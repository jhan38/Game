// This is a very simple game. Player has to go through all the ledges. 
//If player touches the ledge or go beyond the screen, he/she will lose the game.
// I added the snowflakes to make the game look more aesthetic.
// The background.png and the player.png are created by my brother and my friend.
// To start the game, first you will see the Menu, pressing the spacebar to the gameplay screen. 
// Second, touch the screen and use the spacebar to control jump/fly.


var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser');

var MainMenu =  {
    //Preload assets
preload: function(){
    game.load.image('Menu', 'assets/img/Player.png');
    game.load.image('ground', 'assets/img/snowflakes_large.png');
    game.load.image('ledge', 'assets/img/snowflakes.png');
    game.load.image('background', 'assets/img/temp.png');
    game.load.audio('jump', 'assets/audio/jump.mp3');
    game.load.audio('fly', 'assets/audio/fly.mp3');
    game.load.atlasJSONHash('atlas', 'assets/img/spritesheet.png', 'assets/img/sprites.json');
    //game.load.atlasJSONHash('atlas', 'spritesheet.png', 'sprites.json');
    game.load.spritesheet('snowflakes', 'assets/img/snowflakes.png', 17, 17);
},

init: function(){
    //this.score = 0;
},

create: function(){
    // Add image
    game.add.sprite(0,0, 'Menu');
    // Add text
    printMessages('Welcome to my game', 'Touch the screen to start','Press【SPACEBAR】to jump');
},

update: function() {
    // main menu logic
    if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
        // pass this.level to next state
        // .start(key, clearWorld, clearCache, parameter)
        game.state.start('GamePlay', true, false);}
    }
};

var GamePlay = {
    create: function(){
        // Make background move.
        this.background= game.add.tileSprite(0,0,game.width,game.height, 'background'); 
    
        this.ledgeGroup = game.add.group();
        this.ledgeGroup.enableBody = true;

        // Make ground move.
        this.ground = game.add.tileSprite(0, game.height-80,game.width,112,'ground');
        game.physics.enable(this.ground,Phaser.Physics.ARCADE);
        //Make it immovable.
        this.ground.body.immovable = true;

        // Add player and gives it physics
        this.player = game.add.sprite(50, 200, 'atlas');
        this.player.animations.add('fly', ['0001', '0002', '0003', '0004'], 10, true, false);
        this.player.animations.play('fly');
        game.physics.enable(this.player,Phaser.Physics.ARCADE);
        this.player.body.gravity.y = 0;

        // Add snowflakes to the screen
        snowflakes = game.add.group();
        snowflakes.enableBody = true;
        emitter = game.add.emitter(game.world.centerX, Math.random()*game.height-550, 100);
        emitter.makeParticles('snowflakes');
        emitter.start(false, 5000, 50);

        //touch the screen and begin the game
        game.input.onDown.addOnce(this.GamePlay, this);
        
    },

    GamePlay: function(){
        // Add gamespeed
        this.gameSpeed = 200;

        //Let background and ground begin to move.
        this.background.autoScroll(-(this.gameSpeed/10),0);
        this.ground.autoScroll(-this.gameSpeed,0);
        //game.physics.arcade.enable(this.player);// Enable physics
        this.player.body.gravity.y = 1000;
        //Press spacebar to jump
        var spaceKey = game.input.keyboard.addKey(
            Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(this.jump, this);

        //Add ledges
        this.ledges = game.add.group();
        //Add timer. Every 1.5 seconds will compile the addrowledges function
        this.timer = game.time.events.loop(1500, this.addRowOfLedges, this);

        //Add scores
        this.score = 0;
        scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
        this.player.anchor.setTo(-0.2, 0.5);

        //Sound
        this.jumpSound = game.add.audio('jump');
     },

    update: function(){
        // If player exceed the scope, it will die.
        if (this.player.y < 0 || this.player.y > 600)
        game.state.start('GameOver', true, false);

        // Change the rotation center
        if (this.player.angle < 20)
            this.player.angle += 1;
            
        // Check if overlap
        game.physics.arcade.overlap(this.player, this.ledges, this.hitLedge, null, this);
    },

    jump: function() {
        // Player cannot jump after it die.
        if (this.player.alive == false)
            return;
        // Add a vertical velocity to the player
        this.player.body.velocity.y = -300;
        //When the player jumps up, it spins up
        game.add.tween(this.player).to({angle: -20}, 100).start();

        this.jumpSound.play();
    },

    addOneLedge: function(x, y) {
        // Add ledge and give it physics
            var ledge = game.add.sprite(x, y, 'ledge');
            this.ledges.add(ledge);
            game.physics.arcade.enable(ledge);
            ledge.body.velocity.x = -200;
    
            ledge.checkWorldBounds = true;
            ledge.outOfBoundsKill = true;
    },

    addRowOfLedges: function() { 
        // Randomly pick a number between 1 and 5
        // This will be the hole position
        var hole = Math.floor(Math.random() * 5) + 1;

        // Add the 6 ledges
        // With one big hole at position 'hole' and 'hole + 1'
        for (var i = 0; i < 9; i++)
            if (i != hole && i != hole + 1)
                this.addOneLedge(800, i * 90 + 10);
            
            score +=1;
            scoreText.text = 'Score: ' + score;
    },

    hitLedge: function() {
        // If the player has already hit a ledge, do nothing
        // It means the player is already falling off the screen
        if (this.player.alive == false)
            return;

        // Set the alive property of the player to false
        this.player.alive = false;

        // Prevent new ledges from appearing
        game.time.events.remove(this.timer);

        // Go through all the ledges, and stop their movement
        this.ledges.forEach(function(p){
            p.body.velocity.x = 0;
        }, this);
        this.flySound = game.add.audio('fly');
        this.flySound.play();
    }
};


var GameOver = function(game) {};
GameOver.prototype = {
	init: function(score) {
		this.score = score;
    },

    preload: function() {
        //preload assets
        game.load.image('GameOver', 'assets/img/Player.png');
        game.load.audio('lose', 'assets/audio/lose.mp3');
    },

	create: function() {
        // Add the image and souund
        game.add.sprite(0,0, 'GameOver');
        lose = game.add.audio('lose');
        lose.play();
        //Text
		printMessages('Press SPACEBAR to play again!', +score+' is your score','Press 【space】 to restart');
    },
    
	update: function() {
        // GameOver logic
		if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
            game.state.start('MainMenu');
            score = 0;
        }
    
	}
};


function printMessages(top_msg, mtm_msg, btm_msg) {
	let message = '';
    let style1 = { font: '20px Helvetica', fill: '#FFF', align: "center" };
    let style2 = { font: '20px Helvetica', fill: '#FFF', align: "center" };
    let style3 = { font: '20px Helvetica', fill: '#FFF', align: "center" };
	
	message = game.add.text(120, game.world.centerY-220, top_msg, style1);
	//message.anchor.set(0.5); // used for centering, but can make text blurry
	message = game.add.text(100, game.world.centerY-170, mtm_msg, style2);
    message = game.add.text(100, game.world.centerY-120, btm_msg, style3);
	//message.anchor.set(0.5);
}



var score = 0;
var scoreText;


game.state.add('MainMenu', MainMenu);
game.state.add('GamePlay', GamePlay);
game.state.add('GameOver', GameOver);
game.state.start('MainMenu');

