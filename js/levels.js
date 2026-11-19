'use strict';
/* ================= Banor för pussel ================= */
const PUSH = {
  w1: [ {map:["#######","#..#..#","#.B..X#","#P.#..#","#######"], hint:'Gå upp och knuffa stenen åt höger.'},
        {map:["########","#P.#...#","#.B....#","#..#.#.#","#....X.#","########"], hint:'Knuffa stenen åt höger. Sedan nedåt. Sist åt höger.'} ],
  w4: [ {map:["########","#P.....#","#.B.B..#","#..##..#","#X....X#","########"], hint:'Vänstra stenen: ner och sedan vänster. Högra stenen: höger, ner och höger.'},
        {map:["#########","#...#...#","#.B...B.#","#..#P#..#","#.X...X.#","#########"], hint:'Gå upp ovanför stenarna och knuffa dem rakt ner.'} ],
};
const PROG = {
  w2: [ {map:["######","#S...#","####.#","#G...#","######"], max:10, hint:'Höger 3 gånger, ner 2 gånger, vänster 3 gånger.'},
        {map:["#######","#S.#..#","#..#.##","#.....#","###.#G#","#######"], max:9, hint:'Börja med att gå ner 2 steg.'},
        {map:["#######","#S#...#","#.#.#.#","#...#G#","#######"], max:12, hint:'Ner, ner, höger, höger, upp, upp … fortsätt själv!'} ],
  w5: [ {map:["########","#S.....#","######.#","#G.....#","########"], max:4, hint:'Tre kommandon räcker: 5 steg höger, 2 steg ner, 5 steg vänster.'},
        {map:["#########","#S......#","#######.#","#.......#","#.#######","#......G#","#########"], max:6, hint:'7 steg höger, 2 ner, 6 vänster … fortsätt!'},
        {map:["#########","#S....#.#","#####.#.#","#.....#.#","#.#####.#","#.......#","#######G#","#########"], max:7, hint:'Gå inte in i den högra gången högst upp, den är en återvändsgränd.'} ],
};
