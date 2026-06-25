import { supabase } from "./supabaseClient";
import type { Appointment, DiaryPost, FinanceTx, Patient, PatientPlan, QuestionnaireTemplate } from "./types";

/* ------------------------------- patients -------------------------------- */

function rowToPatient(r: any): Patient {
  return {
    id: r.id,
    nome: r.nome,
    idade: r.idade,
    sexo: r.sexo,
    objetivo: r.objetivo,
    status: r.status,
    tags: r.tags ?? [],
    ultimaConsulta: r.ultima_consulta,
    proximaAcao: r.proxima_acao,
    adesao: r.adesao,
    gestante: r.gestante ?? undefined,
    cor: r.cor,
    email: r.email ?? undefined,
    telefone: r.telefone ?? undefined,
    cpfCnpj: r.cpf_cnpj ?? undefined,
    dataNascimento: r.data_nascimento ?? undefined,
    observacao: r.observacao ?? undefined,
  };
}

function patientToRow(p: Partial<Patient>) {
  const row: Record<string, unknown> = {};
  if (p.nome !== undefined) row.nome = p.nome;
  if (p.idade !== undefined) row.idade = p.idade;
  if (p.sexo !== undefined) row.sexo = p.sexo;
  if (p.objetivo !== undefined) row.objetivo = p.objetivo;
  if (p.status !== undefined) row.status = p.status;
  if (p.tags !== undefined) row.tags = p.tags;
  if (p.ultimaConsulta !== undefined) row.ultima_consulta = p.ultimaConsulta;
  if (p.proximaAcao !== undefined) row.proxima_acao = p.proximaAcao;
  if (p.adesao !== undefined) row.adesao = p.adesao;
  if (p.gestante !== undefined) row.gestante = p.gestante;
  if (p.cor !== undefined) row.cor = p.cor;
  if (p.email !== undefined) row.email = p.email;
  if (p.telefone !== undefined) row.telefone = p.telefone;
  if (p.cpfCnpj !== undefined) row.cpf_cnpj = p.cpfCnpj;
  if (p.dataNascimento !== undefined) row.data_nascimento = p.dataNascimento;
  if (p.observacao !== undefined) row.observacao = p.observacao;
  return row;
}

export async function listPatients(): Promise<Patient[]> {
  const { data, error } = await supabase.from("patients").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToPatient);
}

export async function getPatient(id: string): Promise<Patient | null> {
  const { data, error } = await supabase.from("patients").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? rowToPatient(data) : null;
}

export async function createPatient(p: Omit<Patient, "id">, createdBy: string): Promise<Patient> {
  const { data, error } = await supabase.from("patients").insert({ ...patientToRow(p), created_by: createdBy }).select("*").single();
  if (error) throw error;
  return rowToPatient(data);
}

export async function updatePatient(id: string, patch: Partial<Patient>): Promise<Patient> {
  const { data, error } = await supabase.from("patients").update(patientToRow(patch)).eq("id", id).select("*").single();
  if (error) throw error;
  return rowToPatient(data);
}

export async function deletePatient(id: string) {
  const { error } = await supabase.from("patients").delete().eq("id", id);
  if (error) throw error;
}

/* ----------------------------- appointments ------------------------------ */

function rowToAppointment(r: any): Appointment & { id: string } {
  return { id: r.id, paciente: r.paciente, hora: r.hora, dur: Number(r.dur), tipo: r.tipo, modo: r.modo, dia: Number(r.dia) };
}

export async function listAppointments(): Promise<Appointment[]> {
  const { data, error } = await supabase.from("appointments").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToAppointment);
}

export async function createAppointment(a: Omit<Appointment, "id"> & { patientId?: string }, createdBy: string): Promise<Appointment> {
  const { data, error } = await supabase
    .from("appointments")
    .insert({ patient_id: a.patientId, paciente: a.paciente, hora: a.hora, dur: a.dur, tipo: a.tipo, modo: a.modo, dia: a.dia, created_by: createdBy })
    .select("*")
    .single();
  if (error) throw error;
  return rowToAppointment(data);
}

export async function updateAppointment(id: string, patch: Partial<Appointment>): Promise<Appointment> {
  const { data, error } = await supabase.from("appointments").update(patch).eq("id", id).select("*").single();
  if (error) throw error;
  return rowToAppointment(data);
}

export async function deleteAppointment(id: string) {
  const { error } = await supabase.from("appointments").delete().eq("id", id);
  if (error) throw error;
}

/* -------------------------------- diaries -------------------------------- */

function rowToDiary(r: any): DiaryPost {
  return {
    id: r.id,
    pacienteId: r.patient_id,
    paciente: r.paciente,
    refeicao: r.refeicao,
    quando: r.quando,
    desc: r.descricao,
    cor: r.cor,
    reacoes: r.reacoes,
    comentarios: r.comentarios,
    curtido: r.curtido,
    revisado: r.revisado,
    mensagens: r.mensagens ?? undefined,
  };
}

export async function listDiaries(): Promise<DiaryPost[]> {
  const { data, error } = await supabase.from("diaries").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToDiary);
}

export async function updateDiary(id: string, patch: Partial<{ curtido: boolean; revisado: boolean; reacoes: number; comentarios: number; imageUrl?: string; mensagens: DiaryPost["mensagens"] }>): Promise<DiaryPost> {
  const { data, error } = await supabase.from("diaries").update(patch).eq("id", id).select("*").single();
  if (error) throw error;
  return rowToDiary(data);
}

export async function createDiary(diary: Omit<DiaryPost, "id" | "revisado" | "curtido" | "reacoes" | "comentarios" | "mensagens">, createdBy: string): Promise<DiaryPost> {
  const { data, error } = await supabase.from("diaries")
    .insert({ paciente_id: diary.pacienteId, paciente: diary.paciente, refeicao: diary.refeicao, quando: diary.quando, desc: diary.desc, cor: diary.cor, image_url: diary.imageUrl, created_by: createdBy })
    .select("*")
    .single();
  if (error) throw error;
  return rowToDiary(data);
}

export async function uploadDiaryImage(file: File, patientId: string): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `diaries/${patientId}/${Date.now()}.${ext}`;
  const { error: uploadErr } = await supabase.storage.from("media").upload(path, file);
  if (uploadErr) throw uploadErr;
  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return data.publicUrl;
}

/* ---------------------------- questionnaires ------------------------------ */

function rowToQuestionnaire(r: any): QuestionnaireTemplate {
  return { id: r.id, nome: r.nome, categoria: r.categoria, perguntas: r.perguntas, respostas: r.respostas, atualizado: r.atualizado, cor: r.cor };
}

export async function listQuestionnaires(): Promise<QuestionnaireTemplate[]> {
  const { data, error } = await supabase.from("questionnaires").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToQuestionnaire);
}

export async function createQuestionnaire(q: Omit<QuestionnaireTemplate, "id">, createdBy: string): Promise<QuestionnaireTemplate> {
  const { data, error } = await supabase
    .from("questionnaires")
    .insert({ nome: q.nome, categoria: q.categoria, perguntas: q.perguntas, respostas: q.respostas, atualizado: q.atualizado, cor: q.cor, created_by: createdBy })
    .select("*")
    .single();
  if (error) throw error;
  return rowToQuestionnaire(data);
}

/* -------------------------------- finance --------------------------------- */

function rowToFinance(r: any): FinanceTx {
  const [yyyy, mm, dd] = String(r.data).split("-");
  return { id: r.id, data: `${dd}/${mm}/${yyyy}`, paciente: r.paciente, pacienteId: r.patient_id, desc: r.descricao, valor: Number(r.valor), forma: r.forma, status: r.status };
}

export async function listFinance(): Promise<FinanceTx[]> {
  const { data, error } = await supabase.from("finance_tx").select("*").order("data", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToFinance);
}

export async function updateFinance(id: string, patch: Partial<Pick<FinanceTx, "forma" | "status">>): Promise<FinanceTx> {
  const { data, error } = await supabase.from("finance_tx").update(patch).eq("id", id).select("*").single();
  if (error) throw error;
  return rowToFinance(data);
}

/* --------------------------------- plans ---------------------------------- */

function rowToPlan(r: any): PatientPlan {
  return {
    pacienteId: r.patient_id,
    titulo: r.titulo,
    periodo: r.periodo,
    kcal: r.kcal,
    aguaMl: r.agua_ml,
    proteinaG: r.proteina_g,
    refeicoes: r.refeicoes ?? [],
    substituicoes: r.substituicoes ?? [],
  };
}

export async function getPlan(patientId: string): Promise<PatientPlan | null> {
  const { data, error } = await supabase.from("plans").select("*").eq("patient_id", patientId).maybeSingle();
  if (error) throw error;
  return data ? rowToPlan(data) : null;
}

export async function savePlan(plan: PatientPlan, updatedBy: string): Promise<PatientPlan> {
  const { data, error } = await supabase
    .from("plans")
    .upsert({
      patient_id: plan.pacienteId,
      titulo: plan.titulo,
      periodo: plan.periodo,
      kcal: plan.kcal,
      agua_ml: plan.aguaMl,
      proteina_g: plan.proteinaG,
      refeicoes: plan.refeicoes,
      substituicoes: plan.substituicoes,
      updated_by: updatedBy,
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();
  if (error) throw error;
  return rowToPlan(data);
}
