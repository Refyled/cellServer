let graph = require('../graph'),
    test = require('@opeltre/testo');

let G = graph.lattice(3, 3);

exports.getVertices = () => {
    let expect = [
        '0:0', '0:1', '0:2',
        '1:0', '1:1', '1:2',
        '2:0', '2:1', '2:2'
    ];
    let obtain = G.getVertices();
    return test(expect, obtain); 
};

exports.isVertex = () => {
    let expect = [true, false, false],
        obtain = ['1:1', '1:3', '123'].map(G.isVertex);
    return test(expect, obtain);
}; 

exports.isEdge = () => {
    let expect = [true, true, false, false],
        obtain = ['0:0 > 1:0', '0:0 > 0:0', '0:0 > 1:1', '2:2 > 2:3']
        .map(G.isEdge);
    return test(expect, obtain);
};

exports.vertexEdge = () => {
    let expect = '1:1 > 1:1',
        obtain = G.vertexEdge('1:1');
    return test(expect, obtain);
};

exports.edgeSource = () => {
    let expect = '2:2', 
        obtain = G.edgeSource('2:2 > 1:2');
    return test(expect, obtain);
};

exports.edgeTarget = () => {
    let expect = '1:2', 
        obtain = G.edgeTarget('2:2 > 1:2');
    return test(expect, obtain);
};

exports.edgeSym = () => {
    let obtain = 
        G.edgeSym('1:1 > 2:1') === G.edgeSym('2:1 > 1:1');
    return test(true, obtain);
};
