import { isRed, type Card } from "@/lib/blackjack/cards";
import { cn } from "@/lib/utils";

interface Props {
  card?: Card;
  hidden?: boolean;
  size?: "sm" | "md";
}

export function PlayingCard({ card, hidden = false, size = "md" }: Props) {
  const dims = size === "sm" ? "h-16 w-11 text-sm" : "h-24 w-16 text-lg sm:h-28 sm:w-20 sm:text-xl";

  if (hidden || !card) {
    return (
      <div
        className={cn(
          "card-back deal-in flex shrink-0 items-center justify-center rounded-lg border border-border/60",
          dims,
        )}
        aria-label="Carta coperta"
      />
    );
  }

  return (
    <div
      className={cn(
        "playing-card deal-in relative flex shrink-0 flex-col justify-between rounded-lg border border-black/10 p-1.5 font-semibold",
        dims,
      )}
      aria-label={`${card.rank} ${card.suit}`}
    >
      <span className={cn("leading-none", isRed(card.suit) ? "text-red-600" : "text-neutral-900")}>
        {card.rank}
      </span>
      <span
        className={cn(
          "self-center text-2xl leading-none sm:text-3xl",
          isRed(card.suit) ? "text-red-600" : "text-neutral-900",
        )}
      >
        {card.suit}
      </span>
      <span
        className={cn(
          "self-end leading-none",
          isRed(card.suit) ? "text-red-600" : "text-neutral-900",
        )}
      >
        {card.rank}
      </span>
    </div>
  );
}
