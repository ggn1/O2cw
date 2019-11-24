// MAKE SOCKET CONNECTION
var socket = io.connect();
socket.emit('addIdToPlayer');
// Listen for events.
socket.on('updatePlayerCount', function(data){
	document.getElementById('playerCountLabel').innerHTML = data.count
});

socket.on('declareWinner', function(data){
	document.getElementById('playersInfo').innerHTML = data.message
	gameWon = true
});

/* GUY & FRAME *****************************************************************************/
// Global Variables

/* OBJECT = % */
var objectRight = -3; // Incremented in moveObstacle()
var objectLeft = 100; // Decremented in moveObstacle()
var objectTop = 80; // Changed in randomHeight()
var objectBottom = 0; // Changed in randomHeight()

/* GUY = pixels */
var astroRight = 90;
var astroTop = 80;
var astroLeft = 3;	//stores the position of the astronaut from the left of the div in px (x-coord). 
var astroBottom = 0; //stores the position of the astronaut from the bottom of the div (y-coord) 

var astronaut = document.getElementById("astronaut");	//The astronaut 

var canSlide = true // variable to indicate if the astronaut can slide. Used to avoid spamming the down arrow key.

var isDead = false // variable to indicate if the astronaut is dead or not.
var gameWon = false // variable to indicate if there is a winner or not.

// Function Declarations

// Function to change the picture of the astronaut to him sliding and his dimensions. 

function slide()
{
	astronaut.src = "../images/slide.png";

	astroTop = astroTop + 3;
	astroBottom = astroBottom - 3;
	astronaut.style.top = astroTop + "%";
	astronaut.style.bottom = astroBottom + "%";

	astronaut.style.height = 15 + "%";
	astronaut.style.width = 10 + "%";
	canSlide = false;	// sliding is blocked till the astronaut finishes sliding.
}

// Function to reset the astronaut's picture and dimensions after sliding.

function reset() 
{
	astronaut.src = "../images/running.gif";

	astroTop = astroTop - 3;
	astroBottom = astroBottom + 3;
	astronaut.style.top = astroTop + "%";
	astronaut.style.bottom = astroBottom + "%";

	astronaut.style.height = 20 + "%";
	astronaut.style.width = 8 + "%";
	canSlide = true;	//the astronaut can slide again now
}

function resetDash() 
{
	astronaut.src = "../images/running.gif";
	astronaut.style.height = 20 + "%";
	astronaut.style.width = 8 + "%";
	canSlide = true;	//the astronaut can slide again now
}

 
// Function to make the astronaut jump and return back to the ground.

function ascend_Descend()
{
	/*The ID value returned by setInterval() is used as the parameter for the clearInterval() method and is
	stored by timerID. The setInterval method calls jump every millisecond. 
	*/

	let timerID = setInterval(jump,10);
	
	/**
		Function to make the astronaut jump. The astronaut's y-coord increases by 1 every millisecond till 
		it reaches 150. Once y coord is 100 the descend function is called.
	*/
	
	function jump ()
	{
		//If the y-coord of the astronaut is 150 then stop the timer (stop executing the jump function).
		if(astroBottom == 50 && astroTop == 30)
		{
			clearInterval(timerID);
			timerID = setInterval(descend,10);
		}	

		else
		{
			astroBottom++;	//increment the y-coord
			astroTop--;
			astronaut.style.bottom = astroBottom + "%"; //change the astornaut's y-coord
			astronaut.style.top = astroTop + "%";
		}

	}

	/**
		Function to make the astronaut return to the ground after jumping.
		The astronaut's y-coord decreases by 1 every millisecond till it reaches 0.
	*/

	function descend()
	{
		if(astroBottom == 0 && astroTop == 80)
			clearInterval(timerID);
		else
		{
			astroBottom--;	//decrement the y-coord
			astroTop++;
			astronaut.style.bottom = astroBottom + "%"; //change the astornaut's y-coord
			astronaut.style.top = astroTop + "%";
		}
	}	
}

// Function to make the astronaut dash and return back.

function dash_Return()
{
	/* timerID stores the ID returned from the setInterval method.
		The setInterval method calls dash every five milliseconds. 
	*/

	let timerID = setInterval(dash,5);

	/**
		The astronaut's x-coord increases by 1 every 5 millisecs till it reaches 150.
		Once x coord is 150 the returnBack function is called.
	*/

	function dash ()
	{
		//If the x-coord of the astronaut is 150 then stop the timer (stop executing the dash function).
		if(astroLeft == 20)
		{
			clearInterval(timerID);
			timerID = setInterval(returnBack,5);
		}				
		else
		{
			astroLeft++;	//increment the x-coord
			astroRight--;
			astronaut.style.left = astroLeft + "%"; //change the astornaut's x-coord 
			astronaut.style.right = astroRight + "%";
		}

	}

	//The astronaut's x-coord decreases by 1 every 5 millisecs till it reaches 0.
	
	function returnBack()
	{
		
		if(astroLeft == 3)
			clearInterval(timerID);
		else
		{
			astroLeft--;	//decrement the x-coord
			astroRight++;
			astronaut.style.left = astroLeft + "%"; //change the astornaut's x-coord
			astronaut.style.right = astroRight + "%";
		}
	}
}

// Function to handle keypress events.

function animate(e)
{
	if(isDead != true && gameWon != true){
		if(e.keyCode == 38)		//Up arrow key is pressed
	{
		
		// Up arrow key will work only if the y coord is zero and x coord is 30.
		if(astroBottom == 0 && astroLeft == 3)	
		{	
			reset(); 				// This is to reset the astronaut if he suddenly jumps while sliding.
			ascend_Descend();		// Move the astronaut.
		}

	}
	if(e.keyCode == 39)		//Right arrow key is pressed
	{
		
		// Right arrow key will work only if the x coord is 30 and y coord is zero.
		if(astroLeft == 3 && astroBottom == 0)
		{
			resetDash();		// This is to reset the astronaut if he suddenly dashes while sliding.
			dash_Return();	// Make the astronaut dash.
		}	
	}

	if(e.keyCode == 40)		//down arrow key
	{
		//astronaut can duck at initial coordinates and when canSlide = true.
		if(canSlide && (astroLeft == 3 && astroBottom == 0)) 
		{
			slide();	//astronaut slides for 0.75 secs.
			let timerID = setTimeout(reset,750); //timerID stores the ID returned by setTimeout().
		}
	}
	}
	
}

// Add an event listener to respond to the user pressing a directional key.
document.addEventListener("keydown", animate);

/* OBSTACLES *******************************************************************************/
var obstacles = ["url(../images/rock.png)", "url(../images/leech.png)"];

$(document).ready(startMotion);

function startMotion(){
	if(objectLeft <= 0){
		resetObstacle();
	}	
	else{
		is_collision();
	}
}

function moveObstacle(){
	// Get current positions
	objectRight = objectRight + 3;
	objectLeft = objectLeft - 3;

	// Store positions	
	// horizontal movment
	document.getElementById("obstacles").style.right = objectRight + "%";
	document.getElementById("obstacles").style.left = objectLeft + "%";
	setTimeout(startMotion, 40);
	
}

function resetObstacle(){
	$("#obstacles").css("top", "80%");
	setRandomHeight();
	// So that we dont see random change in height.
	$("#obstacles").css("left", "-10%");
	objectRight = 0;
	objectLeft = 100;
	setTimeout(startMotion, 0);
}

function setRandomHeight(){
	let heightVal = Math.floor(Math.random()*11 + 70);

	objectTop = heightVal;
	objectBottom = 100 - (objectTop + 9);

	let imageVal = Math.floor(Math.random()*3);
	let imageString = obstacles [imageVal];

	$("#obstacles").css("background-image", imageString);

	$("#obstacles").css("top", objectTop + "%");
	$("#obstacles").css("bottom", objectBottom + "%");
}

/* O2 BAR **********************************************************************************/
class o2Bar {
	
		/* Fields:
		element valueElem -> Stores the progress bar's Oxygen value object.
		element fillElem -> Stores the colored fill bar object inside the progress bar.
		int value -> stores the new values of the bar.*/

	constructor (element){
		this.valueElem = element.querySelector('.progress-bar-value');
		this.fillElem = element.querySelector('.progress-bar-fill');

		this.set_value(100); //Bar is set to 100% Oxygen as game begins.
	}

	set_value (newValue) { //Method that sets the new value of the progress bar.
		if(newValue > 100){
			newValue = 100;
			}

		if(newValue < 0){
			newValue = 0;
			}

		this.value = newValue

		this.update();
	}

	update() { //Method that updates the progress bar to display the new value and fill bar width.
		const o2label = "Oxygen : "
		const percentage = this.value + '%';

		this.fillElem.style.width = percentage;
		this.valueElem.textContent = o2label + percentage;

		this.bar_color();

		this.kill_if();
	}

	bar_color(){ //Method that changes the bar's color according to value.
		if(this.value <= 10){
			this.fillElem.style.background = "red";
		}
		else if(this.value <= 40){
			this.fillElem.style.background = "yellow";
		}
	}

	kill_if(){  //Method that kills astronaut when death condition is met.
		if(this.value == 0){
			die();
		}
	}	
}

var o2BarReductionVal = 5 // Amount by which to reduce the O2 bar upon collision

/*Creating an object pb, of ProgressBar class.*/	
const pb = new o2Bar(document.querySelector('.progress-bar'));

/* COLLISION DETECTION ***(WITH LEFT)*******************************************************/

// Method that detects if there is a collision and rduces O2 Bar if there is.
function is_collision(){
	if(!isDead && !gameWon){
		moveObstacle();
		if((astroLeft + 7) > objectLeft){
			if( (objectTop < (astroTop + 20)) &&
				(!(objectBottom > (astroBottom + 20))) ){
				pb.set_value(pb.value - o2BarReductionVal);
			}
		}
	}
	console.log("\nastroBottom: " + astroBottom);
	console.log("astroTop: " + astroTop);
	console.log("objectBottom: " + objectBottom);
	console.log("objectTop: " + objectTop);
	console.log("astroRight: " + astroRight);
	console.log("astroLeft: " + astroLeft);
	console.log("objectRight: " + objectRight);
	console.log("objectLeft: " + objectLeft);
}
function die(){ //Method that causes astronaut's death when 0% Oxygen level reached.
	astronaut.src = "../images/dead.png";
	astronaut.style.height = "20%";
	astronaut.style.width = "auto";
	isDead = true;
	socket.emit('isDead', {socketId: socket.id});
	alert('Oxygen : 0 % - Your dead!');
}


