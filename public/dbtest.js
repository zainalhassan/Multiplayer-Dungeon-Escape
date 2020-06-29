var mysql = require("mysql");

var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: ''
});

connection.connect();

// try to create the database
connection.query("CREATE DATABASE IF NOT EXISTS webGame;", function(error, result, fields) {
    if (error) {
        console.log("Error creating database: " + error.code);
    }
    else if (result) {
        console.log("Database created successfully.");
    }
});

connection.query("USE webGame;", function(error, result, fields) {
    if (error) {
        console.log("Error setting database: " + error.code);
    }
    else if (result) {
        console.log("Database successfully set.");
    }
});

// drop the table before we try to create it anew
connection.query("DROP TABLE IF EXISTS players", function(error, result, fields) {
    if (error) {
        // for a deployment app, we'd be more likely to use error.stack
        // which gives us a full stack trace
        console.log("Problem dropping players table: " + error.code);
    }
    else if (result) {
        console.log("Players table dropped successfully.");
    }
});

// construct our query in a variable, to keep our code cleaner below
// this will create a table with five columns - username, email, score, numberofplays and playerid (PK):
var createPlayerTableQuery = "CREATE TABLE players(";
createPlayerTableQuery += "playerID 		    VARCHAR (20)	,";
createPlayerTableQuery += "character 			VARCHAR (20)	,";
createPlayerTableQuery += "playerCount 			INT             ,";
createPlayerTableQuery += "PRIMARY KEY (playerID)"
createPlayerTableQuery += ");";

connection.query(createPlayerTableQuery, function(error, result, fields){

    if (error) {
        console.log("Error creating players table: " + error.code);
    }
    else if (result) {
        console.log("Players table created successfully.");
    }

});

for(let id in players)
{
    connection.query("INSERT INTO players SET ?", players, function (error, result, fields) {

        if (error) {
            console.log(error);
        }

        if (result)
        {
            // uncomment the below for a success message - there will be a lot!
            console.log("Row inserted successfully.");
        }

    });
}