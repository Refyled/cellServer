const io = require('socket.io-client');
const socket = io("http://localhost:3000", {reconnectionDelayMax: 10000});
const testSt	= {initialPos:"default",initialWeight:10,gridSize:10,NBVit:1};
socket.emit('playerIdentification','default');
socket.on('ID',(res)=>{console.log(res)});
socket.emit('newGame',testSt);

socket.emit('reqLiveGamesList');
socket.on('gameList', (data)=>console.log(data))

socket.emit('playOnGame',0);

socket.emit('startGame',0);	