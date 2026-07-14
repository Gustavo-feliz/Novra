import { supabase } from "./supabaseClient";
import type { Appointment, BookingConfig, DiaryPost, FinanceTx, Patient, PatientPlan, QuestionnaireTemplate, SlideContent, SlideTemplate, WhatsAutomation } from "./types";

/* ------------------------------- invites --------------------------------- */

export type InviteInfo = {
  id: string;
  invited_by: string;
  patient_name: string | null;
  patient_email: string | null;
  expires_at: string;
  used_at: string | null;
  clinic_name: string;
};

export async function createInvite(opts: { patientEmail?: string; patientName?: string }, createdBy: string): Promise<{ token: string; url: string }> {
  const { data, error } = await supabase
    .from("patient_invites")
    .insert({
      invited_by: createdBy,
      patient_email: opts.patientEmail?.trim() || null,
      patient_name: opts.patientName?.trim() || null,
    })
    .select("token")
    .single();
  if (error) throw error;
  const url = `${window.location.origin}/convite?token=${data.token}`;
  return { token: data.token as string, url };
}

export async function getInviteInfo(token: string): Promise<InviteInfo | null> {
  const { data, error } = await supabase.rpc("get_invite_info", { p_token: token });
  if (error || !data) return null;
  return data as InviteInfo;
}

export async function useInvite(token: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("use_invite", { p_token: token });
  if (error) return false;
  return (data as any)?.ok === true;
}

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

function rowToAppointment(r: any): Appointment {
  return { id: r.id, paciente: r.paciente, hora: r.hora, dur: Number(r.dur), tipo: r.tipo, modo: r.modo, dia: Number(r.dia), patientId: r.patient_id ?? undefined };
}

export async function getAppointment(id: string): Promise<Appointment | null> {
  const { data, error } = await supabase.from("appointments").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? rowToAppointment(data) : null;
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

export async function createFinance(tx: Omit<FinanceTx, "id">, createdBy: string): Promise<FinanceTx> {
  const [dd, mm, yyyy] = tx.data.split("/");
  const { data, error } = await supabase
    .from("finance_tx")
    .insert({
      data: `${yyyy}-${mm}-${dd}`,
      patient_id: tx.pacienteId,
      paciente: tx.paciente,
      descricao: tx.desc,
      valor: tx.valor,
      forma: tx.forma,
      status: tx.status,
      created_by: createdBy,
    })
    .select("*")
    .single();
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

/* --------------------------------- slides --------------------------------- */

function rowToSlide(r: any): SlideTemplate {
  return { id: r.id, titulo: r.titulo, categoria: r.categoria, cor: r.cor as [string, string], laminas: r.laminas as SlideContent[] };
}

export async function listSlides(): Promise<SlideTemplate[]> {
  const { data, error } = await supabase.from("slides").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToSlide);
}

export async function createSlide(s: Omit<SlideTemplate, "id">, createdBy: string): Promise<SlideTemplate> {
  const { data, error } = await supabase.from("slides")
    .insert({ titulo: s.titulo, categoria: s.categoria, cor: s.cor, laminas: s.laminas, created_by: createdBy })
    .select("*").single();
  if (error) throw error;
  return rowToSlide(data);
}

export async function updateSlide(id: string, patch: Omit<SlideTemplate, "id">): Promise<SlideTemplate> {
  const { data, error } = await supabase.from("slides")
    .update({ titulo: patch.titulo, categoria: patch.categoria, cor: patch.cor, laminas: patch.laminas, updated_at: new Date().toISOString() })
    .eq("id", id).select("*").single();
  if (error) throw error;
  return rowToSlide(data);
}

export async function deleteSlide(id: string) {
  const { error } = await supabase.from("slides").delete().eq("id", id);
  if (error) throw error;
}

/* -------------------------- whats_automations ----------------------------- */

function rowToWhats(r: any): WhatsAutomation {
  return { id: r.id, nome: r.nome, icon: r.icon as WhatsAutomation["icon"], gatilho: r.gatilho, quando: r.quando, template: r.template, ativo: r.ativo, enviadas: Number(r.enviadas) };
}

export async function listWhatsAutomations(): Promise<WhatsAutomation[]> {
  const { data, error } = await supabase.from("whats_automations").select("*").order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToWhats);
}

export async function createWhatsAutomation(a: Omit<WhatsAutomation, "id">, createdBy: string): Promise<WhatsAutomation> {
  const { data, error } = await supabase.from("whats_automations")
    .insert({ nome: a.nome, icon: a.icon, gatilho: a.gatilho, quando: a.quando, template: a.template, ativo: a.ativo, enviadas: a.enviadas, created_by: createdBy })
    .select("*").single();
  if (error) throw error;
  return rowToWhats(data);
}

export async function updateWhatsAutomation(id: string, patch: Partial<Pick<WhatsAutomation, "ativo" | "template" | "enviadas">>): Promise<WhatsAutomation> {
  const { data, error } = await supabase.from("whats_automations").update(patch).eq("id", id).select("*").single();
  if (error) throw error;
  return rowToWhats(data);
}

/* ---------------------------- booking_config ----------------------------- */

function rowToBookingConfig(r: any): BookingConfig {
  return { slug: r.slug, ativo: r.ativo, confirmAuto: r.confirm_auto, servicos: r.servicos ?? [], horarios: r.horarios ?? [] };
}

export async function getBookingConfig(): Promise<BookingConfig | null> {
  const { data, error } = await supabase.from("booking_config").select("*").maybeSingle();
  if (error) throw error;
  return data ? rowToBookingConfig(data) : null;
}

export async function saveBookingConfig(config: BookingConfig, createdBy: string): Promise<void> {
  const { error } = await supabase.from("booking_config").upsert({
    created_by: createdBy,
    slug: config.slug,
    ativo: config.ativo,
    confirm_auto: config.confirmAuto,
    servicos: config.servicos,
    horarios: config.horarios,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function getBookingPublic(slug: string): Promise<BookingConfig | null> {
  const { data, error } = await supabase.rpc("get_booking_public", { p_slug: slug });
  if (error || !data) return null;
  const d = data as any;
  return { slug: d.slug, ativo: d.ativo, confirmAuto: true, servicos: d.servicos ?? [], horarios: d.horarios ?? [] };
}

export async function requestAppointment(slug: string, opts: { nome: string; hora: string; tipo: string; modo: string; dur: number; dia: number }): Promise<boolean> {
  const { data, error } = await supabase.rpc("request_appointment", {
    p_slug: slug, p_nome: opts.nome, p_hora: opts.hora,
    p_tipo: opts.tipo, p_modo: opts.modo, p_dur: opts.dur, p_dia: opts.dia,
  });
  if (error) return false;
  return (data as any)?.ok === true;
}

/* --------------------------------- plans ---------------------------------- */

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
