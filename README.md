# Underverkens gåtor – ett mattespel genom antikens sju underverk

Ett mattespel för åk 1–3, anpassat efter kursplanen i matematik (Lgr22).
Spelet har sju världar med 12 rum vardera. Den sista världen, Fyren på Faros, ligger på nivån för godtagbara kunskaper i slutet av åk 3.

## Spela
- **På nätet:** öppna sidan på GitHub Pages.
- **Utan internet:** ladda ner mappen och dubbelklicka på `index.html`.

## Lägga upp på GitHub Pages
1. Skapa ett nytt repository på GitHub, till exempel `underverkens-gator` (använd inte å, ä, ö i namnet).
2. Ladda upp **allt innehåll** i den här mappen: `index.html`, mapparna `css`, `js` och `arkiv` och den här filen.
   `index.html` ska ligga direkt i repot, inte i en undermapp.
3. Gå till **Settings → Pages**. Välj **Deploy from a branch**, branch `main` och mapp `/ (root)`. Tryck **Save**.
4. Efter någon minut finns spelet på `https://DITT-ANVÄNDARNAMN.github.io/underverkens-gator/`.

## Namnet
Spelet hette tidigare Mattetemplen. Den interna nyckeln för sparade resultat heter fortfarande `mattetemplen`, så inga resultat försvinner. Ändra den inte.

## Skolläget
Med skolläget följer eleverna med till alla datorer. Det kräver att programmet **spel-api** är installerat på webbhotellet (se `spel-api/README.md`).
- Eleverna loggar in med klasskod, sitt namn och tre bilder.
- Läraren loggar in med användarnamn och lösenord under **Vuxen → Lärarinloggning**.
- Om servern inte nås fungerar spelet ändå. Allt sparas lokalt och skickas upp senare.

## Var sparas resultaten?
Utan skolläget sparas resultaten i webbläsaren (localStorage) på den dator och i den webbläsare där barnen spelar. Med skolläget sparas de dessutom på servern.
- GitHub Pages och den nerladdade filen räknas som **olika** platser, så de har olika sparade data.
- Flytta resultat med **Lärarvy → Spara säkerhetskopia** och **Läs in säkerhetskopia**.
- Uppdateringar av spelet raderar inte sparade resultat.

## Filerna
| Fil | Innehåll |
|---|---|
| `index.html` | Startsidan. Laddar alla andra filer. |
| `css/style.css` | Utseende: färger, knappar och teman för varje värld. |
| `css/intro.css`, `js/intro.js` | Introt: den animerade startskärmen med stendörrarna. Ändra berättelsen i `js/intro.js`. |
| `js/worlds.js` | **Världarna och rummen.** Här ändrar du vilka uppgifter som finns i varje rum. Här finns också repetitionen och listan för Träningsrummet. |
| `js/tasks-tal.js` | Uppgifter i taluppfattning: tal, plus, minus, gånger, delat, bråk, pengar, uppställning |
| `js/tasks-alg.js` | Uppgifter i algebra: mönster, likhetstecknet, vågen |
| `js/tasks-geo.js` | Uppgifter i geometri: former, kroppar, lägesord, symmetri, skala, mätning, klockan |
| `js/tasks-stat.js` | Diagram, slump, dubbelt och hälften, priser, textuppgifter |
| `js/levels.js` | Banor för stenblocken och programmeringen |
| `js/skills.js` | Kursplanens områden och förmågorna som visas i lärarvyn |
| `js/quiz.js` | Motorn för uppgifter: svarsalternativ, knappsats och ledtrådar |
| `js/puzzles.js` | Ringtornet, stenblocken och programmeringen |
| `js/screens.js` | Startskärm, karta, rum och Träningsrummet |
| `js/adult.js` | Vuxenkod, lärarvy för den här datorn och säkerhetskopior |
| `js/config.js` | **Skolläget:** adressen till spel-api på webbhotellet. Lämna tom för att bara spara lokalt. |
| `js/cloud.js` | Skolläget: klasskod, elevinloggning med bildkod och synk med servern |
| `js/teacher.js` | Skolläget: lärarinloggning, klasser, elever och inloggningskort |
| `js/graphics.js` | Figurer, bilder och underverkens konst |
| `js/player.js`, `js/storage.js`, `js/util.js`, `js/main.js` | Sparning, hjälpfunktioner och start |
| `arkiv/` | Tidigare versioner av spelet, var och en som en enda fil |

## Ändra ett rum
Öppna `js/worlds.js`. Ett rum ser ut så här:

```js
{name:'Plusrummet', icon:'plus', type:'quiz', intro:'Plus upp till 10.', tasks:() => repeat(6, () => tPlus(10))},
```

- `repeat(6, …)` betyder 6 uppgifter.
- `tPlus(10)` ger plus upp till 10. Kommentarerna överst i varje `tasks-*.js` visar vilka inställningar som finns.
- Från värld 2 läggs en repetitionsuppgift till automatiskt. Skriv `review:false` i ett rum för att stänga av den.
