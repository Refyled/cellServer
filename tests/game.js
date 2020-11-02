let __ = require('lolo'),
    test = require('@opeltre/testo');

let graph = require('../graph').lattice(3, 3),
    game = require('../game')(graph);

exports.crossing = () => {
    let expect = {
        '0:0 > 0:1': ['a', 3],
        '0:1 > 0:0': ['b', 0]
    };
    let obtain = game.crossing({
        '0:0 > 0:1': ['a', 2],
        '0:1 > 0:0': ['b', 1]
    });
    return test(expect, obtain);
} 

exports.reaching = () => {
    let expect = {
        '0:0 > 0:1': ['a', 8],
        '1:1 > 0:1': ['b', 0],
        '0:2 > 0:1': ['a', 0]
    };
    let obtain = game.reaching({
        '0:0 > 0:1': ['a', 3],
        '1:1 > 0:1': ['b', 3],
        '0:2 > 0:1': ['a', 2]
    });
    return test(expect, obtain); 
}

exports.transitions = () => {
    let expect = {
        '0:0 > 0:1': ['a', [2, 3, 5]],
        '0:1 > 0:0': ['b', [1, 0, 0]],
        '1:1 > 0:1': ['a', [2, 2, 0]]
    }; 
    let obtain = game.transition({
        '0:0 > 0:1': ['a', 2],
        '0:1 > 0:0': ['b', 1],
        '1:1 > 0:1': ['a', 2]
    }); 
    return test(expect, obtain); 
}

exports.legalise = () => {
    let state = {
        '0:0': ['a', 4],
        '0:1': ['b', 2],
        '2:2': ['b', 5]
    };
    let expect = {
        '0:0 > 1:0': ['a', 3],
        '0:0 > 0:0': ['a', 1],
        '0:1 > 0:2': ['b', 1],
        '0:1 > 1:1': ['b', 1],
        '2:2 > 2:2': ['b', 5]
    };
    let obtain = game.legalise(state)({
        '0:0 > 1:0': ['a', 3],
        '0:1 > 0:0': ['b', 3],
        '0:1 > 0:2': ['b', 1],
        '0:1 > 1:1': ['b', 1]
    });
    return test(expect, obtain);
};

