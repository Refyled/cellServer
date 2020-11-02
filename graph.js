//  graph.js    

let __ = require('lolo');

/*------ Graph Structure ------
 
    A directed graph `G` is defined by a pair of union types
    `(Vertex, Edge)` where each `e : Edge` has a 
    source and a target, both of type `Vertex`. 

    We denote by `SymEdge` the type of unordered pairs in `Vertex`. 

    The undirected graph `G- : (Vertex, SymEdge)` is associated to `G` 
    by forgetting the orientation of edges. 

        getVertices : () -> [Vertex] 

        isVertex    : String -> Bool
        isEdge      : String -> Bool

        edgeSource  : Edge -> Vertex
        edgeTarget  : Edge -> Vertex
        edgeSym     : Edge -> SymEdge

*///------


/*------ Return a 2D-lattice of size (X, Y) ------*/

//  lattice : (Int, Int) -> Graph
let lattice = (X, Y) => {

    let my = {}; 

    //--- Vertices: "x:y" ---

    //.getVertices : () -> [Vertex]
    my.getVertices = () => __.range(X)
        .map(x => __.range(Y).map(y => [x, y]))
        .map(pos => pos.join(':'));

    //.isVertex : String -> Bool
    my.isVertex = vertex => {
        let fmt = /\d*:\d*/;
        if (!fmt.exec(edge))
            return false;
        let [x, y] = vertex.split(':')
            .map(n => +n);
        return 0 < x && x < X && 0 < y && y < Y;
    };

    //--- Edges: "x0:y0 > x1:y1" ---
    
    //.isEdge : String -> Bool 
    my.isEdge = edge => {

        let fmt = /\d*:\d*\s>\s\d*:\d*/;
        if (!fmt.exec(edge))
            return false;

        let [v0, v1] = edge.split(' > ');
        if (! (my.isVertex(v0) && my.isVertex(v1)))
            return false;

        let [x0, y0] = v0.split(':'),
            [x1, y1] = v1.split(':');
        return (x0 === x1 && Math.abs(y1 - y0) === 1) 
            || (y0 === y1 && Math.abs(x1 - x0) === 1);
    };

    //.source : Edge -> Vertex
    my.source : edge => edge.split(' > ')[0];

    //.target : Edge -> Vertex
    my.source = edge -> edge.split(' > ')[1];

    //--- SymEdges: "x0:y0 - x1:y1" ---
    
    my.symEdge = edge => edge.split(' > ').sort().join(' - ');

    return my; 
};

exports.lattice = lattice; 
