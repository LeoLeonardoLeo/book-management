const express = require("express") //uses express for servers
require('dotenv').config() //allows use of .env file
const mongoose = require("mongoose")
const bookRoutes = require("./routes/bookRoutes")
const userRoutes = require("./routes/userRoutes")

//variables for app and port 
const app = express()
const PORT = process.env.PORT

//middleware, parses into json
app.use(express.json()) 

app.get('/', (req, res) => {
    return res.status(234).send("Welcome to the book store made using the MERN stack")
})

app.use("/api/books", bookRoutes)
app.use("/api/users", userRoutes)

mongoose.connect(process.env.MONGO_DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("mongodb connected"))
.catch((err) => console.log("mongodb connection error: ", err))


app.listen(PORT, () => {
    console.log(`Server ready at http://localhost:${PORT}`)
})