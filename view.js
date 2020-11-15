let io = require('socket.io-client'),
    colors = require('colors'),
    __ = require('lolo'),
    _r = __.r;

let settings = {},
    players = [];

let colormap = {},
    colortheme = [
        'brightBlue', 'brightRed', 'brightYellow',
        'cyan', 'magenta', 'blue', 'red'
    ];

//--- Transport ---

let socket = io('http://localhost:3031')
    .on('time', t => __.log(`\n====== time: ${t} ======`.yellow))
    .on('state', s => viewState(s))
    .on('transition', t => viewTransition(t))
    .on('settings', stgs => settings = stgs)
    .on('players', ps => {
        console.log(ps);
        players = ps; 
        mapColors(ps)
    });


//--- View Modes ---

let view = 'grid'; 

let viewState = s => view === 'grid' 
    ? __.pipe(viewJoined, __.log)(s)
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
        view = __.range(X).map(x => __.range(Y).map(y => '  '.grey));
    
    _r.forEach((cell, vertex) => {
        let [x, y] = vertex.split(':').map(n => +n);
        try {
            view[x][y] = cellString(cell);
        } catch (e) {
            console.log(e);
        }
    })(state);

    let hr = __.range(X).map(() => '--'.grey);
    view = [hr, ...view, hr]
        .map(line => ['|'.grey, ...line, '|'.grey]);

    return view
        .map(line => line.join(''))
        .join('\n');
}


//--- Colored Cells ---

function mapColors (players) {
    players.forEach((p, i) => colormap[p] = colortheme[i]);
}

function cellString([p, w]) {
    if (p === '*') 
        return (' *').brightGreen
    return w < 10 
        ? (' ' + w)[colormap[p]]
        : (''+ Math.min(w, 99))[colormap[p]];
}


//--- Total and Max Weights --- 

function viewWeights (state) {

    let byPlayer = {}; 
    _r.forEach(([player, weight]) => {
        byPlayer[player] = byPlayer[player]
            ? [...byPlayer[player], weight]
            : [weight]
    })(state);


    let totMax = __.pipe(
        _r.map(ws => [
            [...ws].reduce((w0, w1) => w0 + w1),
            Math.max(...ws)
        ]),
        _r.map((ws, p) => ws.map(w => ('' + w)[colormap[p]]))
    )(byPlayer);

    let table = [
        ['', 'tot'.grey, 'max'.grey],
        ...players.map(p => [p.yellow, ...(totMax[p] || [0, 0])])
    ];

    let strings = __.range(4).map(() => 
        __.range(table.length).map(() => ''));

    table.forEach((row, i) => {
        row.forEach((field, j) => {
            strings[i][j] = field;
        })
    });

    return strings
        .map(line => line.join('\t'))
        .join('\n');
}


//--- View Grid and Weights ---

function viewJoined (state) {
    let [grid, table] = [viewGrid, viewWeights]
        .map(__.$(state));
    let gridLines = grid.split('\n'),
        tableLines = ['', '', '', ...table.split('\n')];
    tableLines.forEach((row, i) => {
        gridLines[i] = gridLines[i] + '\t' + row;
    });
    return gridLines.join('\n');
};
