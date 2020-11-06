let io = require('socket.io-client'),
    __ = require('lolo'),
    _r = __.r;

let settings = {};

//--- Transport --- 

let socket = io('http://localhost:3031')
    .on('msg', console.log)
    .on('rooms', console.log)
    .on('settings', stgs => settings = stgs)
    .on('time', t => __.log(`\n\n==== time: ${t} ====`))
    .on('state', state => {
        let move = randMove(state); 
        __.logs('---> sending:')(move); 
        socket.emit('move', move);
    });


//--- Player Interface ---

let my = {
    name : "",
}; 

my.login = name => {
    socket.emit('login', name);
    my.name = name;
    return my;
}

my.create = (room, stgs) => {
    socket.emit('newRoom', room, stgs);
    __.sleep(1000).then(() => 
        socket.emit('joinRoom', room)
    );
    return my;
};

my.join = room => {
    socket.emit('joinRoom', room);
    return my;
};

module.exports = my;

/*--- Move cells randomly ---

    Return a record of weights indexed by edge label: 
        
        `Edge > Int`    => { 'x0:y0 > x1:y1' : 3, ... }

    From a record of cells indexed by vertex label: 

        `Vertex > Cell` => { 'x0:y0' : ['player 1', 3] }


*///---- randMove: (Vertex > Cell) -> (Edge > Int)
function randMove (state) {

    let myCells = _r.filter(
        ([player, weight]) => player === my.name
    )(state);

    let move = {}; 
    _r.forEach(([player, weight], vertex) => {
        __.range(weight)
            .forEach(() => {
                let e = randEdge(vertex);
                move[e] = move[e] ? move[e] + 1 : 1;
            });
    })(myCells);
    return move;
};

/* Chose `edge` leaving from `vertex` on the regular lattice */

//------ randEdge: Vertex -> Edge 
function randEdge (vertex) {
    let directions = 
        [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]];

    let [x0, y0] = vertex.split(':'),
        [dx, dy] = directions[Math.floor(Math.random() * 5)],
        [x1, y1] = [+ x0 + dx, + y0 + dy];

    return `${x0}:${y0} > ${x1}:${y1}`;
};
