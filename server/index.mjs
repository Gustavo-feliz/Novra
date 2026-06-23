import http from "node:http";
import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { join } from "node:path";
import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";

loadEnv();

const PORT = Number(process.env.NUTRIFLOW_API_PORT || process.env.NUTRIFLOW_AI_PORT || 8787);
const MODEL = process.env.OPENAI_MODEL || "gpt-4o";
const JWT_SECRET = process.env.JWT_SECRET || "dev-only-change-me";
const CORS_ORIGINS = (process.env.CORS_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173").split(",");
const DATA_DIR = process.env.NUTRIFLOW_DATA_DIR || join(process.cwd(), "server", "data");
const DB_PATH = join(DATA_DIR, "db.json");
const AUDIT_PATH = join(DATA_DIR, "audit.log");
const MAX_BODY_BYTES = 1_000_000;
const TOKEN_TTL_SECONDS = 60 * 60 * 8;
const rateBuckets = new Map();

const mealSchema = {
  type: "object",
  additionalProperties: false,
  required: ["meals", "totals", "target", "score", "strategy", "substitutions"],
  properties: {
    meals: {
      type: "array",
      minItems: 1,
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["refeicao", "kcal", "prot", "carb", "gord", "itens", "rationale", "alertas", "substituicoes"],
        properties: {
          refeicao: { type: "string" },
          kcal: { type: "number" },
          prot: { type: "number" },
          carb: { type: "number" },
          gord: { type: "number" },
          itens: { type: "array", minItems: 2, maxItems: 7, items: { type: "string" } },
          rationale: { type: "string" },
          alertas: { type: "array", items: { type: "string" } },
          substituicoes: { type: "array", minItems: 2, maxItems: 6, items: { type: "string" } },
        },
      },
    },
    totals: macroSchema(),
    target: macroSchema(),
    score: { type: "number" },
    strategy: { type: "array", minItems: 3, maxItems: 6, items: { type: "string" } },
    substitutions: {
      type: "array",
      minItems: 2,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["grupo", "opcoes"],
        properties: {
          grupo: { type: "string" },
          opcoes: { type: "array", minItems: 3, maxItems: 8, items: { type: "string" } },
        },
      },
    },
  },
};

const developerPrompt = `
Voce e o NutriFlow Creator, uma assistente de apoio para nutricionistas.
Gere cardapios em portugues do Brasil usando raciocinio nutricional conservador.
Nao diagnostique, nao substitua a nutricionista e inclua alertas quando houver gestacao, diabetes, alergias, restricoes severas ou risco clinico.
Respeite estritamente restricoes e preferencias recebidas.
Use refeicoes brasileiras, acessiveis e com porcoes plausiveis.
Distribua kcal e macros de modo coerente com a meta diaria e retorne apenas o JSON no schema solicitado.
`;

ensureDataDir();
ensureDb();

const server = http.createServer(async (req, res) => {
  const requestId = randomId("req");
  const startedAt = Date.now();
  const origin = req.headers.origin || "";

  try {
    setSecurityHeaders(res, origin);
    if (req.method === "OPTIONS") return sendJson(res, 204, null);

    if (!rateLimit(req)) {
      audit("rate_limited", req, null, { requestId });
      return sendJson(res, 429, { error: "Muitas requisicoes. Tente novamente em instantes.", requestId });
    }

    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    const route = `${req.method} ${url.pathname}`;
    const publicRoute = route === "GET /api/health" || route === "POST /api/auth/login";
    const user = publicRoute ? null : authenticate(req);

    if (!publicRoute && !user) {
      return sendJson(res, 401, { error: "Sessao invalida ou expirada.", requestId });
    }

    const result = await dispatch(req, url, user);
    audit("request", req, user, { requestId, route, status: result.status, ms: Date.now() - startedAt });
    return sendJson(res, result.status, result.body);
  } catch (error) {
    audit("error", req, null, { requestId, message: error instanceof Error ? error.message : String(error) });
    const status = Number(error?.status) || 500;
    const message = status === 500 ? "Erro interno da API." : error.message;
    return sendJson(res, status, { error: message, requestId });
  }
});

server.listen(PORT, () => {
  console.log(`NutriFlow API segura em http://localhost:${PORT}`);
  console.log(`OpenAI model: ${MODEL}`);
});

async function dispatch(req, url, user) {
  const method = req.method || "GET";
  const path = url.pathname;

  if (method === "GET" && path === "/api/health") {
    return ok({ ok: true, service: "nutriflow-api", time: new Date().toISOString() });
  }

  if (method === "POST" && path === "/api/auth/login") {
    return login(await readJson(req));
  }

  if (method === "GET" && path === "/api/me") {
    return ok({ user });
  }

  if (method === "GET" && path === "/api/dashboard") {
    const db = readDb();
    return ok({
      pacientes: db.patients.length,
      consultas: db.appointments.length,
      planos: Object.keys(db.plans).length,
      diarios: db.diaries.length,
    });
  }

  if (path === "/api/patients") {
    if (method === "GET") return ok(readDb().patients);
    if (method === "POST") return createPatient(await readJson(req), user);
  }

  const patientMatch = path.match(/^\/api\/patients\/([^/]+)$/);
  if (patientMatch) {
    if (method === "GET") return getById("patients", patientMatch[1]);
    if (method === "PATCH") return patchById("patients", patientMatch[1], await readJson(req), user);
    if (method === "DELETE") return deleteById("patients", patientMatch[1], user);
  }

  const planMatch = path.match(/^\/api\/plans\/([^/]+)$/);
  if (planMatch) {
    if (method === "GET") return ok(readDb().plans[planMatch[1]] || null);
    if (method === "PUT") return savePlan(planMatch[1], await readJson(req), user);
  }

  if (path === "/api/appointments") {
    if (method === "GET") return ok(readDb().appointments);
    if (method === "POST") return createInCollection("appointments", await readJson(req), user);
  }

  const appointmentMatch = path.match(/^\/api\/appointments\/([^/]+)$/);
  if (appointmentMatch) {
    if (method === "PATCH") return patchById("appointments", appointmentMatch[1], await readJson(req), user);
    if (method === "DELETE") return deleteById("appointments", appointmentMatch[1], user);
  }

  if (path === "/api/diaries") {
    if (method === "GET") return ok(readDb().diaries);
    if (method === "POST") return createInCollection("diaries", await readJson(req), user);
  }

  const diaryMatch = path.match(/^\/api\/diaries\/([^/]+)$/);
  if (diaryMatch) {
    if (method === "PATCH") return patchById("diaries", diaryMatch[1], await readJson(req), user);
    if (method === "DELETE") return deleteById("diaries", diaryMatch[1], user);
  }

  if (path === "/api/questionnaires") {
    if (method === "GET") return ok(readDb().questionnaires);
    if (method === "POST") return createInCollection("questionnaires", await readJson(req), user);
  }

  const questionnaireMatch = path.match(/^\/api\/questionnaires\/([^/]+)$/);
  if (questionnaireMatch) {
    if (method === "PATCH") return patchById("questionnaires", questionnaireMatch[1], await readJson(req), user);
    if (method === "DELETE") return deleteById("questionnaires", questionnaireMatch[1], user);
  }

  if (path === "/api/finance") {
    if (method === "GET") return ok(readDb().financeTx || []);
    if (method === "POST") return createInCollection("financeTx", await readJson(req), user);
  }

  const financeMatch = path.match(/^\/api\/finance\/([^/]+)$/);
  if (financeMatch) {
    if (method === "PATCH") return patchById("financeTx", financeMatch[1], await readJson(req), user);
    if (method === "DELETE") return deleteById("financeTx", financeMatch[1], user);
  }

  if (method === "POST" && path === "/api/generate-meal-plan") {
    return generateMealPlan(await readJson(req), user);
  }

  if (method === "GET" && path === "/api/admin/audit") {
    requireRole(user, "admin");
    const auditLog = existsSync(AUDIT_PATH) ? readFileSync(AUDIT_PATH, "utf8").trim().split("\n").slice(-100) : [];
    return ok(auditLog.map((line) => JSON.parse(line)));
  }

  return notFound();
}

function login(input) {
  const email = String(input.email || "").trim().toLowerCase();
  const password = String(input.password || "");
  const db = readDb();
  const user = db.users.find((item) => item.email === email);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { status: 401, body: { error: "E-mail ou senha incorretos." } };
  }

  const publicUser = publicUserData(user);
  return ok({ token: signToken(publicUser), user: publicUser });
}

function createPatient(input, user) {
  const nome = cleanString(input.nome, 120);
  if (!nome) return badRequest("Nome do paciente e obrigatorio.");

  const patient = {
    id: randomId("p"),
    nome,
    idade: Number(input.idade) || 0,
    sexo: input.sexo === "Masculino" ? "Masculino" : "Feminino",
    objetivo: cleanString(input.objetivo, 40) || "Clinico",
    status: "ativo",
    tags: Array.isArray(input.tags) ? input.tags.map((tag) => cleanString(tag, 30)).filter(Boolean).slice(0, 8) : [],
    ultimaConsulta: "",
    proximaAcao: "",
    adesao: 0,
    gestante: Boolean(input.gestante),
    cor: ["#9DB99F", "#6E8C72"],
    email: cleanString(input.email, 160),
    telefone: cleanString(input.telefone, 40),
    observacao: cleanString(input.observacao, 500),
    createdAt: new Date().toISOString(),
    createdBy: user.id,
  };

  const db = readDb();
  db.patients.push(patient);
  writeDb(db);
  return { status: 201, body: patient };
}

function savePlan(patientId, input, user) {
  if (!patientId) return badRequest("Paciente invalido.");
  const db = readDb();
  db.plans[patientId] = {
    ...input,
    pacienteId: patientId,
    updatedAt: new Date().toISOString(),
    updatedBy: user.id,
  };
  writeDb(db);
  return ok(db.plans[patientId]);
}

function createInCollection(collection, input, user) {
  const db = readDb();
  const item = {
    ...input,
    id: input.id || randomId(collection.slice(0, 2)),
    createdAt: new Date().toISOString(),
    createdBy: user.id,
  };
  db[collection].push(item);
  writeDb(db);
  return { status: 201, body: item };
}

function getById(collection, id) {
  const item = readDb()[collection].find((entry) => entry.id === id);
  return item ? ok(item) : notFound();
}

function patchById(collection, id, input, user) {
  const db = readDb();
  const index = db[collection].findIndex((entry) => entry.id === id);
  if (index < 0) return notFound();
  db[collection][index] = {
    ...db[collection][index],
    ...input,
    id,
    updatedAt: new Date().toISOString(),
    updatedBy: user.id,
  };
  writeDb(db);
  return ok(db[collection][index]);
}

function deleteById(collection, id, user) {
  requireRole(user, "admin");
  const db = readDb();
  const before = db[collection].length;
  db[collection] = db[collection].filter((entry) => entry.id !== id);
  writeDb(db);
  return ok({ deleted: before !== db[collection].length });
}

async function generateMealPlan(input) {
  if (!process.env.OPENAI_API_KEY) {
    return { status: 500, body: { error: "Configure OPENAI_API_KEY no .env do backend." } };
  }

  const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.35,
      input: [
        { role: "developer", content: [{ type: "input_text", text: developerPrompt }] },
        { role: "user", content: [{ type: "input_text", text: JSON.stringify(input, null, 2) }] },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "nutriflow_meal_plan",
          strict: true,
          schema: mealSchema,
        },
      },
    }),
  });

  const data = await openaiResponse.json();
  if (!openaiResponse.ok) {
    return { status: openaiResponse.status, body: { error: data.error?.message || "Erro na API da OpenAI." } };
  }

  return ok(extractStructuredJson(data));
}

function authenticate(req) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return null;

  try {
    const [header, payload, signature] = token.split(".");
    const expected = hmac(`${header}.${payload}`);
    if (!safeEqual(signature, expected)) return null;
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) return null;
    return parsed.user;
  } catch {
    return null;
  }
}

function signToken(user) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    user,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
    iat: Math.floor(Date.now() / 1000),
  })).toString("base64url");
  const signature = hmac(`${header}.${payload}`);
  return `${header}.${payload}.${signature}`;
}

function hashPassword(password, salt = randomBytes(16).toString("base64url")) {
  const derived = pbkdf2Sync(password, salt, 120_000, 32, "sha256").toString("base64url");
  return `pbkdf2_sha256$120000$${salt}$${derived}`;
}

function verifyPassword(password, encoded) {
  const [algo, iterations, salt, stored] = String(encoded).split("$");
  if (algo !== "pbkdf2_sha256" || !iterations || !salt || !stored) return false;
  const derived = pbkdf2Sync(password, salt, Number(iterations), 32, "sha256").toString("base64url");
  return safeEqual(derived, stored);
}

function hmac(value) {
  return createHmac("sha256", JWT_SECRET).update(value).digest("base64url");
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && timingSafeEqual(left, right);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > MAX_BODY_BYTES) reject(new Error("Payload muito grande."));
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("JSON invalido."));
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  if (status === 204) return res.end();
  res.end(JSON.stringify(payload));
}

function setSecurityHeaders(res, origin) {
  if (CORS_ORIGINS.includes(origin)) res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cache-Control", "no-store");
}

function rateLimit(req) {
  const key = `${req.socket.remoteAddress}:${req.url}`;
  const now = Date.now();
  const windowMs = 60_000;
  const limit = req.url?.includes("/auth/login") ? 10 : 120;
  const bucket = rateBuckets.get(key) || { count: 0, reset: now + windowMs };
  if (now > bucket.reset) {
    bucket.count = 0;
    bucket.reset = now + windowMs;
  }
  bucket.count += 1;
  rateBuckets.set(key, bucket);
  return bucket.count <= limit;
}

function readDb() {
  const db = JSON.parse(readFileSync(DB_PATH, "utf8"));
  let changed = false;
  for (const key of ["patients", "appointments", "diaries", "questionnaires", "financeTx", "users"]) {
    if (!Array.isArray(db[key])) {
      db[key] = [];
      changed = true;
    }
  }
  if (!db.plans || typeof db.plans !== "object") {
    db.plans = {};
    changed = true;
  }
  if (!db.seedVersion) {
    const seeded = demoSeed();
    for (const key of ["appointments", "diaries", "questionnaires", "financeTx"]) {
      if (db[key].length === 0) {
        db[key] = seeded[key];
        changed = true;
      }
    }
    db.seedVersion = 1;
    changed = true;
  }
  if (changed) writeDb(db);
  return db;
}

function writeDb(db) {
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function ensureDataDir() {
  mkdirSync(DATA_DIR, { recursive: true });
}

function ensureDb() {
  if (existsSync(DB_PATH)) return;
  writeDb(demoSeed());
}

function demoSeed() {
  return {
    users: [
      {
        id: "u_admin",
        name: "Vanessa da Luz",
        email: "nutri123@gmail.com",
        role: "admin",
        passwordHash: hashPassword("nutri123"),
      },
      {
        id: "u_patient",
        name: "Mariana Costa Ribeiro",
        email: "mariana@gmail.com",
        role: "patient",
        patientId: "p1",
        passwordHash: hashPassword("teste123"),
      },
    ],
    patients: [
      {
        id: "p1",
        nome: "Mariana Costa Ribeiro",
        idade: 32,
        sexo: "Feminino",
        objetivo: "Gestacional",
        status: "ativo",
        tags: ["Gestante", "Alta prioridade"],
        ultimaConsulta: "12/06",
        proximaAcao: "Retorno em 10/07",
        adesao: 86,
        gestante: true,
        cor: ["#9DB99F", "#6E8C72"],
      },
    ],
    plans: {},
    appointments: [
      { id: "a6", paciente: "Mariana Costa Ribeiro", hora: "14:30", dur: 60, tipo: "Retorno", modo: "Online", dia: 3 },
    ],
    diaries: [
      { id: "dy2", pacienteId: "p1", paciente: "Mariana Costa Ribeiro", refeicao: "Cafe da manha", quando: "Hoje 08:15", desc: "Tapioca com ovo mexido, mamao e cafe sem acucar.", cor: ["#9DB99F", "#6E8C72"], reacoes: 0, comentarios: 0, curtido: false, revisado: false },
      { id: "dy8", pacienteId: "p1", paciente: "Mariana Costa Ribeiro", refeicao: "Jantar", quando: "Ontem 19:40", desc: "Sopa de abobora com frango desfiado e torradas integrais.", cor: ["#9DB99F", "#6E8C72"], reacoes: 1, comentarios: 1, curtido: true, revisado: true },
    ],
    questionnaires: [
      { id: "q1", nome: "Recordatorio alimentar de 24h", categoria: "Consumo", perguntas: 12, respostas: 38, atualizado: "10/06/2026", cor: "var(--sage)" },
      { id: "q2", nome: "Frequencia alimentar (QFA)", categoria: "Consumo", perguntas: 28, respostas: 21, atualizado: "02/06/2026", cor: "var(--sage)" },
    ],
    financeTx: [
      { id: "f3", data: "12/06/2026", paciente: "Mariana Costa Ribeiro", pacienteId: "p1", desc: "Consulta de retorno", valor: 250, forma: "Pix", status: "Pago" },
    ],
    seedVersion: 1,
  };
}

function audit(event, req, user, data) {
  const entry = {
    at: new Date().toISOString(),
    event,
    ip: req.socket.remoteAddress,
    userId: user?.id || null,
    ...data,
  };
  appendFileSync(AUDIT_PATH, `${JSON.stringify(entry)}\n`);
}

function publicUserData(user) {
  const { passwordHash, ...publicUser } = user;
  return publicUser;
}

function requireRole(user, role) {
  if (user?.role !== role) {
    const err = new Error("Permissao insuficiente.");
    err.status = 403;
    throw err;
  }
}

function extractStructuredJson(data) {
  if (typeof data.output_text === "string" && data.output_text.trim()) return JSON.parse(data.output_text);
  const message = data.output?.find((item) => item.type === "message");
  const text = message?.content?.find((item) => item.type === "output_text")?.text;
  if (!text) throw new Error("Resposta da OpenAI sem texto estruturado.");
  return JSON.parse(text);
}

function macroSchema() {
  return {
    type: "object",
    additionalProperties: false,
    required: ["kcal", "prot", "carb", "gord"],
    properties: {
      kcal: { type: "number" },
      prot: { type: "number" },
      carb: { type: "number" },
      gord: { type: "number" },
    },
  };
}

function ok(body) {
  return { status: 200, body };
}

function badRequest(error) {
  return { status: 400, body: { error } };
}

function notFound() {
  return { status: 404, body: { error: "Recurso nao encontrado." } };
}

function cleanString(value, max) {
  return String(value || "").replace(/[<>]/g, "").trim().slice(0, max);
}

function randomId(prefix) {
  return `${prefix}_${randomBytes(8).toString("hex")}`;
}

function loadEnv() {
  if (!existsSync(".env")) return;
  const envFile = readFileSync(".env", "utf8");
  for (const line of envFile.split(/\r?\n/)) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
}
