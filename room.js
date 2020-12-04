let Graph = require('./graph'),
    Game = require('./game'),
    Player = require('./player'),
    __ = require('lolo'),
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

    Internal State
    --------------
    The internal state* of a room is of type: 

        RoomState = {
            players : [Socket],
            viewers : [Socket],
            state   : (Vertex > Cell),
            move    : (Edge > Cell)
        }

    (*) One could work in the asynchronous state monad: 

        Room e = RoomState -> Async (e, RoomState)

    i.e. functions mapping room states to a promise 
    for an event - room state pair.   

    Constructor 
    -----------
    The `Setting -> Room` constructor looks 
    for the following properties in the setting object: 
        
        Setting = {
            start           : 'auto' | 'manual'
            delay           : Int (ms)
            size            : (Int, Int) 
            nVitamins       : Int   
            nPlayers        : Int
            initialWeight   : Int
        }

    Events
    ------
    The room reacts to events of type:
        
        Event   = 'move'        Edge > Int 
                | 'start'       ()
                | 'pause'       ()
                | 'disconnect'  () 

    Emitting in response events of type:

        Emit    = 'settings'    Settings
                | 'players'     [String] 
                | 'state'       Vertex > Cell
                | 'transition'  Edge > (Player, [Int])

    The 'state' and 'transition' types being destined to 
    players and viewers respectively.

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

        //--- join
        my.emit('msg', `${socket.player} joined`);
        players.push(socket);

        //--- info 
        socket
            .emit('players', players.map(s => s.player))
            .emit('settings', settings);
        
        //--- events
        socket
            .on('move', m => my.onMove(socket.player, m))  
            .on('disconnect', () => my.onLeave(socket))

        //--- autostart
        settings.start === "auto"
            && players.length === settings.nPlayer
            && __.sleep(1000).then(my.start);

        return true;
    }; 

    my.watches = socket => {

        viewers.push(socket);

        //--- info
        socket
            .emit('settings', settings)
            .emit('players', players.map(s => s.player));

        //--- events 
        socket
            .on('start', () => my.onStart(socket))
            .on('pause', my.pause)
            .on('disconnect', () => {
                viewers = viewers.filter(s => s.connected === true);
            })
    }


    //------ Receive Moves ------ 

    my.onMove = (player, move) => {
        currentMove = _r.assign(
            _r.map(weight => [player, weight])(move)
        )(currentMove);
    };

    my.onLeave = (socket) => {
        my.emitAll(`${socket.player} left the game!`);
        players = players.filter(s => s.connected === true);
        my.pause();
    }; 
    
    my.onStart = (socket) => {
        if (players.length === settings.nPlayers) {
            socket.emit('msg', 'game starting...');
            my.start();
        } 
        else 
            socket.emit('msg', 'waiting for players');
    };

    my.start = () => {
        my.paused = false
        //--- create initial state
        currentState = currentState || game.newState(
            players.map(s => s.player),
            settings.initialWeight,
            settings.nVitamins
        );

        //--- broadcast
        my.emitAll('msg', '|> starting...');
        my.emitAll('players', players.map(s => s.player));
        my.emitAll('state', currentState);
        //--- loop
        my.loop(0);
    }

    my.pause = () => {
        my.paused = true
        my.emitAll('msg', '|| game paused.');
    };

    
    //------ Update ------

    my.update = () => {
        let pr = game.process(settings.nVitamins);
        let [nextState, transition] = pr(currentState, currentMove);
        currentState = nextState;
        currentMove = {};
        return transition;
    };

    //------ Main Loop ------
    
    my.loop = (time) => {
        //... dump current state & move @ time ? 
        //--- update 
        let transition = my.update();
        //--- broadcast
        my.emitView('transition', transition);
        my.emitAll('time', time);
        my.emitAll('state', currentState);
        //--- continue
        if (! my.paused)
        __.sleep(settings.delay)
            .then(() => my.loop(time + 1));
    }
    
    //------ Broadcast ------

    my.emit = (...xs) => 
        players.forEach(p => p.emit(...xs));

    my.emitView = (...xs) => 
        viewers.forEach(v => v.emit(...xs));

    my.emitAll = (...xs) => {
        my.emit(...xs);
        my.emitView(...xs);
    };

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
