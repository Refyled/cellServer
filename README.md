# Cell Server 

## Graph Data   

Two subtypes `Vertex` and `Edge` of `String` are assumed 
to label the graph vertices and edges. 

To represent functions on vertices and edges valued in `a`,
we introduce the following type constructors: 

- `Vertex > a`  subtype of `{a}` indexed by vertex keys
- `Edge > a`    subtype of `{a}` indexed by edge keys 

For instance, vertices of type `(Int, Int)` on the 2D-lattice 
may be mapped to keys by `JSON.stringify`. 
Directed edges, subtype `(Vertex, Vertex)` may be similarly stringified, 
although different representations might be chosen. 

## States

Each player owns a collection of cells living on the vertices 
of the graph, each cell carrying an weight integer. 

The game state is therefore given by an object of type `Vertex > Int`
for each player, i.e. 

    State = Player > Vertex > Int 

letting `Player` denote the union type of players,  
and `Player > a` the subtype of `{a}` whose keys are players. 

## Moves

At each time step, cells may move along the graph edges. 
Cells with a weight larger than one may divide into smaller cells 
as long as the total weight is preserved. 

The move sent by each player is therefore an object of type: 

    Move = Edge > Int 

legal if and only if the weights leaving a given vertex sum up 
to the player's weight at this vertex in the previous state. 

The server receives a collection of moves indexed by player, of type

    Moves = Player > Edge > Int

## Cell Fusions 

Cells that meet either merge or eat each other. 
The surviving cell is either the cell of maximal weight, 
or chosen randomly along the cells of maximal weight. 

Cells may first cross along an edge. 
Eaten cells do not reach the end of the edge. 

Cells may then meet on a vertex. 
Cells owned by the same player merge before 
the surviving cell eats the others. 

## Transitions 

The evolution from one state to the next is aggregated 
into a single object of type: 

    Transitions = Player > Edge > (Int, Int, Int)

where a tuple `[w0, w1, w2]` for each edge yields the weights: 
    - `w0` leaving the start node along the edge,
    - `w1` surviving after the crossing, 
    - `w2` surviving on the end node. 

Mapping tuples `[w0, w1, w2]` to `w2` yields the final state, 
i.e. only one edge may assign a weight to its end point. 
