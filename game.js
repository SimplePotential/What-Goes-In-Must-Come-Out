 
// Start the game.
document.onreadystatechange = () => {
	if(document.readyState === "complete"){ SetupGame(); }
}

var oGame = null;
var oContext = null;
var oScore = null;
var cScore = null;
var oKeys = {};
var lastTime = null;
var deltaTime = null;
var audioOn = true;

var defaultTicks_Player = 150;
var minTicks_Player = defaultTicks_Player;
var lastTick_Player = 0;
var multiTick_Player = .01;
var fastTicks_Player = 100;
var minTicks_ClearPoo = 13000;

var minTicks_Food = 1000;
var lastTick_Food = 0;

var score = 0;
var newgame = true;
var newgameRendered = false;
var gameover = false;
var gameoverRendered = false;
var paused = false;
var pauseRendered = false;
var color_bg = "#000000";
var color_bg_score = "#000000";
var color_bg_starving = "#0d0000";
var color_score = "#6fffe9";
var color_title = "#6fffe9";
var color_title_outer = "#05669e";
var color_bellybar_full = "#71ab72"; //"#577480";
var color_bellybar_half = "#d4d126";
var color_bellybar_empty = "#bf5441";
var color_bellybar_empty2 = "#803d32";
var bellybar_off = 0;
var game_width = 640;
var game_height = 480;
var canSpawnClearPoo = 0;
var bonusClearPooXY = null;

var food_max = 20;

var sound_move = null;
var sound_pooing = null;
var sound_eat_food = null;
var sound_eat_poo = null;
var sound_bonus_spawn = null;
var sound_bonus_clear_spawn = null;
var sound_gameover = null;

var oPlayer = null;

var foods = [];
var food = null; 

var pooPiles = [];
var poo = null; 

/*
	Called when the document is loaded, sets up the game so it is ready to play.
*/
function SetupGame()
{
	// Setup the Canvas
	oGame = document.createElement("canvas");
	cGame = oGame.getContext("2d");
	oGame.width = game_width;
	oGame.height = game_height;
	document.getElementById("gameHolder").appendChild(oGame);
	
	document.getElementById("gameHolder").style.width = oGame.width + "px";
	document.getElementById("gameHolder").style.backgroundColor = color_bg;
	
	oGame.style.cursor = 'none';

	oScore = document.createElement("canvas");
	cScore = oScore.getContext("2d");
	oScore.width = oGame.width;
	oScore.height = 50;
	oScore.top = oGame.height;
	
	document.getElementById("gameHolder").appendChild(oScore);

	oScore.style.cursor = 'none';
	
	// Listen for various input
	addEventListener("keydown", function (e){ oKeys[e.code] = true;}, false);
	addEventListener("keyup", function (e){
		
		delete oKeys[e.code];
		
		switch(e.code)
		{
			case 'KeyP':
			case 'Space':
			case 'Enter':
				e.preventDefault();
				if(newgame)
				{
					newgame = false;
				}
				else
				{
					// We are already in a new game, treat as a pause request
					paused = !paused;
				}
				break;
			case 'KeyM':
				e.preventDefault();
				audioOn = !audioOn;
				if(audioOn)
				{
					sound_move.play();
				}
				else
				{
					sound_move.stop();
				}
				break;
			case 'F2':
				e.preventDefault();
				NewGame();
				break;
		}
	}, false);
	
	SetupSounds();

	NewGame();
}

/*
	Start a new game
*/
function NewGame()
{

	ResetPlayer();
	ResetFood();
	ResetPoo();

	lastTime = Date.now();
	
	lastTick_Food = 0;
	score = 0;
	newgame = true;
	newgameRendered = false;
	gameover = false;
	gameoverRendered = false;
	paused = false;
	pauseRendered = false;

	SpawnFood(5);
	Render_Score();

	UpdateGame();
}

function ResetPlayer()
{
	oPlayer = {
		speed: 256,
		color: "#ffffff",
		x: 0,
		y: 0,
		height: 16,
		width: 16,
		dx: 0,
		dy: 0,
		energy: 85,
		pooing: false,
		moveCost: 2,
		pooChance: .05,
		hasMoved: false
	};

	// Center'ish the player
	oPlayer.x = Math.floor(oGame.width / 2);
	oPlayer.y = Math.floor(oGame.height / 2);
}

function ResetFood()
{
	foods = [];

	food = {
		color: "#00FF00",
		x: 0,
		y: 0,
		height: 16,
		width: 16,
		points: 25,
		energy: 15,
		eaten: false,
		pooOn: false,
		isBonus: false,
		bonusColor: "#FF00FF",
		bonusMulti: 5,
		bonusChance: 0.18,
		isClearPoo: false,
		bonusClearPoo: .05,
		bonusClearPooNeed: 25,
		bonusClearPooColor: "#ff0000",
		bonusClearPooColor2: "#eb6060",
		bonusClearPooColorOff: 0,
		soundSpawnPlayed: false
	}
}

function ResetPoo()
{
	pooPiles = [];
	
	poo = {
		color: "#b87455",
		x: 0,
		y: 0,
		height: 16,
		width: 16,
		points: -15,
		energy: -25,
		eaten: false
	}
}

/*
	Update the game's state and call appropriate rendering functions.
*/
function UpdateGame()
{
	
	if(gameover)
	{
		ShowGameOver();
		return;
	}

	var now = Date.now();
	deltaTime = now - lastTime;
	
	lastTime = now; 

	if(newgame)
	{
		ShowNewGame();
	}
	else if(paused)
	{ 
		PauseGame();
	}
	else
	{
		pauseRendered = false;
		/*if(deltaTime < (1000 / 30))
		{
			Render_Game();
		}*/
		Render_Game();
	}

	if(canSpawnClearPoo != 0){ canSpawnClearPoo -= deltaTime; }

	requestAnimationFrame(UpdateGame);
}

/*
	Draw the game's title screen.
*/
function ShowNewGame()
{
	if(newgameRendered){ return; } // We've already rendered the pause detail.
	
	cGame.clearRect(0, 0, oGame.width, oGame.height);
	
	cGame.rect(0, 0, oGame.width, oGame.height);
	cGame.fillStyle = color_bg;
	cGame.fill();
	
	var startY = 50;
	
	cGame.textAlign = "center";

	cGame.font = "32px Verdana";
	cGame.strokeStyle = color_title_outer;
	cGame.lineWidth = 3;
	cGame.strokeText("What Goes In Must Come Out", oGame.width / 2, startY);

	cGame.font = "32px Verdana";
	cGame.fillStyle = color_title;
	cGame.lineWidth = 2;
	cGame.fillText("What Goes In Must Come Out", oGame.width / 2, startY);
	
	cGame.font = "18px Verdana";
	cGame.strokeStyle = color_title_outer;
	cGame.lineWidth = 3;
	cGame.strokeText("Press P To Start & Toggle Pause", oGame.width / 2, startY += 40);

	cGame.font = "18px Verdana";
	cGame.fillStyle = color_title;
	cGame.lineWidth = 2;
	cGame.fillText("Press P To Start & Toggle Pause", oGame.width / 2, startY);
	
	cGame.font = "18px Verdana";
	cGame.strokeStyle = color_title_outer;
	cGame.lineWidth = 3;
	cGame.strokeText("Use Arrow Keys or WASD to Move", oGame.width / 2, startY += 40);

	cGame.font = "18px Verdana";
	cGame.fillStyle = color_title;
	cGame.lineWidth = 2;
	cGame.fillText("Use Arrow Keys or WASD to Move", oGame.width / 2, startY);
	
	cGame.font = "18px Verdana";
	cGame.strokeStyle = color_title_outer;
	cGame.lineWidth = 3;
	cGame.strokeText("Eat Green or Purple Food, Avoid Brown Poo, Red Food Clears Poo", oGame.width / 2, startY += 40);

	cGame.font = "18px Verdana";
	cGame.fillStyle = color_title;
	cGame.lineWidth = 2;
	cGame.fillText("Eat Green or Purple Food, Avoid Brown Poo, Red Food Clears Poo", oGame.width / 2, startY);
	
	cGame.font = "18px Verdana";
	cGame.strokeStyle = color_title_outer;
	cGame.lineWidth = 3;
	cGame.strokeText("Having Negative Belly for too Long Ends Game", oGame.width / 2, startY += 40);

	cGame.font = "18px Verdana";
	cGame.fillStyle = color_title;
	cGame.lineWidth = 2;
	cGame.fillText("Having Negative Belly for too Long Ends Game", oGame.width / 2, startY);
	
	cGame.font = "18px Verdana";
	cGame.strokeStyle = color_title_outer;
	cGame.lineWidth = 3;
	cGame.strokeText("When Your Belly is 100%, You will Poo", oGame.width / 2, startY += 40);

	cGame.font = "18px Verdana";
	cGame.fillStyle = color_title;
	cGame.lineWidth = 2;
	cGame.fillText("When Your Belly is 100%, You will Poo", oGame.width / 2, startY);

	cGame.font = "18px Verdana";
	cGame.strokeStyle = color_title_outer;
	cGame.lineWidth = 3;
	cGame.strokeText("Monitor Belly Fullness with bars on side screen", oGame.width / 2, startY += 40);

	cGame.font = "18px Verdana";
	cGame.fillStyle = color_title;
	cGame.lineWidth = 2;
	cGame.fillText("Monitor Belly Fullness with bars on side screen", oGame.width / 2, startY);
	
	cGame.font = "18px Verdana";
	cGame.strokeStyle = color_title_outer;
	cGame.lineWidth = 3;
	cGame.strokeText("Press M to Toggle Mute", oGame.width / 2, startY += 40);

	cGame.font = "18px Verdana";
	cGame.fillStyle = color_title;
	cGame.lineWidth = 2;
	cGame.fillText("Press M to Toggle Mute", oGame.width / 2, startY);

	cGame.font = "18px Verdana";
	cGame.strokeStyle = color_title_outer;
	cGame.lineWidth = 3;
	cGame.strokeText("Press F2 to Start New Game", oGame.width / 2, startY += 40);

	cGame.font = "18px Verdana";
	cGame.fillStyle = color_title;
	cGame.lineWidth = 2;
	cGame.fillText("Press F2 to Start New Game", oGame.width / 2, startY);

	newgameRendered = true;
}

/*
	Draw what should be shown on screen when the game is over
*/
function ShowGameOver()
{
	if(gameoverRendered){ return; } // We've already rendered the game over detail.
	
	sound_move.stop();

	cGame.clearRect(0, 0, oGame.width, oGame.height);
	
	cGame.rect(0, 0, oGame.width, oGame.height);
	cGame.fillStyle = color_bg;
	cGame.fill();
	
	cGame.textAlign = "center";

	cGame.font = "32px Verdana";
	cGame.strokeStyle = color_title_outer;
	cGame.lineWidth = 3;
	cGame.strokeText("Game Over!", oGame.width / 2, oGame.height / 2);

	cGame.font = "32px Verdana";
	cGame.fillStyle = color_title;
	cGame.lineWidth = 2;
	cGame.fillText("Game Over!", oGame.width / 2, oGame.height / 2);
	
	cGame.font = "32px Verdana";
	cGame.strokeStyle = color_title_outer;
	cGame.lineWidth = 3;
	cGame.strokeText("You Scored", oGame.width / 2, (oGame.height / 2) + 40);

	cGame.font = "32px Verdana";
	cGame.fillStyle = color_title;
	cGame.lineWidth = 2;
	cGame.fillText("You Scored", oGame.width / 2, (oGame.height / 2) + 40);
	
	cGame.font = "32px Verdana";
	cGame.strokeStyle = color_title_outer;
	cGame.lineWidth = 3;
	cGame.strokeText(score, oGame.width / 2, (oGame.height / 2) + 80);

	cGame.font = "32px Verdana";
	cGame.fillStyle = color_title;
	cGame.lineWidth = 2;
	cGame.fillText(score, oGame.width / 2, (oGame.height / 2) + 80);

	sound_gameover.play();

	gameoverRendered = true;
}

/*
	Draw the game.
*/
function Render_Game()
{
	cGame.clearRect(0, 0, oGame.width, oGame.height);

	cGame.rect(0, 0, oGame.width, oGame.height);
	if(oPlayer.energy <= 0)
	{
		cGame.fillStyle = (bellybar_off <= 0 ? color_bg_starving : color_bg);
	}
	else
	{
		cGame.fillStyle = color_bg;
	}

	cGame.fill();

	Render_BellyBars();
	Render_Food();
	Render_Poo();
	Render_Player();
	
	Render_Score();
	
	if(oPlayer.energy < -25)
	{
		gameover = true;
	}
	
}

/*
	Draw Belly Fullness bars
*/
function Render_BellyBars()
{
	var barSize = 5;

	if(oPlayer.energy > 60)
	{
		cGame.fillStyle = color_bellybar_full; // You're going good
	}
	else if(oPlayer.energy <= 35)
	{
		if(bellybar_off <= 0)
		{
			cGame.fillStyle = color_bellybar_empty; // You're starving, first flash!
			bellybar_off = 5;
		}
		else
		{
			cGame.fillStyle = color_bellybar_empty2; // You're starving, second flash!
			bellybar_off--;
		}
	}
	else
	{
		cGame.fillStyle = color_bellybar_half; // Caution required
	}

	// Left Bar
	cGame.fillRect(0, 0, barSize, oGame.height * (oPlayer.energy / 100));

	// Top Bar
	cGame.fillRect(0, 0, oGame.width * (oPlayer.energy / 100), barSize);

	// Right Bar
	//cGame.fillRect(oGame.width - barSize, 0, barSize, oGame.height * (oPlayer.energy / 100));
	cGame.fillRect(oGame.width - barSize, oGame.height - (oGame.height * (oPlayer.energy / 100)), barSize, oGame.height);
	
	// Bottom Bar
	//cGame.fillRect(0, oGame.height - barSize, oGame.width * (oPlayer.energy / 100), barSize);
	cGame.fillRect(oGame.width - (oGame.width * (oPlayer.energy / 100)), oGame.height - barSize, oGame.width - barSize, barSize);
}


/*
	Draw the Score
	TODO: Adjust this so it can be seen from top of the screen or maybe from a side panel.
*/
function Render_Score()
{
	cScore.clearRect(0, 0, oScore.width, oScore.height);
	
	cScore.rect(0, 0, oScore.width, oScore.height);
	cScore.fillStyle = color_bg_score;
	cScore.fill();

	//cScore.fillStyle = "#0b7d1c";
	//cScore.fillRect(0, 0, oScore.width * (oPlayer.energy / 100), oScore.height);
	
	cScore.fillStyle = "#577480";
	cScore.fillRect(0, 0, oScore.width, 2);
	
	
	cScore.textAlign = "left";

	var scoreTxtSize = Math.floor(oScore.height / 3);

	cScore.font = "bold " + scoreTxtSize + "px Verdana";
	cScore.fillStyle = color_score;
	
	var textScore = "Score: " + score;
	var textBelly = "Belly: " + oPlayer.energy + "%";
	
	cScore.fillText(textScore, scoreTxtSize, Math.floor((oScore.height / 2) + (scoreTxtSize / 2)));
	
	cScore.textAlign = "right";
	
	if(oPlayer.energy > 50)
	{
		cScore.fillStyle = color_score; // You're going good
	}
	else if(oPlayer.energy <= 25)
	{
		cScore.fillStyle = "#FF0000"; // You're starving!
	}
	else
	{
		cScore.fillStyle = "#FFFF00"; // Caution required
	}
	
	cScore.fillText(textBelly, oScore.width - scoreTxtSize, Math.floor((oScore.height / 2) + (scoreTxtSize / 2)));
	
}

/*
	Draw the Player on the screen and performs logic based on some conditions
*/
function Render_Player()
{
	var pOffset = oPlayer.speed * (deltaTime / 1000);
		 
	if('KeyW' in oKeys || 'ArrowUp' in oKeys) // Move Up
	{
		oPlayer.dy = -1;
		oPlayer.dx = 0;
	}

	if('KeyS' in oKeys || 'ArrowDown' in oKeys) // Move Down
	{
		oPlayer.dy = 1;
		oPlayer.dx = 0;
	}

	if('KeyA' in oKeys || 'ArrowLeft' in oKeys) // Move Left
	{
		oPlayer.dx = -1;
		oPlayer.dy = 0;
	}

	if('KeyD' in oKeys || 'ArrowRight' in oKeys) // Move Right
	{
		oPlayer.dx = 1;
		oPlayer.dy = 0;
	}
	
	if(lastTick_Player <= 0)
	{
		lastTick_Player = minTicks_Player;
		
		var doPoo = Math.random() <= oPlayer.pooChance;

		// Check to see if we should poo
		if((oPlayer.energy >= 100 || (doPoo && oPlayer.energy >= 50)) && !oPlayer.pooing && oPlayer.hasMoved)
		{
			oPlayer.pooing = true;
			SpawnPoo();
		}
		
		oPlayer.x += oPlayer.width * oPlayer.dx;
		oPlayer.y += oPlayer.height * oPlayer.dy;
		
		if((oPlayer.dx + oPlayer.dy) != 0)
		{
			oPlayer.hasMoved = true;

			//sound_move.stop();
			if(sound_move.paused)
			{
				sound_move.play();
			}
			
			var mc = oPlayer.moveCost;
			
			if(oPlayer.energy <= 10)
			{
				mc--; // You're weak, less energy needed to move but you are about to die.
			}
			else if(oPlayer.energy > 50)
			{
				mc++; // You are full of energy, move faster.
			}
			
			oPlayer.energy -= mc;
		}
		
		CheckScreenBoundsX(oPlayer);
		CheckScreenBoundsY(oPlayer);
		
	}
	else
	{
		lastTick_Player -= deltaTime;
	}
	
	cGame.fillStyle = oPlayer.color;
	cGame.fillRect(oPlayer.x, oPlayer.y, oPlayer.width, oPlayer.height);
	
}

/*
	Draw Food on the screen and performs logic based on some conditions
*/
function Render_Food()
{
	
	if(lastTick_Food <= 0)
	{
		lastTick_Food = minTicks_Food;
		SpawnFood(1);
	}
	else
	{
		lastTick_Food -= deltaTime;
	}
	
	for(i = 0; i < foods.length; i++)
	{
		if(foods[i].isClearPoo)
		{
			bonusClearPooXY = foods[i];
			cGame.fillStyle = (foods[i].bonusClearPooColorOff > 0 ? foods[i].bonusClearPooColor : color_bg);

			if(foods[i].bonusClearPooColorOff <= 0)
			{
				foods[i].bonusClearPooColorOff = 5;
			}
			else
			{
				foods[i].bonusClearPooColorOff--;
			}
		}
		else
		{
			cGame.fillStyle = (!foods[i].isBonus ? foods[i].color : foods[i].bonusColor);
		}

		cGame.fillRect(foods[i].x, foods[i].y, foods[i].width, foods[i].height);
		
		if(foods[i].isClearPoo)
		{
			if(!foods[i].soundSpawnPlayed) { sound_bonus_clear_spawn.play(); foods[i].soundSpawnPlayed = true; }
		}
		else
		{
			if(foods[i].isBonus && !foods[i].soundSpawnPlayed){ sound_bonus_spawn.play(); foods[i].soundSpawnPlayed = true; }
		}		
		
		if(Collision(oPlayer,foods[i]))
		{ 
			foods[i].eaten = true;
			sound_eat_food.play();
		}
	}
	
	CheckEating();
}

/*
	Checks if any of the Food or Poo has been eaten or otherwise needs to be deleted from the pool
*/
function CheckEating()
{
	if(foods.length > 0)
	{
		for(i = foods.length-1; i >= 0; i--)
		{
			if(foods[i].pooOn && !foods[i].isClearPoo)
			{
				// Food has poo on it, delete it
				foods.splice(i, 1);
			}
			else if(foods[i].eaten)
			{
				oPlayer.energy += foods[i].energy * (!foods[i].isBonus ? 1 : foods[i].bonusMulti);
				score += foods[i].points * (!foods[i].isBonus ? 1 : foods[i].bonusMulti);

				if(foods[i].isClearPoo)
				{
					ResetPoo();
				}
				
				/* if(minTicks_Player < 75)
				{ 
					minTicks_Player = 75; // Ensure the game doesn't go so fast it isn't playable
				}
				else
				{
					AdjustPlaySpeed(defaultTicks_Player - (score * multiTick_Player));
				} */
				
				foods.splice(i, 1);
			}
			else if(foods[i].isClearPoo)
			{
				// Check if timer is up
				if(canSpawnClearPoo <= 0)
				{
					foods.splice(i, 1);
				}
			}
		}
	}
	
	if(pooPiles.length > 0)
	{
		for(i = pooPiles.length-1; i >= 0; i--)
		{
			if(pooPiles[i].eaten)
			{
				oPlayer.energy += pooPiles[i].energy;
				score += pooPiles[i].points;
				pooPiles.splice(i, 1);
			}
			else if(Collision(pooPiles[i], bonusClearPooXY))
			{
				// If a bonus clear poo spawns on a poo, delete the poo
				pooPiles.splice(i, 1);
			}
		}
	}
	
}

/*
	Draw Poo on the screen and performs logic based on some conditions
*/
function Render_Poo()
{
	if(pooPiles.length > 0)
	{
		for(i = 0; i < pooPiles.length; i++)
		{
			cGame.fillStyle = pooPiles[i].color;
			cGame.fillRect(pooPiles[i].x, pooPiles[i].y, pooPiles[i].width, pooPiles[i].height);
			
			// See if our new poo pile has touched any food
			CheckPooOnFood();

			if(Collision(oPlayer,pooPiles[i]))
			{
				pooPiles[i].eaten = true;
				sound_eat_poo.play();
			}
		}
	}

	CheckEating();
}

/*
	Checks if the two provided objects have touched each other
 */
function Collision(obj1, obj2)
{
	if(obj1 == null || obj2 == null) { return false; }
	if(obj1.y <= obj2.y + obj2.height && obj1.y + obj1.height >= obj2.y && obj1.x <= obj2.x + obj2.width && obj1.x + obj1.width >= obj2.x)
	{
		return true;
	}
	else
	{
		return false;
	}
}

/*
	Check if any poo has rendered touching food
	We don't want the player to have to figure out why they are eating
	food with poo on it, so we'll delete any food with poo on it
*/
function CheckPooOnFood()
{
	for(p = 0; p < pooPiles.length; p++)
	{
		for(f = 0; f < foods.length; f++)
		{
			if(Collision(pooPiles[p], foods[f]))
			{
				foods[f].pooOn = true; // Food has poo on it so remove it from the food pool
			}
		}
	}
}

/*
	Check if object is within the games left and right coordinates.
*/
function CheckScreenBoundsX(obj)
{
	if(obj.x > oGame.width - obj.width)
	{
		//obj.x = (oGame.width - obj.width);
		obj.x = 0;
	}
	else if(obj.x < 0)
	{
		//obj.x = 0;
		obj.x = (oGame.width - obj.width);
	}
}

/*
	Check if object is within the games top and bottom coordinates.
*/
function CheckScreenBoundsY(obj)
{
	if(obj.y > oGame.height - obj.height)
	{
		//obj.y = (oGame.height - obj.height);
		obj.y = 0;
	}
	else if(obj.y < 0)
	{
		//obj.y = 0;
		obj.y = (oGame.height - obj.height);
	}
}

/*
	Pause the game and render appropriate screen text
*/
function PauseGame()
{
	if(pauseRendered){ return; } // We've already rendered the pause detail.

	sound_move.stop();

	cGame.textAlign = "center";

	cGame.font = "40px Verdana";
	cGame.strokeStyle = "#03045e";
	cGame.lineWidth = 4;
	cGame.strokeText("PRESS P TO PLAY", oGame.width / 2, oGame.height / 2);

	cGame.font = "40px Verdana";
	cGame.fillStyle = "#0096c7";
	cGame.lineWidth = 2;
	cGame.fillText("PRESS P TO PLAY", oGame.width / 2, oGame.height / 2);

	pauseRendered = true;
}

/*
	Create a new piece of food
*/
function SpawnFood(cnt)
{
	if((oPlayer.dx + oPlayer.dy) == 0 && foods.length >= 1){ return; } // Player hasn't started playing yet, don't spawn food.
	if(cnt + foods.length > food_max){ return; }
	for(i = 0; i < cnt; i++)
	{
		var f = Object.create(food);
		
		f.x = Math.floor((Math.random() * oGame.width));
		f.y = Math.floor((Math.random() * oGame.height));
		
		CheckScreenBoundsX(f);
		CheckScreenBoundsY(f);

		// Check if the food spawned on the player in a new game setting
		if(Collision(oPlayer, f) && !oPlayer.hasMoved)
		{
			// It did spawn on player so try again.
			i--;
		}
		else
		{
			// Try to generate a bonus food, if players energy less that 1/4 full, double that chance
			if(pooPiles.length >= f.bonusClearPooNeed && canSpawnClearPoo <= 0)
			{
				f.isClearPoo = (Math.random() <= (f.bonusClearPoo * (Math.floor(pooPiles.length / f.bonusClearPooNeed))));
				if(f.isClearPoo) { canSpawnClearPoo = minTicks_ClearPoo; }
			}

			if(!f.isClearPoo)
			{
				f.isBonus = (Math.random() <= (f.bonusChance * (oPlayer.energy <= 25 ? 2 : 1)));
			}
		}

		foods.push(f);
		
	}
}

/*
	Create a new pill of poo
*/
function SpawnPoo()
{
	var f = Object.create(poo);
	
	var pos = {x: (oPlayer.x) - (oPlayer.width * oPlayer.dx), y: (oPlayer.y) - (oPlayer.height * oPlayer.dy)}
	
	f.x = pos.x;
	f.y = pos.y;

	CheckScreenBoundsX(f);
	CheckScreenBoundsY(f);

	oPlayer.energy += f.energy;
	sound_pooing.play();

	pooPiles.push(f);
	
	oPlayer.pooing = false;
}

/*
	Deprecated
	Adjust the game's play speed
*/
function AdjustPlaySpeed(value)
{
	minTicks_Player = value;
	if(minTicks_Player < fastTicks_Player)
	{ 
		minTicks_Player = fastTicks_Player; 
	}
	else if(minTicks_Player > defaultTicks_Player)
	{
		minTicks_Player = defaultTicks_Player;
	}
}

/*
	setup all sounds used in the game
*/
function SetupSounds()
{
	sound_move = new Sound("sounds/move.wav", .1, true);
	sound_eat_food = new Sound("sounds/eat_food.wav", .5);
	sound_eat_poo = new Sound("sounds/eat_poo.wav", .5);
	sound_bonus_spawn = new Sound("sounds/bonus_spawn.wav", .5);
	sound_bonus_clear_spawn = new Sound("sounds/bonus_clear.wav", .5);
	sound_pooing = new Sound("sounds/pooing.wav", .5);
	sound_gameover = new Sound("sounds/gameover.wav", .5);
}

/*
	Creates a new sound and pre-loads it.  Returns a sound object that can be used to start/stop a sound during game play
	Largely Taken from https://www.w3schools.com/graphics/tryit.asp?filename=trygame_sound
	Easy of use, no reason to reinvent wheel
*/
function Sound(source, vol, loop = false)
{
	this.sound = document.createElement("audio");
	this.sound.src = source;
	this.sound.setAttribute("preload", "auto");
	this.sound.setAttribute("controls", "none");
	this.sound.style.display = "none";
	this.sound.volume = vol;
	this.sound.loop = loop;
	document.body.appendChild(this.sound);
	this.paused = this.sound.paused;
	this.play = function(){
		if(audioOn && this.sound.paused){ this.sound.currentTime = 0; this.sound.play(); }
	}
	this.stop = function(){
		this.sound.pause();
		this.sound.currentTime = 0;
	}
}