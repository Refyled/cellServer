/* game.js

    Cell = {
        weight : Int, 
        player : String
    } 

    State = Vertex > Cell

    Moves = Edge > Cell 
*/ 

//  groupBy : (a -> String) -> {a} -> {{a}} 
//  merge   : {a} -> {a} 
//  degroup : {{a}} -> {a} 

//  crossing : Moves -> Moves 
let crossing = __.pipe(
    groupBy((c, edge) => midpoint(edge)),
    merge,
    degroup
);

//  reaching : Moves -> Moves
let reaching = __.pipe(
    groupBy((c, edge) => endpoint(edge)),
    merge, 
    degroup
);


//  groupBy : (a -> String) -> {a} -> {{a}} 
let groupBy = key => elems => {
    let groups = {}; 
    _r.forEach((ei, i) => {
        groups[key(ei, i)] = _r.set(i, ei)(groups[key(ei, i)] || {});
    })(elems);  
    return groups;
};

//  degroup : {{a}} -> {a} 
let degroup = groups => 
    _r.reduce(
        (group, elems, i) => _r.assign(group)(elems),
        {}
    )(groups); 


/*  Assign the total weight of a group to one of the heaviest cells. */

//  mergeGroup : {Cell} -> {Cell} 
let mergeGroup = cells => {
    let [maxWeight, totalWeight] = _r.reduce(
        ({weight}, [m, t]) => [weight > m ? weight : m, weight + t],
        [0, 0]
    )(cells);
    let winner = __.pipe(
        _r.filter(c => c.weight === maxWeight && c.player !== '*'),
        randKey
    )(cells); 
    return _r.map(
        (c, key) => _r.set('weight', key === winner ? totalWeight : 0)
    )(cells); 
}; 

/*  Merge cells by player before merging the whole group. */

//  merge : {Cell} -> {Cell} 
let merge = __.pipe(
    groupBy(c => c.player),
    _r.map(mergeGroup),
    degroup,
    mergeGroup
);
