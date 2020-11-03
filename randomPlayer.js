
//connexion
const io = require('socket.io-client');
const socket = io("http://localhost:3001", {reconnectionDelayMax: 10000});
console.log('connected to Server');

//identification
var playerID = 'default';
socket.emit('playerIdentification',playerID);
socket.on('ID',(ID)=>{playerID = ID ; console.log('Player identifié en :' + playerID)});

//connect to game
var gameSettings = {};
socket.emit('connectToGame','0');
socket.on('gameDetails',(game)=>{gameSettings = game.st; console.log(gameSettings)});

//receive and answer moves
socket.on('simplifiedNewState',(state)=>{
	console.log('Nouvelle position reçue');
	socket.emit('moves',calcMoves(state))
	console.log('coups envoyés')
})

//actual move logic

function calcMoves(data){
  let myCellsArray = data.filter(function(cell){return(cell.player == playerID)});
    let myMoves = myCellsArray.map(function(cell){
        //liste les directions materiellement possibles
      let possibleDirections = ['o'];
      if (cell.x > 1){possibleDirections.push('l')}
      if (cell.y > 1){possibleDirections.push('d')}
      if (cell.x < gameSettings.gridSize){possibleDirections.push('r')}
      if (cell.y < gameSettings.gridSize){possibleDirections.push('u')}
    
      //liste le nombre de divisions qui ne diminueront pas notre poids
      let possibleSeparations = [1];
      for (let i=2;i<6;i++){if (cell.weight%i==0){possibleSeparations.push(i)}}
      //cumule les deux
      let separationsOK = possibleSeparations.filter(function(nb){return(nb <= possibleDirections.length)});
      
      //choisi un nombre de séparations au hasard
     // let indexDeSeparations = Math.floor(Math.random()*separationsOK.length);
     // let nombreDeSeparations = separationsOK[indexDeSeparations];
      let nombreDeSeparations = Math.max(...separationsOK);
      //prend ce nombre d'éléments dans possibleDirections
      let moves = possibleDirections.sort(() => .5 - Math.random()).slice(0,nombreDeSeparations)
    
      //retourne le resultat pour la cell données
      return {index:data.indexOf(cell),
          move:moves}
    })
    //retourne l'array de moves
    console.log(' MOVES :');
    console.log(myMoves);
    return myMoves; 
}
