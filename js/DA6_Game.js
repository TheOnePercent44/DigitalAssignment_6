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

var player, layer, enemies, friend, leftKey, rightKey, spaceKey, upKey, aKey, sKey, dKey, wKey;
Secrets.Game.prototype = {
    create: function () {
		this.game.physics.startSystem(Phaser.Physics.ARCADE);
		//this.game.physics.startSystem(Phaser.Physics.P2JS);
        //  Honestly, just about anything could go here. It's YOUR game after all. Eat your heart out!
		map = this.game.add.tilemap('map');
		map.addTilesetImage('greenBlock_32x32', 'greenBlock');
		//map.addTilesetImage('blueBlock_32x32', 'blueBlock');
		//layer = map.createLayer('Background');
		layer = map.createLayer('Platforms');
		layer.resizeWorld();
		map.setCollision(1, true, 'Platforms', true);
		
		leftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
		rightKey = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
		spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		upKey = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);
		aKey = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
		sKey = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
		dKey = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
		wKey = this.game.input.keyboard.addKey(Phaser.Keyboard.W);
		
		//this.game.physics.p2.convertTilemap(map, layer);
		//this.game.camera.setSize(100, 100);
		//this.game.camera.bounds = new Phaser.Rectangle(0, 0, 3216,3216);
		//this.game.camera.update();
		
		//this.game.physics.p2.gravity.y = 300;//300;
		this.game.physics.arcade.gravity.y = 300;//300;
		
		enemies = this.game.add.group();
		enemies.enableBody = true;
		enemies.physicsBodyType = Phaser.Physics.ARCADE;
		for(var i = 0; i < 10; i++)
		{
			enemies.add(newEnemy(this.game));
		}
		
		player = new newPlayer(this.game, 15, 1568);//physics enables in Catfighter
		this.game.camera.follow(player.sprite, this.game.camera.FOLLOW_PLATFORMER);
		player.sprite.body.collideWorldBounds = true;
		
		friend = new Participant(this.game, player.sprite);
		friend.sprite.body.collideWorldBounds = true;
    },

    update: function () {

        //  Honestly, just about anything could go here. It's YOUR game after all. Eat your heart out!
		this.game.physics.arcade.collide(player.sprite, layer, player.hitLand, null, player);
		this.game.physics.arcade.collide(enemies, layer);
		//this.game.physics.arcade.collide(player.sprite, humans, change, null, this);
		if(friend.held === false)// && friend.isThrown === false)
			this.game.physics.arcade.collide(friend.sprite, player.sprite, friend.pickedUp, null, friend);
		else
			this.game.physics.arcade.collide(friend.sprite, player.sprite);//so the friend sits on top of the player
		
		this.game.physics.arcade.collide(friend.sprite, layer, friend.hitLand, null, friend);
		
		if(friend.isThrown === true)
			this.game.physics.arcade.collide(friend.sprite, enemies, EnemyDie, null, this);
		
		friend.update();
		enemies.forEachAlive(EnemyUpdate, this, this.game);
		
		if(rightKey.isDown)
		{
			player.runRight();
		}
		else if(leftKey.isDown)
		{
			player.runLeft();
		}
		else
		{
			if(player.inAir === false)
				player.idle();
		}
		//if(this.game.input.keyboard.isDown(Phaser.Keyboard.UP))
		if(friend.held == true)
		{
			//do the throwing thing
			if(aKey.isDown)
				friend.thrown(-1);//throw right
			else if(dKey.isDown)
				friend.thrown(1);
			else{}//do nothing
		}
		
		else
		{
			//?
		}
		if(upKey.isDown)
		{
			player.jump();//WHEEEEEEEEEEE
		}
    },

    quitGame: function (pointer) {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //  Then let's go back to the main menu.
        this.state.start('MainMenu');

    }

};

function Enemy(game, xcoord, ycoord)
{
	this.game = game;
	this.sprite = this.game.add.sprite(xcoord, ycoord, 'yellowBlock');
	this.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
	
	return this.sprite;
};

function EnemyUpdate(enemysprite, game)
{
	var MAX_SPEED = 200;
	var point = game.rnd.integerInRange(1, 8);
	if(point%2 === 0)
		enemysprite.body.velocity.x = MAX_SPEED;
	else
		enemysprite.body.velocity.x = -MAX_SPEED;
}

function EnemyDie(friend, enemysprite)
{
	enemysprite.kill();
}

function Participant(game, playersprite)
{
	this.game = game;
	this.target = playersprite;
	this.sprite = this.game.add.sprite(60, 1568, 'purpleBlock');
	this.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
	
	//this.waitTime = -2500;//this.game.time.now;
	this.held = false;
	this.isThrown = false;
	
	//this.goright = false;
	//this.goleft = false;
	
	this.MIN_DISTANCE = 500;
	//this.MAX_DISTANCE = 32
	
	this.MAX_SPEED = 180;
	this.THROWN_SPEED = 280;
	this.DRAG = 1000;
	this.ACCEL = 300;
	
	this.update = function()
	{
		if(this.held === false && this.isThrown === false)// && this.game.time.elapsedSince(this.timeWait) > 2500)
		{
			this.run();
		}
		else if(this.held === true)
		{
			//console.log("Time elapsed = "+this.game.time.elapsedSince(this.timeWait));//debug
			this.beCarried();
		}
		else{
			//console.log("I am doing nothing for some reason.");//debug
		}//being thrown, await collision
	}
	
	this.run = function()
	{
		//console.log("Running away!");//debug
		var distance = this.game.math.distance(this.sprite.x, this.sprite.y, this.target.x, this.target.y);
		
		// If the distance > MIN_DISTANCE then move
		if (distance < this.MIN_DISTANCE && this.sprite.body.velocity.x < this.MAX_SPEED)// && this.distance !< MAX_DISTANCE)
		{		
			// Calculate the angle to the target
			var rotation = this.game.math.angleBetween(this.sprite.x, this.sprite.y, this.target.x, this.target.y);

			// Calculate velocity vector based on rotation and this.MAX_SPEED
			this.sprite.body.velocity.x = -Math.cos(rotation)*this.MAX_SPEED;
		} 
		else
		{
			this.sprite.body.velocity.x = 0;
		}
	}
	
	this.pickedUp = function(self, player)//accepts two arguments for compatibility with collide
	{
		//console.log("Picked up friend");//debug
		this.sprite.x = this.target.x;
		this.sprite.y = this.target.y-33;
		this.held = true;
		this.isThrown = false;
	}
	
	this.beCarried = function()
	{
		//console.log("I'm being carried!");//debug
		this.sprite.body.velocity.x = this.target.body.velocity.x;
		this.sprite.body.velocity.y = this.target.body.velocity.y;
		if(this.sprite.x != this.target.x || this.sprite.y != this.target.y-33)
		{
			this.sprite.x = this.target.x;
			this.sprite.y = this.target.y-33;
		}
	}
	
	this.thrown = function(scalar)
	{
		//console.log("I'VE BEEN THROWN!");//debug
		this.sprite.body.velocity.x = scalar*this.THROWN_SPEED+this.target.body.velocity.x;
		this.sprite.body.velocity.y = -this.THROWN_SPEED*(1/2);
		//this.waitTime = this.game.time.now;
		this.isThrown = true;
		this.held = false;
	}
	
	this.hitLand = function(self, layer)//accepts two arguments for compatibility with collide
	{
		//console.log("Hittin' the floor");//debug
		if(this.isThrown === true)// && this.sprite.body.touching.down)
		{
			//console.log("Landed!");//debug
			this.isThrown = false;
		}
		else{}//do nothing, let idle or others take care of it
	}
};

function newEnemy(game)
{
	var xcoord, ycoord;
	
	xcoord = game.rnd.integerInRange(16, 3184);
	ycoord = game.rnd.integerInRange(16, 3184);
	
	var hume = new Enemy(game, xcoord, ycoord);
	game.physics.enable(hume, Phaser.Physics.ARCADE);
	while(game.physics.arcade.collide(hume, layer) || game.physics.arcade.collide(hume, player) || game.physics.arcade.collide(hume, enemies))
	{
		xcoord = game.rnd.integerInRange(16, 3184);
		ycoord = game.rnd.integerInRange(16, 3184);
		hume.kill();
		hume.reset(xcoord, ycoord);
	}
	
	return hume;
};