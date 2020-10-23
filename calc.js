//Arr d'obj, accessor de la property (fonction obj => property) => Arr de valeurs de la property (ordre maintenu)
const propertyArr = (objArr,propertyAcessor) =>  
	objArr.map((cell)=> propertyAcessor(cell));
//Arr de valeurs => Arr de valeurs uniques
const getUniqValues = anyArr => 
	Array.from(new Set(anyArr));
//Arr d'obj => Arr d'Arr d'obj, regroupés par propriété
const groupBy = (anyArr,propertyAcessor) =>
	(getUniqValues(propertyArr(anyArr,propertyAcessor)))
		.map((propertyValue)=>
			anyArr.filter((objet)=>
				(propertyAcessor(objet)== propertyValue)));
//n dim Arr => n-1 dim Arr
const flatten = arr => [].concat(...arr);
//random integer between two values
const randomBetween = (min,max)=>
	Math.floor(Math.random()*(max-min+1)+min);
//object => shallow copy of object
const clone = obj => Object.assign({}, obj);
//object,{property1:newValue1,property2:newValue2...} => shallow copy with properties modified to new value
const cloneBut = (obj,modifs)=> 
	Object.assign({},obj,modifs);

//Arr de cells => sum des weights
const sumWeight = cellsArr => 
	cellsArr.reduce((acc,cur)=>acc+cur.weight,0);
//Arr de cells => weight max
const maxWeight = cellsArr => 
	Math.max(...propertyArr(cellsArr,(cell)=>cell.weight));
//cellsArr => Arr of all with weights = heaviest weight && player <> "O"
const heaviestCellsArr = cellsArr=>
	(cellsArr.length>1)?
		cellsArr.filter(cell=>(cell.weight==maxWeight(cellsArr) && cell.player != "O"))
		:[cellsArr[0]];
//cellsArr => index of one amongst heaviest weights with player <> "O"
const indexOfWinner = cellsArr=>
	cellsArr.indexOf(heaviestCellsArr(cellsArr)
		[randomBetween(0,heaviestCellsArr(cellsArr).length-1)]);
//cell => cell avec le weight loggé pour mémoire dans le tableau displayWeight;
const logWeight = (cell) =>
	cloneBut(cell,{displayWeight:(Array.isArray(cell.displayWeight)?cell.displayWeight:[]).concat(cell.weight)});
//cell,cellsArr => cell avec somme des poids de tous, ancien poid logué
const win = (cell,cellsArr) => cloneBut(logWeight(cell),{weight:sumWeight(cellsArr)})
//cell => cell avec poid = 0 , ancien poid logué
const die = (cell) => cloneBut(logWeight(cell), {weight:0})
//(x,y,gridSize) avec x appartient a [1:GridSize]=>conversion unique dans [0...gridSize*gridSize-1]
const to1D = (x,y,gridSize) =>
	(x-1)+(y-1)*gridSize+1;
const to2D = {
	x: function(z,gridSize){return z%gridSize+1},
	y: function(z,gridSize){return Math.floor(z/gridSize)+1}
}
//cellsArr => Arr of Arr of cells, group by same location
const groupByLocation = (cellsArr) => 
	groupBy(cellsArr,cell=>cell.x * 10000 + cell.y);
//cell => illégalité du/des coups (true/false)
const checkIllegal = (cell,gridSize) => {
	if (cell.x <= 1 && cell.move.indexOf("l")>-1){return true}
	if (cell.x >= gridSize && cell.move.indexOf("r")>-1){return true}
	if (cell.y <= 1 && cell.move.indexOf("d")>-1){ true}
	if (cell.y >= gridSize && cell.move.indexOf("u")>-1){return true}
	if (cell.weight < cell.move.length){return true}
	return false;
}
//cell avec array de moves => array de cell avec chacune un move; si illegal, move
const dispatchOneCellMoves = (cell,gridSize) =>
	checkIllegal(cell,gridSize) ? 
		cloneBut(cell,{move:["o"]}) : 
		cell.move.map(cellMove=>cloneBut(cell,{move:[cellMove],weight:Math.floor((cell.weight)/cell.move.length)}))
// cellsArr avec moveArrs => cellsArr avec mono moves ;
const dispatchAllMoves = (cellsArr,gridSize)=>
	cellsArr.reduce((acc,cur)=>acc.concat(dispatchOneCellMoves(cur,gridSize)),[]);
//cellsArr => cellsArr avec win() appliquée à une, die() aux autres
const makeOneKillAll = (cellsArr) => {
	let winnerIndex = indexOfWinner(cellsArr);
	return cellsArr.map((currentCell,index) =>(index == winnerIndex) ? win(currentCell,cellsArr) : die(currentCell))
}
//Arr of cells at the same location => result Arr at that location 
//combine même players, puis combine le reste
const localResult = (cellsArr) =>
	 makeOneKillAll(flatten(groupBy(cellsArr,cell=>cell.player)
		.map(samePlayerArr=>makeOneKillAll(samePlayerArr))))
//Arr of cells with moves logged, step=>same but with location updated by step
const makeDemMove = (cellsArr,step) =>
	cellsArr.map((cell)=>
		{switch(cell.move[0]) {
		case "r": return cloneBut(cell,{x:cell.x+step});break;
		case "l": return cloneBut(cell,{x:cell.x-step});break;
		case "u": return cloneBut(cell,{y:cell.y+step});break;
		case "d": return cloneBut(cell,{y:cell.y-step});break;
		default : return (clone(cell));
		}
	})
//cellsArr=>CellsArr with all fights done
const fightResult = (cellsArr) =>
	groupByLocation(cellsArr).reduce(
			(acc,subArr)=>acc.concat(localResult(subArr))
		,[]);
//cellsArr => final position and combination (move d'un demi step, combine, move d'un demi step, combine) (i.e. on fusionne ceux qui se croisent, puis ceux qui arrivent au même endroit)
const applyMovesAndFights = (cellsArr)=>
	fightResult(makeDemMove(fightResult(makeDemMove(cellsArr,0.5)),0.5));
//(cellsArr,gridSize,NBVit)=>nombre de vit a ajouter
const nbDeVitAAjouter = (cellsArr,gridSize,NBVit) => 
	Math.min(NBVit-cellsArr.filter(cell=>(cell.player == "O")).length,
		gridSize*gridSize-cellsArr.length);
const newVit = (x,y) => {return {weight: 1,displayWeight: [0,0,0,0], x: x, y: y, move: "o", player: "O"}}
//cellsArr,gridSize,NBVit => cellsArr avec vit ajoutées
const addVit = (cellsArr,gridSize,NBVit,CalcNbDeVitAAjouter) => {
	let newVitArr=[];
	let emptySpaces=[...Array(gridSize*gridSize).keys()].
		filter(element=>
			(cellsArr.findIndex(cell=>
				(to1D(cell.x,cell.y,gridSize)==element))<0));
	let theNbDeVitAAjouter=CalcNbDeVitAAjouter(cellsArr,gridSize,NBVit)
	for (i=0; i<theNbDeVitAAjouter; i++){
		let newVitIndex = randomBetween(0,emptySpaces.length-1);
		newVitArr.push(newVit(to2D.x(emptySpaces[newVitIndex],gridSize),to2D.y(emptySpaces[newVitIndex],gridSize)));
		emptySpaces.splice(newVitIndex, 1);
	}
	return cellsArr.concat(newVitArr);
}

//cellsArr,gridSize,NBVit=>final cellsArr with :
// weights are ajusted to final ones
//x y ajusted to departure ones
//displayWeight contient les weights intermédiaires correspondant aux étapes suivantes :
//avant combinaison au croisement avec même joueur
//avant combinaison au croisement avec autres joueurs
//avant combinaison à l'arrivée avec même joueur
//avant combinaison à l'arrivée avec autres joueurs
const completeResult = (cellsArr,st)=>
	makeDemMove(addVit(applyMovesAndFights(dispatchAllMoves(cellsArr,st.gridSize)),st.gridSize,st.NBVit,nbDeVitAAjouter),-1);
//cellArr à la position de départ=>cellArr à la position d'arrivée
const finalPos = (cellsArr)=>makeDemMove(cellsArr,1)
//{gridSize, players[],initialWeight}
const newGrid = (st)=>{
		const borderSize = Math.floor(st.gridSize/5)
		let squareSize = st.gridSize-2*borderSize;
		const toX = (pos)=>
			{if(pos<=squareSize-1){return pos+borderSize}
			else if (pos <=2*squareSize-2){return squareSize-1+borderSize}
			else if (pos <= 3*squareSize-3){return squareSize*3-3-pos+borderSize}
			else if (pos <= 4*squareSize-4){return 0+borderSize}
			}
		const toY = (pos)=>
			{if(pos<=squareSize-1){return 0+borderSize}
			else if (pos <=2*squareSize-2){return pos-squareSize+1+borderSize}
			else if (pos <= 3*squareSize-3){return squareSize-1+borderSize}
			else {return (squareSize*4-4-pos+borderSize)}
			}
		return st.players.map((player,index)=>{return{displayWeight:[0,0,0,0],move:["o"],weight:st.initialWeight,player:player,x : toX(Math.floor(index*(4*squareSize-4)/st.players.length)), y : toY(Math.floor(index*(4*squareSize-4)/st.players.length))}})
}
//de full result => filtre les mortes et enlève les moves et displayWeight
const clean = (cellsArr) =>
		(cellsArr.filter(cell=>(cell.weight>0))).map(cell=>cloneBut(cell,{move:["o"],displayWeight:[]}))
//de full result => 
const simplify = (cellsArr) =>
		clean(cellsArr).map(cell=>{return{player:cell.player,x:cell.x,y:cell.y,weight:cell.weight}})
//cellsArr, [{player:player,moves:[{index,move:[]}]}]=>cellArr avec moves
const addMoves = (cellsArr,moveArr) =>
		{
			var allMovesArr = Array(cellsArr.length).fill(["o"]);
			moveArr.forEach(el=>{el.moves.forEach(ssEl=>{
				if (cellsArr[ssEl.index].player == el.player){
					allMovesArr[ssEl.index] = ssEl.move
				}
			})})
			return cellsArr.map((cell,index)=>cloneBut(cell,{move:allMovesArr[index]}))	


		}
const sentPlayers = moveArr=>getUniqValues(propertyArr(moveArr,(el=>el.player)));


module.exports = {finalPos:finalPos,fullResult:completeResult,new:newGrid,clean:clean,simplify:simplify,addMoves:addMoves,sentPlayers:sentPlayers	};


//		return st.players.map((nothing,index)=>Math.floor(index*(4*squareSize-4)/st.players.length))
//				.map((positionInSquare)=>{x : toX(positionInSquare), y : toY(positionInSquare)})