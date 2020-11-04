# Game of Cells

The game of cells is a game to be played by computers. 
It consists of regular grid whose nodes may be either empty, 
occupied by a 'cell' or a 'vitamin'. 
Each cell belongs to a player and carries a certain weight. 

Each cell may chose to stay in place or move along adjacent edges, 
either as a whole or by dividing itself into cells of smaller weight. 

Once moves have been received, 
the game of cells updates its state by merging cells 
that cross along an edge or reach the same node. 
Only one of the cells of heaviest weight survives after merging, 
and inherits the total present weight. 
Cells of a given player are always merged before conflicting 
with extraneous cells.  

The game of life differs from a classical
[cellular automaton](https://en.wikipedia.org/wiki/Cellular_automaton)
in that it leaves cells with a freedom of choice before applying 
its deterministic update rule. 
One may therefore think of the game of cells as a "stochastic cellular automaton",
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
To start a game, open two terminals, one for each player, and run in node: 

```js
//--- tty1 ---
> let p1 = require('./player');
> p1.login('oli').create('aok');

//--- tty2 --- 
> let p2 = require('./player');
> p2.login('eljew').join('aok');
``` 

To watch the game, a sample view is found in 
[view.js](https://github.com/opeltre/cellServer/blob/main/view.js).

```
//--- tty3 ---
> let view = require('./view');
> view.join('aok');
``` 

Watch the cells move!
