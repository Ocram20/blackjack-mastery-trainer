import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, RotateCcw, Spade } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { HandView } from "@/components/blackjack/HandView";
import { ShoeMeter } from "@/components/blackjack/ShoeMeter";
import { useBlackjack } from "@/lib/blackjack/useBlackjack";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Blackjack Trainer ENHC — Conteggio Hi-Lo e Strategia" },
      {
        name: "description",
        content:
          "Simulatore didattico di Blackjack europeo (ENHC) con 6 mazzi: allena il conteggio Hi-Lo, il True Count e la strategia perfetta con alert sugli errori.",
      },
      { property: "og:title", content: "Blackjack Trainer ENHC — Conteggio Hi-Lo e Strategia" },
      {
        property: "og:description",
        content:
          "Allena conteggio delle carte e strategia perfetta su tavolo ENHC a 6 mazzi, con deviazioni da True Count e quiz sul Running Count.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const CHIPS = [5, 25, 50, 100, 250];

function Index() {
  const g = useBlackjack();
  const [showCount, setShowCount] = useState(false);

  return (
    <main className="min-h-screen bg-background pb-16">
      <header className="border-b border-border/60 bg-black/20">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold">
              <Spade className="h-5 w-5" />
            </span>
            <div>
              <h1 className="font-display text-xl leading-tight text-foreground">
                Blackjack Trainer <span className="text-gold">ENHC</span>
              </h1>
              <p className="text-xs text-muted-foreground">
                6 mazzi · Hi-Lo · strategia perfetta con deviazioni
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Saldo</p>
              <p className="font-mono text-lg text-gold">{g.bankroll.toFixed(0)} €</p>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="peek" checked={showCount} onCheckedChange={setShowCount} />
              <Label htmlFor="peek" className="flex items-center gap-1 text-xs text-muted-foreground">
                {showCount ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                Conteggio
              </Label>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-6 lg:grid-cols-[1fr_320px]">
        {/* ---------- Tavolo ---------- */}
        <section className="table-felt relative overflow-hidden rounded-3xl p-4 sm:p-6">
          <p className="mb-4 text-center font-display text-sm tracking-[0.2em] text-gold/80">
            IL BANCO STA SU 17 · BLACKJACK PAGA 3:2 · NO HOLE CARD
          </p>

          <HandView
            cards={g.dealer}
            title="Banco"
            badge={g.phase !== "showdown" && g.dealer.length === 1 ? "una sola carta" : undefined}
          />

          <div className="my-6 h-px bg-gold/20" />

          <div className="flex flex-wrap gap-3">
            {g.hands.length === 0 && <HandView cards={[]} title="Giocatore" />}
            {g.hands.map((h, i) => (
              <HandView
                key={i}
                cards={h.cards}
                title={g.hands.length > 1 ? `Mano ${i + 1} · ${h.bet}€` : `Giocatore · ${h.bet}€`}
                active={g.phase === "player" && i === g.active}
                badge={h.doubled ? "raddoppiata" : undefined}
                outcome={h.outcome}
              />
            ))}
          </div>

          {/* ---------- Controlli ---------- */}
          <div className="mt-6 rounded-2xl bg-black/25 p-4">
            {g.phase === "betting" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                    Puntata
                  </Label>
                  <span className="font-mono text-lg text-gold">{g.bet} €</span>
                </div>
                <Slider
                  value={[g.bet]}
                  min={5}
                  max={Math.max(5, Math.min(500, g.bankroll))}
                  step={5}
                  onValueChange={(v) => g.setBet(v[0] ?? 5)}
                />
                <div className="flex flex-wrap gap-2">
                  {CHIPS.map((c) => (
                    <Button
                      key={c}
                      size="sm"
                      variant="secondary"
                      disabled={c > g.bankroll}
                      onClick={() => g.setBet(c)}
                      className={cn("font-mono", g.bet === c && "ring-1 ring-gold")}
                    >
                      {c} €
                    </Button>
                  ))}
                </div>
                <Button className="w-full" size="lg" onClick={g.startRound}>
                  Distribuisci
                </Button>
              </div>
            )}

            {g.phase === "insurance" && (
              <div className="space-y-3 text-center">
                <p className="font-display text-lg">Il banco mostra un Asso</p>
                <p className="text-sm text-muted-foreground">
                  Vuoi l'assicurazione? (costa metà della puntata, paga 2:1)
                </p>
                <div className="flex justify-center gap-3">
                  <Button onClick={() => g.resolveInsurance(true)}>Assicurati</Button>
                  <Button variant="secondary" onClick={() => g.resolveInsurance(false)}>
                    No, grazie
                  </Button>
                </div>
              </div>
            )}

            {g.phase === "player" && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                <Button onClick={g.hit} disabled={!g.availableActions.hit}>
                  Carta
                </Button>
                <Button variant="secondary" onClick={g.stand} disabled={!g.availableActions.stand}>
                  Stai
                </Button>
                <Button variant="secondary" onClick={g.double} disabled={!g.availableActions.double}>
                  Raddoppia
                </Button>
                <Button variant="secondary" onClick={g.split} disabled={!g.availableActions.split}>
                  Splitta
                </Button>
                <Button
                  variant="outline"
                  onClick={g.surrender}
                  disabled={!g.availableActions.surrender}
                >
                  Resa
                </Button>
              </div>
            )}

            {g.phase === "showdown" && (
              <Button className="w-full" size="lg" onClick={g.nextRound}>
                <RotateCcw className="mr-2 h-4 w-4" /> Nuova mano
              </Button>
            )}

            {g.phase === "quiz" && (
              <div className="space-y-3">
                <p className="font-display text-lg text-gold">Controllo conteggio!</p>
                <p className="text-sm text-muted-foreground">
                  Qual è il Running Count attuale? Il gioco è in pausa.
                </p>
                <div className="flex gap-2">
                  <Input
                    autoFocus
                    inputMode="numeric"
                    placeholder="es. -3"
                    value={g.quizAnswer}
                    onChange={(e) => g.setQuizAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && g.submitQuiz()}
                    className="font-mono"
                  />
                  <Button onClick={g.submitQuiz}>Verifica</Button>
                </div>
                {g.quizResult && <p className="text-sm">{g.quizResult}</p>}
              </div>
            )}
          </div>
        </section>

        {/* ---------- Pannello laterale ---------- */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-border/60 bg-card p-4">
            <ShoeMeter
              cardsDealt={g.cardsDealt}
              discardedDecks={g.discardedDecks}
              decksLeft={g.decksLeft}
            />
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-4">
            <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
              Conteggio Hi-Lo
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Running Count" value={showCount ? `${g.runningCount}` : "•••"} />
              <Stat label="True Count" value={showCount ? `${g.trueCount}` : "•••"} />
            </div>
            {!showCount && (
              <p className="mt-3 text-xs text-muted-foreground">
                Il conteggio gira in background: attiva l'interruttore solo per verificarti.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-4">
            <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
              Precisione allenamento
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Mosse corrette" value={`${g.stats.correct}`} tone="success" />
              <Stat label="Errori bloccati" value={`${g.stats.errors}`} tone="danger" />
              <Stat label="Quiz ok" value={`${g.stats.quizOk}`} tone="success" />
              <Stat label="Quiz errati" value={`${g.stats.quizKo}`} tone="danger" />
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-4 text-sm text-muted-foreground">
            <p className="mb-2 font-display text-base text-foreground">Regole del trainer</p>
            <ul className="space-y-1.5 text-xs leading-relaxed">
              <li>· ENHC: il banco pesca la seconda carta solo alla fine del tuo turno.</li>
              <li>· Se il banco fa Blackjack perdi anche le puntate di Double e Split.</li>
              <li>· Le mosse contrarie alla matrice vengono bloccate con spiegazione.</li>
              <li>· Assicurazione solo con Asso e True Count ≥ 3.</li>
              <li>· 2-6 = +1 · 7-9 = 0 · 10, J, Q, K, A = −1.</li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success" | "danger";
}) {
  return (
    <div className="rounded-xl bg-black/25 px-3 py-2">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p
        className={cn(
          "font-mono text-xl",
          tone === "success" ? "text-success" : tone === "danger" ? "text-destructive" : "text-gold",
        )}
      >
        {value}
      </p>
    </div>
  );
}
