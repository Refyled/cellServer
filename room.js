let Game = require('./game'),
    Graph = require('./graph');

let __ = require('lolo'),
    _r = __.r;

let defaults = {
    size            : [11, 11],
    nPlayers        : 2,
    nVitamins       : 4,
    initialWeight   : 4,
    delay           : 1000
};


/*------ Room ------

    A room manages sockets associated to each player
    along with a common game state. 

    The internal state of a room is of type: 

        Room = {
            players : [Socket],
            viewers : [Socket],
            state   : (Vertex > Cell),
            move    : (Edge > Cell)
        }

    One should work in the asynchronous state monad: 

        RoomState e = Room -> Async (e, Room)

    i.e. functions mapping room states to a promise 
    for an event - room state pair.   

*///------ 

let Room = settings => {

    let graph = Graph.lattice(...settings.size),
        game = Game(graph);

    let currentState = null,
        currentMove = {},
        players = [],
        viewers = [];

    let my = {
        settings,
        players
    }; 

    //------ Sockets ------ 

    my.joins = socket => {
       
        if (players.length === settings.nPlayers) {
            socket.emit('msg', 'room is full!');
            return false
        } 
        my.emit('msg', `${socket.player} joined`);
        players.push(socket);

        if (players.length === settings.nPlayers) 
            my.start();

        socket.on('move', m => {
            my.putMove(socket.player, m)
            socket.emit('msg', 'move received');
        });

        socket.on('disconnect', () => {
            __.log(`${socket.player} left the game!`);
            players = players.filter(s => s.connected === true);
            my.pause();
        }) 

        return true;
    }; 

    my.watches = socket => {
        viewers.push(socket);
        socket.on('disconnect', () => {
            viewers = viewers.filter(s => s.connected === true);
        });
    }

    //------ Receive Moves ------ 

    my.putMove = (player, move) => {
        currentMove = _r.assign(
            _r.map(weight => [player, weight])(move)
        )(currentMove);
    };


    //------ Main Loop ------
    
    my.loop = (time) => {

        let move = game.legalise(currentState)(currentMove),
            transition = game.transition(move),
            nextState = game.final(transition);

        my.emit('state', nextState);
        my.emitView('transition', transition);

        //... dump current state & move @ time

        currentState = nextState;
        currentMove = {};

        if (! my.paused)
        __.sleep(settings.delay)
            .then(() => my.loop(time + 1));
    }
    
    my.start = () => {
        my.paused = false
        if (!currentState) {
            let s0 = game.addPlayers(
                players.map(s => s.player), 
                settings.initialWeight
            )
            currentState = game.addVitamins(settings.nVitamins)(s0);
        }

        my.emit('starting...');
        my.emit('state', currentState);
        my.loop(0);
    }

    my.pause = () => {
        my.paused = true
    };

    //------ Broadcast ------

    my.emit = (...xs) => 
        players.forEach(p => p.emit(...xs));

    my.emitView = (...xs) => 
        viewers.forEach(v => v.emit(...xs));

    //------ DB? ------ 

    my.getState = t => currentState;

    my.dumpState = (t, state) => {};

    my.getMove = t => currentMove;

    my.dumpMove = (t, move) => {
        currentMove = {};
    };

    return my;
};

module.exports = __.pipe(
    stgs => _r.update(stgs || {})(defaults),
    Room
);
