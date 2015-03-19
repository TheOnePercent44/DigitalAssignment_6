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
var player, baddies, orangeLB, orangeRB, yellowSB, bulletgroup, enemybullets;
var LBflag, RBflag, timeMark, shootFlag;
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
		player = new newPlayer(this.game, this.game.rnd.integerInRange(0, 3168), 192);
		this.game.camera.follow(player.sprite, this.game.camera.FOLLOW_PLATFORMER);
		this.game.camera.width = 800;//dangerous use of camera.width?
		
		baddies = this.game.add.group();
		baddies.enableBody = true;
		for(var i = 0; i < 25; i++)//25 enemies randomly on the map somewhere
		{
			baddies.add(newEnemy(this.game));
		}
	///////////////////////////////////////////////////////////////////////////////////////////////////
		bulletgroup = this.game.add.group();
		bulletgroup.enableBody = true;
		
		enemybullets = this.game.add.group();
		enemybullets.enableBody = true;
	///////////////////////////////////////////////////////////////////////////////////////////////////	
		yellowSB = this.game.add.sprite(this.game.camera.x+(this.game.camera.width/2)-16, 704, 'yellowBlock');//the camera's x postion, +center of the camera, shifted 16 left to center the square
		orangeLB = this.game.add.sprite(yellowSB.x-32, 704, 'orangeBlock');//position of yellow, -spacing of 48
		orangeRB = this.game.add.sprite(yellowSB.x+32, 704, 'orangeBlock');//position of yellow, +spacing of 48
		
		yellowSB.inputEnabled = true;
		orangeLB.inputEnabled = true;
		orangeRB.inputEnabled = true;
		
		yellowSB.events.onInputDown.add(playerShoot, this.game);
		orangeLB.events.onInputDown.add(movePlayerLeft, this.game);
		orangeRB.events.onInputDown.add(movePlayerRight, this.game);
		//yellowSB.events.onInputUp.add(playerShoot, this.game);
		orangeLB.events.onInputUp.add(movePlayerLeft, this.game);
		orangeRB.events.onInputUp.add(movePlayerRight, this.game);
		
		LBflag = false;
		RBflag = false;
		
		timeMark = this.game.time.now;
		shootFlag = false;
    },

    update: function () {
		this.game.physics.arcade.overlap(player.sprite, enemybullets, playerDie, null, this);
		this.game.physics.arcade.overlap(bulletgroup, baddies, EnemyDie, null, this);
		//this.game.physics.arcade.overlap(bulletgroup, enemybullets, bulletClash, null, this);
		this.game.physics.arcade.overlap(bulletgroup, layer, bulletKill, null, this);
		
		if(rightKey.isDown || RBflag)//temporary test movement functionality
		{
			player.moveRight();
		}
		else if(leftKey.isDown || LBflag)
		{
			player.moveLeft();
		}
		else
		{
			player.idle();
		}
		if(this.game.time.now-timeMark > 2000)
		{
			shootFlag = true;
		}
		baddies.forEachAlive(EnemyUpdate, this, this);
		if(shootFlag)
		{
			timeMark = this.game.time.now;
			shootFlag = false;
		}
		if(baddies.countLiving === 0)
		{
			this.state.start('WinScreen');
		}
		//update button positions
		yellowSB.x = this.game.camera.x+(this.game.camera.width/2)-16;
		orangeLB.x = yellowSB.x-32;
		orangeRB.x = yellowSB.x+32;
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
	if(enemysprite.inCamera && shootFlag)//(enemysprite.inWorld
	{
		var rotation = this.game.math.angleBetween(enemysprite.x, enemysprite.y,player.sprite.x, player.sprite.y);
		
		var temp = this.game.add.sprite(enemysprite.x, enemysprite.y, 'redShot');
		this.game.physics.enable(temp, Phaser.Physics.ARCADE);
		temp.body.velocity.x = Math.cos(rotation) * 350;//change the number to make faster and whatnot
		temp.body.velocity.y = Math.sin(rotation) * 350;
		enemybullets.add(temp);
	}
};

function EnemyDie(playerbullet, enemysprite)
{
	enemysprite.kill();
	playerbullet.kill();
};

function bulletKill(playerbullet, layer)
{
	playerbullet.kill();
}

function bulletClash(playerbullet, bulletsprite)
{
	playerbullet.kill();
	bulletsprite.kill();
};

function playerDie(playersprite, bulletsprite)//wrapper to use state change
{
	console.log("in playerDie");//debug
	player.sprite.kill();
	bulletsprite.kill();
	this.state.start('LoseScreen');
};

function playerShoot()
{
	player.shoot(bulletgroup);
};

function movePlayerLeft()
{
	LBflag = !LBflag;
};

function movePlayerRight()
{
	RBflag = !RBflag;
};