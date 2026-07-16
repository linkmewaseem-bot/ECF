import { Application, Facade, HttpServiceProvider, Route } from "@ecf/http";

const app = new Application();
app.register(HttpServiceProvider);
app.boot();
Facade.setApplication(app);

const users = [
    { id: 1, name: 'John', email: 'john@gmail.com' },
    { id: 2, name: 'Jane', email: 'jane@gmail.com' },
    { id: 3, name: 'Bob', email: 'bob@gmail.com' },
    { id: 4, name: 'Alice', email: 'alice@gmail.com' },
    { id: 5, name: 'Mike', email: 'mike@gmail.com' },
];

// Static routes first
Route.get("/", (req, res) => {
    return res.html(`
        <h1>Welcome to the ECF world!</h1>
        <p>Let's explore the features and capabilities of ECF.</p>
    `);
});

Route.get('/about', (req, res) => {
    res.text('Hi i am ECF i am new use me');
});

Route.get('/users/new', (req, res) => {
    return res.html(`
    <h1>New User</h1>
    <form action="/user" method="post">
        <label for="name">Name:</label>
        <input type="text" id="name" name="name">
        <br>
        <label for="email">Email:</label>
        <input type="email" id="email" name="email">
        <br>
        <button type="submit">Create</button>
    </form>
    `);
});

Route.get('/users', (req, res) => {
    return res.html(`
    <h1>Users</h1>
    <ul>
    ${users.map((user) => {
        return `
            <li>
                <a href="/users/${user.id}"><strong>${user.name}</strong></a>
                <p>${user.email}</p>
            </li>
        `
    }).join('')}
    </ul>
    <p><a href="/users/new">Add New User</a></p>
    `);
});

// Route for finding by name (case-insensitive) - MUST come before /users/{id}
Route.get('/users/name/{name}', (req, res) => {
    const searchName = req.params.name;
    console.log('Searching for user by name:', searchName);
    
    // Case-insensitive search
    const user = users.find((user) => 
        user.name.toLowerCase() === searchName.toLowerCase()
    );
    
    if (!user) {
        // Show suggestions
        const suggestions = users.filter((user) => 
            user.name.toLowerCase().includes(searchName.toLowerCase())
        );
        
        let suggestionHtml = '';
        if (suggestions.length > 0) {
            suggestionHtml = `
                <h2>Did you mean?</h2>
                <ul>
                    ${suggestions.map(u => 
                        `<li><a href="/users/name/${u.name}">${u.name}</a></li>`
                    ).join('')}
                </ul>
            `;
        }
        
        return res.html(`
        <h1>User not found</h1>
        <p>No user found with name: "${searchName}"</p>
        ${suggestionHtml}
        <p><a href="/users">View all users</a></p>
        `);
    }
    
    return res.html(`
    <h1>User Profile</h1>
    <p><strong>Name:</strong> ${user.name}</p>
    <p><strong>Email:</strong> ${user.email}</p>
    <p><a href="/users">Back to all users</a></p>
    `);
});

// Route for finding by ID - must come AFTER specific routes
Route.get('/users/{id}', (req, res) => {
    const id = parseInt(req.params.id);
    console.log('Searching for user by ID:', id);
    
    const user = users.find((user) => user.id === id);
    if (!user) {
        return res.html(`
        <h1>User not found</h1>
        <p>No user found with ID: ${id}</p>
        <p><a href="/users">View all users</a></p>
        `);
    }
    return res.html(`
    <h1>User Profile</h1>
    <p><strong>Name:</strong> ${user.name}</p>
    <p><strong>Email:</strong> ${user.email}</p>
    <p><a href="/users">Back to all users</a></p>
    `);
});

Route.post('/user', (req, res) => {
    return res.json(req.body);
});

app.listen(3000, () => {
    console.log("ECF running at http://localhost:3000");
});