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
    { nome: "Cafe da manha", horario: "07:30", itens: [
        { nome: "Tapioca media com 2 ovos", porcao: "1 un", kcal: 220 }, { nome: "Mamao com chia", porcao: "1 fatia", kcal: 70 }, { nome: "Cafe com leite sem acucar", porcao: "1 xic", kcal: 40 },
      ], observacao: "Priorize comer antes de sair de casa." },
    { nome: "Lanche da manha", horario: "10:30", itens: [
        { nome: "Iogurte natural", porcao: "170 g", kcal: 100 }, { nome: "Aveia em flocos", porcao: "30 g", kcal: 115 }, { nome: "Morangos ou banana", porcao: "1 porção", kcal: 60 },
      ] },
    { nome: "Almoco", horario: "13:00", itens: [
        { nome: "Arroz integral", porcao: "4 col", kcal: 124 }, { nome: "Feijao", porcao: "1 concha", kcal: 76 }, { nome: "Frango grelhado ou peixe", porcao: "100 g", kcal: 165 },
        { nome: "Salada verde com azeite", porcao: "1 porção", kcal: 90 }, { nome: "Legumes cozidos", porcao: "100 g", kcal: 40 },
      ] },
    { nome: "Lanche da tarde", horario: "16:30", itens: [
        { nome: "Pao integral", porcao: "1 fatia", kcal: 74 }, { nome: "Queijo branco", porcao: "30 g", kcal: 70 }, { nome: "Fruta da estacao", porcao: "1 un", kcal: 65 },
      ] },
    { nome: "Jantar", horario: "20:00", itens: [
        { nome: "Sopa de legumes com frango", porcao: "1 prato", kcal: 180 }, { nome: "Torradas integrais", porcao: "2 un", kcal: 60 }, { nome: "Folhas verdes", porcao: "1 porção", kcal: 15 },
      ] },
    { nome: "Ceia", horario: "22:00", itens: [
        { nome: "Leite morno", porcao: "200 ml", kcal: 90 }, { nome: "Castanhas ou pasta de amendoim", porcao: "15 g", kcal: 95 },
      ] },
  ],
  substituicoes: [
    { grupo: "Proteinas", opcoes: ["Frango", "Peixe", "Patinho", "Ovos", "Tofu"] },
    { grupo: "Carboidratos", opcoes: ["Arroz integral", "Batata-doce", "Mandioca", "Macarrao integral"] },
    { grupo: "Frutas", opcoes: ["Mamao", "Banana", "Maca", "Morango", "Laranja"] },
  ],
};

// Planos alimentares são por paciente. Só a Mariana (paciente-teste do portal) vem com
// um plano de exemplo pré-preenchido — qualquer outro paciente começa sem plano, e a
// nutricionista cria um do zero pela tela de Plano alimentar.
export const PLANOS_SEED: Record<string, PatientPlan> = {
  [PORTAL_ACCESS.patientId]: PATIENT_PLAN,
};

export const REFEICOES_PADRAO = ["Café da manhã", "Lanche da manhã", "Almoço", "Lanche da tarde", "Jantar", "Ceia"];
export const HORARIOS_PADRAO: Record<string, string> = {
  "Café da manhã": "07:30", "Lanche da manhã": "10:00", "Almoço": "12:30",
  "Lanche da tarde": "16:00", "Jantar": "19:30", "Ceia": "22:00",
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
  {
    id: "pq3",
    titulo: "Triagem inicial",
    categoria: "Consumo",
    prazo: "05/06",
    status: "respondido",
    perguntas: [
      { id: "q1", texto: "Como voce descreveria sua rotina alimentar atual?", tipo: "texto" },
      { id: "q2", texto: "Em uma escala, como esta seu nivel de energia?", tipo: "escala" },
    ],
    respostas: { q1: "Tento comer de 3 em 3 horas, mas as vezes pulo o lanche da tarde por falta de tempo no trabalho.", q2: "4" },
  },
];

// Questionários enviados/respondidos são por paciente. Só a Mariana (paciente do
// portal) vem com exemplos pré-prontos; qualquer outro paciente começa sem nenhum.
export const QUESTIONARIOS_SEED: Record<string, PortalQuestionnaire[]> = {
  [PORTAL_ACCESS.patientId]: PORTAL_QUESTIONNAIRES,
};

export const PORTAL_FINANCE = [
  { id: "pf1", data: "12/06/2026", desc: "Consulta de retorno", valor: 250, status: "Pago", vencimento: "12/06/2026" },
  { id: "pf2", data: "10/07/2026", desc: "Retorno agendado", valor: 250, status: "Pendente", vencimento: "10/07/2026" },
];

export const BIRTHDAYS: { nome: string; quando: string; idade: number }[] = [];

export const TASKS = [
  { t: "Confirmar retorno da Mariana Costa (10/07)", done: false },
];

export const DASH = {
  ativos: 1, consultasSemana: 1, taxaRetorno: 0, planosVencendo: 0,
  semana: [
    { dia: "Seg", consultas: 0 }, { dia: "Ter", consultas: 0 }, { dia: "Qua", consultas: 0 },
    { dia: "Qui", consultas: 1 }, { dia: "Sex", consultas: 0 }, { dia: "Sáb", consultas: 0 },
  ],
};

export const AGENDA: Appointment[] = [
  { id: "a6", paciente: "Mariana Costa Ribeiro", hora: "14:30", dur: 60, tipo: "Retorno", modo: "Online", dia: 3 },
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
  { id: "dy2", pacienteId: "p1", paciente: "Mariana Costa Ribeiro", refeicao: "Café da manhã", quando: "Hoje · 08:15", desc: "Tapioca com ovo mexido, mamão e café sem açúcar.", cor: ["#9DB99F", "#6E8C72"], reacoes: 0, comentarios: 0, curtido: false, revisado: false },
  { id: "dy8", pacienteId: "p1", paciente: "Mariana Costa Ribeiro", refeicao: "Jantar", quando: "Ontem · 19:40", desc: "Sopa de abóbora com frango desfiado e torradas integrais.", cor: ["#9DB99F", "#6E8C72"], reacoes: 1, comentarios: 1, curtido: true, revisado: true },
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
  { id: "f3", data: "12/06/2026", paciente: "Mariana Costa Ribeiro", pacienteId: "p1", desc: "Consulta de retorno", valor: 250, forma: "Pix", status: "Pago" },
];
export const FINANCE_MONTHLY = [
  { mes: "Jan", receita: 0 }, { mes: "Fev", receita: 0 }, { mes: "Mar", receita: 0 },
  { mes: "Abr", receita: 0 }, { mes: "Mai", receita: 0 }, { mes: "Jun", receita: 250 },
];
export const FINANCE_FORMAS = [
  { forma: "Pix", valor: 250, cor: "var(--sage)" },
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
  {
    id: "s1", titulo: "Prato saudável — método do prato", categoria: "Educação alimentar", cor: ["#9DB99F", "#6E8C72"],
    laminas: [
      { titulo: "O método do prato", corpo: ["Uma forma simples de montar refeições equilibradas sem precisar pesar tudo.", "Divida o prato visualmente em proporções — sem báscula, sem complicação."] },
      { titulo: "Metade do prato: vegetais", corpo: ["Folhas verdes, legumes crus ou cozidos", "Capriche nas cores — quanto mais variado, melhor a variedade de nutrientes", "Pode ser salada + legume cozido ao mesmo tempo"] },
      { titulo: "Um quarto: proteínas", corpo: ["Carnes magras, peixe, ovos", "Leguminosas (feijão, lentilha, grão-de-bico) também contam", "Alterne as fontes durante a semana"] },
      { titulo: "Um quarto: carboidratos", corpo: ["Arroz, batata, mandioca, macarrão", "Prefira versões integrais quando possível", "A porção é o que diferencia — não é proibido, é proporção"], destaque: "Carboidrato não é vilão: é energia. O segredo está na quantidade e no que vem junto." },
      { titulo: "Não esqueça da gordura boa", corpo: ["Azeite de oliva, abacate, castanhas", "Com moderação — uma colher de azeite já faz diferença"] },
      { titulo: "Na prática", corpo: ["Funciona em casa e em restaurante/buffet", "Ajuda a visualizar porção sem contar caloria a toda hora", "Use esse modelo como ponto de partida, não como regra rígida"], destaque: "Tire uma foto do seu prato montado assim e traga para a próxima consulta." },
    ],
  },
  {
    id: "s2", titulo: "Mitos e verdades sobre carboidratos", categoria: "Educação alimentar", cor: ["#A2C2C9", "#739AA0"],
    laminas: [
      { titulo: "Carboidrato é vilão?", corpo: ["Não. É a principal fonte de energia do corpo e do cérebro.", "O problema não é o nutriente — é o excesso ou a baixa qualidade das fontes."] },
      { titulo: "Mito: comer carboidrato à noite engorda", corpo: ["O que determina ganho de peso é o balanço total do dia, não o horário da refeição.", "Jantar com carboidrato não é o problema — exagerar no total diário sim."] },
      { titulo: "Mito: pão integral é sempre mais saudável", corpo: ["Depende da lista de ingredientes, não só do nome na embalagem.", "Procure 'farinha integral' como primeiro ingrediente e poucos aditivos."], destaque: "Vire o pacote e leia o rótulo — a marca não conta a história toda." },
      { titulo: "Verdade: nem todo carboidrato é igual", corpo: ["Integrais e fontes com fibra saciam mais e elevam a glicose mais lentamente.", "Refinados (açúcar, farinha branca) elevam a glicemia rápido e saciam menos."] },
      { titulo: "Quanto comer", corpo: ["Varia com objetivo, atividade física e rotina — não existe número universal.", "Cortar carboidrato sem orientação pode causar fadiga e perda de massa magra."] },
      { titulo: "Resumo da conversa", corpo: ["Carboidrato não precisa ser eliminado.", "Equilíbrio e qualidade da fonte importam mais que zerar o grupo todo."], destaque: "Equilíbrio sempre vence eliminação a longo prazo." },
    ],
  },
  {
    id: "s3", titulo: "Alimentação na gestação", categoria: "Gestante", cor: ["#C9A2B0", "#9E7383"],
    laminas: [
      { titulo: "Por que a alimentação importa agora", corpo: ["Sustenta a formação do bebê, a placenta e suas próprias reservas.", "Não é “comer por dois” — é comer melhor, com mais atenção à qualidade."] },
      { titulo: "Nutrientes-chave da gestação", corpo: ["Ácido fólico — formação do sistema nervoso", "Ferro — previne anemia, mais comum nessa fase", "Cálcio — ossos do bebê sem comprometer os seus", "Ômega-3 (DHA) — desenvolvimento cerebral"] },
      { titulo: "Hidratação", corpo: ["Meta de referência: cerca de 2,5 L de água por dia", "Sinais de pouca água: urina escura, sede intensa, dor de cabeça"], destaque: "Leve uma garrafinha com você — facilita lembrar de beber ao longo do dia." },
      { titulo: "Atenção a esses itens", corpo: ["Álcool: evitar completamente", "Peixes com mercúrio alto em excesso (ex.: peixes grandes/predadores)", "Embutidos e carnes cruas ou mal passadas"] },
      { titulo: "Enjoo e desconforto no início", corpo: ["Refeições menores e mais frequentes ajudam mais que 3 refeições grandes", "Evitar ficar de estômago vazio por muito tempo", "Gengibre (chá ou natural) pode aliviar"] },
      { titulo: "Ganho de peso saudável", corpo: ["A faixa recomendada varia por trimestre e pelo seu IMC pré-gestacional", "Acompanhamos isso juntas a cada consulta — não existe meta genérica"], destaque: "Sua curva de peso é individual. Vamos olhar o seu gráfico na próxima consulta." },
    ],
  },
  {
    id: "s4", titulo: "Lanches inteligentes para o trabalho", categoria: "Praticidade", cor: ["#E0B48C", "#C98B5A"],
    laminas: [
      { titulo: "Por que planejar o lanche", corpo: ["Evita escolhas por impulso na máquina de snacks ou na padaria mais próxima.", "Quem decide com fome decide pior — ter algo pronto facilita a boa escolha."] },
      { titulo: "Para levar na bolsa (sem geladeira)", corpo: ["Castanhas e mix de oleaginosas", "Frutas que não amassam: maçã, banana, tangerina", "Barrinhas caseiras de aveia e fruta"] },
      { titulo: "Se tiver geladeira no trabalho", corpo: ["Iogurte natural ou queijo branco", "Ovos cozidos (duram bem na geladeira por alguns dias)", "Potinho de frutas picadas"] },
      { titulo: "Sem tempo de preparar nada", corpo: ["Opções de mercado com rótulo simples: poucos ingredientes reconhecíveis", "Água de coco, frutas inteiras e castanhas embaladas resolvem bem"] },
      { titulo: "Monte com antecedência", corpo: ["Reserve 20-30 min no fim de semana para organizar potes da semana", "Lanche pronto = menos decisão no meio do dia cansado"], destaque: "Comece organizando só 2-3 dias da semana — não precisa ser tudo de uma vez." },
    ],
  },
  {
    id: "s5", titulo: "Hipertrofia: proteína e timing", categoria: "Esportivo", cor: ["#9FB6A0", "#6E8C72"],
    laminas: [
      { titulo: "Quanto de proteína", corpo: ["A necessidade varia por peso, treino e objetivo — vamos individualizar o seu número.", "Mais não é sempre melhor: existe um teto de aproveitamento por refeição."] },
      { titulo: "Distribuição ao longo do dia", corpo: ["Espalhar proteína em 3-4 refeições funciona melhor que concentrar tudo numa só.", "Cada refeição principal com uma boa fonte de proteína ajuda a atingir a meta do dia."] },
      { titulo: "E a tal 'janela' pós-treino?", corpo: ["Não precisa ser nos primeiros 30 minutos — esse mito já foi revisado.", "O que importa é não deixar passar muitas horas sem comer depois do treino."], destaque: "Relaxa: comer proteína no pós-treino dentro de 1-2h já é suficiente." },
      { titulo: "Fontes de boa qualidade", corpo: ["Carnes magras, peixe, ovos, frango", "Whey protein como complemento prático (não substitui a comida)", "Combinação leguminosa + cereal (feijão + arroz) também soma proteína"] },
      { titulo: "Não é só sobre proteína", corpo: ["Carboidrato dá energia para treinar com qualidade", "Sono e descanso são onde o músculo realmente se recupera e cresce"] },
    ],
  },
  {
    id: "s6", titulo: "Diabetes: índice glicêmico na prática", categoria: "Clínico", cor: ["#B9A88C", "#8E7B5E"],
    laminas: [
      { titulo: "O que é índice glicêmico", corpo: ["Mede a velocidade com que um alimento eleva a glicose no sangue.", "Quanto mais rápido sobe, maior o índice glicêmico do alimento."] },
      { titulo: "Alto x baixo IG — exemplos", corpo: ["Alto: pão branco, batata frita, refrigerante, arroz branco em excesso", "Baixo: leguminosas, vegetais, grãos integrais, a maioria das frutas inteiras"] },
      { titulo: "Como reduzir o impacto de uma refeição", corpo: ["Combine carboidrato com fibra, proteína ou gordura boa", "Exemplo: arroz branco + feijão + salada tem impacto menor do que arroz puro"], destaque: "Combinar é mais simples no dia a dia do que eliminar grupos inteiros." },
      { titulo: "Sobre as frutas", corpo: ["Frutas não são proibidas — atenção à porção e à combinação", "Fruta inteira > suco, porque a fibra desacelera a absorção do açúcar"] },
      { titulo: "Hábito que ajuda bastante", corpo: ["Caminhar de 10 a 15 minutos após a refeição reduz o pico glicêmico", "Pequenas pausas ativas ao longo do dia também contribuem"] },
    ],
  },
  {
    id: "s7", titulo: "Introdução alimentar do bebê (BLW)", categoria: "Infantil", cor: ["#C9C2A2", "#9E9873"],
    laminas: [
      { titulo: "O que é BLW", corpo: ["Baby-Led Weaning: o bebê se alimenta com as próprias mãos desde o início.", "Em vez de papinhas amassadas, oferece-se o alimento em pedaços seguros."] },
      { titulo: "Quando começar", corpo: ["Geralmente a partir dos 6 meses, junto com os sinais de prontidão.", "A idade sozinha não basta — observe o desenvolvimento do bebê."] },
      { titulo: "Sinais de prontidão", corpo: ["Senta sem apoio com boa estabilidade de tronco", "Sustenta bem a cabeça", "Demonstra interesse ativo pela comida da família"] },
      { titulo: "Primeiros alimentos sugeridos", corpo: ["Legumes cozidos em formato de bastão (cenoura, abobrinha, batata-doce)", "Frutas macias em pedaços grandes (banana, manga, pera madura)"], destaque: "Formato de bastão facilita a pega da mãozinha do bebê no início." },
      { titulo: "Segurança à mesa", corpo: ["Sempre supervisionar — nunca deixar o bebê comendo sozinho", "Evitar alimentos pequenos e duros (risco de engasgo): uva inteira, amendoim inteiro", "Texturas e formatos adequados à fase do bebê"] },
      { titulo: "Sobre a sujeira (sim, vai sujar)", corpo: ["Faz parte do processo: o bebê está explorando textura, cor e cheiro.", "Forre o chão e tenha paciência — é aprendizado sensorial, não desperdício"] },
    ],
  },
  {
    id: "s8", titulo: "Leitura de rótulos sem mistério", categoria: "Educação alimentar", cor: ["#A8B6C9", "#73839E"],
    laminas: [
      { titulo: "Por onde começar", corpo: ["Vá direto na lista de ingredientes — eles aparecem em ordem de quantidade.", "Se açúcar ou farinha branca estão entre os 3 primeiros, é um sinal de alerta."] },
      { titulo: "Tabela nutricional: cuidado com a porção", corpo: ["Os valores são por porção de referência — nem sempre é o pacote inteiro.", "Compare sempre o tamanho da porção antes de comparar calorias entre produtos."], destaque: "Um pacote 'de 100 kcal' pode ter 3 porções — ou seja, 300 kcal se comer tudo." },
      { titulo: "Termos que merecem desconfiança", corpo: ["'Light' e 'diet' não são sinônimos de saudável — leia o que mudou de fato", "Açúcar aparece com vários nomes: xarope de glicose, maltodextrina, dextrose"] },
      { titulo: "Sódio escondido", corpo: ["Embutidos, temperos prontos e congelados costumam concentrar bastante sódio", "Compare marcas — a diferença entre elas pode ser grande"] },
      { titulo: "Exercício prático", corpo: ["Pegue dois produtos parecidos no mercado e compare a tabela antes de decidir", "Em pouco tempo isso vira hábito automático, sem esforço"], destaque: "Traga um rótulo que te deixou em dúvida para conversarmos na consulta." },
    ],
  },
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
  { id: "p1", paciente: "Mariana Costa Ribeiro", hora: "Qui · 14:30", tipo: "Retorno", status: "agendada", cor: ["#9DB99F", "#6E8C72"] as [string, string] },
];
