let __ = require('@opeltre/lolo'),
    _r = __.r;

let calc = {}; 
/*  
    Move = { 
        start   : Pos
        end     : Pos
        weight  : Int
        player  : String
    }

    Cell = {
        pos     : Pos
        weight  : Int
        player  : String
    }

    State = { Cell }
*/

let moves = [
    {
        start : [x0, y0],
        end :   [x1, y1],
        weight: w0,
        player: "a"
    }
]; 

//  groupBy : (a -> String) -> [a] -> { [a] } 
let groupBy = f => xs => {
    let zs = {}; 
    xs.forEach(x => zs[f(x)].push(x));
    return zs
};

//  sortBy : (a -> a -> Bool) -> [a] -> [(a, Int)]
let sortBy = (

//  randKey : {a} -> String
let randKey = as => {
    let ks = Object.keys(as); 
    let n = Math.floor(Math.rand()* ks.length);
    return ks[n];
}; 

//  source : Move -> Cell 

//  halfMoves : Move -> (Move, Move) 
let halfMoves = m => { 
    let halfPos = __.map2(
        (x0, x1) => (x0 + x1) / 2
    )(m.start, m.move); 
    return [{
        weight: m.weight,
        start:  m.start,
        end:    halfPos
    },{
        weight: m.weight,
        start:  halfPos,
        end:    m.end
    }];
}

//  merge : Moves -> (Moves, Moves) 
/*
        M    =     M2     .    M1 
                /      \    /     \            
             s2  <----   s1  <----  s0

*/

let merge = moves => {
    let [m1, m2] = halfMoves(moves);
    let state1 = __.pipe(
        groupBy(cell => JSON.stringify(cell.end)),
        _r.map(mergeNode)
    )(m1); 
    let m12 = m2.map(
        cell => cell.player === state1[JSON.stringify(cell.start)].player
            ? cell
            : _r.set('weight', 0)(cell)
    );
    let state2 = __.pipe(
        groupBy(cell => JSON.stringify(cell.end)),
        _r.map(mergeNode)
    )(m12);
    return {
        moves: [m1, m12], 
        states: [state1, state2]
    }; 
}; 

/*  mergeNode : ([Cell], String) -> Cell

    Parameters:
    ----------
        - cells:    array of cells at a given position
        - pos:      string key identifying position

    Returns:
    -------
        - cell:     the unique surviving cell at position
*/
let mergeNode = (cells, pos) => {

    let weightsByPlayer = __.pipe(
        groupBy(c => c.player), 
        _r.map(cs => cs.reduce((c, w) => w + c.weight, 0))
    )(cells); 

    let [maxWeight, totalWeight] = _r.reduce(
        (wi, [max, tot]) => [wi > W ? wi : W, wi + W]
        [0, 0]
    )(weightsByPlayer);  

    let winner = __.pipe(
        _r.filter((w, p) => w === maxWeight && p !== 'vit'),
        randKey
    )(weightsByPlayer);

    return {
        pos:    JSON.parse(pos), 
        player: winner,
        weight: totalWeight
    }; 
}


//  start : Moves -> State
let start = moves => moves.reduce(


let groupBy = (xs, id) => xs.reduce(
    (x, acc) => State.set(id(x), [...acc[id(x)], x]), 
    State.empty()
)

/* 
    legal : State -> Moves -> Bool 

*/ 

module.exports = calc; 
