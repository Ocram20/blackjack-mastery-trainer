import { Settings2, RotateCcw, Users, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TrainingMode } from "@/lib/blackjack/persistence";

interface SettingsDialogProps {
  players: number;
  setPlayers: (n: number) => void;
  mode: TrainingMode;
  setMode: (m: TrainingMode) => void;
  resetProgress: () => void;
}

export function SettingsDialog({
  players,
  setPlayers,
  mode,
  setMode,
  resetProgress,
}: SettingsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-gold/30 hover:border-gold/60">
          <Settings2 className="h-4 w-4 text-gold" /> Impostazioni
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-gold" /> Impostazioni di Gioco
          </DialogTitle>
          <DialogDescription>
            Personalizza la simulazione multi-giocatore e la modalità di allenamento mirato.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Numero di giocatori */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Users className="h-4 w-4 text-gold" />
              Numero di Giocatori al Tavolo
            </Label>
            <Select value={String(players)} onValueChange={(val) => setPlayers(Number(val))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleziona numero giocatori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Giocatore (Solo Tu)</SelectItem>
                <SelectItem value="2">2 Giocatori (Tu + 1 Bot)</SelectItem>
                <SelectItem value="3">3 Giocatori (Tu + 2 Bot)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Le carte servite ai Bot aggiornano il Running Count nascosto, simulando l&apos;affollamento di un vero casinò.
            </p>
          </div>

          {/* Modalità allenamento */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Target className="h-4 w-4 text-gold" />
              Modalità di Allenamento
            </Label>
            <Select value={mode} onValueChange={(val) => setMode(val as TrainingMode)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleziona modalità" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="random">Partita Casuale (Default)</SelectItem>
                <SelectItem value="split">Allenamento Split (Forza coppie)</SelectItem>
                <SelectItem value="double">Allenamento Raddoppio (Start 9, 10 o 11)</SelectItem>
                <SelectItem value="soft">Allenamento Mani Morbide (Start con Asso)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Forza le prime due carte ricevute dall&apos;utente per esercitarti su scenari specifici.
            </p>
          </div>

          <div className="pt-2 border-t border-border/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Ripristina Saldo e Dati</p>
                <p className="text-xs text-muted-foreground">
                  Azzera il saldo a 1000 €, il conteggio e le statistiche salvate.
                </p>
              </div>
              <Button variant="destructive" size="sm" onClick={resetProgress} className="gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
