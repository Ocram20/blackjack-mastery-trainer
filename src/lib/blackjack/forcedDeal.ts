import { cardValue, type Card } from "./cards";
import type { TrainingMode } from "./persistence";

/**
 * Riordina la shoe in modo che le prime due carte producano lo scenario
 * richiesto dalla modalità di allenamento. Nessuna carta viene creata o
 * rimossa: vengono solo spostate in testa, così conteggio e penetrazione
 * restano corretti.
 */
export function forceShoe(shoe: Card[], mode: TrainingMode): Card[] {
  if (mode === "random") return shoe;
  const pair = findPair(shoe, mode);
  if (!pair) return shoe;
  const [i, j] = pair;
  const rest = shoe.filter((_, idx) => idx !== i && idx !== j);
  return [shoe[i]!, shoe[j]!, ...rest];
}

function findPair(shoe: Card[], mode: TrainingMode): [number, number] | null {
  for (let i = 0; i < shoe.length; i++) {
    const a = shoe[i]!;
    if (mode === "soft" && a.rank !== "A") continue;
    for (let j = i + 1; j < shoe.length; j++) {
      const b = shoe[j]!;
      if (ok(mode, a, b)) return [i, j];
    }
  }
  return null;
}

function ok(mode: TrainingMode, a: Card, b: Card): boolean {
  const va = cardValue(a.rank);
  const vb = cardValue(b.rank);
  if (mode === "split") return va === vb;
  if (mode === "double") {
    if (a.rank === "A" || b.rank === "A") return false;
    const t = va + vb;
    return t === 9 || t === 10 || t === 11;
  }
  // soft: asso + carta non-asso
  return a.rank === "A" && b.rank !== "A";
}
