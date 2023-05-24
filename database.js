const mongoose = require("mongoose");

class Databse {

    constructor() {
        this.connect();
    }

    connect() {
        mongoose.connect("mongodb+srv://yelaman0111:fnX0eXaFOahx9qEb@twittercloneclaster.aww60qg.mongodb.net/?retryWrites=true&w=majority")
            .then(() => {
                console.log("Database connection successfull");
            })
            .catch((err) => {
                console.log("Database connection error" + err);
            })
    }
}

module.exports = new Databse();