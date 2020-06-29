//Empty object that will contain information about the dungeon
let dungeon = {};
//Empty object that will contain information about the starting point of the dungeon
let dungeonStart = {};
//Empty object that will contain information about the end point of the dungeon
let dungeonEnd = {};

//initialised as an empty player object till data about the client is sent from the server.
let players = {};

//loads the dungeon spritesheet
const tilesImage = new Image();
tilesImage.src = "dungeon_tiles.png";

const playerSpriteSheet = new Image();
playerSpriteSheet.src = "playerSprite3.png";

const left1 = new Image();
left1.src = "left.png"; //left animation for playerCharacter 1

const left2 = new Image();
left2.src = "left2.png";  //left animation for playerCharacter 2

const left3 = new Image();
left3.src = "left3.png";  //left animation for playerCharacter 3

const left4 = new Image();
left4.src = "left4.png";  //left animation for playerCharacter 4

//Object that is used to decide which way a certain client is trying to go.
//All set to false as when the client connects, they have not yet chosen which way they want to go.
let movement = {
    up: false,
    down: false,
    left: false,
    right: false
};


 //Establish a connection to our server
const socket = io.connect("http://localhost:8081");

//if you would like to test my game on another device such as a mobile phone, use the code below and switch the ip address.
// const socket = io.connect("http://10.182.54.147:8081");

//listens to dungeon data being sent from the server, used to draw the dungeon, and its starting and end point
socket.on("dungeon data", function (data) {
    dungeon = data.dungeon;
    dungeonStart = data.startingPoint;
    dungeonEnd = data.endingPoint;
});

//listens for state which is constantly being sent from the server, saves the players object being sent from the server to a players object saved in the client.
socket.on("state", function (playerStatus) {
    players = playerStatus;
});

//listens for level which is sent from the server, once listened to, it is then drawn onto html page by placing the value into an empty p element.
socket.on("level", function (data)
{
    document.getElementById("level").innerHTML = "Level: " + data;
});

//listens for timeMessage which is sent from the server, once listened to, the value sent over is formatted and then displayed into an empty p element.
socket.on("timeMessage", function (timee)
{
    let minutes = Math.floor(timee / 60);
    let seconds = timee - (minutes * 60);
    let Format = "0";

    if (seconds > -1 && seconds < 10)
    {
        //displays a zero before
        seconds = Format + seconds;
    }
    if (minutes > -1 && minutes < 10)
    {
        minutes = Format + minutes;
    }
    document.getElementById("time").innerHTML = "Time: "+ minutes + ":" + seconds;
});

//function is used to decide which tiles are needed to be drawn.
function identifySpaceType(x, y) {

    let returnObject = {
        spaceType: "",
        tilesetX: 0,
        tilesetY: 0,
        tilesizeX: 16,
        tilesizeY: 16
    };

    //Booleans which also decide whether to draw a wall, corridor, etc.
    let canMoveUp = false;
    let canMoveLeft = false;
    let canMoveRight = false;
    let canMoveDown = false;

    // check for out of bounds (i.e. this move would move the player off the edge
    if (x - 1 >= 0 && dungeon.maze[y][x - 1] > 0) {
        canMoveLeft = true;
    }
    if (x + 1 < dungeon.w && dungeon.maze[y][x + 1] > 0) {
        canMoveRight = true;
    }
    if (y - 1 >= 0 && dungeon.maze[y - 1][x] > 0) {
        canMoveUp = true;
    }
    if (y + 1 < dungeon.h && dungeon.maze[y + 1][x] > 0) {
        canMoveDown = true;
    }

    if (canMoveUp && canMoveRight && canMoveDown && canMoveLeft) {
        returnObject.spaceType = "all_exits";
        returnObject.tilesetX = 16;
        returnObject.tilesetY = 16;
    }
    else if (canMoveUp && canMoveRight && canMoveDown) {
        returnObject.spaceType = "left_wall";
        returnObject.tilesetX = 0;
        returnObject.tilesetY = 16;
    }
    else if (canMoveRight && canMoveDown && canMoveLeft) {
        returnObject.spaceType = "up_wall";
        returnObject.tilesetX = 16;
        returnObject.tilesetY = 0;
    }
    else if (canMoveDown && canMoveLeft && canMoveUp) {
        returnObject.spaceType = "right_wall";
        returnObject.tilesetX = 32;
        returnObject.tilesetY = 16;
    }
    else if (canMoveLeft && canMoveUp && canMoveRight) {
        returnObject.spaceType = "down_wall";
        returnObject.tilesetX = 16;
        returnObject.tilesetY = 32;
    }
    else if (canMoveUp && canMoveDown) {
        returnObject.spaceType = "vertical_corridor";
        returnObject.tilesetX = 144;
        returnObject.tilesetY = 16;
    }
    else if (canMoveLeft && canMoveRight) {
        returnObject.spaceType = "horizontal_corridor";
        returnObject.tilesetX = 112;
        returnObject.tilesetY = 32;
    }
    else if (canMoveUp && canMoveLeft) {
        returnObject.spaceType = "bottom_right";
        returnObject.tilesetX = 32;
        returnObject.tilesetY = 32;
    }
    else if (canMoveUp && canMoveRight) {
        returnObject.spaceType = "bottom_left";
        returnObject.tilesetX = 0;
        returnObject.tilesetY = 32;
    }
    else if (canMoveDown && canMoveLeft) {
        returnObject.spaceType = "top_right";
        returnObject.tilesetX = 32;
        returnObject.tilesetY = 0;
    }
    else if (canMoveDown && canMoveRight) {
        returnObject.spaceType = "top_left";
        returnObject.tilesetX = 0;
        returnObject.tilesetY = 0;
    }
    return returnObject;
}

//function called when the player tries to move up using the mouse, keyboard or with touch events
function moveUp()
{
    movement.up = true;
    socket.emit("positions", movement);
    movement.up = false; //set it back to false after sending the data to server

    //listen if level has changed
    socket.on("level", function (data)
    {
        document.getElementById("level").innerHTML = "Level: " + data;
    });
}

//function called when the player tries to move down using the mouse, keyboard or with touch events
function moveDown()
{
    movement.down = true;
    socket.emit("positions", movement);
    movement.down = false; //set it back to false after sending the data to server

    //listen if level has changed
    socket.on("level", function (data)
    {
        document.getElementById("level").innerHTML = "Level: " + data;
    });
}

//function called when the player tries to move left using the mouse, keyboard or with touch events
function moveLeft()
{
    movement.left = true;
    socket.emit("positions", movement);
    movement.left = false; //set it back to false after sending the data to server

    //listen if level has changed
    socket.on("level", function (data)
    {
        document.getElementById("level").innerHTML = "Level: " + data;
    });
}

//function called when the player tries to move right using the mouse, keyboard or with touch events
function moveRight()
{
    movement.right = true;
    socket.emit("positions", movement);
    movement.right = false; //set it back to false after sending the data to server

    //listen if level has changed
    socket.on("level", function (data)
    {
        document.getElementById("level").innerHTML = "Level: " + data;
    });

}

$(document).ready(function () {

    startAnimating(60);

    //used for touch events through JQuery
    $(document).on(
        {
        swipeup: function ()
        {
            moveUp();
        },
        swipedown: function ()
        {
            moveDown();
        },

        swipeleft: function ()
        {
            moveLeft();
        },
        swiperight: function ()
        {
            moveRight();
        }
    });

    //onscreen buttons functionality
    $('#upButton').click(function()
    {
        moveUp();
    });

    $('#downButton').click(function()
    {
        moveDown();
    });

    $('#leftButton').click(function()
    {
        moveLeft();
    });

    $('#rightButton').click(function()
    {
        moveRight();
    });

    //keyboard functionality
    $("body").keydown(function(arrowKeys)
    {
        if (arrowKeys.which === 38)
        {
            moveUp();
        }
        else if (arrowKeys.which === 40)
        {
            moveDown();
        }
        if (arrowKeys.which === 37)
        {
            moveLeft();
        }
        if (arrowKeys.which === 39)
        {
            moveRight();
        }
    });
});

let fpsInterval;
let then;
let counter = 0; //variable used for animation

//starts animation
function startAnimating(fps) {
    fpsInterval = 1000 / fps;
    then = Date.now();
    animate();
}


//animation function which is drawing everything
function animate() {
    requestAnimationFrame(animate);

    //continuously listens whether anyone has left
    socket.on("totalPlayers", function (pCount)
    {
        document.getElementById("totalPlayers").innerHTML = "Total Players: " + pCount;
    });

    let now = Date.now();
    let elapsed = now - then;

    if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval);
        // Acquire both a canvas (using jQuery) and its associated context
        let canvas = $("canvas").get(0);
        let context = canvas.getContext("2d");

        // Calculate the width and height of each cell in our dungeon
        // by diving the pixel width/height of the canvas by the number of
        // cells in the dungeon
        let cellWidth = canvas.width / dungeon.w;
        let cellHeight = canvas.height / dungeon.h;

        // Clear the drawing area each animation cycle
        context.clearRect(0, 0, canvas.width, canvas.height);

        //drawing the dungeon and all walls and corridors.
        for (let x = 0; x < dungeon.w; x++) {
            for (let y = 0; y < dungeon.h; y++) {
                if (dungeon.maze[y][x] > 0) {
                    let tileInformation = identifySpaceType(x, y);
                    context.drawImage(tilesImage,
                        tileInformation.tilesetX,
                        tileInformation.tilesetY,
                        tileInformation.tilesizeX,
                        tileInformation.tilesizeY,
                        x * cellWidth,
                        y * cellHeight,
                        cellWidth,
                        cellHeight);
                } else {
                    //background colour of dungeon that isnt used by the rooms.
                    context.fillStyle = "#1e1e1e";
                    context.fillRect(
                        x * cellWidth,
                        y * cellHeight,
                        cellWidth,
                        cellHeight
                    );
                }
            }
        }

        //start point of the dungeon
        context.drawImage(tilesImage,
            16, 80, 16, 16,
            dungeonStart.x * cellWidth,
            dungeonStart.y * cellHeight,
            cellWidth,
            cellHeight);

        //end point of the dungeon
        context.drawImage(tilesImage,
            224, 80, 16, 16,
            dungeonEnd.x * cellWidth,
            dungeonEnd.y * cellHeight,
            cellWidth,
            cellHeight);

        //imageToDraw will be used when drawing the image to specify which image needs to be drawn.
        let imageToDraw = playerSpriteSheet;

        //cutting is set to default
        let spriteX = 0;
        let spriteY = 0;
        let spriteYRight = 0;
        let spriteYUp = 0;
        let spriteXLeft = 900;
        let spriteYLeft = 0;

        //used for animation purposes, value will determine which image is drawn from the sprite image
        counter++;

        for (let id in players)
        {
            //sets a new object that only holds information about that particular client.
            let player = players[id];

            //displays the players number so the client can distinguish between themselves and other clients
            document.getElementById("currentPlayer").innerHTML = "You are Player: " + player.playerCount;

            if(player.playerCharacter === 0)
            {
                spriteX = 125;  //x position to start clipping
                spriteY = 190;  //y position to start clipping
                spriteYRight = 100; //where to start clipping sprite for right animation images
                spriteYUp = 20; //where to start clipping for up animation images
                spriteYLeft = 20;
            }
            else if(player.playerCharacter === 1)
            {
                spriteX = 0;  //x position to start clipping
                spriteY = 440;  //y position to start clipping
                spriteYRight = 350; //where to start clipping sprite for right animation images
                spriteYUp = 270; //where to start clipping for up animation images
                spriteYLeft = 100;

            }
            else if(player.playerCharacter === 2)
            {
                spriteX = 550;  //x position to start clipping
                spriteY = 180;  //y position to start clipping

                spriteYRight = 100; //where to start clipping sprite for right animation images
                spriteYUp = 20; //where to start clipping for up animation images
                spriteYLeft = 180;
            }
            else if(player.playerCharacter === 3)
            {
                spriteX = 0;  //x position to start clipping
                spriteY = 945;  //y position to start clipping
                spriteYRight = 860; //where to start clipping sprite for right animation images
                spriteYUp = 780; //where to start clipping for up animation images
                spriteYLeft = 267;
            }


            if (player.goingUp)
            {
                spriteY = spriteYUp; //update value of spriteY to spriteYUp
            }
            else if (player.goingRight)
            {
                spriteY = spriteYRight;  //update value of spriteY to spriteYRight
            }
            else if (player.goingLeft)
            {
                spriteX = spriteXLeft;
                spriteY = spriteYLeft;
            }
            context.font= "13px Arial";
            context.fillStyle = "darkgoldenrod";
            //player title hovers above the player image
            context.fillText("Player: " + player.playerCount, (player.x - 0.7)  * cellWidth, (player.y - 0.2) * cellHeight);

            //4 animation images display one after another then loop through by setting counter to 0
            if (counter < 8)
            {
                context.drawImage(imageToDraw, spriteX, spriteY, 41, 60, player.x * cellWidth, player.y * cellHeight, 20, 25);
            }
            else if (counter < 16)
            {
                context.drawImage(imageToDraw, spriteX + 43, spriteY, 41, 60, player.x * cellWidth, player.y * cellHeight, 20, 25);
            }
            else if (counter < 24)
            {
                context.drawImage(imageToDraw, spriteX + 86, spriteY, 41, 60, player.x * cellWidth, player.y * cellHeight, 20, 25);
            }
            else if (counter < 32)
            {
                context.drawImage(imageToDraw, spriteX + 129, spriteY, 41, 60, player.x * cellWidth, player.y * cellHeight, 20, 25);
            }
            else
            {
                counter = 0;
            }
        }
    }
}