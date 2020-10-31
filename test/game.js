let game = require('../game'),
    __ = require('lolo');

let state = {
    '0:0': ['a', 4], 
    '1:0': ['a', 1],
    '0:1': ['b', 1]
}; 

let move = {
    '0:0 > 1:0': ['a', 2],
    '0:0 > 0:1': ['a', 2],
    '0:1 > 0:0': ['b', 1]
}; 

let source = e => e.split(' > ')[0],
    target = e => e.split(' > ')[1],
    sym = e => e.split(' > ').sort().join(' - ');

let crossing = game.mergeBy((c, e) => sym(e))(move);

let reaching = game.mergeBy((c, e) => target(e))(crossing);

__.logs('move:')(move);
__.logs('crossing:')(crossing);
__.logs('reaching:')(reaching);
