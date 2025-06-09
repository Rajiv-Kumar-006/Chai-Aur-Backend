const DBconnect = require("./db/dbConnection")
require("dotenv").config()


DBconnect()
    .then(() => {
        app.listen(process.env.PORT || 5000, () => {
            console.log(`✅ SERVER IS RUNNING ON PORT ${process.env.PORT}`)
        })
    })
    .catch((err) => {
        console.log("SERVER RUNNING FAILED ...!", err)
    })
