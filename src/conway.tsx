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

function StopPollingButton({}) {
    return (
        <div>
            <span
                hx-post={`/conway/next`}
                hx-trigger="every 1s"
                hx-target=".board"
                hx-swap="outerHTML"></span>
            <button
                class="bg-red-400 py-2 px-4 my-2 mx-2 rounded"
                hx-post={`/conway/stop`}
                hx-target=".board"
                hx-swap="outerHTML">stop</button>
        </div>
    )
}

function ConwayBoard({boardState, isPolling = false}:{boardState:boolean[][], isPolling?:boolean}){
    // Use 2d array to keep track of board state.
    // 0 represents blank, 1 is filled in.

    const rows = boardState.map((row, i) => (
        <div class="flex flex-row">
            {row.map((square, j) => <ConwaySquare isToggled={square} row={i} col={j}/>)}
        </div>
    ));
    
    return (        
        <div class="board">
            <button 
                class="bg-red-500 py-2 px-4 my-2 rounded"
                hx-post={`/conway/clear`}
                hx-target=".board"
                hx-swap="outerHTML">clear</button>
            <div>
                {rows}
            </div>
            <div class="flex flex-row items-stretch">
                <button
                    class="bg-blue-400 py-2 px-4 my-2 mx-2 rounded"
                    hx-post={`/conway/next`}
                    hx-target=".board"
                    hx-swap="outerHTML">next round</button>

                {!isPolling && <button
                    class="bg-green-400 py-2 px-4 my-2 mx-2 rounded"
                    hx-post={`/conway/play`}
                    hx-target=".board"
                    hx-swap="outerHTML">play</button>}

                {isPolling && <StopPollingButton/>}
            </div>
            
        </div>
    )
}



export { ConwayBoard, ConwaySquare };