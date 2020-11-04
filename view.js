let io = require('socket.io-client'),
    __ = require('lolo'),
    _r = __.r;

let settings = {}; 


//--- Transport ---

let socket = io('http://localhost:3031')
    .on('time', t => __.log(`\n==== time: ${t} ====`))
    .on('settings', stgs => settings = stgs)
    .on('state', viewState)
    .on('transition', viewTransition);


//--- View Modes ---

let view = 'grid'; 

let viewState = s => view === 'grid' 
    ? __.pipe(viewGrid, __.log)(s)
    : __.logs('-> state:')(s);

let viewTransition = t => view === 'grid'
    ? () => {}
    : __.logs('-> transition:')(t);


//--- View Interface --- 

let my = {}; 

my.join = room => {
    socket.emit('viewRoom', room)
    return my;
};

my.use = str => {
    view = str === 'grid' ? 'grid' : 'log';
    return my;
};

module.exports = my;


//--- Terminal Grid ---

function viewGrid(state) {
    let [X, Y] = settings.size,
        view = __.range(X).map(x => __.range(Y).map(y => '  '));
    
    let cellString = ([p, w]) => w <= 10
        ? p[0].toLowerCase() + w
        : p[0].toUpperCase() + Math.floor(w / 10);

    _r.forEach((cell, vertex) => {
        let [x, y] = vertex.split(':').map(n => +n);
        try {
            view[x][y] = cellString(cell);
        } catch (e) {
            console.log(e);
        }
    })(state);
    return view
        .map(line => line.join(''))
        .join('\n');
}

