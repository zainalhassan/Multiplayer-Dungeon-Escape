//setting up of the server with express, and mysql
const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const mysql = require("mysql");

//connection setup
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: ''
});

//establish connection
connection.connect();

// try to create the database
connection.query("CREATE DATABASE IF NOT EXISTS webGame;", function(error, result, fields) {
    if (error)
    {
        console.log("Error creating database: " + error.code);
    }
    else if (result)
    {
        console.log("Database created successfully.");
    }
});

//use the database
connection.query("USE webGame;", function(error, result, fields) {
    if (error)
    {
        console.log("Error setting database: " + error.code);
    }
    else if (result)
    {
        console.log("Database successfully set.");
    }
});

// drop the table players before we try to create it
    connection.query("DROP TABLE IF EXISTS Players", function(error, result, fields) {
    if (error)
    {
        console.log("Problem dropping Players table: " + error.code);
    }
    else if (result) {
        console.log("Players table dropped successfully.");
    }
});

//sql syntax of player table creation
let createPlayerTableQuery = "CREATE TABLE players(";
createPlayerTableQuery += "ID 		VARCHAR (30)	,";
createPlayerTableQuery += "playerCharacter 			INT	,";
createPlayerTableQuery += "playerCount 			INT				,";
createPlayerTableQuery += "x 	INT				,";
createPlayerTableQuery += "y 		INT				,";
createPlayerTableQuery += "timeElapsed 		INT				,";
createPlayerTableQuery += "goingUp 		VARCHAR (10)				,";
createPlayerTableQuery += "goingLeft 		VARCHAR (10)				,";
createPlayerTableQuery += "goingRight 		VARCHAR (10)				,";
createPlayerTableQuery += "PRIMARY KEY (ID)";
createPlayerTableQuery += ")";

//attempt to create the players table
connection.query(createPlayerTableQuery, function(error, result, fields){

    if (error) {
        console.log("Error creating players table: " + error.code);
    }
    else if (result) {
        console.log("Players table created successfully.");
    }

});

//drop Score table
connection.query("DROP TABLE IF EXISTS Score", function (error, result, fields) {
    if (error) 	{
        // for a deployment app, we'd be more likely to use error.stack
        // which gives us a full stack trace
        console.log("Problem dropping Score table: " + error.code);
    }
    else if (result)	{
        console.log("Score table dropped successfully.");
    }
});

//sql syntax of Score table creation
let createScoreTableQuery = "CREATE TABLE Score(";
createScoreTableQuery += "ID 		VARCHAR (30)	,";
createScoreTableQuery += "Level 			INT	,";
createScoreTableQuery += "Time 			INT				,";
createScoreTableQuery += "PRIMARY KEY (ID, Level)"
createScoreTableQuery += ")";

//attempt to create the Score table
connection.query(createScoreTableQuery, function(error, result, fields){

    if (error) {
        console.log("Error creating Score table: " + error.code);
    }
    else if (result) {
        console.log("Score table created successfully.");
    }
});

//drop table before trying to create new table
connection.query("DROP TABLE IF EXISTS DungeonInfo", function (error, result, fields) {
    if (error) 	{
        // for a deployment app, we'd be more likely to use error.stack
        // which gives us a full stack trace
        console.log("Problem dropping DungeonInfo table: " + error.code);
    }
    else if (result)	{
        console.log("DungeonInfo table dropped successfully.");
    }
});

//sql syntax of DungeonInfo table creation
let createDungeonInfoTableQuery = "CREATE TABLE DungeonInfo(";
createDungeonInfoTableQuery += "dungeonID 		INT NOT NULL AUTO_INCREMENT,";
createDungeonInfoTableQuery += "dungeon_width 			INT	,";
createDungeonInfoTableQuery += "dungeon_height 			INT				,";
createDungeonInfoTableQuery += "number_of_rooms 			INT				,";
createDungeonInfoTableQuery += "average_room_size 			INT				,";
createDungeonInfoTableQuery += "PRIMARY KEY (dungeonID)"
createDungeonInfoTableQuery += ")";

//attempt to create the DungeonInfo table
connection.query(createDungeonInfoTableQuery, function(error, result, fields){

    if (error) {
        console.log("Error creating DungeonInfo table: " + error.code);
    }
    else if (result) {
        console.log("DungeonInfo table created successfully.");
    }
});



//use the dungeongenerator module to generate random dungeons
const DungeonGenerator = require("dungeongenerator");

//serve static pages from the public directory
app.use(express.static("public"));

//Empty object that will contain information about the dungeon
let dungeon = {};
//Empty object that will contain information about the starting point of the dungeon
let dungeonStart = {};
//Empty object that will contain information about the end point of the dungeon
let dungeonEnd = {};

//details about the dungeons
let dungeonOptions = {
    dungeon_width: 20,
    dungeon_height: 20,
    number_of_rooms: 7,
    average_room_size: 8
};

//function used for query insertion
function insertDungeonInfo()
{
    connection.query("INSERT INTO DungeonInfo SET ?", dungeonOptions, function (error, result, fields) {

        if (error) {
            console.log(error.stack);
        }

        if (result)
        {
            // uncomment the below for a success message - there will be a lot!
            console.log("Row inserted successfully.");
        }
    });
}

//object of players that contains all players and their info
let players = {};
//another object which will be used to for query insertion
let dbPlayers = {};
//variable containing number of players
let playerCount = 0;
//variable containing level;
let level = 1;
//difference between start time and end time
let timeTaken = 0;

//all information of dungeon returned in this function
function getDungeonData() {
    return {
        dungeon,
        startingPoint: dungeonStart,
        endingPoint: dungeonEnd
    };
}

//used for incrementing time variable by 1.
setInterval(function () {
    timeTaken++;
}, 1000);


io.on("connection", function (socket)
{
    //once a player has connected, dungeon info is stored in the database
    insertDungeonInfo();
    //add one to the player count
    playerCount ++;
    console.log("Number of Players: " + playerCount);

    //assign them a random character out of 4 possible options
    let randomPlayer = Math.floor(Math.random() * 4);

    // Print an acknowledge to the server's console to confirm a player has connected
    console.log("A player has connected - sending dungeon data...", socket.id);

    //sends information to the client which is used to display the total number of players
    io.emit("totalPlayers", playerCount);

    //array of players object with each player assigned a socket id to uniquely identify them
    players[socket.id] = {
        ID: socket.id,
        playerCharacter: randomPlayer,
        playerCount: playerCount,
        x: dungeonStart.x,
        y: dungeonStart.y,
        timeElapsed: timeTaken,
        goingUp: false,
        goingLeft: false,
        goingRight: false
    };

    //insert all players into the database, players table
    for (let id in players)
    {
        connection.query("INSERT INTO players SET ?", players[id], function (error, result, fields) {

            if (error) {
                console.log(error.stack);
            }

            if (result)
            {
                // uncomment the below for a success message - there will be a lot!
                console.log("Row inserted successfully.");
            }
        });
    }

    //send information to the clients about the dungeon
    socket.emit("dungeon data", getDungeonData());

    //sends the original level when player joins.
    socket.emit("level", level);

    //listens for when a client tries to move using mouse,keyboard or touch contols
    socket.on("positions", function (movement)
    {
        if (movement.up)
        {
            //checks for collision if the player is not out of bounds
            if (players[socket.id].y - 1 >= 0 && dungeon.maze[players[socket.id].y - 1][players[socket.id].x] > 0)
            {
                //displays up image and moves particular client up
                players[socket.id].goingUp = true;
                players[socket.id].goingLeft = false;
                players[socket.id].goingRight = false;
                players[socket.id].y--;
            }
        }
        else if (movement.down)
        {
            //checks for collision if the player is not out of bounds
            if (players[socket.id].y + 1 >= 0 && dungeon.maze[players[socket.id].y + 1][players[socket.id].x] > 0)
            {
                //displays down image and moves particular client down
                players[socket.id].goingUp = false;
                players[socket.id].goingLeft = false;
                players[socket.id].goingRight = false;
                players[socket.id].y++;
            }
        }
        else if (movement.left)
        {
            //checks for collision if the player is not out of bounds
            if (players[socket.id].x - 1 >= 0 && dungeon.maze[players[socket.id].y][players[socket.id].x - 1] > 0)
            {
                //displays left image and moves particular client left
                players[socket.id].goingUp = false;
                players[socket.id].goingLeft = true;
                players[socket.id].goingRight = false;
                players[socket.id].x--;
            }
        }
        else if (movement.right)
        {
            //checks for collision if the player is not out of bounds
            if (players[socket.id].x + 1 >= 0 && dungeon.maze[players[socket.id].y][players[socket.id].x + 1] > 0)
            {
                //displays right image and moves particular client right
                players[socket.id].goingUp = false;
                players[socket.id].goingLeft = false;
                players[socket.id].goingRight = true;
                players[socket.id].x ++;
            }
        }
        else
        {
            //displays forward image
            players[socket.id].goingUp = false;
            players[socket.id].goingLeft = false;
            players[socket.id].goingRight = false;
        }

        //checks to see if a player has reached the end of the maze
        if(players[socket.id].x === dungeonEnd.x && players[socket.id].y === dungeonEnd.y)
        {
            //create an object that contains information about the level which will add to the database, Score table
            dbPlayers[socket.id] =
            {
                ID: players[socket.id].ID,
                Level: level,
                Time: timeTaken
            };

            //Score table query insertion
            connection.query("INSERT INTO Score SET ?", dbPlayers[socket.id], function (error, result, fields) {

                if (error) {
                    console.log(error.stack);
                }

                if (result)
                {
                    // uncomment the below for a success message - there will be a lot!
                    console.log("Row inserted successfully.");
                }
            });


            console.log("Time taken to complete level " +  level + "," + timeTaken);
            //increment level
            level++;
            //semd updated value of level to clients
            io.emit("level", level);

            //add a room to the level each time players complete a level
            dungeonOptions.number_of_rooms++;

            //generates a new connection
            generateDungeon();
            //insert new dungeon info into database dungeon info table
            insertDungeonInfo();

            //reset time counter
            timeTaken = 0;

            for(let id in players)
            {
                //reset all players back to starting position
                players[id].x = dungeonStart.x;
                players[id].y = dungeonStart.y;


                //make all players face downwards.
                players[id].goingUp = false;
                players[id].goingLeft = false;
                players[id].goingRight = false;
            }
            //send the new dungeon to all clients connected to the server.
            io.emit("dungeon data", getDungeonData());
        }
    });
    //resets gameTime, variable used to ensure time is sent continuously instead of every second
    let gameTime = 0;
    setInterval(function()
    {
        //send the state of the players continuously
        io.emit("state", players);
        //update the time elapsed
        gameTime = timeTaken;
        //send time to all clients
        io.emit("timeMessage", gameTime);
    }, 1000 / 60);

    //when a client disconnects
    socket.on("disconnect", function()
    {
        //only reset game stats if 1 player
        if (playerCount === 1)
        {
            timeTaken = 0;
            level = 1;
        }
        for(let id in players)
        {
            //ensures player count doesnt go below 0
            if(players[id].playerCount !== 1)
            {
                players[id].playerCount--;
            }
        }
        //remove player once disconnected
        playerCount--;
        io.emit("totalPlayers", playerCount);
        delete players[socket.id];
        console.log("Number of Players: " + playerCount);
    });
});


//finds center of rooms
function getCenterPositionOfSpecificRoom(roomIndex) {
    let position = {
        x: 0,
        y: 0
    };

    for (let i = 0; i < dungeon.rooms.length; i++) {
        let room = dungeon.rooms[i];
        if (room.id === roomIndex) {
            position.x = room.cx;
            position.y = room.cy;
            return position;
        }
    }
    return position;
}

//new dungeon is generated
function generateDungeon() {
    dungeon = new DungeonGenerator(
        dungeonOptions.dungeon_height,
        dungeonOptions.dungeon_width,
        dungeonOptions.number_of_rooms,
        dungeonOptions.average_room_size
    );
    console.log(dungeon);
    dungeonStart = getCenterPositionOfSpecificRoom(2);
    dungeonEnd = getCenterPositionOfSpecificRoom(dungeon._lastRoomId - 1);
}

//starts the server
server.listen(8081, function () {
    console.log("Dungeon server has started - connect to http://localhost:8081");
    generateDungeon();
    console.log("Initial dungeon generated!");
});