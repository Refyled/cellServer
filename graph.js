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

        initialVertices : Int -> [Vertex]

*///------


/*------ Return a 2D-lattice of size (X, Y) ------*/

//  lattice : (Int, Int) -> Graph
let lattice = (X, Y) => {

    let my = {
        shape: [X, Y]
    }; 

    //--- Vertices: "x:y" ---

    //.getVertices : () -> [Vertex]
    my.getVertices = () => __.range(X)
        .map(x => __.range(Y).map(y => [x, y].join(':')))
        .reduce((as, bs) => [...as, ...bs]);

    //.isVertex : String -> Bool
    my.isVertex = vertex => {
        let fmt = /\d*:\d*/;
        if (!fmt.exec(vertex))
            return false;
        let [x, y] = vertex.split(':')
            .map(n => +n);
        return 0 <= x && x < X && 0 <= y && y < Y;
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
            || (y0 === y1 && Math.abs(x1 - x0) === 1)
            || (x0 === x1 && y0 === y1);
    };

    //.edgeSource : Edge -> Vertex
    my.edgeSource = edge => edge.split(' > ')[0];

    //.edgeTarget : Edge -> Vertex
    my.edgeTarget = edge => edge.split(' > ')[1];

    //.vertexEdge : Vertex -> Edge 
    my.vertexEdge = vertex => vertex + ' > ' + vertex;

    //--- SymEdges: "x0:y0 - x1:y1" ---
    
    my.edgeSym = edge => edge.split(' > ').sort().join(' - ');


    //--- Initial positions evenly spaced on a box ---

    //.initialVertices : Int -> [Vertex]
    my.initialVertices = (nPlayers) => { 
        let [x2, y2] = [X-1, Y-1].map(n => Math.floor(n/2)),
            [x4, y4] = [X-1, Y-1].map(n => Math.floor(n/4));
        let onBox = dL => {
            if (dL <= x2) 
                return [x4 + dL, y4];
            if (dL - x2 <= y2)
                return [x4 + x2, y4 + (dL - x2)];
            if (dL - x2 - y2 <= x2) 
                return [x4 + x2 - (dL - x2 - y2), y4 + y2];
            else
                return [x4, y4 + y2 - (dL - 2 * x2 - y2)];
        };
        return __.range(nPlayers)
            .map(k => Math.floor(k * (X + Y - 2) / nPlayers))
            .map(onBox)
            .map(pos => pos.join(':'));
    };

    return my; 
};

exports.lattice = lattice; 
