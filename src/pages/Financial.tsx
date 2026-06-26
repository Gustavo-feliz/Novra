import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { Eye, EyeOff, Download, TrendingUp, Receipt, Plus } from "lucide-react";
import { Card, Button, Chip, Segmented, IconButton, Modal, Field, Input, Select } from "../components/ui";
import { useToast } from "../components/ui/Toast";
import { FINANCE_MONTHLY, FINANCE_FORMAS } from "../lib/mock";
import { brl, cx } from "../lib/utils";
import { listFinance, updateFinance, createFinance, listPatients } from "../lib/db";
import { getUserId } from "../lib/auth";
import type { FinanceTx, Patient } from "../lib/types";

type Period = "mes" | "trimestre" | "ano";
const STATUS_CHIP: Record<string, string> = { Pago: "sage", Pendente: "amber", Atrasado: "red" };
const FORMAS: FinanceTx["forma"][] = ["Pix", "Cartão", "Dinheiro", "Transferência"];
const STATUSES: FinanceTx["status"][] = ["Pendente", "Pago", "Atrasado"];

function hojeBr() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

export default function Financial() {
  const nav = useNavigate();
  const toast = useToast();
  const [mask, setMask] = useState(false);
  const [period, setPeriod] = useState<Period>("mes");
  const [txs, setTxs] = useState<FinanceTx[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [novo, setNovo] = useState(false);
  const FORM_VAZIO = { pacienteId: "", desc: "", valor: "", forma: "Pix" as FinanceTx["forma"], status: "Pendente" as FinanceTx["status"], data: hojeBr() };
  const [form, setForm] = useState(FORM_VAZIO);
  const m = (v: string) => (mask ? "••••" : v);

  useEffect(() => { listFinance().then(setTxs).catch(() => toast("Erro ao carregar financeiro")); }, []);
  useEffect(() => { listPatients().then(setPatients).catch(() => {}); }, []);

  const resetForm = () => setForm(FORM_VAZIO);
  const fecharModal = () => { setNovo(false); resetForm(); };
  const podeCriar = !!(form.pacienteId && form.desc.trim() && Number(form.valor) > 0);

  const criarMovimentacao = async () => {
    if (!podeCriar) return;
    const userId = getUserId();
    if (!userId) return;
    const paciente = patients.find((p) => p.id === form.pacienteId);
    if (!paciente) return;
    try {
      const saved = await createFinance({
        data: form.data,
        paciente: paciente.nome,
        pacienteId: paciente.id,
        desc: form.desc.trim(),
        valor: Number(form.valor),
        forma: form.forma,
        status: form.status,
      }, userId);
      setTxs([saved, ...txs]);
      toast("Movimentação lançada");
      fecharModal();
    } catch {
      toast("Erro ao lançar movimentação");
    }
  };

  const marcarPago = async (tx: FinanceTx) => {
    try {
      const updated = await updateFinance(tx.id, { status: "Pago", forma: tx.forma === "—" ? "Pix" : tx.forma });
      setTxs(txs.map((item) => item.id === tx.id ? updated : item));
      toast("Pagamento registrado e recibo liberado");
    } catch {
      toast("Erro ao registrar pagamento");
    }
  };

  const stats = useMemo(() => {
    const recebido = txs.filter((t) => t.status === "Pago").reduce((a, t) => a + t.valor, 0);
    const aberto = txs.filter((t) => t.status === "Pendente").reduce((a, t) => a + t.valor, 0);
    const atrasado = txs.filter((t) => t.status === "Atrasado").reduce((a, t) => a + t.valor, 0);
    const pagos = txs.filter((t) => t.status === "Pago");
    const ticket = pagos.length ? recebido / pagos.length : 0;
    return { recebido, aberto, atrasado, ticket };
  }, [txs]);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .3 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14, marginBottom: 18 }}>
        <div>
          <div className="h1">Financeiro</div>
          <div className="muted" style={{ fontSize: 13, marginTop: 3 }}>Visão geral do consultório · junho de 2026</div>
        </div>
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap", alignItems: "center" }}>
          <Segmented<Period> value={period} onChange={setPeriod} options={[{ value: "mes", label: "Mês" }, { value: "trimestre", label: "Trimestre" }, { value: "ano", label: "Ano" }]} />
          <IconButton onClick={() => setMask(!mask)} title="Ocultar valores">{mask ? <EyeOff size={16} /> : <Eye size={16} />}</IconButton>
          <Button variant="ghost" onClick={() => toast("Relatório exportado em CSV")}><Download size={15} />Exportar</Button>
          <Button variant="primary" onClick={() => setNovo(true)}><Plus size={15} />Nova movimentação</Button>
        </div>
      </div>

      <div className="grow grow-resp" style={{ marginBottom: 18 }}>
        <Card pad style={{ flex: 1, minWidth: 150 }}><div className="faint" style={{ fontSize: 11.5 }}>Receita do mês</div><div className="num" style={{ fontSize: 24, fontWeight: 600, marginTop: 4, color: "var(--sage-strong)" }}>{m(brl(8650))}</div><div style={{ marginTop: 6 }}><Chip tone="sage"><TrendingUp size={11} />+12% vs. maio</Chip></div></Card>
        <Card pad style={{ flex: 1, minWidth: 150 }}><div className="faint" style={{ fontSize: 11.5 }}>Recebido</div><div className="num" style={{ fontSize: 24, fontWeight: 600, marginTop: 4 }}>{m(brl(stats.recebido))}</div><div className="faint" style={{ fontSize: 11.5, marginTop: 8 }}>{txs.filter((t) => t.status === "Pago").length} pagamentos</div></Card>
        <Card pad style={{ flex: 1, minWidth: 150 }}><div className="faint" style={{ fontSize: 11.5 }}>Em aberto</div><div className="num" style={{ fontSize: 24, fontWeight: 600, marginTop: 4, color: "var(--amber)" }}>{m(brl(stats.aberto))}</div><div className="faint" style={{ fontSize: 11.5, marginTop: 8 }}>{txs.filter((t) => t.status === "Pendente").length} pendente(s)</div></Card>
        <Card pad style={{ flex: 1, minWidth: 150 }}><div className="faint" style={{ fontSize: 11.5 }}>Atrasado</div><div className="num" style={{ fontSize: 24, fontWeight: 600, marginTop: 4, color: "var(--red)" }}>{m(brl(stats.atrasado))}</div><div className="faint" style={{ fontSize: 11.5, marginTop: 8 }}>{txs.filter((t) => t.status === "Atrasado").length} cobrança(s)</div></Card>
        <Card pad style={{ flex: 1, minWidth: 150 }}><div className="faint" style={{ fontSize: 11.5 }}>Ticket médio</div><div className="num" style={{ fontSize: 24, fontWeight: 600, marginTop: 4 }}>{m(brl(stats.ticket))}</div><div className="faint" style={{ fontSize: 11.5, marginTop: 8 }}>por atendimento</div></Card>
      </div>

      <div className="gcol gcol-resp" style={{ gridTemplateColumns: "1.6fr 1fr", marginBottom: 18 }}>
        <Card pad>
          <span className="eyebrow">Receita por mês</span>
          <div style={{ height: 240, marginTop: 14 }}>
            <ResponsiveContainer>
              <AreaChart data={FINANCE_MONTHLY} margin={{ top: 6, right: 6, left: -12, bottom: 0 }}>
                <defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--sage)" stopOpacity={0.28} /><stop offset="100%" stopColor="var(--sage)" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 4" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "var(--faint)" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--faint)" }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip formatter={(v: number) => [brl(v), "Receita"]} />
                <Area type="monotone" dataKey="receita" stroke="var(--sage)" strokeWidth={2.5} fill="url(#rev)" dot={{ r: 3, fill: "var(--sage)" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card pad>
          <span className="eyebrow">Formas de pagamento</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
            <div style={{ width: 130, height: 130 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={FINANCE_FORMAS} dataKey="valor" nameKey="forma" innerRadius={38} outerRadius={62} paddingAngle={3} stroke="none">
                    {FINANCE_FORMAS.map((f, i) => <Cell key={i} fill={f.cor} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => brl(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 9 }}>
              {FINANCE_FORMAS.map((f) => (
                <div key={f.forma} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
                  <i style={{ width: 9, height: 9, borderRadius: 3, background: f.cor, flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{f.forma}</span>
                  <span className="num faint">{m(brl(f.valor))}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 11 }}>
        <span className="eyebrow">Movimentações recentes</span>
        <span className="chip">{txs.length} lançamentos</span>
      </div>
      <Card style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="tbl" style={{ minWidth: 640 }}>
            <thead><tr><th>Data</th><th>Paciente</th><th>Descrição</th><th className="num">Valor</th><th>Forma</th><th>Status</th><th>Recibo</th></tr></thead>
            <tbody>
              {txs.map((t) => (
                <tr key={t.id} style={{ cursor: "pointer" }} onClick={() => nav(`/patients/${t.pacienteId}`)}>
                  <td className="num">{t.data}</td>
                  <td style={{ fontWeight: 500 }}>{t.paciente}</td>
                  <td className="muted">{t.desc}</td>
                  <td className="num" style={{ fontWeight: 600 }}>{m(brl(t.valor))}</td>
                  <td className="faint">{t.forma}</td>
                  <td><span className={cx("chip", STATUS_CHIP[t.status])} style={{ height: 22 }}>{t.status}</span></td>
                  <td onClick={(e) => {
                    e.stopPropagation();
                    if (t.status === "Pago") toast("Recibo emitido");
                    else {
                      marcarPago(t);
                    }
                  }}>
                    <Button variant="subtle" sm>{t.status === "Pago" ? <><Receipt size={13} />Emitir</> : "Cobrar"}</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {novo && (
        <Modal title="Nova movimentação" sub="Lance uma receita manualmente" onClose={fecharModal} max={480}
          footer={<>
            <Button variant="ghost" onClick={fecharModal}>Cancelar</Button>
            <Button variant="primary" disabled={!podeCriar} onClick={criarMovimentacao}>Lançar</Button>
          </>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Paciente *">
              <Select value={form.pacienteId} onChange={(e) => setForm({ ...form, pacienteId: e.target.value })}>
                <option value="">Selecione um paciente</option>
                {patients.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </Select>
            </Field>
            <Field label="Descrição *">
              <Input value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder="Ex: Consulta de retorno" />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="Valor (R$) *">
                <Input className="num" type="number" min="0" step="0.01" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} placeholder="0,00" />
              </Field>
              <Field label="Data">
                <Input className="num" type="date" value={form.data.split("/").reverse().join("-")}
                  onChange={(e) => {
                    const [y, mo, d] = e.target.value.split("-");
                    setForm({ ...form, data: `${d}/${mo}/${y}` });
                  }} />
              </Field>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="Forma de pagamento">
                <Select value={form.forma} onChange={(e) => setForm({ ...form, forma: e.target.value as FinanceTx["forma"] })}>
                  {FORMAS.map((f) => <option key={f} value={f}>{f}</option>)}
                </Select>
              </Field>
              <Field label="Status">
                <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as FinanceTx["status"] })}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
              </Field>
            </div>
          </div>
        </Modal>
      )}
    </motion.div>
  );
}
