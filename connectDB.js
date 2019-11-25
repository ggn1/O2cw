// Variables to store the required credentials when connecting to the DB
var myHost = "localHost";
var myUser = "root";
var myPassword = "";
var myDatabase = "players";

// Load the mysql module into a variable called db.
var db = require('mysql');

// Create a connection to the my-sql DB with the above credentials.
var con = db.createConnection(
     {
        host:myHost,
        user:myUser,
        password:myPassword,
        database:myDatabase
    }
);

// Connect to the DB and output the status to the console.
function connectToDB(){
    con.connect(function(err){
        if(!err) {
            console.log("Connected to db " + myDatabase + ".");    
        } else {
            console.log("Error connecting database.");    
        }
    });
}

/* A function to insert the recent string, player name and alive status into the table. The function returns a string
   containing the inserted username.
*/
function insertNameIntoTable(nameToAdd, recent){
    return new Promise(function(resolve, reject){
        var myQuery = "INSERT INTO `players_table`(`recent`, `username`, `isAlive`) "
                    + "VALUES ('" + recent +"'," + "'" + nameToAdd + "',1)";
        con.query(myQuery);
       resolve("inserted " + nameToAdd + " into table.");
    });
}

/* A function to insert the socket id into the table where there's a value for the recent string. The recent string is 
   changed to ' ' after adding the socket id. The function returns a string containing the inserted socket id.
*/
function insertIdIntoTable(id){
    return new Promise(function(resolve, reject){
        var myQuery = "UPDATE `players_table` SET `recent` = '',"
                        + "`socketId`= '" + id + "' WHERE `recent` = 'recent'";
        con.query(myQuery);
        resolve("updated socketId to " + id + " in table.");
    })
}

/* A function to delete the row(s) from the table where the socket id specified as parameter matches the socket ID in
   the table. The function returns a string containing the deleted socket id.
*/
function deleteFromTable(socketID){
    return new Promise(function(resolve, reject){
        var myQuery = "DELETE FROM `players_table` WHERE socketId = '" 
                    + socketID + "'";
        con.query(myQuery);
        resolve("deleted " + socketID + " from table.");
    });
}

// A function to get the number of players in the table.
function getPlayerCount(){
    return new Promise(function(resolve, reject){
        var myQuery = "SELECT COUNT(username) AS playersCount FROM players_table";
        var count = con.query(myQuery, function(err, result) {
            res = result[0].playersCount;
            resolve(res);
        });
    })
}
/* A function to select the username of the last player alive from the table as the winner and return a string containing 
   the player's username. */
function getWinner(){
    return new Promise(function(resolve, reject){
        var myQuery = "SELECT username AS winner FROM `players_table`";
        var count = con.query(myQuery, function(err, result) {
            res = result[0].winner;
            resolve(res.toString() + " is the sole surviver." 
                        + "<br>Congratulations " + res.toString()
                        + "!<br>You are the winner!");
        });
    })
}

/* A function to select the username of the player who recently died from the table as a loser and return a string 
   containing the username */
function getLoser(socketId){
    return new Promise(function(resolve, reject){
        var myQuery = "SELECT username AS loser FROM `players_table` WHERE socketId = '"
                        + socketId + "'";
        var count = con.query(myQuery, function(err, result) {
            if(!(result[0] == undefined)){
            res = result[0].loser;
            resolve(res.toString() + " just died.")
            }
        });
    })
}

// A function to clear the database of all rows
function clearDB(){
    return new Promise(function(resolve, reject){
        var myQuery = "DELETE FROM `players_table`";
        con.query(myQuery, function(err, result){
            if(err){
                resolve("Could not clear db.");
            }
            else{
                resolve("Cleared db.");
            }
        });
    });
}

// Exporting all the above functions, so that other modules(files) that require this module(file) can use these functions.

module.exports.connectToDB = connectToDB;
module.exports.insertNameIntoTable = insertNameIntoTable;
module.exports.insertIdIntoTable = insertIdIntoTable;
module.exports.deleteFromTable = deleteFromTable;
module.exports.getPlayerCount = getPlayerCount;
module.exports.getWinner = getWinner;
module.exports.getLoser = getLoser;
module.exports.clearDB = clearDB;
