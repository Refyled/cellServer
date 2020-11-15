# Cells for AI

The game of cells is a game to be played by computers.

It consists of cells living on a regular grid, carrying an integer weight 
which they may increase by merging with
their siblings,or by eating other lighter cells and vitamins. 

Cells can stay in place or move along adjacent edges, 
either as a whole or by dividing into cells of smaller weights. 
Once moves have been received, 
the game updates its state by merging cells 
that cross along an edge or reach the same node. 
Only one cell of heaviest weight survives after merging, 
inheriting the total weight in presence. 
Cells of a given player are always merged before conflicting 
with extraneous cells.  

The game of cells differs from a classical
[cellular automaton](https://en.wikipedia.org/wiki/Cellular_automaton), 
such as Conway's 
[game of life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life),
by giving cells a freedom of choice before applying 
its deterministic update rule. 
One may therefore think of the game of cells as a stochastic cellular automaton,
where a player's policy is implemented by a stochastic transition function.

## Usage 

To run the game server on your computer, clone the and run `app.js`:
```
$ git clone https://github.com/refyled/cellServer
$ cd cellServer
$ node app.js
``` 

A sample random player is found in 
[player.js](https://github.com/opeltre/cellServer/blob/main/player.js). 
To start a game, open two terminals and run in node: 

```js
//--- tty1 ---
> let p1 = require('./player');
> p1.login('oli').create('aok');

//--- tty2 --- 
> let p2 = require('./player');
> p2.login('eljew').join('aok');
``` 

To watch the game from a terminal, use the sample view found in 
[view.js](https://github.com/opeltre/cellServer/blob/main/view.js).

```js
//--- tty3 ---
> let view = require('./view');
> view.join('aok');
``` 

## Players 

Player behaviours may be defined through a function of type `State -> Move`,
called upon each server update to generate the player's response. 

Call `player.use(...)` on a function of type
`Params -> State -> Move` to automatically pass parameters 
such as grid size and player login before instantiating the 
player's policy, e.g.   

```js 
> let p1 = require('./player')
> let move = require('./move')
> p1.use(move)
> p1.login('bob').join('chillroom')
```
 
The game state is given as a record mapping 
vertex labels `'x:y'` to cells 
viewed as `[player, weight]` 
pairs. 

Note that vitamins are labelled as player `'*'`

```js
//  State example
let state = {
    '2:2'   : ['A', 4],
    '3:2'   : ['B', 5],
    '5:6'   : ['A', 2],
    '9:4'   : ['*', 1]
};
```

Each player responds by a 
record mapping edge labels 
`'x0:y0 > x1:y1'` to moving weights.  

```js
//  Move for player "A":
let move = {
    '2:2 > 2:3': 2,
    '2:2 > 1:2': 2,
    '5:6 > 7:6': 1,
};
```

A cell of remaining weight stays in place 
if the total weight leaving from a node is less 
than the prior weight present on that node.  


```js
/*------ move.js ------

    Compute a move for `login` given the game state. 

    This module exports a function `Params -> State -> Move` where:

        Params = {
            login       : String
            gridsize    : (Int, Int)
        }
        
        State   = Vertex > (Player, Int) 
        Move    = Edge > Int

    Denoting by `Key > a` the subtype of `{a}` 
    formed by records with keys in `Key`. 

*///------

//  edge : Vertex -> Edge 
let edge = vertex => {
    let [x0, y0] = vertex.split(':').map(n => +n);
    let [x1, y1] = [
        [x+1, y], [x-1, y], [x, y-1], [x, y+1]
    ][Math.floor(Math.random() * 4)];
    return `${x0}:${y0} > ${x1}:${y1}`;
}

//             : Params -> (Vertex > (Player, Int)) -> (Edge > Int)
module.exports = ({login}) => state => {
    let move = {};
    Object.keys(state).forEach(v => {
        let [player, weight] = state[v];
        if (player === login) 
            move[edge(v)] = weight % 4 === 0 ? weight / 2 : weight;
    });
    return move; 
}
``` 
