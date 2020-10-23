const express = require('express');  
const app = express();  
const server = require('http').createServer(app);
const calc = require('./calc.js');
var events = require('events');

const port = 3001;

app.use(express.static(__dirname + '/node_modules'));  
app.get('/', function(req, res,next) {  
    res.sendFile(__dirname + '/static/index.html');
});
app.get('/style.css', function(req, res,next) {  
    res.sendFile(__dirname + '/static/style.css');
});
app.get('/script.js', function(req, res,next) {  
    res.sendFile(__dirname + '/static/script.js');
});
app.get('/sidebar.js', function(req, res,next) {  
    res.sendFile(__dirname + '/static/sidebar.js');
});

// Chargement de socket.io
const io = require('socket.io').listen(server);
//socket management
io.on('connection', function(socket){

	//()=>[gamesID]
	socket.on('reqLiveGamesList',()=>{
		socket.emit('gameList',gameList.map(oneGame=>oneGame.ID));
	})
	//{initialPos,initialWeight,gridSize,NBVit}
	socket.on('newGame',(st)=>{
		console.log("creating game");
		newGame(st);
	})
	socket.on('playerIdentification',(playerName)=>{
		this.typeOfConnection = 'player'
		this.playerID=(playerName=="default")?"player_" + playerCurrentlyConnected:playerName;
		playerCurrentlyConnected ++;
		socket.emit('ID',this.playerID);
	})
	socket.on('viewIdentification',()=>{
		this.typeOfConnection='view';
	})
	socket.on('connectToGame',(ID)=>{
		this.gameID=(ID=="default")?gameList[gameList.length-1].ID:ID;
		//socket.join(this.typeOfConnection + '_' + v);
		socket.join(this.gameID);
		//a enlever
		console.log('adding ' + this.playerID + ' to game : ' + this.gameID);
		if(this.typeOfConnection == 'player'){
			findGame(this.gameID).addPlayer(this.playerID);
		}
		socket.emit('gameDetails',findGame(this.gameID));
	})
	socket.on('startGame',(gameID)=>{
		console.log("starting");
		findGame(gameID).start()
	})
	socket.on('moves',(moveMessage)=>{
		findGame(this.gameID).addMoves({player:this.playerID,moves:moveMessage});
	})
	socket.on('disconnect',()=>{
		if (this.typeOfConnection='player') {playerCurrentlyConnected--}
	})

})

//impur
const newGame = (st) => {
	ID=Date.now();
	gameList.push(new game(ID,st));
	return ID;
}

const findGame = (gameID) => gameList.find(oneGame=>(oneGame.ID==gameID))





class game {
	constructor(ID,st){
		this.ID=ID;
		this.st=st;
		this.sentMoves=[];
		this.st.players=[];
	}
	addPlayer(playerName){
		if (this.st.players.indexOf(playerName)<0){
			this.st.players.push(playerName);
		}
		if (this.st.autoStartAtPlayersCount>0 && this.st.autoStartAtPlayersCount<=this.st.players.length){
			this.start();
		}
		this.broadCast('gameDetails',this);
	}
	addMoves (moves){
		this.sentMoves.push(moves);
		this.updateManager(0);
	}
	start(){
		this.state=(this.st.initialPos=="default")?calc.new(this.st):(this.st.initialPos);
		console.log("start");
		this.run=true;
		this.broadCast('start');
		this.updateManager();
	}
	broadCast(type,data){
		io.to(this.ID).emit(type,data);
	}
	updateManager(type){
		if(this.run){
			if (this.st.timer==0){
				if(calc.sentPlayers(this.sentMoves).length==this.st.players.length)
					{this.update()}
			}
			else if(type!=0) {
				setTimeout(()=>{this.update()},this.st.timer);
			}
		}
	}
	update(){
		console.log('update ______________________');
		console.log('inital state');
		this.state=calc.clean(calc.finalPos(this.state));
		console.log(this.state);
		this.state=calc.fullResult(calc.addMoves(calc.clean(this.state),this.sentMoves),this.st);
		this.broadCast('fullNewState',this.state);
		this.broadCast('simplifiedNewState',(calc.simplify(calc.clean(calc.finalPos(this.state)))));
		this.sentMoves=[];
		console.log(this.state);
		this.updateManager();
	}

	pause(){
		this.st.initialPos = calc.clean(this.state);
		this.run=false;
		this.broadCast('pause');
	}
	stop(){
		this.pause()
		this.broadCast('stop');
		gameList.splice(indexOf(oneGame=>(oneGame.ID==this.ID)),1)
		if (gameList.length<1){addDefaultGame()}
	}
	
}

var gameList = [];
var playerCurrentlyConnected = 0;

const defaultGameSettings={initialPos:"default",initialWeight:32,gridSize:30,NBVit:10,timer:1000,autoStartAtPlayersCount:1};
const addDefaultGame =() => gameList.push(new game(0,defaultGameSettings));

addDefaultGame();
server.listen(port, () => console.log('Cells Server is listening on port ' + port));

console.log(findGame(0));