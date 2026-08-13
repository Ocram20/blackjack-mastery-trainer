import { handTotal, isBlackjack, type Card } from "@/lib/blackjack/cards";
import { cn } from "@/lib/utils";
import { PlayingCard } from "./PlayingCard";

interface Props {
  cards: Card[];
  title: string;
  active?: boolean | undefined;
  badge?: string | undefined;
  outcome?: string | undefined;
}

const outcomeLabel: Record<string, string> = {
  win: "Vinta",
  lose: "Persa",
  push: "Pari",
  bj: "Blackjack!",
  bust: "Sballata",
  surrender: "Resa",
};

export function HandView({ cards, title, active, badge, outcome }: Props) {
  const { total, soft, busted } = handTotal(cards);
  const bj = isBlackjack(cards);

  return (
    <div
      className={cn(
        "rounded-2xl border border-transparent px-3 py-3 transition-all",
        active && "border-gold/60 bg-black/15 shadow-[0_0_0_1px_var(--gold)]",
      )}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
        <span>{title}</span>
        {cards.length > 0 && (
          <span className="rounded-full bg-black/25 px-2 py-0.5 font-mono text-foreground">
            {bj ? "BJ" : `${soft && total <= 21 ? "soft " : ""}${total}`}
          </span>
        )}
        {badge && <span className="rounded-full bg-gold/20 px-2 py-0.5 text-gold">{badge}</span>}
        {busted && <span className="text-destructive">bust</span>}
        {outcome && (
          <span
            className={cn(
              "rounded-full px-2 py-0.5",
              outcome === "win" || outcome === "bj"
                ? "bg-success/20 text-success"
                : outcome === "push"
                  ? "bg-muted text-muted-foreground"
                  : "bg-destructive/20 text-destructive",
            )}
          >
            {outcomeLabel[outcome] ?? outcome}
          </span>
        )}
      </div>
      <div className="flex gap-2">
        {cards.map((c) => (
          <PlayingCard key={c.id} card={c} />
        ))}
        {cards.length === 0 && <PlayingCard hidden />}
      </div>
    </div>
  );
}
