let Room = require('./room'),
    __ = require('lolo'),
    _r = __.r;

let express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io')(server);

let port = 3031;

app.use('static', express.static('static'));


/*------ Cell Server ------ 

    Manage rooms and players through sockets. 

    The internal state of the server is of type:

        Server = {
            players: [String],
            rooms:   {Room} 
        };

    Game handling is left to the room object.

    Sockets may either:
        - login as players (ai) 
        - subscribe as a view (humans).

    The server reacts to events of the following union type:

        Event   = 'login'       String
                | 'getRooms'    ()
                | 'joinRoom'    String
                | 'viewRoom'    String
                | 'newRoom'     Settings

    In response, the server emits events of type: 

        Emit    = 'msg'         String
                | 'rooms'       {RoomView}

                | 'state'       Vertex > Cell
                | 'transition'  Edge > (Player, [Int])

    N.B. The 'state' and 'transition' events, destined to 
    players and viewers respectively, are left to be handled 
    by each room object. 

*///------ 

let players = [],
    rooms = {}; 

let viewRoom = r => 
    _r.set('players', r.players.map(s => s.player))(r.settings);

io.on('connection', socket => {

        //--- set player name ---
	socket.on('login', name => {
            if (players.indexOf(name) > 0 || name === '*') 
                socket.emit('msg', 'please use another name');
            else if (socket.player) 
                socket.emit('logged', `you are connected as ${socket.player}`)
            else {
                players.push(name);
                socket.player = name;
                socket.emit('msg', `logged in as ${name}`);
                __.logs(`\n> player ${name} connected`)(players);
            }
        }); 
        
        //--- get open rooms ---
        socket.on('getRooms', () => {
             socket.emit('rooms', _r.map(viewRoom)(rooms)); 
        }); 

        //--- create a new room --- 
        socket.on('newRoom', (name, settings) => {
            if (!rooms[name]) {
                rooms[name] = Room(settings);
                socket.emit('msg', `room "${name}" created`);
                __.logs(`\n+ new room "${name}" created`)
                    (_r.map(viewRoom)(rooms));
            } else {
                socket.emit('msg', `room "${name}" exists`);
            }
        }); 
        
        //--- join a room --- 
        socket.on('joinRoom', name => {
            if (socket.player && rooms[name]) {
                let joined = rooms[name].joins(socket);
                if (joined)
                    socket.emit('msg', `joined room ${name}`);
                    __.logs(`\n===> ${socket.player} joined "${name}"`)
                        (_r.map(viewRoom)(rooms));
            } 
            else if (!socket.player) 
                socket.emit('msg', 'please log in');
            else 
                socket.emit('msg', `room "${name}" does not exist`);
        });

        //--- watch a room --- 
        socket.on('viewRoom', name => {
            if (rooms[name]) {
                rooms[name].watches(socket);
                socket.emit('msg', `watching room "${name}"`);
                __.logs(`\n\t(<>.<>) - - - > ${name}`) 

            } 
            else
                socket.emit('msg', `room "${name}" does not exist`);
        });

        
        //--- leave --- 
        socket.on('disconnect', () => {
            if (socket.player) {
                let i = players.indexOf(socket.player);
                players = [...players.slice(0, i), ...players.slice(i+1)];
                __.logs(`\n< player ${socket.player} disconnected`)(players);
            }
        });
});

server.listen(port, () => __.log('...cell server @ ' + port));
