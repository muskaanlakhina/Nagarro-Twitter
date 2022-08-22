const mongoose = require("mongoose");
//mongoose.set('useNewUrlParser',true);
//mongoose.set("useUnifiedTopology", true);
//mongoose.set("useFindAndModify", false);

class Database{

    constructor()
    {
        this.connect();
    }

     connect(){
        mongoose.connect("mongodb+srv://muskaanlakhina:Muskaan@cluster0.x8yffad.mongodb.net/?retryWrites=true&w=majority")
        .then( () =>{
            console.log("database connection successfull ");
        })  //in case of success
        .catch( (err) =>{
            console.log("database connection error "+ err);
        })  //else
    }
}

module.exports = new Database();