import { Elysia, t } from 'elysia';
import { html } from '@elysiajs/html';
import { ConwayBoard, ConwaySquare } from './conway';

const BaseHtml = ({ children }: elements.Children) => (`
<!DOCTYPE html>
<html lang="en-us">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BETH STACK TODO</title>
    <script src="https://unpkg.com/htmx.org@1.9.5" integrity="sha384-xcuj3WpfgjlKF+FXhSQFQ0ZNr39ln+hwjN3npfM9VBnUskLolQAcN80McRIVOPuO" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/@unocss/runtime"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@unocss/reset/tailwind.min.css">
</head>
${children}
</html>
`);

let boardRowCount = 20;
let boardState:boolean[][];
let shouldStopPolling = false;
let isPolling = false;

function initializeBoardState() {
    boardState = Array.from(Array(boardRowCount), _ => Array(boardRowCount).fill(false));
}

initializeBoardState();

const app = new Elysia()
    .use(html())
    .get("/", ({html}) => html(
        <BaseHtml>
            <body 
                class="flex w-full h-screen justify-center items-center"
                hx-get="/conway"
                hx-trigger="load"
                hx-swap="innerHTML">                
            </body>
        </BaseHtml>))
    .post("/clicked", () => <div class="text-blue-600">You did it</div>)
    .get("/conway", () => <ConwayBoard boardState={boardState}/>)
    .post("/conway/toggle/:row/:col", 
    ({params: {row, col}}) => {
        boardState[row][col] = !boardState[row][col];
        return <ConwayBoard boardState={boardState}/>
    },
    {
        params: t.Object({
            row: t.Numeric(),
            col: t.Numeric()
        })
    })
    .post("/conway/clear", () => {
        initializeBoardState();
        return <ConwayBoard boardState={boardState}/>
    })
    .post("/conway/next", ({set}) => {
        if (shouldStopPolling) {
            shouldStopPolling = false;            
            set.status = 286;
            return <ConwayBoard boardState={boardState} isPolling={isPolling}/>
        }
        boardTick();
        
        return <ConwayBoard boardState={boardState} isPolling={isPolling}/>
    })
    .post("/conway/stop", () => {
        shouldStopPolling = true;
        isPolling = false;
        return <ConwayBoard boardState={boardState} isPolling={isPolling}/>
    })
    .post("/conway/play", () => {
        isPolling = true;
        return <ConwayBoard boardState={boardState} isPolling={isPolling}/>
    })
    .listen(3000);

console.log(`🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`);

function boardTick() {
    const clonedBoardState = boardState.map(row => row.slice());
    // Loop through each square
    for (let i = 0; i < boardState.length; i++) {
        for (let j = 0; j < boardState[i].length; j++) {
            const isAlive = boardState[i][j];

            let aliveCount = getAliveCount(i, j);
            if (isAlive) {         
                if (aliveCount > 1 && aliveCount < 4) {
                    // square stays alive
                    clonedBoardState[i][j] = true;
                }
                else {
                    clonedBoardState[i][j] = false;
                }
            } else {
                // current square is dead
                // it's alive if it has 3 live neighbors
                clonedBoardState[i][j] = aliveCount === 3;
            }
        }
    }
    boardState = clonedBoardState;
}

function getAliveCount(i: number, j: number) {
    let squareStatus: boolean[] = [];
    
    for (let iRow = i-1; iRow < i+2; iRow++) {
        for (let jRow = j-1; jRow < j+2; jRow++) {
            if (iRow === i && jRow === j) {
                continue;
            }
            pushSquareStatus(iRow, jRow, squareStatus);
        }
    }    
    /* pushSquareStatus(i-1, j-1, squareStatus);
    pushSquareStatus(i-1, j, squareStatus);
    squareStatus.push(getSquareValue[i - 1][j + 1]);
    squareStatus.push(getSquareValue[i][j - 1]);
    squareStatus.push(getSquareValue[i][j + 1]);
    squareStatus.push(getSquareValue[i + 1][j - 1]);
    squareStatus.push(getSquareValue[i + 1][j]);
    squareStatus.push(getSquareValue[i + 1][j + 1]); */

    let aliveCount = squareStatus.reduce((acc, cur) => {
        const squareAliveCount = cur ? 1 : 0;
        return acc + squareAliveCount;
    }, 0);    
    return aliveCount;
}
function pushSquareStatus(i: number, j:number, squareStatus: boolean[]) {
    squareStatus.push(getSquareValue(i,j));
}
function getSquareValue(i: number, j: number): boolean {
    const squareValue = !!boardState?.[i]?.[j];    
    return squareValue;
} 

