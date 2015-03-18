function newPlayer(game, xcoord, ycoord)
{
	this.game = game;
	this.sprite = this.game.add.sprite(xcoord, ycoord, 'purpleBlock');
	this.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
	this.MAX_SPEED = 500; // pixels/second
    this.ACCELERATION = 1500; // pixels/second/second
    this.DRAG = 500; // pixels/second
	this.sprite.body.collideWorldBounds = true;
	this.sprite.body.maxVelocity.setTo(this.MAX_SPEED, 0); // x, y
	this.sprite.body.drag.setTo(this.DRAG, 0); // x, y
	
	this.idle = function()
	{
		this.sprite.body.acceleration.x = 0;
	}
	
	this.moveRight = function()
	{
		this.sprite.body.acceleration.x = this.ACCELERATION;
	}
	
	this.moveLeft = function()
	{
		this.sprite.body.acceleration.x = -this.ACCELERATION;
	}
	
	this.shoot = function(bulletgroup)
	{
		var temp = this.game.add.sprite(this.sprite.x, this.sprite.y, 'purpleShot');
		this.game.physics.enable(temp, Phaser.Physics.ARCADE);
		temp.body.velocity.x = this.sprite.body.velocity.x;
		temp.body.velocity.y = 300;
		bulletgroup.add(temp);
	}
	
	this.kill = function(playersprite, bulletsprite)
	{
		bulletsprite.kill();
		this.sprite.kill();
	}
	
	return this;
};