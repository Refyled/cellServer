const domain = 'http://localhost:3031';

let connectionOptions =  {
    "force new connection" : true,
    //avoid manual reconnects - dead clients after server restart
    "reconnectionAttempts": "Infinity", 
    "timeout" : 10000, //before connect_error and connect_timeout are emitted.
    "transports" : ["websocket"]
};

let room = null;

let socket = io(domain,connectionOptions)
    .on('msg', console.log)
    .on('rooms', showRooms);

function getRooms () {
    socket.emit('getRooms');
}

function joinRoom (name) {
    socket.emit('viewRoom', name);
};


function showRooms (rooms) {
    let oldDiv = document.getElementById('games');
    let newDiv = dom('#games')
        .branch(games => games.map(
            ([r, name]) => room.pull(() => _r.update({name})(r))
        ));

    let room = dom('.game', [
        dom('span.name', {html: r => r.name}),
        dom('span.nPlayers', {html: r => `(${r.nPlayers})`}),
        dom('span.players', {
            html: r => `${r.players.join('\t')}`
        })
    ])
        .on('click', (e, io, r) => joinRoom(r.name));

    oldDiv.replaceWith(newDiv(__.r.toPairs(rooms)));
};

var gridSettings={};
socket.on("gameDetails",function(data){
	console.log('room settings recus');
	roomSettings = data;
});

socket.on("fullNewState",function(data){
	preparedData=prepareData(data);
	console.log('data reçues');
	console.log(data);
	console.log('data préparée');
	beginTime = new Date().getTime();
	console.log(preparedData);

});

//identify as view
socket.emit('viewIdentification');

//connect to default game
socket.emit('connectToGame',0);


const testDataInit =
		[
	];

//a modif
var players = ['O','player_0','player_1'];
const cloneBut = (obj,modifs)=> 
	Object.assign({},obj,modifs);
const prepareData = (data)=>data.map(cell=>
	{
		cell.toX=0;
		cell.toY=0;
		if (cell.move[0]=="r"){cell.toX=1}
		if (cell.move[0]=="l"){cell.toX=-1}
		if (cell.move[0]=="u"){cell.toY=-1}
		if (cell.move[0]=="d"){cell.toY=1}
		return cloneBut(cell,{x:cell.x,y:size-cell.y+1,fillStyle:colorsArray[players.indexOf(cell.player)]})
	})




const colorsArray = ['rgba(40, 50, 40,','rgba(198, 34, 5,','rgba(1, 69, 106,','rgba(1, 112, 110,','rgba(200, 110, 110,','rgba(80, 240, 97,','rgba(76, 112, 220,','rgba(10, 10, 200,'];
	

const textColor = '#cee6d8';
const ligneStyle = {
	lineWidth:1,
	strokeStyle:'rgba(200, 200, 200,0.2 )'
}
let showWeight = true;
let transparency = true;
let size = 10;
let maxW = 10;
let minG = 0.3;
let maxG = 1;

var preparedData=prepareData(testDataInit);


let displaySettings={
	canSize:600
}

let canSize=600;
let gridSize = 10;

function draw(gridSettings,displaySettings, cellsArray,timer){
	var ctx = document.getElementById('canvas').getContext('2d');
	var cellSize=canSize/gridSize;
	//initialiser
	ctx.clearRect(0,0,canSize,canSize); 
	ctx.strokeStyle = ligneStyle.strokeStyle;
	ctx.lineWidth = ligneStyle.lineWidth;
	//lignes horiz
	for (var i = 0; i <= size+1; i++) {
    	ctx.beginPath();
    	ctx.moveTo(0,i * cellSize);
    	ctx.lineTo(canSize,i * cellSize);
    	ctx.stroke();
    }
    //lignes vert
     for (var i = 0; i <= size+1; i++) {
  		ctx.beginPath();
  		ctx.moveTo(i * cellSize, 0);
  		ctx.lineTo(i * cellSize, canSize);
  		ctx.stroke();
  	}
  	//proprtion d'avancée dans le coup actuel
	let proportion = (new Date().getTime() - beginTime)/tempsDeCoup;
	//let proportion = 0;
	function drawCell(cell,step){
		if (cell.displayWeight[step*3]>0){
		let gradient = Math.min(1,(cell.weight/maxW)*(maxG-minG)+minG);
		//si c'est une nouvelle vitamine
		if (cell.weight == 1 && cell.displayWeight[3] == 0){
			gradient=proportion*maxG}			
		ctx.fillStyle = ''+ cell.fillStyle + gradient + ')';
		ctx.fillRect((cell.x+cell.toX*proportion-1)*cellSize,(cell.y+cell.toY*proportion-1)*cellSize,cellSize,cellSize);
		if (showWeight == true){
			ctx.fillStyle=textColor;
			ctx.textAlign="center";
			ctx.fillText(cell.displayWeight[(step)*3],(cell.x+cell.toX*proportion-1)*cellSize+cellSize/2,(cell.y+cell.toY*proportion-1)*cellSize+cellSize/2);
		}
		}
	}
	preparedData.forEach(cell=>{drawCell(cell,0)});
		window.requestAnimationFrame(draw);
}


beginTime = new Date().getTime();
let tempsDeCoup=1000;
draw();

