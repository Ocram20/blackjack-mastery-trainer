import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  buildShoe,
  cardValue,
  handTotal,
  hiLoValue,
  isBlackjack,
  isPair,
  remainingDecks,
  trueCount as calcTrueCount,
  DECKS,
  CARDS_PER_DECK,
  type Card,
} from "./cards";
import { actionLabel, bestAction, shouldTakeInsurance, type Action } from "./strategy";

export type Phase = "betting" | "insurance" | "player" | "showdown" | "quiz";

export interface PlayerHand {
  cards: Card[];
  bet: number;
  done: boolean;
  doubled: boolean;
  surrendered: boolean;
  fromSplit: boolean;
  outcome?: "win" | "lose" | "push" | "bj" | "bust" | "surrender";
  payout?: number;
}

const PENETRATION = 0.75;
const DAS = true;

export function useBlackjack() {
  const [shoe, setShoe] = useState<Card[]>(() => buildShoe());
  const [cardsDealt, setCardsDealt] = useState(0);
  const [runningCount, setRunningCount] = useState(0);
  const [bankroll, setBankroll] = useState(1000);
  const [bet, setBet] = useState(25);
  const [phase, setPhase] = useState<Phase>("betting");
  const [hands, setHands] = useState<PlayerHand[]>([]);
  const [active, setActive] = useState(0);
  const [dealer, setDealer] = useState<Card[]>([]);
  const [insurance, setInsurance] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [stats, setStats] = useState({ correct: 0, errors: 0, quizOk: 0, quizKo: 0 });
  const [quizAnswer, setQuizAnswer] = useState("");
  const [quizResult, setQuizResult] = useState<string | null>(null);

  const shoeRef = useRef(shoe);
  shoeRef.current = shoe;
  const countRef = useRef(runningCount);
  countRef.current = runningCount;
  const dealtRef = useRef(cardsDealt);
  dealtRef.current = cardsDealt;

  const trueCount = useMemo(() => calcTrueCount(runningCount, cardsDealt), [runningCount, cardsDealt]);
  const decksLeft = useMemo(() => remainingDecks(cardsDealt), [cardsDealt]);
  const discardedDecks = Math.floor(cardsDealt / CARDS_PER_DECK);

  const pushLog = useCallback((line: string) => {
    setLog((l) => [line, ...l].slice(0, 30));
  }, []);

  /** Estrae n carte aggiornando conteggio e pila scarti. */
  const draw = useCallback((n: number): Card[] => {
    const current = shoeRef.current;
    const taken = current.slice(0, n);
    const rest = current.slice(n);
    shoeRef.current = rest;
    setShoe(rest);
    const delta = taken.reduce((s, c) => s + hiLoValue(c.rank), 0);
    countRef.current += delta;
    dealtRef.current += taken.length;
    setRunningCount(countRef.current);
    setCardsDealt(dealtRef.current);
    return taken;
  }, []);

  const dealerUp = dealer[0] ? cardValue(dealer[0].rank) : 0;

  const strategyCtx = useCallback(
    (hand: PlayerHand, handCount: number) => ({
      hand: hand.cards,
      dealer: dealerUp,
      trueCount,
      canDouble: hand.cards.length === 2 && bankroll >= hand.bet,
      canSplit:
        isPair(hand.cards) && handCount < 4 && bankroll >= hand.bet && hand.cards.length === 2,
      canSurrender: hand.cards.length === 2 && !hand.fromSplit,
      das: DAS,
    }),
    [dealerUp, trueCount, bankroll],
  );

  const newShoeIfNeeded = useCallback(() => {
    if (shoeRef.current.length < DECKS * CARDS_PER_DECK * (1 - PENETRATION)) {
      const fresh = buildShoe();
      shoeRef.current = fresh;
      countRef.current = 0;
      dealtRef.current = 0;
      setShoe(fresh);
      setRunningCount(0);
      setCardsDealt(0);
      pushLog("🔄 Nuovo sabot: 6 mazzi mescolati, conteggio azzerato.");
    }
  }, [pushLog]);

  const settle = useCallback(
    (playerHands: PlayerHand[], dealerCards: Card[], insBet: number) => {
      const dealerBJ = isBlackjack(dealerCards);
      const dTotal = handTotal(dealerCards).total;
      let net = 0;
      const resolved = playerHands.map((h): PlayerHand => {
        if (h.surrendered) return { ...h, outcome: "surrender", payout: -h.bet / 2 };
        const pBJ = isBlackjack(h.cards) && !h.fromSplit;
        const p = handTotal(h.cards);
        if (dealerBJ) {
          if (pBJ) return { ...h, outcome: "push", payout: 0 };
          // ENHC: si perdono anche le puntate aggiuntive di Double e Split
          return { ...h, outcome: "lose", payout: -h.bet };
        }
        if (p.busted) return { ...h, outcome: "bust", payout: -h.bet };
        if (pBJ) return { ...h, outcome: "bj", payout: h.bet * 1.5 };
        if (dTotal > 21 || p.total > dTotal) return { ...h, outcome: "win", payout: h.bet };
        if (p.total === dTotal) return { ...h, outcome: "push", payout: 0 };
        return { ...h, outcome: "lose", payout: -h.bet };
      });
      net = resolved.reduce((s, h) => s + (h.payout ?? 0), 0);
      if (insBet > 0) net += dealerBJ ? insBet * 2 : -insBet;
      setHands(resolved);
      setDealer(dealerCards);
      setBankroll((b) => b + net);
      setPhase("showdown");
      pushLog(
        `${dealerBJ ? "Banco BLACKJACK — " : ""}Banco ${dTotal > 21 ? "sballa" : dTotal} · Risultato ${net >= 0 ? "+" : ""}${net}€`,
      );
      // Quiz a intervalli casuali
      if (Math.random() < 0.22) {
        setTimeout(() => {
          setQuizAnswer("");
          setQuizResult(null);
          setPhase("quiz");
        }, 900);
      }
    },
    [pushLog],
  );

  /** ENHC: il banco pesca la seconda carta solo ora. */
  const playDealer = useCallback(
    (playerHands: PlayerHand[], insBet: number) => {
      const allGone = playerHands.every(
        (h) => h.surrendered || handTotal(h.cards).busted,
      );
      let dealerCards = [...dealer, ...draw(1)];
      if (!isBlackjack(dealerCards) && !allGone) {
        while (handTotal(dealerCards).total < 17) {
          dealerCards = [...dealerCards, ...draw(1)];
        }
      }
      settle(playerHands, dealerCards, insBet);
    },
    [dealer, draw, settle],
  );

  const advance = useCallback(
    (updated: PlayerHand[], fromIndex: number) => {
      const next = updated.findIndex((h, i) => i >= fromIndex && !h.done);
      if (next === -1) {
        setHands(updated);
        playDealer(updated, insurance);
      } else {
        setHands(updated);
        setActive(next);
      }
    },
    [playDealer, insurance],
  );

  const startRound = useCallback(() => {
    if (bet > bankroll) {
      toast.error("Puntata superiore al saldo disponibile.");
      return;
    }
    newShoeIfNeeded();
    const player = draw(2);
    const up = draw(1);
    const hand: PlayerHand = {
      cards: player,
      bet,
      done: false,
      doubled: false,
      surrendered: false,
      fromSplit: false,
    };
    setHands([hand]);
    setActive(0);
    setDealer(up);
    setInsurance(0);
    if (cardValue(up[0]!.rank) === 11) {
      setPhase("insurance");
      return;
    }
    if (isBlackjack(player)) {
      setPhase("player");
      setTimeout(() => {
        setHands([{ ...hand, done: true }]);
        playDealerWith([{ ...hand, done: true }], up, 0);
      }, 400);
      return;
    }
    setPhase("player");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bet, bankroll, draw, newShoeIfNeeded]);

  /** Variante usata quando lo state del banco non è ancora propagato. */
  const playDealerWith = useCallback(
    (playerHands: PlayerHand[], dealerStart: Card[], insBet: number) => {
      const allGone = playerHands.every((h) => h.surrendered || handTotal(h.cards).busted);
      let dealerCards = [...dealerStart, ...draw(1)];
      if (!isBlackjack(dealerCards) && !allGone) {
        while (handTotal(dealerCards).total < 17) {
          dealerCards = [...dealerCards, ...draw(1)];
        }
      }
      settle(playerHands, dealerCards, insBet);
    },
    [draw, settle],
  );

  const resolveInsurance = useCallback(
    (take: boolean) => {
      const correct = shouldTakeInsurance(dealerUp, trueCount);
      if (take !== correct) {
        setStats((s) => ({ ...s, errors: s.errors + 1 }));
        toast.error(
          take
            ? `Errore: assicurazione da prendere solo con True Count ≥ 3 (attuale ${trueCount}).`
            : `Errore: con True Count ${trueCount} ≥ 3 l'assicurazione diventa vantaggiosa.`,
          { description: "Azione bloccata: correggi la scelta." },
        );
        return;
      }
      setStats((s) => ({ ...s, correct: s.correct + 1 }));
      const insBet = take ? bet / 2 : 0;
      setInsurance(insBet);
      const hand = hands[0];
      if (hand && isBlackjack(hand.cards)) {
        const done = [{ ...hand, done: true }];
        setHands(done);
        playDealerWith(done, dealer, insBet);
        return;
      }
      setPhase("player");
    },
    [dealerUp, trueCount, bet, hands, dealer, playDealerWith],
  );

  const validate = useCallback(
    (attempt: Action): boolean => {
      const hand = hands[active];
      if (!hand) return false;
      const ctx = strategyCtx(hand, hands.length);
      const best = bestAction(ctx);
      if (best.action !== attempt) {
        setStats((s) => ({ ...s, errors: s.errors + 1 }));
        toast.error(`Mossa sbagliata: ${actionLabel(attempt)}`, {
          description: `${best.reason} Mossa corretta: ${actionLabel(best.action)}.${best.deviation ? " (deviazione da True Count)" : ""}`,
        });
        return false;
      }
      setStats((s) => ({ ...s, correct: s.correct + 1 }));
      if (best.deviation) {
        toast.success(`Deviazione corretta! ${actionLabel(best.action)}`, { description: best.reason });
      }
      return true;
    },
    [hands, active, strategyCtx],
  );

  const hit = useCallback(() => {
    if (!validate("hit")) return;
    const card = draw(1);
    const updated = hands.map((h, i) =>
      i === active ? { ...h, cards: [...h.cards, ...card] } : h,
    );
    const me = updated[active]!;
    if (handTotal(me.cards).busted) {
      updated[active] = { ...me, done: true };
      pushLog(`Mano ${active + 1}: sballata con ${handTotal(me.cards).total}.`);
      advance(updated, active + 1);
    } else {
      setHands(updated);
    }
  }, [validate, draw, hands, active, advance, pushLog]);

  const stand = useCallback(() => {
    if (!validate("stand")) return;
    const updated = hands.map((h, i) => (i === active ? { ...h, done: true } : h));
    advance(updated, active + 1);
  }, [validate, hands, active, advance]);

  const double = useCallback(() => {
    if (!validate("double")) return;
    const card = draw(1);
    const updated = hands.map((h, i) =>
      i === active
        ? { ...h, cards: [...h.cards, ...card], bet: h.bet * 2, doubled: true, done: true }
        : h,
    );
    advance(updated, active + 1);
  }, [validate, draw, hands, active, advance]);

  const split = useCallback(() => {
    if (!validate("split")) return;
    const hand = hands[active]!;
    const [c1, c2] = [hand.cards[0]!, hand.cards[1]!];
    const extra = draw(2);
    const h1: PlayerHand = { ...hand, cards: [c1, extra[0]!], fromSplit: true, done: false };
    const h2: PlayerHand = { ...hand, cards: [c2, extra[1]!], fromSplit: true, done: false };
    const updated = [...hands.slice(0, active), h1, h2, ...hands.slice(active + 1)];
    // Split di assi: una sola carta per mano
    if (cardValue(c1.rank) === 11) {
      updated[active] = { ...h1, done: true };
      updated[active + 1] = { ...h2, done: true };
      advance(updated, active + 2);
      return;
    }
    setHands(updated);
    setActive(active);
  }, [validate, hands, active, draw, advance]);

  const surrender = useCallback(() => {
    if (!validate("surrender")) return;
    const updated = hands.map((h, i) => (i === active ? { ...h, surrendered: true, done: true } : h));
    advance(updated, active + 1);
  }, [validate, hands, active, advance]);

  const nextRound = useCallback(() => {
    setHands([]);
    setDealer([]);
    setActive(0);
    setInsurance(0);
    setPhase("betting");
  }, []);

  const submitQuiz = useCallback(() => {
    const val = parseInt(quizAnswer, 10);
    if (Number.isNaN(val)) {
      setQuizResult("Inserisci un numero.");
      return;
    }
    if (val === runningCount) {
      setStats((s) => ({ ...s, quizOk: s.quizOk + 1 }));
      setQuizResult(`✅ Corretto! Running Count = ${runningCount} (True Count ${trueCount}).`);
      toast.success("Conteggio corretto!");
    } else {
      setStats((s) => ({ ...s, quizKo: s.quizKo + 1 }));
      setQuizResult(`❌ Sbagliato. Running Count reale = ${runningCount} (True Count ${trueCount}).`);
      toast.error(`Conteggio errato: hai detto ${val}, il valore reale è ${runningCount}.`);
    }
    setTimeout(() => setPhase("showdown"), 1400);
  }, [quizAnswer, runningCount, trueCount]);

  const activeHand = hands[active];
  const availableActions = useMemo(() => {
    if (phase !== "player" || !activeHand) {
      return { hit: false, stand: false, double: false, split: false, surrender: false };
    }
    const ctx = strategyCtx(activeHand, hands.length);
    return {
      hit: !activeHand.done,
      stand: !activeHand.done,
      double: ctx.canDouble && !activeHand.done,
      split: ctx.canSplit && !activeHand.done,
      surrender: ctx.canSurrender && !activeHand.done,
    };
  }, [phase, activeHand, hands.length, strategyCtx]);

  return {
    phase,
    hands,
    active,
    dealer,
    bet,
    setBet,
    bankroll,
    runningCount,
    trueCount,
    decksLeft,
    discardedDecks,
    cardsDealt,
    shoeLeft: shoe.length,
    insurance,
    log,
    stats,
    quizAnswer,
    setQuizAnswer,
    quizResult,
    submitQuiz,
    availableActions,
    startRound,
    resolveInsurance,
    hit,
    stand,
    double,
    split,
    surrender,
    nextRound,
  };
}
