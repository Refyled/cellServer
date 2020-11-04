let __ = require('lolo'),
    _r = __.r,
    test = require('@opeltre/testo');

let Graph = require('../graph'),
    Game = require('../game');

let graph = require('../graph').lattice(3, 3),
    game = require('../game')(graph);

exports.crossing = () => {
    let expect = {
        '0:0 > 0:1': ['a', 3],
        '0:1 > 0:0': ['b', 0],
        '2:2 > 2:2': ['*', 1]
    };
    let obtain = game.crossing({
        '0:0 > 0:1': ['a', 2],
        '0:1 > 0:0': ['b', 1],
        '2:2 > 2:2': ['*', 1]
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

exports.final = () => {
    let expect = {
        '0:0': ['a', 4], 
        '1:1': ['b', 3]
    }; 
    let obtain = __.pipe(game.transition, game.final)({
        '1:0 > 0:0': ['a', 3],
        '0:1 > 0:0': ['b', 1],
        '2:1 > 1:1': ['b', 2],
        '1:1 > 1:1': ['b', 1]
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
        '0:1 > 1:1': ['b', 1],
        '2:2 > 2:2': ['b', 2],
        '2:2 > 0:0': ['b', 1],
        '1:2 > 2:2': ['b', 2]
    });
    return test(expect, obtain);
};

exports.legaliseEmpty = () => {
    let state = {
        '0:0': ['a', 4],
        '1:1': ['b', 3],
        '2:2': ['*', 1]
    };
    let expect = {
        '0:0 > 0:0': ['a', 4],
        '1:1 > 1:1': ['b', 3],
        '2:2 > 2:2': ['*', 1]
    };
    let obtain = game.legalise(state)({});
    return test(expect, obtain);
}

exports.addVitamins = () => {
    let state = {
        '1:1': ['a', 4],
        '3:3': ['b', 2]
    }; 
    let expect = _r.assign(state)(
        _r.compute(v => ['*', 1])(graph.getVertices())
    );
    let obtain = game.addVitamins(8)(state);
    return test(expect, obtain);
};

exports.countVitamins = () => {
    let expect = 2,
        obtain = game.countVitamins({
        '1:1': ['*', 1],
        '2:2': ['a', 3],
        '1:0': ['*', 1]
    });
    return test(expect, obtain);
};

let game2 = Game(Graph.lattice(5, 5));

exports.addPlayers = () => {
    let expect = {
        '1:1': ['a', 4],
        '3:3': ['b', 4]
    };
    let obtain = game2.addPlayers(['a', 'b'], 4)({});
    return test(expect, obtain);
};
