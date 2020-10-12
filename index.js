//array d'obj, accessor de la property (fonction obj => property) => array de valeurs de la property (ordre maintenu)
const propertyArray = (objArray,propertyAcessor) =>  
	objArray.map((cell)=> propertyAcessor(cell));
//array de valeurs => array de valeurs uniques
const getUniqValues = anyArray => 
	Array.from(new Set(anyArray));
//array d'obj => array de property uniques
const getUniqPropertyList = (cellsArray,propertyAcessor) => 
	getUniqValues(propertyArray(cellsArray,propertyAcessor));
//array d'obj => array d'array d'obj, regroupés par propriété
const groupBy = function (anyArray,propertyAcessor) {
	var arrayOfProp = getUniqPropertyList (anyArray,propertyAcessor);
	var initvalue = []
	for (i=0; i<arrayOfProp.length; i++)
		{initvalue.push([])}
	return anyArray.reduce(function (acc,cur) {
		var accInit = acc;
		accInit[arrayOfProp.indexOf(propertyAcessor(cur))].push(cur);
		return accInit
	},initvalue)
}
//random integer between two values
const randomBetween = (min,max)=>
	Math.floor(Math.random()*(max-min+1)+min);

//array de cells => sum des weights
const sumWeight = cellsArray => 
	cellsArray.reduce((acc,cur)=>acc+cur.weight,0);
//array de cells => weight max
const maxWeight = cellsArray => 
	Math.max(...propertyArray(cellsArray,(cell)=>cell.weight));
//cellsArray => cellsArray avec win(cell,cellsArray) pour le winner defini et death(cell) pour les autres
const makeOneKillAll = (cellsArray,winnerIndex,winningF,dyingF) => 
	cellsArray.map(function(currentCell,index){
		if (index == winnerIndex){
			return winningF(currentCell,cellsArray)
		}
		else {
			return dyingF(currentCell)
		}
	})
//cellsArray => array of all with equal heaviest weights with player <> "O"
const heaviestCellsArray = cellsArray=>
	cellsArray.filter(cell=>(cell.weight==maxWeight(cellsArray) && cell.player != "O"));
//cellsArray => index of one amongst heaviest weights with player <> "O"
const indexOfWinner = cellsArray=>
	cellsArray.indexOf(heaviestCellsArray(cellsArray)
		[randomBetween(0,heaviestCellsArray(cellsArray).length-1)]);
//object => shallow copy of object
const clone = (obj => Object.assign({}, obj));
//object,property,newValue => shallow copy with property modified to new value
const cloneBut = function (obj,property,newValue){
	let tempClone = clone(obj);
	tempClone[property] = newValue
	return tempClone;
}
//cell,cellsArray => new cell avec somme des poids de tous
const winOnStep = step => 
	function(cell,cellsArray) {
		return cloneBut(cell,"weight",sumWeight(cellsArray.filter(cell=>(cell.state<step))))}
//step => fonction de die on step (new cell avec state = step)
const dieOnStep = (step) => 
	function(cell){
			return cloneBut(cloneBut(cell,"state",step),"weight",0)
	}
// cellsArray,step => un cellsArray avec le poids d'un des plus grand ajusté à la somme de tous et les autres cells avec le state=step
const resultOfFight = (cellsArray,step) => 
	makeOneKillAll(cellsArray,indexOfWinner(cellsArray),winOnStep(step),dieOnStep(step))
// arrayOfSamePlayerCells, step => array of one winner for each player, with sum of weights of cells with same player and other cells with state = step
const combineSamePlayer = (cellsArray,step) => 
	degroup(groupBy(cellsArray,cell=>cell.player)
		.map(samePlayerArray=>resultOfFight(samePlayerArray,step)));
//Array of Arrays => Arrays of obj
const degroup = anyArray=>
	anyArray.reduce((acc,curr)=>acc.concat(curr),[]);
//array of cells at the same location,step => result array at that location (modifying only cells with states<step)
const localResult = function (cellsArray,step) {
	var tempResult = combineSamePlayer(cellsArray,step)
	return resultOfFight(tempResult.filter(cell=>(cell.state<step)),step+1)
		.concat(tempResult.filter(cell=>(cell.state>=step)))
}
//array of cells with moves logged, step=>same but with location updated by step
const makeDemMove = (cellsArray,step) =>
	cellsArray.map(cell=>
		{if (cell.move == "r"){
			return cloneBut(cell,"x",cell.x+step)}
		else if (cell.move == "l"){
			return cloneBut(cell,"x",cell.x-step)}
		else if (cell.move == "u"){
			return cloneBut(cell,"y",cell.y+step)}
		else if (cell.move == "d"){
			return cloneBut(cell,"y",cell.y-step)}
		else {clone(cell)}
		}
	)
//cellsArray => Array of array of cells, group by same location
const groupByLocation = (cellsArray) => 
	groupBy(cellsArray,cell=>cell.x * 10000 + cell.y);
//cellsArray,step=>CellsArray with all fights done
const fightResult = (cellsArray, step) =>
	groupByLocation(cellsArray).reduce(
			(acc,subArray)=>acc.concat(localResult(subArray,step))
		,[]);
//cellsArray => final position and combination (move d'un demi step, combine, move d'un demi step, combine) (i.e. on fusionne ceux qui se croisent, puis ceux qui arrivent au même endroit)
//displayweight1 est le poids avant croisement, displayweight2 après croisement, weight à la fin
const applyMovesAndFights = (cellsArray)=>
	fightResult(makeDemMove(fightResult(makeDemMove(cellsArray,0.5)
		.map(cell=>cloneBut(cell,"displayWeight1",cell.weight))
		,1),0.5)
		.map(cell=>cloneBut(cell,"displayWeight2",cell.weight))
		,3);
//cell => illlégalité du/des coups (true/false)
const checkIllegal = (cell,gridSize) => {
	if (cell.x <= 1 && cell.move.indexOf("l")>-1)
		{return true}
	if (cell.x >= gridSize && cell.move.indexOf("r")>-1)
		{return true}
	if (cell.y <= 1 && cell.move.indexOf("d")>-1)
		{return true}
	if (cell.y >= gridSize && cell.move.indexOf("u")>-1)
		{return true}
	if (cell.weight < cell.move.length)
		{return true}
	return false;
}
//cell => check la légalité des moves, si coup illégal, cell ne bouge pas, sinon créé autant de cells que de divisions pour avoir des cells mono move
const dispatchOneCellMoves = (cell,gridSize)=>
	{
		if (checkIllegal(cell,gridSize)){
			return clone(cell);
		}
		else {
			let newWeight = Math.floor((cell.weight)/cell.move.length);
			return cell.move.map(cellMove=>cloneBut(cloneBut(cell,"move",cellMove),"weight",newWeight));
		}
	}
// cellsArray avec moveArrays => cellsArray avec mono moves 
const dispatchAllMoves = (cellsArray,gridSize)=>
	cellsArray.reduce(
		(acc,cur)=>acc.concat(dispatchOneCellMoves(cur,gridSize))
	,[]);
//(x,y,gridSize)=>conversion unique dans [1...gridSize]
const to1D = (x,y,gridSize) =>
	x+y*gridSize;
const to2D = {
	x: function(z,gridSize){return z%gridSize},
	y: function(z,gridSize){return Math.floor(z/gridSize)}
}
//(cellsArray,gridSize,NBVit)=>nombre de vit a ajouter
const nbDeVitAAjouter = (cellsArray,gridSize,NBVit) => 
	Math.min(NBVit-cellsArray.filter(cell=>(cell.player == "O")).length,
		gridSize*gridSize-cellsArray.length);
const newVit = (x,y) => {return {weight: 1,displayWeight1: 1, displayWeight2: 1, state: 5, x: x, y: y, move: "o", player: "O"}}
//cellsArray,gridSize,NBVit => cellsArray avec vit ajoutées
const addVit = (cellsArray,gridSize,NBVit,CalcNbDeVitAAjouter) => {
	let newVitArray=[]
	let emptySpaces=[...Array(gridSize*gridSize).keys()].map(el=>el+1).
		filter(element=>
			(cellsArray.findIndex(cell=>
				(to1D(cell.x,cell.y,gridSize)==element))<0));
	let theNbDeVitAAjouter=CalcNbDeVitAAjouter(cellsArray,gridSize,NBVit)
	for (i=0; i<theNbDeVitAAjouter; i++){
		let newVitIndex = randomBetween(0,emptySpaces.length-1);
		newVitArray.push(newVit(to2D.x(emptySpaces[newVitIndex],gridSize),to2D.y(emptySpaces[newVitIndex],gridSize)));
		emptySpaces.splice(newVitIndex, 1);
	}
	return cellsArray.concat(newVitArray);
}
//cellsArray,gridSize,NBVit=>final cellsArray with :
// step = 0 if alive
// step = 1 if dies by crossing friendly
// step = 2 if dies by crossing hostile
// step = 3 if dies by arriving on coords and merging with friendly
// step = 4 if dies by arriving an coords and dying to hostile
// step = 5 for new vitamins
// weights are ajusted to final ones
//displayWeight1 is weight for first half of move(before crossing combination)
//displayWeight2 is weight for last half of move(after crossing combination)
const completeResult = ((cellsArray,gridSize,NBVit)=>
	addVit(applyMovesAndFights(dispatchAllMoves(cellsArray)),gridSize,NBVit,nbDeVitAAjouter));

module.exports = completeResult;