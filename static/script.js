const domain = 'http://localhost:3031';

const _r = __.r;

var connectionOptions =  {
	"force new connection" : true,
    "reconnectionAttempts": "Infinity", //avoid having user reconnect manually in order to prevent dead clients after a server restart
    "timeout" : 10000, //before connect_error and connect_timeout are emitted.
    "transports" : ["websocket"]
};

let state0={};
let state1={};

const mySocket = io(domain,connectionOptions)

    .on('state', s => {
    	if(displaySettings.mode === 'state'){
    		state0 = state1;
    		state1 = s;
    		draw(state0,state1)}
    	})


    .on('transition', t => {
    	if(displaySettings.mode === 'transition'){ draw(t,{})}})

    .on('settings', stgs => {console.log(stgs);
    	draw = drawState(stgs,displaySettings)})

    .on('players', ps => {
        players = ["*"].concat(ps); 
        console.log(players)
    });

let players=[];


let displaySettings = {
	canSize : 600,
	ligneStyle : {
		lineWidth:1,
		strokeStyle:'rgba(200, 200, 200,0.2 )'},
	textColor : '#cee6d8',
	font : "15px Verdana",
	timePerMove : 1000,
	colorScheme : [[40,50,40],[198,34,5],[1,69,106],[1,112,110],[220,110,110]],
	mode : 'transition',
	showWeight : true
}
//let liveStates = [{},{}];


const barycentre = (proportion) => (source,target) => source + proportion*(target-source);

let draw = (s0,s1)=>{};


//connect to room 'room'
mySocket.emit('viewRoom','room');

	var animReq;

const drawState = (settings,displaySettings) => (s0,s1) => {


	let beginTime = new Date().getTime();
	var ctx = document.getElementById('canvas').getContext('2d');
	
	var cellSize=displaySettings.canSize/settings.size[0];

	let displayCellAr = [];

	if (displaySettings.mode === 'state')
	{
		displayCellAr=[...new Set(_r.keys(s0).concat(_r.keys(s1)))]
			.map(pos => { 
				return {
					x0: +pos.split(':')[0],
					x1: +pos.split(':')[0],
					y0: +pos.split(':')[1],
					y1: +pos.split(':')[1],
					weight0: typeof s0[pos] !== 'undefined'?
						s0[pos][1]
						:0,
					weight1: typeof s1[pos] !== 'undefined' ?
						s1[pos][1]
						:0,
					player0: typeof s0[pos] !== 'undefined'?
						s0[pos][0]
						:s1[pos][0],
					player1: typeof s1[pos] !== 'undefined'?
						s1[pos][0]
						:s0[pos][0]
				}
			});
	}
	if (displaySettings.mode === 'transition')
	{
		displayCellArTemp=_r.keys(s0).map(vertex=>{return{
			x0: + (vertex.split(' > ')[0]).split(':')[0],
			x1: + (vertex.split(' > ')[1]).split(':')[0],
			y0: + (vertex.split(' > ')[0]).split(':')[1],
			y1: + (vertex.split(' > ')[1]).split(':')[1],
			weight0: s0[vertex][1][0],
			weight1: s0[vertex][1][2],
			player0: s0[vertex][0],
			player1: s0[vertex][0]
		}})

		displayCellAr = [].concat(
			displayCellArTemp.filter(cell=>(cell.weight1>0)),
			displayCellArTemp.filter(cell=>(cell.weight1==0)))
	}



	let s0Max = Math.min(30,Math.max(...displayCellAr.map(cell=>cell.weight0)));
	let s1Max = Math.min(30,Math.max(...displayCellAr.map(cell=>cell.weight1)));
	s0Max = 1;
	s1Max = 1;

	let getRGB = (player) => displaySettings.colorScheme[players.indexOf(player)];
	  	
	let getAlpha = (weight,maxWeight) => weight/maxWeight;

	//draw top canvas
	var ctx2 = document.getElementById('topCan').getContext('2d');
	players.filter(player=>player != "*").forEach((player,index)=>{
		ctx2.fillStyle ="rgba(" + (getRGB(player))[0]
	  	+ "," + (getRGB(player))[1]
	  	+ "," + (getRGB(player))[2]
	  	+ "," + 1
	  	+ ")";
	  	ctx2.font = displaySettings.font;
	  	ctx2.textAlign = "center";
		ctx2.fillText(player,200+(400/(players.length-1))*(index),50);

	})
	


	function drawFrame(){
		let proportion = (new Date().getTime() - beginTime)/displaySettings.timePerMove	;
		let between = barycentre(proportion);
		//initialiser 
		ctx.clearRect(0,0,displaySettings.canSize,displaySettings.canSize); 
		ctx.strokeStyle = displaySettings.ligneStyle.strokeStyle;
		ctx.lineWidth = displaySettings.ligneStyle.lineWidth;
		//lignes horiz
		for (var i = 0; i <= settings.size[0]+1; i++) {
	    	ctx.beginPath();
	    	ctx.moveTo(0,i * cellSize);
	    	ctx.lineTo(displaySettings.canSize,i * cellSize);
	    	ctx.stroke();
	    }
	    //lignes vert
	     for (var i = 0; i <= settings.size[0]+1; i++) {
	  		ctx.beginPath();
	  		ctx.moveTo(i * cellSize, 0);
	  		ctx.lineTo(i * cellSize, displaySettings.canSize);
	  		ctx.stroke();
	  	}

	  	let drawCell = (style,x,y) => 
	  	{
	  		ctx.fillStyle=style;
	  		ctx.fillRect(x*cellSize,y*cellSize,cellSize,cellSize)
	  	}
	  	let drawWeight = (weight,x,y) => {
	  		ctx.fillStyle = displaySettings.textColor;
	  		ctx.font = displaySettings.font;
	  		ctx.textAlign = "center";
	  		ctx.fillText(weight,x*cellSize+cellSize/2,y*cellSize+cellSize/2);
	  	}


	  	let getStyle = (cell) => 
	  	"rgba(" + between((getRGB(cell.player0))[0],getRGB(cell.player1)[0])
	  	+ "," + between((getRGB(cell.player0))[1],getRGB(cell.player1)[1])
	  	+ "," + between((getRGB(cell.player0))[2],getRGB(cell.player1)[2])
	  	+ "," + between(getAlpha(cell.weight0,s0Max),getAlpha(cell.weight1,s1Max))
	  	+ ")";


	  	displayCellAr.forEach(cell=>{drawCell(getStyle(cell,proportion),
	  		between(cell.x0,cell.x1),between(cell.y0,cell.y1))
	  		if (displaySettings.showWeight)
	  			{drawWeight(cell.weight0,
	  			between(cell.x0,cell.x1),between(cell.y0,cell.y1))}
	  		});



		if (proportion<=1)
		{animReq = window.requestAnimationFrame(drawFrame);
		}		
	}
			
		
	window.cancelAnimationFrame(animReq);
	drawFrame();
	
}
