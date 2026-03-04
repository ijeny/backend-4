//import express
import express from "express";

//init express
const app = express();

//basic route
app.get('/', (req, res) => {
    res.send('kasih aku sikrit');
});

//listen on port
app.listen(3000, () => console.log('server running at http://localhost:3000'));