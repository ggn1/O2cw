// Requiring the necessary modules
const express = require('express');
const socket = require('socket.io');

// Using the dbConnection variable to refer to functions in the connectDB module.
const dbConnection = require('./serverSide/connectDB'); 

// Creating an instance of the express module
const app = express();
// Specifying that the port number is 3000
var portNumber = 3000;  

// Tells express to serve files from the clientSide and game directories
app.use(express.static('./clientSide'));
app.use(express.static('./game'));

// Creates the server and listens on port 3000 (specified in portNumber variable above)
const server = app.listen(portNumber, function(){
    console.log("Listening to port 3000")
});

// TO LOAD LOGIN PAGE ON BROWSER WHEN USER JUST ENTERS IP ADDRESS WITH PORT NUMBER 3000 (IPV4:3000)

app.get('/', function(req, res){
    res.sendFile(__dirname + 'clientSide/index.html');
});

// TO LOAD GAME PAGE ON BROWSER WHEN GET REQUEST FOR /GAME DIRECTORY IS MADE
app.get('/game', function(req, res){
    res.sendFile(__dirname + "/game/html/indexGame.html");
});

// TO REDIRECT TO GAME PAGE ON SUBMISSION OF FORM
app.post('/game/submit', function(req,res){
    res.redirect('/game');
});

// CONNECTING TO DB
dbConnection.connectToDB();

// CONNECTING USING SOCKET

// Creating a socket and attaching it to the server.
var io = socket(server);

// Socket Event Listeners

// All sockets listen for 'connection' event
io.sockets.on('connection', function(socket){
    console.log("Made socket connection.", socket.id);

    /* Listen for the 'addPlayerNameToDB' socket event and call the insertNameIntoTable() function with the username and a 
       string called recent */
    socket.on('addPlayerNameToDB', function(usernameObj){
        // storing the username taken from the usernameObj into a variable called data
        data = usernameObj.name
        data = data.replace(";","");    // replace ';' with an empty string ('')
        data = data.replace(" ","");    // replace spaces(" ") with an empty string
        
        // The then() function specifies that the insertNameIntoTable function returns a promise value (data).
        dbConnection.insertNameIntoTable(data, "recent").then(function(data){ 
            console.log(data);
        });
    });

    /* Listen for the 'addIdToPlayer' socket event and insert the socket id into the table. Once that's done, get the 
       player count from the DB and emit an 'updatePlayerCount' socket event that sends the count of the players */

    socket.on('addIdToPlayer', function(){
        dbConnection.insertIdIntoTable(socket.id).then(function(data){
            console.log(data);
            dbConnection.getPlayerCount().then(function(data){
                io.sockets.emit('updatePlayerCount', {count: data});
            })
        });
    });

    /* Listen for the 'getCountAgain' socket event and get the player count from the DB. Emit an 'updatePlayerCount' 
    socket event that sends the count of the players */

    socket.on('getCountAgain', function(){
        dbConnection.getPlayerCount().then(function(data){
            io.sockets.emit('updatePlayerCount', {count: data});
        })
    });

    /* Listen for the 'isDead' socket event, get the Loser from the DB using the socket id passed as parameter to the
       'isDead' socket event handler function. After getting the loser, emit a socket event 'displayLoser' that sends
       a loser string returned from the DB. Delete the playerthat has the socketID as the one specified as paramter 
       from the DB and get the count of the remaining number of players. 
       
       If the number of remaining players is 1, get the username of the winner from the DB and emit a socket function 
       called 'declareWinner' that passes the winner string obtained from the DB function. Finally, clear the database. 

       Otherwise, emit an 'updatePlayerCount' socket event that sends the count of the players */
       
    socket.on('isDead', function(socketID){
        dbConnection.getLoser(socketID.socketId).then(function(loserString){
            io.sockets.emit('displayLoser', {loser: loserString});
            dbConnection.deleteFromTable(socketID.socketId).then(function(deletedString){
                console.log(deletedString);
                dbConnection.getPlayerCount().then(function(numOfPlayers){
                    if(numOfPlayers == 1){
                        dbConnection.getWinner().then(function(winnerString){
                            io.sockets.emit('declareWinner', {message: winnerString});

                            dbConnection.clearDB().then(function(dbClearedString){
                                console.log(dbClearedString);
                            });
                        });
                    }
                    else{
                        io.sockets.emit('updatePlayerCount', {count: numOfPlayers});
                    }
                })
            });
        });
    });
});
