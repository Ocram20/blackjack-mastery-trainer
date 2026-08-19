import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, RotateCcw, Spade, Users, Target, History } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { HandView } from "@/components/blackjack/HandView";
import { ShoeMeter } from "@/components/blackjack/ShoeMeter";
import { TheoryDialog } from "@/components/blackjack/TheoryDialog";
import { SettingsDialog } from "@/components/blackjack/SettingsDialog";
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
          "Allena conteggio delle carte e strategia perfetta su tavolo ENHC a 6 mazzi, con deviazioni da True Count, bot multi-giocatore e quiz sul Running Count.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const CHIPS = [5, 25, 50, 100, 250];

const MODE_LABELS: Record<string, string> = {
  random: "Partita Casuale",
  split: "Allenamento Split",
  double: "Allenamento Raddoppio",
  soft: "Allenamento Mani Morbide",
};

function Index() {
  const g = useBlackjack();
  const [showCount, setShowCount] = useState(false);

  return (
    <main className="min-h-screen bg-background pb-16">
      {/* ---------- Header ---------- */}
      <header className="border-b border-border/60 bg-black/20 backdrop-blur-md sticky top-0 z-20">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="relative group flex-shrink-0">
              <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-600 opacity-60 blur-sm transition duration-300 group-hover:opacity-100" />
              <img
                src="/logo.png"
                alt="Blackjack Trainer Logo"
                className="relative h-11 w-11 rounded-xl object-cover border border-gold/40 shadow-md shadow-gold/20"
              />
            </div>
            <div>
              <h1 className="font-display text-xl leading-tight text-foreground flex items-center gap-2">
                Blackjack Trainer <span className="text-gold font-bold">ENHC</span>
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                6 mazzi · Hi-Lo · deviazioni True Count · multi-giocatore
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Modalità Teoria & Impostazioni */}
            <TheoryDialog />
            <SettingsDialog
              players={g.players}
              setPlayers={g.setPlayers}
              mode={g.mode}
              setMode={g.setMode}
              resetProgress={g.resetProgress}
            />

            {/* Saldo Bankroll */}
            <div className="text-right pl-2 border-l border-border/60">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Saldo</p>
              <p className="font-mono text-lg font-bold text-gold">{g.bankroll.toFixed(0)} €</p>
            </div>

            {/* Switch Conteggio */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-border/60">
              <Switch id="peek" checked={showCount} onCheckedChange={setShowCount} />
              <Label htmlFor="peek" className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer">
                {showCount ? <Eye className="h-3.5 w-3.5 text-gold" /> : <EyeOff className="h-3.5 w-3.5" />}
                <span className="hidden md:inline">Conteggio</span>
              </Label>
            </div>
          </div>
        </div>
      </header>

      {/* ---------- Main Layout ---------- */}
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[1fr_340px]">
        {/* ---------- Tavolo da Gioco ---------- */}
        <section className="table-felt relative overflow-hidden rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col justify-between min-h-[540px]">
          {/* Header Tavolo */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <p className="text-center font-display text-xs sm:text-sm tracking-[0.2em] text-gold/80 flex-1">
              IL BANCO STA SU 17 · BLACKJACK PAGA 3:2 · NO HOLE CARD
            </p>
            {g.mode !== "random" && (
              <Badge variant="outline" className="border-gold/40 text-gold bg-black/40 gap-1 text-xs">
                <Target className="h-3 w-3" /> {MODE_LABELS[g.mode]}
              </Badge>
            )}
          </div>

          {/* Banco */}
          <div className="flex justify-center">
            <HandView
              cards={g.dealer}
              title="Banco"
              badge={g.phase !== "showdown" && g.dealer.length === 1 ? "una sola carta" : undefined}
            />
          </div>

          <div className="my-4 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

          {/* Postazioni Giocatori al Tavolo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 items-end my-2">
            {/* Giocatore 1 (L'Utente) */}
            <div className="space-y-2">
              {g.hands.length === 0 ? (
                <HandView cards={[]} title="Giocatore 1 (Tu)" />
              ) : (
                g.hands.map((h, i) => (
                  <HandView
                    key={i}
                    cards={h.cards}
                    title={g.hands.length > 1 ? `Mano ${i + 1} (Tu) · ${h.bet}€` : `Giocatore 1 (Tu) · ${h.bet}€`}
                    active={g.phase === "player" && i === g.active}
                    badge={h.doubled ? "raddoppiata" : undefined}
                    outcome={h.outcome}
                  />
                ))
              )}
            </div>

            {/* Bot 1 (Giocatore 2) */}
            {g.players >= 2 && (
              <div>
                <HandView
                  cards={g.bots[0]?.cards ?? []}
                  title="Giocatore 2 (Bot)"
                  badge="Bot · Sta a 17+"
                />
              </div>
            )}

            {/* Bot 2 (Giocatore 3) */}
            {g.players >= 3 && (
              <div>
                <HandView
                  cards={g.bots[1]?.cards ?? []}
                  title="Giocatore 3 (Bot)"
                  badge="Bot · Sta a 17+"
                />
              </div>
            )}
          </div>

          {/* ---------- Controlli Gioco ---------- */}
          <div className="mt-6 rounded-2xl bg-black/35 backdrop-blur-sm p-4 border border-white/5">
            {g.phase === "betting" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                    Puntata Mano
                  </Label>
                  <span className="font-mono text-xl font-bold text-gold">{g.bet} €</span>
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
                      className={cn("font-mono font-semibold transition-all", g.bet === c && "ring-2 ring-gold bg-gold/20")}
                    >
                      {c} €
                    </Button>
                  ))}
                </div>
                <Button className="w-full font-bold text-base py-6 shadow-lg shadow-gold/10" size="lg" onClick={g.startRound}>
                  Distribuisci Carte
                </Button>
              </div>
            )}

            {g.phase === "insurance" && (
              <div className="space-y-3 text-center py-2">
                <p className="font-display text-lg text-gold">Il banco mostra un Asso</p>
                <p className="text-sm text-muted-foreground">
                  Vuoi acquistare l&apos;Assicurazione? (costa metà puntata, paga 2:1)
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <Button onClick={() => g.resolveInsurance(true)} className="px-6">Assicurati</Button>
                  <Button variant="secondary" onClick={() => g.resolveInsurance(false)} className="px-6">
                    No, grazie
                  </Button>
                </div>
              </div>
            )}

            {g.phase === "player" && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                <Button onClick={g.hit} disabled={!g.availableActions.hit} className="font-semibold">
                  Carta
                </Button>
                <Button variant="secondary" onClick={g.stand} disabled={!g.availableActions.stand} className="font-semibold">
                  Stai
                </Button>
                <Button variant="secondary" onClick={g.double} disabled={!g.availableActions.double} className="font-semibold">
                  Raddoppia
                </Button>
                <Button variant="secondary" onClick={g.split} disabled={!g.availableActions.split} className="font-semibold">
                  Splitta
                </Button>
                <Button
                  variant="outline"
                  onClick={g.surrender}
                  disabled={!g.availableActions.surrender}
                  className="font-semibold"
                >
                  Resa
                </Button>
              </div>
            )}

            {g.phase === "showdown" && (
              <Button className="w-full font-bold py-6 text-base" size="lg" onClick={g.nextRound}>
                <RotateCcw className="mr-2 h-5 w-5" /> Nuova Mano
              </Button>
            )}

            {g.phase === "quiz" && (
              <div className="space-y-3 py-1">
                <div className="flex items-center gap-2">
                  <p className="font-display text-lg text-gold">Controllo Conteggio Running Count!</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Qual è il Running Count attuale del sabot? (Il gioco riprenderà dopo la verifica)
                </p>
                <div className="flex gap-2 pt-1">
                  <Input
                    autoFocus
                    inputMode="numeric"
                    placeholder="es. -3 oppure +4"
                    value={g.quizAnswer}
                    onChange={(e) => g.setQuizAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && g.submitQuiz()}
                    className="font-mono text-lg"
                  />
                  <Button onClick={g.submitQuiz} className="px-6 font-bold">Verifica</Button>
                </div>
                {g.quizResult && <p className="text-sm font-semibold pt-1">{g.quizResult}</p>}
              </div>
            )}
          </div>
        </section>

        {/* ---------- Pannello Laterale ---------- */}
        <aside className="space-y-4">
          {/* Shoe & Penetrazione */}
          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <ShoeMeter
              cardsDealt={g.cardsDealt}
              discardedDecks={g.discardedDecks}
              decksLeft={g.decksLeft}
            />
          </div>

          {/* Conteggio Hi-Lo */}
          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                Conteggio Hi-Lo
              </p>
              {g.players > 1 && (
                <Badge variant="secondary" className="text-[10px] gap-1">
                  <Users className="h-3 w-3" /> {g.players} giocatori
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Running Count" value={showCount ? `${g.runningCount}` : "•••"} />
              <Stat label="True Count" value={showCount ? `${g.trueCount}` : "•••"} />
            </div>
            {!showCount && (
              <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                Il conteggio aggiorna anche le carte uscite dei bot. Attiva l&apos;occhio in alto per verificare il tuo conto mentale.
              </p>
            )}
          </div>

          {/* Statistiche Allenamento */}
          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground font-semibold">
              Statistiche & Precisione
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <Stat label="Mosse Ok" value={`${g.stats.correct}`} tone="success" />
              <Stat label="Errori" value={`${g.stats.errors}`} tone="danger" />
              <Stat label="Quiz Ok" value={`${g.stats.quizOk}`} tone="success" />
              <Stat label="Quiz Errati" value={`${g.stats.quizKo}`} tone="danger" />
              <Stat label="Vinte / BJ" value={`${g.stats.wins}`} tone="success" />
              <Stat label="Perse / Bust" value={`${g.stats.losses}`} tone="danger" />
            </div>
          </div>

          {/* Cronologia / Registro di gioco */}
          {g.log.length > 0 && (
            <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
              <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1.5">
                <History className="h-3.5 w-3.5" /> Registro Ultime Azioni
              </p>
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                {g.log.slice(0, 8).map((line, idx) => (
                  <p key={idx} className="text-[11px] text-muted-foreground leading-snug border-b border-border/30 pb-1">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Regole rapide */}
          <div className="rounded-2xl border border-border/60 bg-card p-4 text-sm text-muted-foreground shadow-sm">
            <p className="mb-2 font-display text-base text-foreground">Regole ENHC & Trainer</p>
            <ul className="space-y-1.5 text-xs leading-relaxed">
              <li>· ENHC: il banco pesca la 2ª carta a fine turno.</li>
              <li>· Se il banco fa BJ si perdono anche Double e Split.</li>
              <li>· Mosse errate bloccate con spiegazione e deviazioni.</li>
              <li>· Assicurazione conveniente solo con True Count ≥ 3.</li>
              <li>· Valori Hi-Lo: 2-6 (+1), 7-9 (0), 10-A (-1).</li>
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
    <div className="rounded-xl bg-black/25 px-3 py-2 border border-white/5">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p
        className={cn(
          "font-mono text-lg font-bold",
          tone === "success" ? "text-success" : tone === "danger" ? "text-destructive" : "text-gold",
        )}
      >
        {value}
      </p>
    </div>
  );
}
