import http from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

loadEnv();

const PORT = Number(process.env.NUTRIFLOW_API_PORT || process.env.NUTRIFLOW_AI_PORT || 8787);
const MODEL = process.env.OPENAI_MODEL || "gpt-4o";
const CORS_ORIGINS = (process.env.CORS_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173").split(",");
const MAX_BODY_BYTES = 1_000_000;
const rateBuckets = new Map();

const supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

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

const server = http.createServer(async (req, res) => {
  const requestId = randomId("req");
  const origin = req.headers.origin || "";

  try {
    setSecurityHeaders(res, origin);
    if (req.method === "OPTIONS") return sendJson(res, 204, null);

    if (!rateLimit(req)) {
      return sendJson(res, 429, { error: "Muitas requisicoes. Tente novamente em instantes.", requestId });
    }

    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

    if (req.method === "GET" && url.pathname === "/api/health") {
      return sendJson(res, 200, { ok: true, service: "nutriflow-api", time: new Date().toISOString() });
    }

    if (req.method === "POST" && url.pathname === "/api/generate-meal-plan") {
      const user = await authenticate(req);
      if (!user) return sendJson(res, 401, { error: "Sessao invalida ou expirada.", requestId });
      const result = await generateMealPlan(await readJson(req));
      return sendJson(res, result.status, result.body);
    }

    return sendJson(res, 404, { error: "Recurso nao encontrado." });
  } catch (error) {
    const status = Number(error?.status) || 500;
    const message = status === 500 ? "Erro interno da API." : error.message;
    return sendJson(res, status, { error: message, requestId });
  }
});

server.listen(PORT, () => {
  console.log(`NutriFlow API segura em http://localhost:${PORT}`);
  console.log(`OpenAI model: ${MODEL}`);
});

async function authenticate(req) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return null;

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
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

  return { status: 200, body: extractStructuredJson(data) };
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
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
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
  const limit = 60;
  const bucket = rateBuckets.get(key) || { count: 0, reset: now + windowMs };
  if (now > bucket.reset) {
    bucket.count = 0;
    bucket.reset = now + windowMs;
  }
  bucket.count += 1;
  rateBuckets.set(key, bucket);
  return bucket.count <= limit;
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

function randomId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2)}`;
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
