import { cardValue, handTotal, isPair, type Card } from "./cards";

export type Action = "hit" | "stand" | "double" | "split" | "surrender";

export interface StrategyContext {
  hand: Card[];
  /** Carta scoperta del banco: 2..10, 11 = Asso */
  dealer: number;
  trueCount: number;
  canDouble: boolean;
  canSplit: boolean;
  canSurrender: boolean;
  /** Double After Split permesso (usato per le mosse Y/N) */
  das: boolean;
}

export interface StrategyResult {
  action: Action;
  /** Spiegazione matematica della mossa corretta */
  reason: string;
  deviation: boolean;
}

const label: Record<Action, string> = {
  hit: "Carta (Hit)",
  stand: "Stai (Stand)",
  double: "Raddoppia (Double)",
  split: "Splitta (Split)",
  surrender: "Resa (Surrender)",
};

export function actionLabel(a: Action): string {
  return label[a];
}

/** R = Raddoppia altrimenti Carta */
function R(ctx: StrategyContext): Action {
  return ctx.canDouble ? "double" : "hit";
}
/** Rs = Raddoppia altrimenti Stai */
function Rs(ctx: StrategyContext): Action {
  return ctx.canDouble ? "double" : "stand";
}
/** Y/N = Splitta solo se il raddoppio post-split è permesso */
function YN(ctx: StrategyContext, fallback: Action): Action {
  return ctx.das && ctx.canSplit ? "split" : fallback;
}

const inSet = (d: number, list: number[]) => list.includes(d);

/**
 * Restituisce la mossa corretta secondo strategia di base europea (ENHC)
 * + deviazioni Hi-Lo (Illustrious 18 europee).
 */
export function bestAction(ctx: StrategyContext): StrategyResult {
  const { hand, dealer, trueCount: tc } = ctx;
  const { total, soft } = handTotal(hand);
  const pair = isPair(hand);
  const twoCards = hand.length === 2;

  // ---- A. Resa (valutata prima di tutto) ----
  if (ctx.canSurrender && twoCards) {
    const sr = surrenderCheck(hand, dealer, tc, total, soft, pair);
    if (sr) return sr;
  }

  // ---- E. Split ----
  if (pair && ctx.canSplit) {
    const sp = splitCheck(ctx, cardValue(hand[0].rank));
    if (sp) return sp;
  }

  // ---- D. Mani morbide ----
  if (soft && twoCards && hand.some((c) => c.rank === "A")) {
    const other = hand.find((c) => c.rank !== "A");
    const kicker = other ? cardValue(other.rank) : 11;
    const s = softCheck(ctx, kicker);
    if (s) return s;
  }

  // ---- C. Mani dure ----
  return hardCheck(ctx, total, soft);
}

function res(action: Action, reason: string, deviation = false): StrategyResult {
  return { action, reason, deviation };
}

function surrenderCheck(
  hand: Card[],
  d: number,
  tc: number,
  total: number,
  soft: boolean,
  pair: boolean,
): StrategyResult | null {
  const A = 11;
  if (pair && cardValue(hand[0].rank) === 8) {
    if (inSet(d, [10, A]))
      return res("surrender", "In ENHC 8,8 contro 10 o Asso si arrende: lo split perderebbe due puntate.");
    return null;
  }
  if (soft) return null;
  switch (total) {
    case 17:
      if (d === A) return res("surrender", "17 dura contro Asso: in ENHC la resa è obbligatoria.");
      if (d === 10 && tc >= 5)
        return res("surrender", `Deviazione: 17 contro 10 si arrende con True Count ≥ 5 (attuale ${tc}).`, true);
      return null;
    case 16:
      if (inSet(d, [9, 10, A])) return res("surrender", "16 contro 9, 10 o Asso: resa.");
      if (d === 8 && tc >= 4)
        return res("surrender", `Deviazione: 16 contro 8 si arrende con True Count ≥ 4 (attuale ${tc}).`, true);
      return null;
    case 15:
      if (inSet(d, [10, A])) return res("surrender", "15 contro 10 o Asso: resa.");
      if (d === 9 && tc >= 2)
        return res("surrender", `Deviazione: 15 contro 9 si arrende con True Count ≥ 2 (attuale ${tc}).`, true);
      return null;
    case 14:
      if (inSet(d, [10, A])) return res("surrender", "14 contro 10 o Asso: resa (regola ENHC).");
      return null;
    case 13:
    case 12:
      if (d === A) return res("surrender", `${total} contro Asso: resa (ENHC).`);
      return null;
    case 7:
    case 6:
    case 5:
      if (d === A) return res("surrender", `${total} contro Asso: resa (ENHC).`);
      return null;
    default:
      return null;
  }
}

function splitCheck(ctx: StrategyContext, v: number): StrategyResult | null {
  const { dealer: d, trueCount: tc } = ctx;
  const A = 11;
  switch (v) {
    case 11:
      if (d === A) return res("hit", "A,A contro Asso: in ENHC non si splitta, si chiede carta.");
      return res("split", "A,A si splitta sempre contro 2-10.");
    case 10:
      if (d === 4 && tc >= 6)
        return res("split", `Deviazione: 10,10 contro 4 si splitta con True Count ≥ 6 (attuale ${tc}).`, true);
      if (d === 5 && tc >= 5)
        return res("split", `Deviazione: 10,10 contro 5 si splitta con True Count ≥ 5 (attuale ${tc}).`, true);
      if (d === 6 && tc >= 4)
        return res("split", `Deviazione: 10,10 contro 6 si splitta con True Count ≥ 4 (attuale ${tc}).`, true);
      return res("stand", "10,10 vale 20: non si splitta mai, si sta.");
    case 9:
      if (inSet(d, [2, 3, 4, 5, 6, 8, 9])) return res("split", "9,9 si splitta contro 2-6, 8 e 9.");
      return res("stand", "9,9 contro 7, 10 o Asso: non si splitta, si sta su 18.");
    case 8:
      if (inSet(d, [2, 3, 4, 5, 6, 7, 8, 9])) return res("split", "8,8 si splitta contro 2-9.");
      return null; // 10/A gestito da resa o mano dura
    case 7:
      if (inSet(d, [2, 3, 4, 5, 6, 7])) return res("split", "7,7 si splitta contro 2-7.");
      return null;
    case 6:
      if (d === 2) {
        const a = YN(ctx, "hit");
        return res(a, "6,6 contro 2: si splitta solo se il raddoppio post-split è permesso (Y/N).");
      }
      if (inSet(d, [3, 4, 5, 6])) return res("split", "6,6 si splitta contro 3-6.");
      return null;
    case 5:
      return null; // 5,5 = 10 dura
    case 4:
      if (inSet(d, [5, 6])) {
        const a = YN(ctx, "hit");
        return res(a, "4,4 contro 5-6: split solo con raddoppio post-split permesso (Y/N).");
      }
      return null;
    case 3:
    case 2:
      if (inSet(d, [2, 3])) {
        const a = YN(ctx, "hit");
        return res(a, `${v},${v} contro 2-3: split solo con raddoppio post-split permesso (Y/N).`);
      }
      if (inSet(d, [4, 5, 6, 7])) return res("split", `${v},${v} si splitta contro 4-7.`);
      return null;
    default:
      return null;
  }
}

function softCheck(ctx: StrategyContext, kicker: number): StrategyResult | null {
  const { dealer: d } = ctx;
  switch (kicker) {
    case 9:
    case 8:
      return res("stand", `A,${kicker} è una mano forte: si sta sempre.`);
    case 7:
      if (d === 2) return res("stand", "A,7 contro 2: si sta.");
      if (inSet(d, [3, 4, 5, 6])) return res(Rs(ctx), "A,7 contro 3-6: raddoppia, altrimenti stai.");
      if (inSet(d, [7, 8])) return res("stand", "A,7 contro 7-8: si sta su 18.");
      return res("hit", "A,7 contro 9, 10 o Asso: chiedi carta.");
    case 6:
      if (d === 2) return res("hit", "A,6 contro 2: chiedi carta.");
      if (inSet(d, [3, 4, 5, 6])) return res(R(ctx), "A,6 contro 3-6: raddoppia, altrimenti carta.");
      return res("hit", "A,6 contro 7+: chiedi carta.");
    case 5:
    case 4:
      if (inSet(d, [2, 3])) return res("hit", `A,${kicker} contro 2-3: chiedi carta.`);
      if (inSet(d, [4, 5, 6])) return res(R(ctx), `A,${kicker} contro 4-6: raddoppia, altrimenti carta.`);
      return res("hit", `A,${kicker} contro 7+: chiedi carta.`);
    case 3:
    case 2:
      if (inSet(d, [2, 3, 4])) return res("hit", `A,${kicker} contro 2-4: chiedi carta.`);
      if (inSet(d, [5, 6])) return res(R(ctx), `A,${kicker} contro 5-6: raddoppia, altrimenti carta.`);
      return res("hit", `A,${kicker} contro 7+: chiedi carta.`);
    default:
      return null;
  }
}

function hardCheck(ctx: StrategyContext, total: number, soft: boolean): StrategyResult {
  const { dealer: d, trueCount: tc } = ctx;
  const A = 11;
  if (soft) {
    // mani morbide multi-carta: stai da 19, altrimenti carta (18 stand contro 2-8)
    if (total >= 19) return res("stand", "Mano morbida da 19 o più: si sta.");
    if (total === 18 && inSet(d, [2, 7, 8])) return res("stand", "18 morbida contro 2, 7 o 8: si sta.");
    return res("hit", `${total} morbida: chiedi carta, non puoi sballare.`);
  }
  if (total >= 17) return res("stand", "17 o più duro: si sta sempre.");

  switch (total) {
    case 16:
      if (d === 10 && tc >= 0)
        return res("stand", `Deviazione: 16 contro 10 si sta con True Count ≥ 0 (attuale ${tc}).`, true);
      if (d === 9 && tc >= 4)
        return res("stand", `Deviazione: 16 contro 9 si sta con True Count ≥ 4 (attuale ${tc}).`, true);
      if (inSet(d, [2, 3, 4, 5, 6])) return res("stand", "16 contro 2-6: si sta.");
      return res("hit", "16 contro 7-A: chiedi carta.");
    case 15:
      if (d === 10 && tc >= 3)
        return res("stand", `Deviazione: 15 contro 10 si sta con True Count ≥ 3 (attuale ${tc}).`, true);
      if (inSet(d, [2, 3, 4, 5, 6])) return res("stand", "15 contro 2-6: si sta.");
      return res("hit", "15 contro 7-A: chiedi carta.");
    case 14:
    case 13:
      if (inSet(d, [2, 3, 4, 5, 6])) return res("stand", `${total} contro 2-6: si sta.`);
      return res("hit", `${total} contro 7-A: chiedi carta.`);
    case 12:
      if (d === 3 && tc >= 2)
        return res("stand", `Deviazione: 12 contro 3 si sta con True Count ≥ 2 (attuale ${tc}).`, true);
      if (d === 2 && tc >= 3)
        return res("stand", `Deviazione: 12 contro 2 si sta con True Count ≥ 3 (attuale ${tc}).`, true);
      if (inSet(d, [4, 5, 6])) return res("stand", "12 contro 4-6: si sta.");
      return res("hit", "12 contro 2, 3 e 7-A: chiedi carta.");
    case 11:
      if (d === A) return res("hit", "11 contro Asso in ENHC: chiedi carta, non raddoppiare.");
      return res(R(ctx), "11 contro 2-10: raddoppia, altrimenti carta.");
    case 10:
      if (inSet(d, [10, A])) return res("hit", "10 contro 10 o Asso: chiedi carta.");
      return res(R(ctx), "10 contro 2-9: raddoppia, altrimenti carta.");
    case 9:
      if (d === 2 && tc >= 1)
        return res(R(ctx), `Deviazione: 9 contro 2 si raddoppia con True Count ≥ 1 (attuale ${tc}).`, true);
      if (d === 7 && tc >= 3)
        return res(R(ctx), `Deviazione: 9 contro 7 si raddoppia con True Count ≥ 3 (attuale ${tc}).`, true);
      if (inSet(d, [3, 4, 5, 6])) return res(R(ctx), "9 contro 3-6: raddoppia, altrimenti carta.");
      return res("hit", "9 contro 2 e 7-A: chiedi carta.");
    case 8:
      if (d === 6 && tc >= 2)
        return res(R(ctx), `Deviazione: 8 contro 6 si raddoppia con True Count ≥ 2 (attuale ${tc}).`, true);
      return res("hit", "8 duro: chiedi carta.");
    default:
      return res("hit", `${total}: chiedi carta.`);
  }
}

/** Assicurazione: solo con Asso del banco e True Count ≥ 3. */
export function shouldTakeInsurance(dealer: number, tc: number): boolean {
  return dealer === 11 && tc >= 3;
}
