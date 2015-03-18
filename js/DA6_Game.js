Secrets.Game = function (game) {

    //  When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:

    this.game;      //  a reference to the currently running game (Phaser.Game)
    this.add;       //  used to add sprites, text, groups, etc (Phaser.GameObjectFactory)
    this.camera;    //  a reference to the game camera (Phaser.Camera)
    this.cache;     //  the game cache (Phaser.Cache)
    this.input;     //  the global input manager. You can access this.input.keyboard, this.input.mouse, as well from it. (Phaser.Input)
    this.load;      //  for preloading assets (Phaser.Loader)
    this.math;      //  lots of useful common math operations (Phaser.Math)
    this.sound;     //  the sound manager - add a sound, play one, set-up markers, etc (Phaser.SoundManager)
    this.stage;     //  the game stage (Phaser.Stage)
    this.time;      //  the clock (Phaser.Time)
    this.tweens;    //  the tween manager (Phaser.TweenManager)
    this.state;     //  the state manager (Phaser.StateManager)
    this.world;     //  the game world (Phaser.World)
    this.particles; //  the particle manager (Phaser.Particles)
    this.physics;   //  the physics manager (Phaser.Physics)
    this.rnd;       //  the repeatable random number generator (Phaser.RandomDataGenerator)
	
    //  You can use any of these from any function within this State.
    //  But do consider them as being 'reserved words', i.e. don't create a property for your own game called "world" or you'll over-write the world reference.

};

var layer, map, leftKey, rightKey, spaceKey, upKey, downKey, aKey, sKey, dKey, wKey;
var player, baddies, orangeLB, orangeRB, yellowSB;
Secrets.Game.prototype = {
    create: function () {
	///////////////////////////////////////////////////////////////////////////////////////////////////
		leftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
		rightKey = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
		spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		upKey = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);
		downKey = this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
		aKey = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
		sKey = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
		dKey = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
		wKey = this.game.input.keyboard.addKey(Phaser.Keyboard.W);
	///////////////////////////////////////////////////////////////////////////////////////////////////
		this.game.physics.startSystem(Phaser.Physics.ARCADE);
		map = this.game.add.tilemap('map');
		map.addTilesetImage('greenBlock_32x32', 'greenBlock');
		map.addTilesetImage('blueBlock_32x32', 'blueBlock');
		layer = map.createLayer('Background');
		layer = map.createLayer('Land');
		layer.resizeWorld();
		map.setCollision(2, true, 'Land', true);
	///////////////////////////////////////////////////////////////////////////////////////////////////
		player = new newPlayer(this.game, this.game.rnd.integerInRange(0, 3168), 320);
		this.game.camera.follow(player.sprite, this.game.camera.FOLLOW_PLATFORMER);
		this.game.camera.width = 800;//dangerous use of camera.width?
		
		baddies = this.game.add.group();
		baddies.enableBody = true;
		for(var i = 0; i < 25; i++)//25 enemies randomly on the map somewhere
		{
			baddies.add(newEnemy(this.game));
		}
	///////////////////////////////////////////////////////////////////////////////////////////////////	
		yellowSB = this.game.add.sprite(this.game.camera.x+(this.game.camera.width/2)-16, 704, 'yellowBlock');//the camera's x postion, +center of the camera, shifted 16 left to center the square
		orangeLB = this.game.add.sprite(yellowSB.x-48, 704, 'orangeBlock');//position of yellow, -spacing of 48
		orangeRB = this.game.add.sprite(yellowSB.x+48, 704, 'orangeBlock');//position of yellow, +spacing of 48
		
		yellowSB.inputEnabled = true;
		orangeLB.inputEnabled = true;
		orangeRB.inputEnabled = true;
		
		yellowSB.events.onInputDown.add(playerIdle, this);
		orangeLB.events.onInputDown.add(movePlayerLeft, this);
		orangeRB.events.onInputDown.add(movePlayerRight, this);
    },

    update: function () {
		if(rightKey.isDown)//temporary test movement functionality
		{
			player.moveRight();
		}
		else if(leftKey.isDown)
		{
			player.moveLeft();
		}
		else
		{
			player.idle();
		}
		
		//update button positions
		yellowSB.x = this.game.camera.x+(this.game.camera.width/2)-16;
		orangeLB.x = yellowSB.x-48;
		orangeRB.x = yellowSB.x+48;
    },

    quitGame: function (pointer) {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //  Then let's go back to the main menu.
        this.state.start('MainMenu');
    }

};

function newEnemy(game)
{
	var xcoord, ycoord;
	
	xcoord = game.rnd.integerInRange(16, 3184);
	ycoord = 608
	
	var hume = new Enemy(game, xcoord, ycoord);
	while(game.physics.arcade.collide(hume, baddies))//game.physics.arcade.collide(hume, layer) || 
	{
		xcoord = game.rnd.integerInRange(0, 3168);//removed collision checks for player and layer from above for now
		//ycoord = 608
		hume.kill();
		hume.reset(xcoord, ycoord);
	}
	
	return hume;//hume is a sprite
};

function Enemy(game, xcoord, ycoord)
{
	return game.add.sprite(xcoord, ycoord, 'redBlock');
};

function EnemyUpdate(enemysprite, game)
{
	
};

function EnemyDie(friend, enemysprite)
{
	enemysprite.kill();
};

function playerIdle()
{
	player.idle();
};

function movePlayerLeft()
{
	player.moveLeft();
};

function movePlayerRight()
{
	player.moveRight();
};