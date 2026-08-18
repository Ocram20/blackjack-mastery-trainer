import { useState } from "react";
import { BookOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CELL_CLASS,
  CELL_MEANING,
  DEALER_COLS,
  HARD_ROWS,
  SOFT_ROWS,
  SPLIT_ROWS,
  SURRENDER_ROWS,
  type Cell,
  type Row,
} from "@/lib/blackjack/theory";
import { cn } from "@/lib/utils";

interface Selection {
  hand: string;
  dealer: string;
  cell: Cell;
  dev?: string | undefined;
}

export function TheoryDialog() {
  const [showDev, setShowDev] = useState(false);
  const [sel, setSel] = useState<Selection | null>(null);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" className="gap-2">
          <BookOpen className="h-4 w-4" /> Teoria
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Teoria — Strategia Europea (ENHC)
          </DialogTitle>
          <DialogDescription>
            In Europa il banco non riceve la seconda carta coperta: il suo blackjack si scopre solo
            alla fine, quindi alcune mosse cambiano. Clicca su una casella per l'interpretazione.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <Switch id="dev" checked={showDev} onCheckedChange={setShowDev} />
          <Label htmlFor="dev" className="text-xs text-muted-foreground">
            Mostra deviazioni da True Count (numeri in rosso: "+" = da quel true count in su, "−" =
            in giù)
          </Label>
        </div>

        <Tabs defaultValue="hard">
          <TabsList className="flex w-full flex-wrap">
            <TabsTrigger value="hard">Coppie pure</TabsTrigger>
            <TabsTrigger value="soft">Coppie con asso</TabsTrigger>
            <TabsTrigger value="split">Splittare</TabsTrigger>
            <TabsTrigger value="surrender">Resa</TabsTrigger>
          </TabsList>

          <TabsContent value="hard">
            <Grid rows={HARD_ROWS} showDev={showDev} onPick={setSel} />
            <Legend items={["C", "S", "R"]} />
          </TabsContent>
          <TabsContent value="soft">
            <Grid rows={SOFT_ROWS} showDev={showDev} onPick={setSel} />
            <Legend items={["C", "S", "R", "Rs"]} />
          </TabsContent>
          <TabsContent value="split">
            <Grid rows={SPLIT_ROWS} showDev={showDev} onPick={setSel} />
            <Legend items={["Y", "YN", "N", "H"]} />
          </TabsContent>
          <TabsContent value="surrender">
            <Grid rows={SURRENDER_ROWS} showDev={showDev} onPick={setSel} />
            <Legend items={["ARR"]} />
            <p className="mt-2 text-xs text-muted-foreground">
              Assicurazione: da non prendere mai in strategia di base; con conteggio, prenderla dal
              True Count 3+.
            </p>
          </TabsContent>
        </Tabs>

        <div className="rounded-xl border border-border/60 bg-card p-3 text-sm">
          {sel ? (
            <>
              <p className="font-display text-base text-gold">
                {sel.hand} contro {sel.dealer}
              </p>
              <p className="text-muted-foreground">{CELL_MEANING[sel.cell]}</p>
              {sel.dev && (
                <p className="mt-1 text-destructive">
                  Deviazione: cambia mossa a True Count {sel.dev}.
                </p>
              )}
            </>
          ) : (
            <p className="text-muted-foreground">
              Seleziona una casella della tabella per vedere la spiegazione della mossa.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Grid({
  rows,
  showDev,
  onPick,
}: {
  rows: Row[];
  showDev: boolean;
  onPick: (s: Selection) => void;
}) {
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full min-w-[520px] border-separate border-spacing-0.5 text-center text-xs">
        <thead>
          <tr>
            <th className="w-14 text-[10px] uppercase tracking-widest text-muted-foreground">
              Mano
            </th>
            {DEALER_COLS.map((d) => (
              <th key={d} className="rounded bg-black/30 py-1 font-mono text-muted-foreground">
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <td className="rounded bg-black/30 px-1 py-1 font-mono text-muted-foreground">
                {r.label}
              </td>
              {r.cells.map((cell, i) => {
                const dev = r.dev?.[i];
                return (
                  <td key={i} className="p-0">
                    <button
                      type="button"
                      onClick={() =>
                        onPick({
                          hand: r.label,
                          dealer: DEALER_COLS[i]!,
                          cell,
                          dev: showDev ? dev : undefined,
                        })
                      }
                      className={cn(
                        "flex h-8 w-full items-center justify-center gap-0.5 rounded font-mono transition-transform hover:scale-105",
                        CELL_CLASS[cell],
                      )}
                    >
                      <span>{cell === "YN" ? "Y/N" : cell}</span>
                      {showDev && dev && (
                        <span className="text-[9px] font-semibold text-red-400">{dev}</span>
                      )}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Legend({ items }: { items: Cell[] }) {
  return (
    <div className="mt-3 space-y-1 rounded-xl border border-border/60 p-3 text-xs">
      {items.map((k) => (
        <div key={k} className="flex items-center gap-2">
          <span
            className={cn(
              "flex h-5 w-8 items-center justify-center rounded font-mono",
              CELL_CLASS[k],
            )}
          >
            {k === "YN" ? "Y/N" : k}
          </span>
          <span className="text-muted-foreground">{CELL_MEANING[k]}</span>
        </div>
      ))}
    </div>
  );
}
