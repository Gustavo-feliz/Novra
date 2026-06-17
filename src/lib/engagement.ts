import { LOCAL_KEYS, usePersistentState } from "./localData";
import { pushEvent } from "./events";

export interface StreakState {
  dias: number;
  ultimoDia: string;
}

const todayStr = () => new Date().toDateString();
const yesterdayStr = () => new Date(Date.now() - 86400000).toDateString();

export function useStreak(patientId: string) {
  const [dict, setDict] = usePersistentState<Record<string, StreakState>>(LOCAL_KEYS.streaks, {});
  const streak = dict[patientId] ?? { dias: 0, ultimoDia: "" };

  const registerHydrationComplete = (patientName: string) => {
    const today = todayStr();
    if (streak.ultimoDia === today) return streak;
    const novoDias = streak.ultimoDia === yesterdayStr() ? streak.dias + 1 : 1;
    const proximo: StreakState = { dias: novoDias, ultimoDia: today };
    setDict({ ...dict, [patientId]: proximo });
    pushEvent({
      tipo: "meta",
      titulo: novoDias > 1
        ? `${patientName.split(" ")[0]} está numa sequência de ${novoDias} dias de hidratação 🔥`
        : `${patientName.split(" ")[0]} bateu a meta de hidratação hoje`,
      audiencia: "ambos",
      patientId,
      clinicLink: `/patients/${patientId}`,
      portalLink: "metas",
    });
    return proximo;
  };

  return { streak, registerHydrationComplete };
}

export interface Achievement {
  id: string;
  titulo: string;
  descricao: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "primeiro-registro", titulo: "Primeiro registro", descricao: "Postou a primeira refeição no diário" },
  { id: "dez-refeicoes", titulo: "Dez refeições", descricao: "Registrou 10 refeições no diário alimentar" },
  { id: "streak-3", titulo: "Sequência de 3 dias", descricao: "Bateu a meta de água por 3 dias seguidos" },
  { id: "streak-7", titulo: "Sequência de 7 dias", descricao: "Bateu a meta de água por 7 dias seguidos" },
  { id: "todas-metas", titulo: "Tudo em dia", descricao: "Todas as metas em 100% ao mesmo tempo" },
  { id: "questionarios-em-dia", titulo: "Questionários em dia", descricao: "Respondeu todos os questionários pendentes" },
];

export interface AchievementContext {
  diaryCount: number;
  waterStreak: number;
  allGoalsComplete: boolean;
  allQuestionnairesAnswered: boolean;
}

export function computeUnlocked(ctx: AchievementContext): Set<string> {
  const ids = new Set<string>();
  if (ctx.diaryCount >= 1) ids.add("primeiro-registro");
  if (ctx.diaryCount >= 10) ids.add("dez-refeicoes");
  if (ctx.waterStreak >= 3) ids.add("streak-3");
  if (ctx.waterStreak >= 7) ids.add("streak-7");
  if (ctx.allGoalsComplete) ids.add("todas-metas");
  if (ctx.allQuestionnairesAnswered) ids.add("questionarios-em-dia");
  return ids;
}

export function useAchievements(patientId: string) {
  const [dict, setDict] = usePersistentState<Record<string, string[]>>(LOCAL_KEYS.achievements, {});
  const unlockedIds = dict[patientId] ?? [];

  const unlock = (ids: Set<string>) => {
    if (ids.size === 0) return;
    const prev = new Set(unlockedIds);
    let changed = false;
    ids.forEach((id) => { if (!prev.has(id)) { prev.add(id); changed = true; } });
    if (changed) setDict({ ...dict, [patientId]: Array.from(prev) });
  };

  return { unlockedIds, unlock };
}
