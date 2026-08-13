# Blackjack Mastery Trainer

Ruolo: Sei uno sviluppatore esperto in React, TypeScript e Tailwind CSS.

Obiettivo: Crea un simulatore di Blackjack interattivo a scopo didattico per allenare l'utente al conteggio delle carte e alla strategia perfetta.

Interfaccia: Pulita, moderna (stile Tailwind). Deve mostrare il tavolo, le carte (grafica minimale), i pulsanti per le azioni, uno slider o input per variare la puntata, e un indicatore dei mazzi scartati nella pila.

1. REGOLA DEL GIOCO: BLACKJACK EUROPEO (ENHC)

Il simulatore deve seguire le regole ENHC (European No Hole Card):  

Il banco riceve inizialmente una sola carta scoperta. Non c'è una seconda carta coperta all'inizio.  

Se il banco fa Blackjack, il giocatore lo scopre solo alla fine del turno, perdendo anche le puntate aggiuntive derivanti da Raddoppi (Double) o Split.  

Il gioco si svolge con un sabot (shoe) da 6 mazzi standard.  

2. MOTORE DI CONTEGGIO: SISTEMA HI-LO E TRUE COUNT

Il sistema deve calcolare silenziosamente in background i seguenti valori in tempo reale:

Valori carte: 2, 3, 4, 5, 6 valgono +1. Le carte 7, 8, 9 valgono 0. Le carte 10, J, Q, K, Asso valgono -1.  

Running Count: È la somma progressiva dei valori di tutte le carte uscite.  

True Count: Calcolato come Running Count / Mazzi Rimanenti (arrotondato sempre per difetto).  

Mazzi Rimanenti: Mazzi totali (6) meno i mazzi già scartati visivamente.  

3. MECCANICA DI ALLENAMENTO E ALERT ERRORI

L'utente gioca la sua mano. Se l'utente clicca un'azione che va contro la matrice della "Strategia di Base" o ignora una "Deviazione" dettata dal True Count in quel momento, l'app deve bloccare l'azione, mostrare un alert (es. un toast rosso) spiegando l'errore matematico, e suggerire la mossa corretta basata sulla matrice qui sotto. A intervalli casuali, l'app deve mettere in pausa il gioco e chiedere all'utente di inserire il Running Count attuale per testare la sua memoria.

4. MATRICE DECISIONALE (STRATEGIA E DEVIAZIONI EUROPEE)

Implementa questa esatta logica per validare le mosse dell'utente.

Legenda Azioni: C (Carta/Hit), S (Stai/Stand), R (Raddoppia altrimenti Carta), Rs (Raddoppia altrimenti Stai), Y (Splitta), Y/N (Splitta solo se raddoppio post-split è permesso), N (Non splittare), ARR (Resa/Surrender).  

A. Assicurazione (Insurance)  

Di base: NON prendere mai.

Deviazione: Prenderla SOLO se la carta del banco è Asso e il True Count è >= 3.

B. Resa (Surrender - Da valutare prima delle altre mosse)  

Mani dure:

17: ARR contro A. (Deviazione: ARR contro 10 se True Count >= 5).

16: ARR contro 9, 10, A. (Deviazione: ARR contro 8 se True Count >= 4).

15: ARR contro 10, A. (Deviazione: ARR contro 9 se True Count >= 2).

14: ARR contro 10, A. (Deviazione: ARR contro 10 se True Count >= 3).

13 & 12: ARR contro A.

7, 6 & 5: ARR contro A.

Coppie:

8,8: ARR contro 10, A.

C. Mani Dure (Coppie Pure - Senza Asso)  

17+: Sempre S contro qualsiasi carta.

16: S contro 2,3,4,5,6. C contro 7,8,9,10,A. (Deviazioni: S contro 10 se True Count >= 0; S contro 9 se True Count >= 4).

15: S contro 2,3,4,5,6. C contro 7,8,9,10,A. (Deviazioni: S contro 10 se True Count >= 3).

14 & 13: S contro 2,3,4,5,6. C contro 7,8,9,10,A.

12: C contro 2,3. S contro 4,5,6. C contro 7,8,9,10,A. (Deviazioni: S contro 3 se True Count >= 2; S contro 2 se True Count >= 3).

11: R contro 2,3,4,5,6,7,8,9,10. C contro A.

10: R contro 2,3,4,5,6,7,8,9. C contro 10,A.

9: C contro 2. R contro 3,4,5,6. C contro 7,8,9,10,A. (Deviazioni: R contro 2 se True Count >= 1; R contro 7 se True Count >= 3).

8: C contro qualsiasi carta. (Deviazioni: R contro 6 se True Count >= 2).

D. Mani Morbide (Coppie con Asso)  

A,9 & A,8: Sempre S.

A,7: S contro 2. Rs contro 3,4,5,6. S contro 7,8. C contro 9,10,A.

A,6: C contro 2. R contro 3,4,5,6. C contro 7,8,9,10,A.

A,5 & A,4: C contro 2,3. R contro 4,5,6. C contro 7,8,9,10,A.

A,3 & A,2: C contro 2,3,4. R contro 5,6. C contro 7,8,9,10,A.

E. Split (Coppie Uguali)  

A,A: Y contro 2,3,4,5,6,7,8,9,10. C contro A.

10,10: Sempre N. (Deviazioni: Y contro 4 se True Count >= 6; Y contro 5 se True Count >= 5; Y contro 6 se True Count >= 4).

9,9: Y contro 2,3,4,5,6. N contro 7. Y contro 8,9. N contro 10,A.

8,8: Y contro 2,3,4,5,6,7,8,9. N contro 10,A.

7,7: Y contro 2,3,4,5,6,7. N contro 8,9,10,A.

6,6: Y/N contro 2. Y contro 3,4,5,6. N contro 7,8,9,10,A.

5,5: Sempre N.

4,4: N contro 2,3,4. Y/N contro 5,6. N contro 7,8,9,10,A.

3,3 & 2,2: Y/N contro 2,3. Y contro 4,5,6,7. N contro 8,9,10,A.

Fornisci il codice completo e funzionante per questo simulatore, partendo dai componenti base e strutturando lo stato di React in modo che gestisca correttamente il flusso del gioco

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/458ebff4-4883-4870-a6c6-2bc928945e96).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
