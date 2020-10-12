
const compute = require('./index.js');

//-------------------------------------------------------

//const displayGridWithPlayers()


//-------------------------------------------------------

console.log("testing");

testArray = [
{name:"cell1",
x:3,
y:4,
move:["r","u"],
weight:3,
state:0,
player:"J"},
{name:"cell2",
x:5,
y:4,
move:["l"],
weight:4,
state:0,
player:"P"},
{name:"cell3",
x:8,
y:8,
move:["r"],
weight:6,
state:0,
player:"J"},
{name:"cell4",
x:8,
y:6,
move:["r"],
weight:5,
state:0,
player:"R"}
];
console.log("_____________initial situation :____________");
console.log(testArray);
console.log("-----------------result :---------------");
console.log(compute(testArray,10,1));

