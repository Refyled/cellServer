/*  view.js
 *  
 *  Show game transitions inside: 
 *
 *      <div id="view"> ... </div> 
 *
 *  Replace this file by exporting `viewTransition(t)`
 */

let svg = dom('svg', {width: "600px", height: "600px"})
    .branch([dom('g#transition').place('gCells')])
    .put('#view');

let ioCells = dom.IO.put(svg)();

function viewTransition (trs) {

    let [X, Y] = settings.size,
        [W, H] = [600, 600],
        [w, h] = [W/X, H/Y],
        fps = 10,
        ds = 1/fps,
        T = settings.delay/1000;

    //  interpolate : (Edge, Num) -> (Int, Int)
    let interpolate = (edge, k) => {
        let [[x0, y0], [x1, y1]] = edge
            .split(' > ').map(v => v.split(':').map(n => +n));
        return [(1-k)*x0 + k*x1, (1-k)*y0 + k*y1];
    }
   
    //  interweight : ([Int], Num) -> Num
    let interweight = (ws, k) => k <= .5 
        ? 2 * k * ws[1] + (1 - 2 * k) * ws[0]
        : 2 * (k - .5) * ws[2] + (2 - 2 * k) * ws[1];

    //  model : Num -> [CellModel]
    let model = k => __.pipe(
        _r.map(([p, ws], edge) => ({
            player: p,
            weight: interweight(ws, k), 
            pos: interpolate(edge, k).map(coord => coord * w)
        })),
        _r.toPairs, 
        __.map(([m, e]) => m)
    )(trs); 

    let color = () => "#f23";

    //  cell : CellModel -> Dom
    let cell = dom('rect.cell', {
        fill        : m => `rgb(${colormap[m.player].join(',')})`,
        'fill-opacity': m => Math.min(m.weight/10, 1),
        width       : w,
        height      : h,
        transform: m => `translate(${m.pos[0]}, ${m.pos[1]})`
    })
        .place('cell')

    //  cells : [CellModel] -> Dom
    let cells = dom.map(cell)
        .pull(model)
    
    //  group : [CellModel] -> Dom
    let group = dom('g#transition')
        .place('gCells')
        .put('svg')
        .branch(cells);

    //  tick : Num -> IO ()
    let tick = k => dom.IO()
        .return(k)
        .bind(dom.IO.map.set(cells))
    
    //  loop : Time -> IO Time
    let loop = t0 => {
        let k = __.logs('k:')((Date.now() - t0) / settings.delay);
        return ds < __.logs('time remaining')((1 - k) * T)
            ? tick(k).sleep(ds).bind(() => loop(t0))
            : tick(k);
    };

    //--- Show initial State ---

    ioCells.return(0)
        .bind(dom.IO.replace(group));

    //--- Start Loop ---

    ioCells.return(Date.now())
        .sleep(ds)
        .bind(loop);

}

