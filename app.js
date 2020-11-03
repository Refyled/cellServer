let Room = require('./room'),
    __ = require('lolo');

let app = require('express')(), 
    server = require('http').createServer(app),
    io = require('socket.io')(server);

let port = 3031;

/*------ Cell Server ------ 

    Manage rooms and players through sockets. 

        Server = {
            players: [String],
            rooms:   {Room} 
        };

    Game handling is left to the room object.

*///------ 

let players = [],
    rooms = {}; 

app.use('static', express.static('static'));

io.on('connection', socket => {

        //--- set player name ---
	socket.on('login', name => {
            if (players.indexOf(name) > 0 || name === '*') {
                socket.emit('msg', 'please use another name');
            } else {
                players.push(name);
                socket.player = name;
                socket.emit('msg', `logged in as ${name}`);
                __.logs(`> player ${name} connected`)(players);
            }
        }); 
        
        //--- get open rooms ---
        socket.on('getRooms', () => {
             socket.emit('rooms', rooms); 
        }); 

        //--- create a new room --- 
        socket.on('newRoom', (name, settings) => {
            if (!rooms[name]) {
                rooms[name] = Room(settings);
                __.logs(`+ new room ${name} created`)(
                    _r.map(r => r.settings)(rooms)
                );
            } else {
                socket.emit('msg', `room ${name} exists`);
            }
        }); 
        
        //--- join a room --- 
        socket.on('joinRoom', name => {
            if (socket.player) {
                rooms[name].joins(socket);
            } else {
                socket.emit('please log in');
            }
        });
});

server.listen(port, () => __.log('...cell server @ ' + port));
