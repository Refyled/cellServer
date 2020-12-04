let room = null,
    settings = {},
    players = [],
    colormap = {'*': [0, 255, 0]},
    playerColors = [
        [255, 0, 2],
        [0, 0, 255]
    ];

let socket = io()
    .on('msg', showMsg)
    .on('settings', stgs => settings = stgs)
    .on('players', getPlayers)
    .on('rooms', showRooms)
    .on('transition', viewTransition);

getRooms();

//------ Start & Pause ------

function start () {
    socket.emit('start');
}
function pause () {
    socket.emit('pause');
}

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
            dom('span.players')
                .branch(r => r.players
                    .map(p => dom('span').html(p))
                )
        ]);
    oldDiv.replaceWith(newDiv(rooms));
}

function showMsg (msg) {
    __.log(msg);
    document.getElementById('console')
        .appendChild(
            dom('.log').html(`&gt; ${msg}`)()
        );
}

//------ Player Colors ------

function getPlayers (ps) {
    players = ps;
    players.forEach((p, i) => {
        colormap[p] = playerColors[i]
    });
}
