let test = require('@opeltre/testo');

let game = require('./tests/game.js'),
    graph = require('./tests/graph.js');

test.run({
    game,
    graph
}); 
