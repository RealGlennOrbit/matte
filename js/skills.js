'use strict';
/* ================= Kursplanen: områden och förmågor ================= */
const AREAS = {
  TAL:'Taluppfattning och tals användning', ALG:'Algebra', GEO:'Geometri',
  STAT:'Sannolikhet och statistik', SAMB:'Samband och förändring', PROB:'Problemlösning'
};
const SKILLS = {
  antal:['TAL','Antal, ordning och jämföra tal'], tiokompisar:['TAL','Dela upp tal'],
  pm10:['TAL','Plus och minus 0–10'], pm20:['TAL','Plus och minus 0–20'],
  pos100:['TAL','Tiotal och ental (0–100)'], huvud100:['TAL','Huvudräkning 0–100'],
  pengar:['TAL','Pengar och växel'], ganger:['TAL','Multiplikation'], division:['TAL','Division'],
  pos1000:['TAL','Positionssystemet 0–1000'], huvud1000:['TAL','Huvudräkning med hundratal'],
  skriftlig:['TAL','Skriftlig + och − (uppställning)'], brak:['TAL','Enkla bråk'], rimlighet:['TAL','Rimlighet och överslag'],
  monster:['ALG','Mönster och talföljder'], likhet:['ALG','Likhetstecknet och obekanta tal'], program:['ALG','Stegvisa instruktioner (programmering)'],
  former:['GEO','Former (2D)'], kroppar:['GEO','Kroppar: klot, kon, cylinder, rätblock'], lage:['GEO','Lägesord'],
  symmetri:['GEO','Symmetri'], skala:['GEO','Skala: förstoring och förminskning'], matning:['GEO','Mätning: längd, massa, volym'], tid:['GEO','Klockan och tid'],
  diagram:['STAT','Tabeller och diagram'], slump:['STAT','Slumpmässiga händelser'],
  dubbelt:['SAMB','Dubbelt, hälften och proportionalitet'],
  problem:['PROB','Textuppgifter och problemlösning'], logik:['PROB','Logiska pussel och strategi'],
};
const sk = (t, skill) => { t.skill = skill; return t; };
