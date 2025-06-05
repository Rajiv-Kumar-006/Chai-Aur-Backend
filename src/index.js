const express = require("express")
const DBconnect = require("./db/dbConnection")
require("dotenv").config()


const app = express()
DBconnect()


const PORT = process.env.PORT || 5000
app.listen(PORT, ()=>{
    console.log(`APP IS LISTENING ON PORT ${PORT}`)
})