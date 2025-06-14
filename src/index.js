const express = require("express")
const app = express()
const cors = require("cors")
const cookieParser = require("cookie-parser")
const DBconnect = require("./db/dbConnection")
require("dotenv").config()

// Connect to DB
DBconnect()

// Middlewares
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))
app.use(cookieParser())

// Test Route
app.get("/", (req, res) => {
    res.send("<h1>HELLO, HERE THE API'S ....</h1>")
})

// Import routes
const userRoute = require("./routes/user.routes")

// Use routes 
app.use("/api/v1/user", userRoute)

// Start server
app.listen(process.env.PORT || 5000, () => {
    console.log(`✅ SERVER IS RUNNING ON PORT ${process.env.PORT}`)
})
