# Cell Server 

Each cell is defined by a position, a weight and a player attribute

```
Cell = {
    pos:    (Int, Int),
    weight: Int,
    player: String
} 
```

The game state is given as a record of cells indexed by position. 
The key associated to `[x, y]` computed by `JSON.stringify`. 

```
State = { Cell }
``` 

Each player sends moves of type `[Move]` where:

```
Move = {
    start:  (Int, Int),
    end:    (Int, Int), 
    weight: Int,
    player: String
}
``` 

The server sends the view an array of type `[Transition]` where: 

``` 
Transition = {
    positions:  [(Int, Int)], 
    weights:    [Int],
    player:     String 
} 
``` 
