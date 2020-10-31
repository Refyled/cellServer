/* game.js 

    Cell = (String, Int) 

    State = Vertex > Cell

    Moves = Edge > Cell 
*/ 

let __ = require('lolo'),
    _r = __.r;


//------ Cell Operations ------
    
//  Cell = (String, Int) 

//  getPlayer : Cell -> String
let getPlayer = ([p, w]) => p;

//  isVitamin : Cell -> Bool
let isVitamin = c => getPlayer(c) === '*'; 

//  getWeight : Cell -> Int
let getWeight = ([p, w]) => w;

//  setWeight : Int -> Cell -> Int
let setWeight = w1 => ([p, w0]) => [p, w1]; 

//------ Graph Operations ------ 

let source = e => e.split(' > ')[0],
    target = e => e.split(' > ')[1],
    sym = e => e.split(' > ').sort().join(' - ');

//------ Record Operations ------

/*  Pluck subrecords satisfying a common grouping property */ 
 
//  groupBy : (a -> b) -> {a} -> (b > {a})  
let groupBy = key => elems => {
    let groups = {}; 
    _r.forEach((ei, i) => {
        groups[key(ei, i)] = _r.set(i, ei)(groups[key(ei, i)] || {});
    })(elems);  
    return groups;
};

/*  Concatenate a record of subrecords */ 

//  degroup : (b > {a}) -> {a} 
let degroup = groups => 
    _r.reduce(
        (group, elems, i) => _r.assign(group)(elems),
        {}
    )(groups); 

/*  Randomly select one of a record's keys */

//  randKey : {a} -> String
let randKey = as => {
    let ks = Object.keys(as); 
    let n = Math.floor(Math.random() * ks.length);
    return ks[n];
}; 


//------ Merging Cells ------ 

/*  Assign the total weight of a group to one of the heaviest cells. */

//  mergeGroup : {Cell} -> {Cell} 
let mergeGroup = cells => {
    let [maxWeight, totalWeight] = __.pipe(
        _r.map(getWeight),
        _r.reduce(
            ([max, tot], w) => [w > max ? w : max, tot + w],
            [0, 0]
        )
    )(cells);
    let winner = __.pipe(
        _r.filter(c => getWeight(c) === maxWeight && !isVitamin(c)),
        randKey
    )(cells); 
    return _r.map(
        (c, key) => setWeight(key === winner ? totalWeight : 0)(c)
    )(cells);
}; 

/*  Merge cells by player before merging the whole group. */

//  merge : {Cell} -> {Cell} 
let merge = __.pipe(
    groupBy(getPlayer),
    _r.map(mergeGroup),
    degroup,
    mergeGroup
);

/*  Merge only cells satisfying a common property 

        groupBy(f)       _r.map(merge)       degroup
    {a} ---------> {{a}} ------------> {{a}} ------> {a} 
      `                                               ^              
        ` - - - - - - - - - - - - - - - - - - - - - - '
                         mergeBy(f) 
*/

//  mergeBy : (Cell -> String) -> {Cell} -> {Cell} 
let mergeBy = property => __.pipe(
    groupBy(property),
    _r.map(merge),
    degroup
); 


//------ Examples ------

/*  Merge cells crossing the same edge */

//  crossing : (Edge > Cell) -> (Edge > Cell) 
let crossing = 
    mergeBy((cell, edge) => Graph.symEdge(edge)); 

/*  Merge cells reaching the same node */

//  reaching : (Edge > Cell) -> (Edge > Cell) 
let reaching = 
    mergeBy((cell, edge) => Graph.endpoint(edge));

/*  Return the successive weights of cells running through edges */

//  transitions : (Edge > Cell) -> (Edge > (Player, [Int]))
let transitions = move => {
    let m1 = crossing(move),
        m2 = reaching(move); 
    return _r.map(
        (cell, edge) => [getPlayer(cell), [
            getWeight(cell),
            getWeight(m1[edge]),
            getWeight(m2[edge])
        ]]
    )(move);
}

//------ Exports ------ 

module.exports = {
    groupBy,
    degroup,
    mergeGroup,
    merge,
    mergeBy
}; 
