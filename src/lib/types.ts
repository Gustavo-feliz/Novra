export type PatientStatus = "ativo" | "pausa" | "inativo" | "alta";
export type Objetivo = "Emagrecimento" | "Hipertrofia" | "Gestacional" | "Esportivo" | "Clínico" | "Infantil";

export interface Patient {
  id: string;
  nome: string;
  idade: number;
  sexo: "Feminino" | "Masculino";
  objetivo: Objetivo;
  status: PatientStatus;
  tags: string[];
  ultimaConsulta: string;
  proximaAcao: string;
  adesao: number;
  gestante?: boolean;
  cor: [string, string];
  email?: string;
  telefone?: string;
  cpfCnpj?: string;
  dataNascimento?: string;
  observacao?: string;
}

export interface Appointment {
  id: string;
  paciente: string;
  hora: string;
  dur: number;
  tipo: string;
  modo: "Online" | "Presencial";
  dia: number;
}

export interface DiaryMessage {
  autor: string;
  texto: string;
  quando: string;
}

export interface DiaryPost {
  id: string;
  pacienteId: string;
  paciente: string;
  refeicao: string;
  quando: string;
  desc: string;
  cor: [string, string];
  reacoes: number;
  comentarios: number;
  curtido: boolean;
  revisado: boolean;
  mensagens?: DiaryMessage[];
}

export interface QuestionnaireTemplate {
  id: string;
  nome: string;
  categoria: string;
  perguntas: number;
  respostas: number;
  atualizado: string;
  cor: string;
}

export interface FinanceTx {
  id: string;
  data: string;
  paciente: string;
  pacienteId: string;
  desc: string;
  valor: number;
  forma: "Pix" | "Cartão" | "Dinheiro" | "Transferência" | "—";
  status: "Pago" | "Pendente" | "Atrasado";
}

export interface SlideContent {
  titulo: string;
  corpo: string[];
  destaque?: string;
}

export interface SlideTemplate {
  id: string;
  titulo: string;
  categoria: string;
  laminas: SlideContent[];
  cor: [string, string];
}

export interface WhatsAutomation {
  id: string;
  nome: string;
  gatilho: string;
  quando: string;
  ativo: boolean;
  template: string;
  enviadas: number;
  icon: "cake" | "check" | "bell" | "heart" | "star";
}

export interface Goal {
  id: string;
  titulo: string;
  detalhe: string;
  progresso: number;
  categoria: "Habito" | "Clinica" | "Comportamental";
  coposAtuais?: number;
  coposMeta?: number;
  copoMl?: number;
}

export interface NutritionInstruction {
  id: string;
  titulo: string;
  categoria: string;
  resumo: string;
  enviadoEm: string;
  tempoLeitura: string;
}

export interface PortalQuestionnaire {
  id: string;
  titulo: string;
  categoria: string;
  perguntas: {
    id: string;
    texto: string;
    tipo: "texto" | "escala" | "opcao";
    opcoes?: string[];
  }[];
  prazo: string;
  status: "rascunho" | "pendente" | "respondido";
  respostas?: Record<string, string>;
}

export interface PlanItem {
  nome: string;
  porcao?: string;
  kcal?: number;
}

export interface PatientPlan {
  pacienteId: string;
  titulo: string;
  periodo: string;
  kcal: number;
  aguaMl: number;
  proteinaG: number;
  refeicoes: {
    nome: string;
    horario: string;
    itens: PlanItem[];
    observacao?: string;
  }[];
  substituicoes: {
    grupo: string;
    opcoes: string[];
  }[];
}
