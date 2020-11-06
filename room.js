let Game = require('./game'),
    Graph = require('./graph'),
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
            socket.emit('msg', '> room is full!');
            return false
        } 
        //--- join
        socket.emit('settings', settings);
        socket.emit('players', players.map(s => s.player));
        my.emit('msg', `> ${socket.player} joined`);
        players.push(socket);
        //--- send moves
        socket.on('move', m => {
            my.putMove(socket.player, m)
        });
        //--- leave game 
        socket.on('disconnect', () => {
            __.log(`< ${socket.player} left the game!`);
            players = players.filter(s => s.connected === true);
            my.pause();
        }) 
        //--- autostart
        if (players.length === settings.nPlayers) 
            __.sleep(1000).then(my.start);
        return true;
    }; 

    my.watches = socket => {
        viewers.push(socket);
        socket.emit('settings', settings);
        socket.emit('players', players.map(s => s.player));
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


    //------ Process Moves ------ 

    //  process : (State, Move) -> (State, Transition)
    let process = (s0, m0) => {
        let m1 = game.legalise(s0)(m0),
            tr = game.transition(m1),
            s1 = game.final(tr),
            nVit = game.countVitamins(s1),
            dVit = settings.nVitamins - nVit,
            s2 = game.addVitamins(dVit)(s1);
        return [s2, tr];
    };


    //------ Main Loop ------
    
    my.loop = (time) => {
        //... dump current state & move @ time ? 
        //--- update 
        let [nextState, transition] = process(currentState, currentMove);
        currentState = nextState;
        currentMove = {};
        //--- broadcast
        my.emitView('transition', transition);
        my.emitAll('time', time);
        my.emitAll('state', nextState);
        //--- continue
        if (! my.paused)
        __.sleep(settings.delay)
            .then(() => my.loop(time + 1));
    }
    
    my.start = () => {
        my.paused = false
        //--- create initial state
        if (!currentState) {
            let ps = players.map(s => s.player),
                w0 = settings.initialWeight,
                nVit = settings.nVitamins;
            currentState = __.pipe(
                game.addPlayers(ps, w0),
                game.addVitamins(nVit)
            )({});
        }
        //--- broadcast
        my.emitAll('msg', '|> starting...');
        my.emitAll('players', players.map(s => s.player));
        my.emitAll('state', currentState);
        //--- loop
        my.loop(0);
    }

    my.pause = () => {
        my.paused = true
        my.emit('msg', '|| game paused.');
    };

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
