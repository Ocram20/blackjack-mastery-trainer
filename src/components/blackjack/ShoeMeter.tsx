import { CARDS_PER_DECK, DECKS } from "@/lib/blackjack/cards";
import { cn } from "@/lib/utils";

interface Props {
  cardsDealt: number;
  discardedDecks: number;
  decksLeft: number;
}

export function ShoeMeter({ cardsDealt, discardedDecks, decksLeft }: Props) {
  const pct = Math.min(100, (cardsDealt / (DECKS * CARDS_PER_DECK)) * 100);

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">Pila scarti</span>
        <span className="font-mono text-sm text-gold">
          {discardedDecks}/{DECKS} mazzi
        </span>
      </div>

      <div className="flex items-end gap-1.5">
        {Array.from({ length: DECKS }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-10 flex-1 rounded-md border transition-all",
              i < discardedDecks
                ? "border-gold/60 bg-gold/70"
                : "border-border bg-black/25",
            )}
          />
        ))}
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-black/30">
        <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${pct}%` }} />
      </div>

      <div className="flex justify-between font-mono text-xs text-muted-foreground">
        <span>{cardsDealt} carte uscite</span>
        <span>{decksLeft} mazzi rimanenti</span>
      </div>
    </div>
  );
}
