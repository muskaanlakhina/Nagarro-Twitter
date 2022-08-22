const mongoose = require("mongoose")

class Database {

    // Making the constructor call the connect function.
    constructor(){
        this.connect()
    }

    connect() {
        mongoose.connect("mongodb+srv://muskaanlakhina:Muskaan@cluster0.x8yffad.mongodb.net/?retryWrites=true&w=majority")
        .then(() => {
            console.log("Database connection successful")
        })
        .catch((err) => {
            console.log(`Database connection error ${err}`)
        })
    }
}

module.exports = new Database()