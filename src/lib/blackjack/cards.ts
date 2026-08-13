export type Rank = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
export type Suit = "♠" | "♥" | "♦" | "♣";

export interface Card {
  id: string;
  rank: Rank;
  suit: Suit;
}

export const RANKS: Rank[] = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
export const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];

export const DECKS = 6;
export const CARDS_PER_DECK = 52;

/** Valore "di gioco" della carta (Asso = 11, gestito poi come 1). */
export function cardValue(rank: Rank): number {
  if (rank === "A") return 11;
  if (rank === "J" || rank === "Q" || rank === "K") return 10;
  return parseInt(rank, 10);
}

/** Valore Hi-Lo: 2-6 = +1, 7-9 = 0, 10/J/Q/K/A = -1 */
export function hiLoValue(rank: Rank): number {
  const v = cardValue(rank);
  if (v >= 2 && v <= 6) return 1;
  if (v >= 7 && v <= 9) return 0;
  return -1;
}

/** Carta del banco normalizzata: 2..10 oppure 11 per l'Asso. */
export function upcardKey(rank: Rank): number {
  return cardValue(rank);
}

export function buildShoe(decks = DECKS): Card[] {
  const shoe: Card[] = [];
  for (let d = 0; d < decks; d++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        shoe.push({ id: `${d}-${suit}-${rank}`, rank, suit });
      }
    }
  }
  return shuffle(shoe);
}

export function shuffle<T>(input: T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i] as T;
    arr[i] = arr[j] as T;
    arr[j] = tmp;
  }
  return arr;
}

export interface HandTotal {
  total: number;
  soft: boolean;
  busted: boolean;
}

export function handTotal(cards: Card[]): HandTotal {
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    const v = cardValue(c.rank);
    total += v;
    if (c.rank === "A") aces++;
  }
  let soft = aces > 0;
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  if (aces === 0) soft = false;
  return { total, soft, busted: total > 21 };
}

export function isBlackjack(cards: Card[]): boolean {
  return cards.length === 2 && handTotal(cards).total === 21;
}

export function isPair(cards: Card[]): boolean {
  if (cards.length !== 2) return false;
  return cardValue(cards[0]!.rank) === cardValue(cards[1]!.rank);
}

export function isRed(suit: Suit): boolean {
  return suit === "♥" || suit === "♦";
}

/** True count = running count / mazzi rimanenti, arrotondato per difetto. */
export function trueCount(runningCount: number, cardsDealt: number, decks = DECKS): number {
  const discardedDecks = Math.floor(cardsDealt / CARDS_PER_DECK);
  const remaining = Math.max(1, decks - discardedDecks);
  return Math.floor(runningCount / remaining);
}

export function remainingDecks(cardsDealt: number, decks = DECKS): number {
  return Math.max(1, decks - Math.floor(cardsDealt / CARDS_PER_DECK));
}
