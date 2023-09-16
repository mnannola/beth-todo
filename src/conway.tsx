import * as elements from 'typed-html';

function ConwaySquare({isToggled, row, col}: {isToggled: boolean, row:number, col:number}) {
    let baseClasses = "flex flex-row space-x-3 border border-black w-6 h-6";
    if (isToggled) {
        baseClasses = baseClasses.concat(' bg-yellow-300');
    }
    
    return (
        <div 
            class={baseClasses}
            hx-post={`/conway/toggle/${row}/${col}`}
            hx-target=".board"
            hx-swap="outerHTML">            
        </div>
    )
}

function ConwayBoard({boardState}:{boardState:boolean[][]}){
    // Use 2d array to keep track of board state.
    // 0 represents blank, 1 is filled in.

    const rows = boardState.map((row, i) => (
        <div class="flex flex-row">
            {row.map((square, j) => <ConwaySquare isToggled={square} row={i} col={j}/>)}
        </div>
    ))
    
    return (
        <div class="board">
           <div>
                {rows}
            </div> 
        </div>
    )
}

export { ConwayBoard, ConwaySquare };