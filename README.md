# Würzburger ÖPNV Plot Generator

[Website](https://aehrm.github.io/wuerzburg-oepnv-plot/)

Willkommen beim **Würzburger ÖPNV Plot Generator**! Mit dieser Webanwendung kannst du Linien der Busse und Bahnen visualisieren und individuelle Bildfahrpläne generieren. Gebaut mit [Angular](https://angular.io), [D3.js](https://d3js.org) und [jsPDF](https://github.com/parallax/jsPDF).

### Features

- **Interaktive Benutzeroberfläche**: Auswahl von Linien und Positionierung des Plots.
- **Automatisches Layout**: Berechnet "automagisch" ein Layout für den Plot mit wenig Wendungen (Heuristik von Hartleb/Schmidt/Wolf/Wolff: [arXiv](https://arxiv.org/abs/2503.01808)).
- **Echtzeit-Daten**: Zugriff auf aktuelle Daten (via [EFA](<https://de.wikipedia.org/wiki/Elektronische_Fahrplanauskunft_(Software)>)), um die neuesten Fahrpläne und Haltestellen anzuzeigen.
- **PDF Export**: Erstelle und lade deinen Fahrplan als PDF herunter.

### Tutorial

1. **Haltestelle auswählen**: Gebe den Namen einer Würzburger Haltestelle in das Suchfeld ein
2. **Fahrten auswählen**: Markiere die gewünschten Fahrten aus der Liste und füge sie dem Plot hinzu
3. **Anpassen**: Passen die Farben der Linien und angezeigten Haltestellen an. Positioniere die Haltestellen im Plot durch Ziehen.

### Lokale Installation

```bash
git clone https://github.com/aehrm/wuerzburg-oepnv-plot.git
cd wuerzburg-oepnv-plot
npm install
npm run dev
```
