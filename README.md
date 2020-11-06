# Game of Cells

The game of cells is a game to be played by computers. 

It consists of regular grid whose nodes may be either empty, 
occupied by a 'cell' or a 'vitamin'. 
Each cell belongs to a player and carries a certain weight. 

Cells may chose to stay in place or move along adjacent edges, 
either as a whole or by dividing into cells of smaller weight. 
Once moves have been received, 
the game of cells updates its state by merging cells 
that cross along an edge or reach the same node. 

Only one cell of heaviest weight survives after merging, 
inheriting the total weight in presence. 
Cells of a given player are always merged before conflicting 
with extraneous cells.  

The game of cells differs from a classical
[cellular automaton](https://en.wikipedia.org/wiki/Cellular_automaton)
in that it leaves cells with a freedom of choice before applying 
its deterministic update rule. 
One may therefore think of the game of cells as a stochastic cellular automaton,
each player's choices being implemented as a stochastic transition function. 

## Usage 

To run the game server on your computer, clone the and run `app.js`:
```
$ git clone https://github.com/opeltre/cellServer
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

Player behaviours are defined through a function of type `State -> Move` 
provided to `player.use(...)`, e.g.

```js 
> let p1 = require('./player')
> let move = require('./move')
> p1.use(move)
> p1.login('bob').join('chillroom')
```
 
The game state is represented by a collection of  
`[player, weight]` pairs indexed by vertex labels,
of the form `"x:y"`. 

Each player responds by his move represented by
a collection of weights indexed by edge labels,
of the form `"x0:y0 > x1:y1"`.

If the total weight leaving from `"x0:y0"` is less than 
the weight initially present, a cell of remaining 
weight will be left remaining at `"x0:y0"`. 


```js
// move.js 
 
let edge = vertex => {
    let [x0, y0] = vertex.split(':').map(n => +n);
    let [x1, y1] = [
        [x+1, y], [x-1, y], [x, y-1], [x, y+1]
    ][Math.floor(Math.random() * 4)];
    return `${x0}:${y0} > ${x1}:${y1}`;
}

module.exports = (state) => {
    let move = {};
    Object.keys(state).forEach(v => {
        let [player, weight] = state[v];
        if (player === 'bob') 
            move[edge(v)] = weight % 4 === 0 ? weight / 2 : weight;
    });
    return move; 
}
``` 
