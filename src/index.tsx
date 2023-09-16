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

type Todo = {
    id: number;
    content: string;
    completed: boolean;
}

const db: Todo[] = [
    {
        id: 1, content: 'Learn htmx', completed: false
    },
    {
        id: 2, content: 'Learn bun', completed: true
    }
];

let boardState = [
    [false,false,false,false,false],
    [false,false,false,false,false],
    [false,false,false,false,false],
    [false,false,false,false,false],
    [false,false,false,false,false],
];

function TodoItem({id, content, completed}: Todo) {
    return (
        <div class="flex flex-row space-x-3">
            <p>{content}</p>
            <input 
                type="checkbox" 
                checked={completed}
                hx-post={`/todos/toggle/${id}`}
                hx-target="closest div"
                hx-swap="outerHTML">                    
            </input>
            <button 
                class="text-red-500"
                hx-delete={`/todos/${id}`}
                hx-target="closest div"
                hx-swap="outerHTML">X</button>
        </div>
    )
}

function TodoList({ todos }: { todos: Todo[]}) {
    return (
        <div>
            {todos.map(({id, content, completed}) => <TodoItem id={id} content={content} completed={completed} />)}
            <TodoForm/>
        </div>        
    )
}

function TodoForm() {
    return (
        <form hx-post="/todos" hx-swap="beforebegin">
            <label for="content">Content: </label>
            <input name="content" type="text" class="border border-black"></input>

            <button type="submit">Create</button>        
        </form>
    )
}

const app = new Elysia()
    .use(html())
    .get("/", ({html}) => html(
        <BaseHtml>
            <body 
                class="flex w-full h-screen justify-center items-center"
                //hx-get="/todos"
                hx-get="/conway"
                hx-trigger="load"
                hx-swap="innerHTML">                
            </body>
        </BaseHtml>))
    .post("/clicked", () => <div class="text-blue-600">You did it</div>)
    .get("/todos", () => <TodoList todos={db} />)
    .get("/conway", () => <ConwayBoard boardState={boardState}/>)
    .post("/conway/toggle/:row/:col", 
    ({params: {row, col}}) => {
        const cloneBoardState = [...boardState];
        cloneBoardState[row][col] = !cloneBoardState[row][col];
        boardState = cloneBoardState;
        return <ConwayBoard boardState={cloneBoardState}/>
    },
    {
        params: t.Object({
            row: t.Numeric(),
            col: t.Numeric()
        })
    })
    .post("/todos/toggle/:id", 
        ({ params }) => {
            const todo = db.find(todo => todo.id === params.id)
            if (todo) {
                todo.completed = !todo.completed;
                return <TodoItem {...todo}/>
            }            
        },
        {
            params: t.Object({
                id: t.Numeric(),
            })
        })
    .delete("/todos/:id", 
        ({params}) => {
            const todo = db.find(todo => todo.id === params.id);
            if (todo) {
                db.splice(db.findIndex(todo => todo.id === params.id), 1);
            }
        },
        {
            params: t.Object({
                id: t.Numeric()
            })
        })
    .post('/todos', 
        ({body}) => {
            if (body) {
                const newTodo = {
                    id: db.length,
                    content: body.content,
                    completed: false
                };
                db.push(newTodo);
                return <TodoItem {...newTodo} />
            }            
        },
        {
            body: t.Object({
                content: t.String()
            })
        })
    .listen(3000);

console.log(`🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`);

