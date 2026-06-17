import type {
  Patient,
  Appointment,
  DiaryPost,
  QuestionnaireTemplate,
  FinanceTx,
  SlideTemplate,
  WhatsAutomation,
  Goal,
  NutritionInstruction,
  PatientPlan,
  PortalQuestionnaire,
} from "./types";

export const CLINIC = { nome: "Vanessa da Luz · Nutrição", nutri: "Vanessa da Luz", crn: "CRN-4 25107574", cidade: "Rio de Janeiro · RJ" };

export const PATIENTS: Patient[] = [
  { id: "p1", nome: "Mariana Costa Ribeiro", idade: 32, sexo: "Feminino", objetivo: "Gestacional", status: "ativo", tags: ["Gestante", "Alta prioridade"], ultimaConsulta: "12/06", proximaAcao: "Retorno em 10/07", adesao: 86, gestante: true, cor: ["#9DB99F", "#6E8C72"] },
  { id: "p2", nome: "Rafael Andrade Lima", idade: 41, sexo: "Masculino", objetivo: "Clínico", status: "ativo", tags: ["Dislipidemia"], ultimaConsulta: "09/06", proximaAcao: "Revisar exames", adesao: 64, cor: ["#A8B6C9", "#73839E"] },
  { id: "p3", nome: "Beatriz Nogueira", idade: 27, sexo: "Feminino", objetivo: "Emagrecimento", status: "ativo", tags: ["Online"], ultimaConsulta: "11/06", proximaAcao: "Enviar plano v2", adesao: 92, cor: ["#E0B48C", "#C98B5A"] },
  { id: "p4", nome: "João Pedro Salgado", idade: 23, sexo: "Masculino", objetivo: "Hipertrofia", status: "ativo", tags: ["Atleta"], ultimaConsulta: "05/06", proximaAcao: "Ajustar macros", adesao: 78, cor: ["#9FB6A0", "#6E8C72"] },
  { id: "p5", nome: "Carolina Mendes", idade: 35, sexo: "Feminino", objetivo: "Gestacional", status: "pausa", tags: ["Gestante"], ultimaConsulta: "20/05", proximaAcao: "Reagendar", adesao: 55, gestante: true, cor: ["#C9A2B0", "#9E7383"] },
  { id: "p6", nome: "Henrique Tavares", idade: 52, sexo: "Masculino", objetivo: "Clínico", status: "ativo", tags: ["Diabetes", "Inadimplente"], ultimaConsulta: "02/06", proximaAcao: "Cobrança pendente", adesao: 41, cor: ["#B9A88C", "#8E7B5E"] },
  { id: "p7", nome: "Larissa Fontes", idade: 19, sexo: "Feminino", objetivo: "Esportivo", status: "ativo", tags: ["Corrida"], ultimaConsulta: "10/06", proximaAcao: "Plano pré-prova", adesao: 88, cor: ["#A2C2C9", "#739AA0"] },
  { id: "p8", nome: "Theo Martins", idade: 8, sexo: "Masculino", objetivo: "Infantil", status: "ativo", tags: ["Seletividade"], ultimaConsulta: "07/06", proximaAcao: "Orientar família", adesao: 70, cor: ["#C9C2A2", "#9E9873"] },
  { id: "p9", nome: "Patrícia Lemos", idade: 47, sexo: "Feminino", objetivo: "Emagrecimento", status: "alta", tags: [], ultimaConsulta: "28/04", proximaAcao: "Alta concedida", adesao: 95, cor: ["#A8B6C9", "#73839E"] },
];

/* ============================ PORTAL DO PACIENTE ============================ */
export const PORTAL_ACCESS = {
  slug: "mariana-costa",
  code: "MARIANA2026",
  patientId: "p1",
};

export const PATIENT_PLAN: PatientPlan = {
  pacienteId: "p1",
  titulo: "Plano gestacional - fase 2",
  periodo: "17/06 a 01/07",
  kcal: 2350,
  aguaMl: 2600,
  proteinaG: 112,
  refeicoes: [
    { nome: "Cafe da manha", horario: "07:30", itens: ["Tapioca media com 2 ovos", "Mamao com chia", "Cafe com leite sem acucar"], observacao: "Priorize comer antes de sair de casa." },
    { nome: "Lanche da manha", horario: "10:30", itens: ["Iogurte natural", "Aveia em flocos", "Morangos ou banana"] },
    { nome: "Almoco", horario: "13:00", itens: ["Arroz integral", "Feijao", "Frango grelhado ou peixe", "Salada verde com azeite", "Legumes cozidos"] },
    { nome: "Lanche da tarde", horario: "16:30", itens: ["Pao integral", "Queijo branco", "Fruta da estacao"] },
    { nome: "Jantar", horario: "20:00", itens: ["Sopa de legumes com frango", "Torradas integrais", "Folhas verdes"] },
    { nome: "Ceia", horario: "22:00", itens: ["Leite morno", "Castanhas ou pasta de amendoim"] },
  ],
  substituicoes: [
    { grupo: "Proteinas", opcoes: ["Frango", "Peixe", "Patinho", "Ovos", "Tofu"] },
    { grupo: "Carboidratos", opcoes: ["Arroz integral", "Batata-doce", "Mandioca", "Macarrao integral"] },
    { grupo: "Frutas", opcoes: ["Mamao", "Banana", "Maca", "Morango", "Laranja"] },
  ],
};

export const PORTAL_GOALS: Goal[] = [
  { id: "g1", titulo: "Hidratacao diaria", detalhe: "Alcancar 2,6 L de agua em 5 dias da semana", progresso: 75, categoria: "Habito", coposAtuais: 6, coposMeta: 8, copoMl: 325 },
  { id: "g2", titulo: "Ganho de peso gestacional", detalhe: "Manter dentro da curva combinada", progresso: 58, categoria: "Clinica" },
  { id: "g3", titulo: "Jantar sem longos intervalos", detalhe: "Nao passar de 4h sem refeicao no fim do dia", progresso: 84, categoria: "Comportamental" },
];

export const PORTAL_INSTRUCTIONS: NutritionInstruction[] = [
  { id: "i1", titulo: "Hidratacao na gestacao", categoria: "Gestante", resumo: "Estrategias simples para bater a meta de agua sem desconforto.", enviadoEm: "14/06/2026", tempoLeitura: "4 min" },
  { id: "i2", titulo: "Como montar um prato equilibrado", categoria: "Educacao alimentar", resumo: "Referencia visual para combinar proteinas, carboidratos, verduras e gorduras boas.", enviadoEm: "10/06/2026", tempoLeitura: "6 min" },
  { id: "i3", titulo: "Lanches para levar", categoria: "Praticidade", resumo: "Opcoes seguras para bolsa, trabalho e deslocamentos longos.", enviadoEm: "07/06/2026", tempoLeitura: "3 min" },
];

export const PORTAL_QUESTIONNAIRES: PortalQuestionnaire[] = [
  {
    id: "pq1",
    titulo: "Check-in semanal",
    categoria: "Acompanhamento",
    prazo: "Hoje",
    status: "pendente",
    perguntas: [
      { id: "q1", texto: "Como ficou sua fome ao longo da semana?", tipo: "escala" },
      { id: "q2", texto: "Qual refeicao foi mais dificil de seguir?", tipo: "opcao", opcoes: ["Cafe da manha", "Almoco", "Lanche", "Jantar", "Ceia"] },
      { id: "q3", texto: "Conte qualquer sintoma, enjoo ou desconforto importante.", tipo: "texto" },
    ],
  },
  {
    id: "pq2",
    titulo: "Recordatorio alimentar de 24h",
    categoria: "Consumo",
    prazo: "20/06",
    status: "pendente",
    perguntas: [
      { id: "q1", texto: "Descreva tudo que comeu no cafe da manha.", tipo: "texto" },
      { id: "q2", texto: "Descreva tudo que comeu no almoco.", tipo: "texto" },
      { id: "q3", texto: "Quantos copos de agua tomou?", tipo: "escala" },
    ],
  },
];

export const PORTAL_FINANCE = [
  { id: "pf1", data: "12/06/2026", desc: "Consulta de retorno", valor: 250, status: "Pago", vencimento: "12/06/2026" },
  { id: "pf2", data: "10/07/2026", desc: "Retorno agendado", valor: 250, status: "Pendente", vencimento: "10/07/2026" },
];

export const BIRTHDAYS = [
  { nome: "Beatriz Nogueira", quando: "Hoje", idade: 27 },
  { nome: "Henrique Tavares", quando: "Quinta", idade: 52 },
];

export const TASKS = [
  { t: "Revisar exames do Rafael Andrade", done: false },
  { t: "Enviar plano alimentar v2 — Beatriz", done: false },
  { t: "Confirmar retorno da Mariana (10/07)", done: false },
  { t: "Emitir recibo de maio — Larissa", done: true },
];

export const DASH = {
  ativos: 47, consultasSemana: 18, taxaRetorno: 82, planosVencendo: 5,
  semana: [
    { dia: "Seg", consultas: 4 }, { dia: "Ter", consultas: 3 }, { dia: "Qua", consultas: 5 },
    { dia: "Qui", consultas: 2 }, { dia: "Sex", consultas: 4 }, { dia: "Sáb", consultas: 0 },
  ],
};

export const AGENDA: Appointment[] = [
  { id: "a1", paciente: "Beatriz Nogueira", hora: "08:00", dur: 60, tipo: "Retorno", modo: "Online", dia: 0 },
  { id: "a2", paciente: "Rafael Andrade Lima", hora: "10:00", dur: 60, tipo: "Avaliação", modo: "Presencial", dia: 0 },
  { id: "a3", paciente: "João Pedro Salgado", hora: "14:00", dur: 45, tipo: "Retorno", modo: "Presencial", dia: 1 },
  { id: "a4", paciente: "Larissa Fontes", hora: "09:00", dur: 60, tipo: "Retorno", modo: "Online", dia: 2 },
  { id: "a5", paciente: "Theo Martins", hora: "11:00", dur: 45, tipo: "Acompanhamento", modo: "Presencial", dia: 2 },
  { id: "a6", paciente: "Mariana Costa Ribeiro", hora: "14:30", dur: 60, tipo: "Retorno", modo: "Online", dia: 3 },
  { id: "a7", paciente: "Henrique Tavares", hora: "16:00", dur: 60, tipo: "Avaliação", modo: "Presencial", dia: 4 },
];

export const WEEKDAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
export const HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

export const STATUS_META: Record<string, { label: string; chip: string }> = {
  ativo: { label: "Ativo", chip: "sage" },
  pausa: { label: "Em pausa", chip: "amber" },
  inativo: { label: "Inativo", chip: "" },
  alta: { label: "Alta", chip: "blue" },
};

/* ============================ DIÁRIOS (visão geral) ============================ */
export const DIARIES: DiaryPost[] = [
  { id: "dy1", pacienteId: "p3", paciente: "Beatriz Nogueira", refeicao: "Almoço", quando: "Hoje · 12:40", desc: "Arroz integral, feijão, frango grelhado e salada de folhas verdes com azeite.", cor: ["#E0B48C", "#C98B5A"], reacoes: 0, comentarios: 0, curtido: false, revisado: false },
  { id: "dy2", pacienteId: "p1", paciente: "Mariana Costa Ribeiro", refeicao: "Café da manhã", quando: "Hoje · 08:15", desc: "Tapioca com ovo mexido, mamão e café sem açúcar.", cor: ["#9DB99F", "#6E8C72"], reacoes: 0, comentarios: 0, curtido: false, revisado: false },
  { id: "dy3", pacienteId: "p4", paciente: "João Pedro Salgado", refeicao: "Pré-treino", quando: "Hoje · 06:30", desc: "Pão integral com pasta de amendoim e banana. Café preto.", cor: ["#9FB6A0", "#6E8C72"], reacoes: 1, comentarios: 1, curtido: true, revisado: true },
  { id: "dy4", pacienteId: "p7", paciente: "Larissa Fontes", refeicao: "Jantar", quando: "Ontem · 20:10", desc: "Omelete de claras com legumes e batata-doce assada.", cor: ["#A2C2C9", "#739AA0"], reacoes: 1, comentarios: 0, curtido: true, revisado: false },
  { id: "dy5", pacienteId: "p2", paciente: "Rafael Andrade Lima", refeicao: "Lanche", quando: "Ontem · 16:30", desc: "Iogurte natural com aveia e mix de castanhas.", cor: ["#A8B6C9", "#73839E"], reacoes: 0, comentarios: 0, curtido: false, revisado: false },
  { id: "dy6", pacienteId: "p3", paciente: "Beatriz Nogueira", refeicao: "Café da manhã", quando: "Ontem · 07:50", desc: "Vitamina de morango com whey e chia. Ovos mexidos.", cor: ["#E0B48C", "#C98B5A"], reacoes: 1, comentarios: 2, curtido: true, revisado: true },
  { id: "dy7", pacienteId: "p8", paciente: "Theo Martins", refeicao: "Lanche escolar", quando: "Ontem · 15:00", desc: "Sanduíche de queijo branco, suco de uva integral e uma maçã.", cor: ["#C9C2A2", "#9E9873"], reacoes: 0, comentarios: 0, curtido: false, revisado: false },
  { id: "dy8", pacienteId: "p1", paciente: "Mariana Costa Ribeiro", refeicao: "Jantar", quando: "Ontem · 19:40", desc: "Sopa de abóbora com frango desfiado e torradas integrais.", cor: ["#9DB99F", "#6E8C72"], reacoes: 1, comentarios: 1, curtido: true, revisado: true },
  { id: "dy9", pacienteId: "p6", paciente: "Henrique Tavares", refeicao: "Almoço", quando: "2 dias · 13:10", desc: "Macarrão integral ao sugo com carne moída magra e salada.", cor: ["#B9A88C", "#8E7B5E"], reacoes: 0, comentarios: 0, curtido: false, revisado: false },
  { id: "dy10", pacienteId: "p7", paciente: "Larissa Fontes", refeicao: "Pós-treino", quando: "2 dias · 10:20", desc: "Shake de banana com whey e pasta de amendoim.", cor: ["#A2C2C9", "#739AA0"], reacoes: 1, comentarios: 1, curtido: true, revisado: true },
  { id: "dy11", pacienteId: "p4", paciente: "João Pedro Salgado", refeicao: "Almoço", quando: "2 dias · 12:30", desc: "Arroz, feijão, patinho grelhado, brócolis e ovo cozido.", cor: ["#9FB6A0", "#6E8C72"], reacoes: 0, comentarios: 0, curtido: false, revisado: false },
  { id: "dy12", pacienteId: "p5", paciente: "Carolina Mendes", refeicao: "Café da manhã", quando: "3 dias · 09:00", desc: "Cuscuz com ovo e queijo coalho. Suco de laranja.", cor: ["#C9A2B0", "#9E7383"], reacoes: 0, comentarios: 0, curtido: false, revisado: false },
];

/* ============================ QUESTIONÁRIOS (banco) ============================ */
export const QUESTIONNAIRES: QuestionnaireTemplate[] = [
  { id: "q1", nome: "Recordatório alimentar de 24h", categoria: "Consumo", perguntas: 12, respostas: 38, atualizado: "10/06/2026", cor: "var(--sage)" },
  { id: "q2", nome: "Frequência alimentar (QFA)", categoria: "Consumo", perguntas: 28, respostas: 21, atualizado: "02/06/2026", cor: "var(--sage)" },
  { id: "q3", nome: "Qualidade do sono — Pittsburgh", categoria: "Estilo de vida", perguntas: 19, respostas: 14, atualizado: "28/05/2026", cor: "var(--blue)" },
  { id: "q4", nome: "Triagem de risco cardiovascular", categoria: "Saúde", perguntas: 8, respostas: 27, atualizado: "21/05/2026", cor: "var(--terra)" },
  { id: "q5", nome: "Sintomas gastrointestinais", categoria: "Saúde", perguntas: 15, respostas: 9, atualizado: "14/05/2026", cor: "var(--terra)" },
  { id: "q6", nome: "Nível de atividade física (IPAQ)", categoria: "Estilo de vida", perguntas: 7, respostas: 33, atualizado: "30/04/2026", cor: "var(--blue)" },
  { id: "q7", nome: "Comportamento alimentar (TFEQ)", categoria: "Comportamento", perguntas: 21, respostas: 12, atualizado: "22/04/2026", cor: "var(--amber)" },
  { id: "q8", nome: "Pré-consulta — primeira avaliação", categoria: "Consumo", perguntas: 24, respostas: 46, atualizado: "15/04/2026", cor: "var(--sage)" },
];
export const Q_CATEGORIES = ["Todas", "Consumo", "Saúde", "Estilo de vida", "Comportamento"];

/* ============================ FINANCEIRO (consultório) ============================ */
export const FINANCE_TX: FinanceTx[] = [
  { id: "f1", data: "16/06/2026", paciente: "Beatriz Nogueira", pacienteId: "p3", desc: "Consulta de retorno", valor: 220, forma: "Pix", status: "Pago" },
  { id: "f2", data: "15/06/2026", paciente: "João Pedro Salgado", pacienteId: "p4", desc: "Consulta + bioimpedância", valor: 320, forma: "Cartão", status: "Pago" },
  { id: "f3", data: "12/06/2026", paciente: "Mariana Costa Ribeiro", pacienteId: "p1", desc: "Consulta de retorno", valor: 250, forma: "Pix", status: "Pago" },
  { id: "f4", data: "11/06/2026", paciente: "Larissa Fontes", pacienteId: "p7", desc: "Plano pré-prova", valor: 280, forma: "Transferência", status: "Pago" },
  { id: "f5", data: "09/06/2026", paciente: "Rafael Andrade Lima", pacienteId: "p2", desc: "Consulta de retorno", valor: 250, forma: "—", status: "Pendente" },
  { id: "f6", data: "07/06/2026", paciente: "Theo Martins", pacienteId: "p8", desc: "Acompanhamento infantil", valor: 200, forma: "Dinheiro", status: "Pago" },
  { id: "f7", data: "02/06/2026", paciente: "Henrique Tavares", pacienteId: "p6", desc: "Consulta de retorno", valor: 250, forma: "—", status: "Atrasado" },
  { id: "f8", data: "30/05/2026", paciente: "Beatriz Nogueira", pacienteId: "p3", desc: "Primeira consulta", valor: 380, forma: "Cartão", status: "Pago" },
  { id: "f9", data: "28/05/2026", paciente: "Carolina Mendes", pacienteId: "p5", desc: "Consulta de retorno", valor: 250, forma: "Pix", status: "Pago" },
  { id: "f10", data: "20/05/2026", paciente: "João Pedro Salgado", pacienteId: "p4", desc: "Consulta de retorno", valor: 250, forma: "Pix", status: "Pago" },
];
export const FINANCE_MONTHLY = [
  { mes: "Jan", receita: 6800 }, { mes: "Fev", receita: 7250 }, { mes: "Mar", receita: 8100 },
  { mes: "Abr", receita: 7600 }, { mes: "Mai", receita: 9200 }, { mes: "Jun", receita: 8650 },
];
export const FINANCE_FORMAS = [
  { forma: "Pix", valor: 4120, cor: "var(--sage)" },
  { forma: "Cartão", valor: 3380, cor: "var(--blue)" },
  { forma: "Transferência", valor: 1150, cor: "var(--amber)" },
  { forma: "Dinheiro", valor: 600, cor: "var(--terra)" },
];

/* ============================ MEUS FAVORITOS ============================ */
export const FAVORITES = {
  alimentos: [
    { nome: "Frango grelhado", info: "100 g · 165 kcal" },
    { nome: "Arroz integral cozido", info: "100 g · 124 kcal" },
    { nome: "Abacate", info: "100 g · 96 kcal" },
    { nome: "Iogurte natural integral", info: "170 g · 102 kcal" },
    { nome: "Castanha-do-pará", info: "15 g · 98 kcal" },
    { nome: "Batata-doce cozida", info: "100 g · 86 kcal" },
  ],
  planos: [
    { nome: "Plano low-carb 1.600 kcal", info: "5 refeições · clínico" },
    { nome: "Plano hipertrofia 2.800 kcal", info: "6 refeições · esportivo" },
    { nome: "Plano gestacional 2.350 kcal", info: "6 refeições · gestante" },
  ],
  instrucoes: [
    { nome: "Como montar um prato equilibrado", info: "Orientação · geral" },
    { nome: "Hidratação na gestação", info: "Orientação · gestante" },
    { nome: "Leitura de rótulos de alimentos", info: "Orientação · educação" },
  ],
  questionarios: [
    { nome: "Recordatório alimentar de 24h", info: "12 perguntas" },
    { nome: "Pré-consulta — primeira avaliação", info: "24 perguntas" },
  ],
};

/* ============================ LÂMINAS (templates visuais) ============================ */
export const SLIDES: SlideTemplate[] = [
  { id: "s1", titulo: "Prato saudável — método do prato", categoria: "Educação alimentar", laminas: 6, cor: ["#9DB99F", "#6E8C72"] },
  { id: "s2", titulo: "Mitos e verdades sobre carboidratos", categoria: "Educação alimentar", laminas: 8, cor: ["#A2C2C9", "#739AA0"] },
  { id: "s3", titulo: "Alimentação na gestação", categoria: "Gestante", laminas: 10, cor: ["#C9A2B0", "#9E7383"] },
  { id: "s4", titulo: "Lanches inteligentes para o trabalho", categoria: "Praticidade", laminas: 5, cor: ["#E0B48C", "#C98B5A"] },
  { id: "s5", titulo: "Hipertrofia: proteína e timing", categoria: "Esportivo", laminas: 7, cor: ["#9FB6A0", "#6E8C72"] },
  { id: "s6", titulo: "Diabetes: índice glicêmico na prática", categoria: "Clínico", laminas: 9, cor: ["#B9A88C", "#8E7B5E"] },
  { id: "s7", titulo: "Introdução alimentar do bebê (BLW)", categoria: "Infantil", laminas: 12, cor: ["#C9C2A2", "#9E9873"] },
  { id: "s8", titulo: "Leitura de rótulos sem mistério", categoria: "Educação alimentar", laminas: 6, cor: ["#A8B6C9", "#73839E"] },
];
export const SLIDE_CATEGORIES = ["Todas", "Educação alimentar", "Gestante", "Esportivo", "Clínico", "Infantil", "Praticidade"];

/* ============================ LINK DE AGENDAMENTO ============================ */
export const BOOKING = {
  slug: "vanessadaluz",
  servicos: [
    { nome: "Primeira consulta", dur: "60 min", preco: 380, modo: "Presencial ou Online" },
    { nome: "Consulta de retorno", dur: "45 min", preco: 250, modo: "Presencial ou Online" },
    { nome: "Avaliação antropométrica", dur: "30 min", preco: 150, modo: "Presencial" },
  ],
  horarios: ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"],
  ocupados: ["10:00", "14:00", "16:00"],
};

/* ============================ NUTRIFLOW CREATOR (IA) ============================ */
export const CREATOR_SUGGESTIONS = [
  {
    refeicao: "Café da manhã", kcal: 420, prot: 24, carb: 48, gord: 14,
    itens: ["Omelete de 2 ovos com espinafre", "1 fatia de pão integral", "1 colher de pasta de amendoim", "Café sem açúcar"],
  },
  {
    refeicao: "Lanche da manhã", kcal: 180, prot: 12, carb: 18, gord: 6,
    itens: ["Iogurte natural integral (170g)", "1 colher de aveia em flocos", "Mix de frutas vermelhas"],
  },
  {
    refeicao: "Almoço", kcal: 620, prot: 42, carb: 62, gord: 18,
    itens: ["Filé de frango grelhado (130g)", "Arroz integral (4 col.)", "Feijão (1 concha)", "Salada de folhas + brócolis", "Azeite (1 col. chá)"],
  },
  {
    refeicao: "Lanche da tarde", kcal: 210, prot: 14, carb: 22, gord: 8,
    itens: ["Vitamina de banana com whey", "1 colher de pasta de amendoim"],
  },
  {
    refeicao: "Jantar", kcal: 520, prot: 38, carb: 44, gord: 16,
    itens: ["Filé de tilápia (150g)", "Batata-doce assada (120g)", "Legumes salteados", "Salada verde"],
  },
];

/* ============================ WHATSAPP AUTOMÁTICO ============================ */
export const WHATS_AUTOMATIONS: WhatsAutomation[] = [
  { id: "w1", nome: "Mensagem de aniversário", gatilho: "Aniversário do paciente", quando: "09:00 do dia", ativo: true, enviadas: 34, icon: "cake",
    template: "Oi {nome}! 🎉 A equipe da {clinica} deseja um feliz aniversário! Que seu novo ciclo seja cheio de saúde e equilíbrio. 💚" },
  { id: "w2", nome: "Confirmação de consulta", gatilho: "24h antes da consulta", quando: "1 dia antes · 10:00", ativo: true, enviadas: 128, icon: "check",
    template: "Olá {nome}, sua consulta com {nutri} está confirmada para {data} às {hora}. Podemos confirmar sua presença? Responda SIM ou NÃO." },
  { id: "w3", nome: "Lembrete de agendamento", gatilho: "2h antes da consulta", quando: "2h antes", ativo: true, enviadas: 96, icon: "bell",
    template: "Oi {nome}! Passando para lembrar da sua consulta hoje às {hora}. Até já! 🌿 {link}" },
  { id: "w4", nome: "Boas-vindas ao novo paciente", gatilho: "Cadastro de novo paciente", quando: "Imediato", ativo: false, enviadas: 22, icon: "heart",
    template: "Seja bem-vindo(a), {nome}! Sou {nutri} e vou te acompanhar nessa jornada. Em breve envio seu primeiro plano. 💚" },
  { id: "w5", nome: "Reengajamento", gatilho: "Sem consulta há 60 dias", quando: "Semanal · segunda 09:00", ativo: false, enviadas: 11, icon: "star",
    template: "Oi {nome}, senti sua falta por aqui! Que tal retomarmos seu acompanhamento? Tenho horários nesta semana. 😊" },
];

/* ============================ VIDEOCHAMADA (salas) ============================ */
export const VIDEO_ROOMS = [
  { id: "p3", paciente: "Beatriz Nogueira", hora: "Hoje · 08:00", tipo: "Retorno", status: "agora", cor: ["#E0B48C", "#C98B5A"] as [string, string] },
  { id: "p7", paciente: "Larissa Fontes", hora: "Hoje · 14:00", tipo: "Retorno", status: "proxima", cor: ["#A2C2C9", "#739AA0"] as [string, string] },
  { id: "p1", paciente: "Mariana Costa Ribeiro", hora: "Qui · 14:30", tipo: "Retorno", status: "agendada", cor: ["#9DB99F", "#6E8C72"] as [string, string] },
];
