let room = null,
    settings = {},
    players = [];

let socket = io()
    .on('msg', console.log)
    .on('settings', stgs => settings = stgs)
    .on('players', ps => players = ps)
    .on('rooms', showRooms)
    .on('transition', viewTransition);

//------ Navigation ------

function getRooms () {
    socket.emit('getRooms');
}

function joinRoom (name) {
    socket.emit('viewRoom', name),
    transitions = [];
}

function showRooms (rooms) {
    let oldDiv = document.getElementById('games');
    let newDiv = 
        dom('#games')
            .pull(__.r.toPairs)
            .branch(games => games.map(
                ([r, name]) => dom.pull(() => ({name, ...r}))(room)
            ));
    let room = 
        dom('.game', {
            onclick: (e, io, r) => joinRoom(r.name)
        }, [
            ['span.name',       {html: r => r.name}],
            ['span.nPlayers',   {html: r => `(${r.nPlayers})`}],
            ['span.players',    {html: r => `${r.players.join('\t')}`}]
        ]);
    oldDiv.replaceWith(newDiv(rooms));
}

//------ Game View ------ 

let svg = dom('svg', {width: "600", height: "600"})
    .place('svg')
    .branch([dom('g').place('gCells')])
    .put('#view');

let ioCells = dom.IO.put(svg)();

function viewTransition (trs) {

    let [X, Y] = settings.size,
        [W, H] = [600, 600],
        [w, h] = [W/X, H/Y],
        cssDelay = 0.01
        ds = (settings.delay / 2000) - 3 * cssDelay;

    //  interpolate : (Edge, Num) -> (Int, Int)
    let interpolate = (edge, k) => {
        let [[x0, y0], [x1, y1]] = edge
            .split(' > ').map(v => v.split(':').map(n => +n));
        return [(1-k)*x0 + k*x1, (1-k)*y0 + k*y1];
    }

    //  model : Num -> [CellModel]
    let model = k => __.pipe(
        _r.map(([p, ws], edge) => ({
            player: p,
            weight: ws[k],
            pos: interpolate(edge, k).map(coord => coord * w)
        })),
        _r.toPairs, 
        __.map(([m, e]) => m)
    )(trs); 

    let color = () => "#f23";

    //  cell : CellModel -> Dom
    let cell = dom('rect.cell', {
        fill        : m => color(m.weight, m.player),
        width       : w,
        height      : h
    })
        .style('transform',  m => `translate(${m.pos[0]}px, ${m.pos[1]}px)`)
        .style('transition', `transform ${ds}s linear`)
        .place('cell')

    //  cells : [CellModel] -> Dom
    let cells = dom.map(cell)
        .pull(model)
    
    //  group : [CellModel] -> Dom
    let group = dom('g#transition')
        .place('gCells')
        .put('svg')
        .branch(cells)

    //  tick : Num -> IO(Num)
    let tick = k => dom.IO()
        .return(k)
        .bind(dom.IO.map.set(cells))
        .return(k + 0.5);
    
    //  loop : Num -> IO()
    let loop = k => __.log(k) < 1
        ? tick(k).sleep(ds + cssDelay).bind(loop)
        : tick(k);
    
    ioCells.return(0)
        .bind(dom.IO.replace(group))
        .sleep(cssDelay)
        .return(0.5)
        .bind(loop);
}
