/** Dati delle tabelle di strategia europea (ENHC) + deviazioni Hi-Lo. */

export type Cell = "C" | "S" | "R" | "Rs" | "Y" | "N" | "YN" | "ARR" | "H" | "";

export const DEALER_COLS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "A"];

export interface Row {
  label: string;
  cells: Cell[];
  /** deviazioni: indice colonna -> nota true count */
  dev?: Record<number, string>;
}

const c = (s: string) => s.split(" ") as Cell[];

/** Coppie pure = mani dure */
export const HARD_ROWS: Row[] = [
  { label: "17", cells: c("S S S S S S S S S S") },
  { label: "16", cells: c("S S S S S C C C C C"), dev: { 7: "4+", 8: "0+" } },
  { label: "15", cells: c("S S S S S C C C C C"), dev: { 8: "3+" } },
  { label: "14", cells: c("S S S S S C C C C C") },
  { label: "13", cells: c("S S S S S C C C C C"), dev: { 0: "-1" } },
  { label: "12", cells: c("C C S S S C C C C C"), dev: { 0: "3+", 1: "2+", 2: "0-" } },
  { label: "11", cells: c("R R R R R R R R R C"), dev: { 9: "4+" } },
  { label: "10", cells: c("R R R R R R R R C C"), dev: { 8: "-1" } },
  { label: "9", cells: c("C R R R R C C C C C"), dev: { 0: "1+", 5: "3+" } },
  { label: "8", cells: c("C C C C C C C C C C"), dev: { 4: "2+" } },
];

/** Coppie con asso = mani morbide */
export const SOFT_ROWS: Row[] = [
  { label: "A,9", cells: c("S S S S S S S S S S") },
  { label: "A,8", cells: c("S S S S S S S S S S"), dev: { 2: "3+", 3: "1+", 4: "1+" } },
  { label: "A,7", cells: c("S Rs Rs Rs Rs S S C C C"), dev: { 0: "0+", 9: "1+" } },
  { label: "A,6", cells: c("C R R R R C C C C C"), dev: { 0: "1+" } },
  { label: "A,5", cells: c("C C R R R C C C C C") },
  { label: "A,4", cells: c("C C R R R C C C C C") },
  { label: "A,3", cells: c("C C C R R C C C C C") },
  { label: "A,2", cells: c("C C C R R C C C C C") },
];

export const SPLIT_ROWS: Row[] = [
  { label: "A,A", cells: c("Y Y Y Y Y Y Y Y Y H") },
  { label: "T,T", cells: c("N N N N N N N N N N"), dev: { 2: "6+", 3: "5+", 4: "4+" } },
  { label: "9,9", cells: c("Y Y Y Y Y N Y Y N N"), dev: { 5: "0+" } },
  { label: "8,8", cells: c("Y Y Y Y Y Y Y Y N N") },
  { label: "7,7", cells: c("Y Y Y Y Y Y N N N N") },
  { label: "6,6", cells: c("YN Y Y Y Y N N N N N") },
  { label: "5,5", cells: c("N N N N N N N N N N") },
  { label: "4,4", cells: c("N N N YN YN N N N N N"), dev: { 2: "3+/N" } },
  { label: "3,3", cells: c("YN YN Y Y Y Y N N N N"), dev: { 0: "0-" } },
  { label: "2,2", cells: c("YN YN Y Y Y Y N N N N") },
];

export const SURRENDER_ROWS: Row[] = [
  { label: "17", cells: c("- - - - - - - - - ARR").map((x) => (x === ("-" as Cell) ? "" : x)), dev: { 8: "5+" } },
  { label: "16", cells: ["", "", "", "", "", "", "", "ARR", "ARR", "ARR"], dev: { 6: "4+", 7: "-1" } },
  { label: "15", cells: ["", "", "", "", "", "", "", "", "ARR", "ARR"], dev: { 7: "2+" } },
  { label: "14", cells: ["", "", "", "", "", "", "", "", "ARR", "ARR"] },
  { label: "13", cells: ["", "", "", "", "", "", "", "", "", "ARR"], dev: { 8: "3+" } },
  { label: "12", cells: ["", "", "", "", "", "", "", "", "", "ARR"] },
  { label: "7", cells: ["", "", "", "", "", "", "", "", "", "ARR"], dev: { 8: "-1" } },
  { label: "6", cells: ["", "", "", "", "", "", "", "", "", "ARR"], dev: { 8: "-2" } },
  { label: "5", cells: ["", "", "", "", "", "", "", "", "", "ARR"] },
  { label: "8,8", cells: ["", "", "", "", "", "", "", "", "ARR", "ARR"] },
];

export const CELL_MEANING: Record<Cell, string> = {
  C: "Carta (Hit): chiedi un'altra carta.",
  S: "Stai (Stand): fermati con questo punteggio.",
  R: "Raddoppia se permesso, altrimenti Carta.",
  Rs: "Raddoppia se permesso, altrimenti Stai.",
  Y: "Splitta la coppia.",
  N: "Non splittare.",
  YN: "Splitta solo se il raddoppio dopo lo split (DAS) è permesso.",
  ARR: "Arrenditi (resa): perdi metà della puntata.",
  H: "Carta (Hit): A,A contro Asso non si splitta in ENHC.",
  "": "Nessuna resa: gioca la mano normalmente.",
};

export const CELL_CLASS: Record<Cell, string> = {
  C: "bg-muted/40 text-foreground",
  S: "bg-amber-700/70 text-white",
  R: "bg-emerald-600/70 text-white",
  Rs: "bg-emerald-700/80 text-white",
  Y: "bg-emerald-600/70 text-white",
  N: "bg-muted/40 text-foreground",
  YN: "bg-teal-600/70 text-white",
  ARR: "bg-emerald-600/70 text-white",
  H: "bg-muted/40 text-foreground",
  "": "bg-transparent",
};
