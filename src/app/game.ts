import "phaser";
import { Keys } from "./keys";
import { ArcadeSprite, BaseSound, CursorKeys, PhysicsGroup, SpriteWithDynamicBody, StaticGroup, Text } from "./types";

export default class Demo extends Phaser.Scene {
	private _platforms: StaticGroup;
	private _player: SpriteWithDynamicBody;
	private _cursors: CursorKeys;
	private _stars: PhysicsGroup;
	private _collectSound: BaseSound;
	private _score: number = 0;
	private _scoreText: Text;
	private _bombs: PhysicsGroup;
	private _gameOver: boolean = false;

	constructor() {
		super("demo");
	}

	public preload(): void {
		this.load.image("logo", "assets/phaser3-logo.png");
		this.load.image("libs", "assets/libs.png");
		this.load.glsl("bundle", "assets/plasma-bundle.glsl.js");
		this.load.glsl("stars", "assets/starfields.glsl.js");
		this.load.image("test", "assets/tifa.png");

		this.load.image(Keys.Images.Sky, "assets/sky.png");
		this.load.image(Keys.Images.Ground, "assets/platform.png");
		this.load.image(Keys.Images.Star, "assets/star.png");
		this.load.image(Keys.Images.Bomb, "assets/bomb.png");
		this.load.spritesheet(Keys.Sprites.Dude, "assets/dude.png", { frameWidth: 32, frameHeight: 48 });

		this.load.audio(Keys.Sfx.Collect, "assets/sfx/moan.mp3");
	}

	public create(): void {
		this.add.image(400, 300, Keys.Images.Sky);
		this._collectSound = this.sound.add(Keys.Sfx.Collect);

		this.createPlatforms();
		this.createPlayer();
		this.createPlayerAnimations();
		this.addStars();
		this.createBombs();

		this.physics.add.collider(this._player, this._platforms);
		this.physics.add.collider(this._stars, this._platforms);
		this.physics.add.overlap(this._player, this._stars, this.collectStar, null, this);

		this._scoreText = this.add.text(16, 16, "Score: 0", { fontSize: "32px", color: "#000" });
	}

	public update(time: number, delta: number): void {
		this.createBindings();
	}

	private createPlatforms(): void {
		this._platforms = this.physics.add.staticGroup();

		(this._platforms.create(400, 568, Keys.Images.Ground) as ArcadeSprite).setScale(2).refreshBody();

		this._platforms.create(600, 400, Keys.Images.Ground);
		this._platforms.create(50, 250, Keys.Images.Ground);
		this._platforms.create(750, 220, Keys.Images.Ground);
	}

	private createPlayer(): void {
		this._player = this.physics.add.sprite(100, 450, Keys.Sprites.Dude);

		this._player.setBounce(0.2);
		this._player.setCollideWorldBounds(true);
	}

	private createPlayerAnimations(): void {
		this.anims.create({
			key: Keys.Animations.Left,
			frames: this.anims.generateFrameNumbers(Keys.Sprites.Dude, { start: 0, end: 3 }),
			frameRate: 10,
			repeat: -1,
		});

		this.anims.create({
			key: Keys.Animations.Idle,
			frames: [{ key: Keys.Sprites.Dude, frame: 4 }],
			frameRate: 20,
		});

		this.anims.create({
			key: Keys.Animations.Right,
			frames: this.anims.generateFrameNumbers(Keys.Sprites.Dude, { start: 5, end: 8 }),
			frameRate: 10,
			repeat: -1,
		});
	}

	private createBindings(): void {
		this._cursors = this.input.keyboard.createCursorKeys();

		if (this._cursors.left.isDown) {
			this._player.setVelocityX(-160);
			this._player.anims.play(Keys.Animations.Left, true);
		} else if (this._cursors.right.isDown) {
			this._player.setVelocityX(160);
			this._player.anims.play(Keys.Animations.Right, true);
		} else {
			this._player.setVelocityX(0);
			this._player.anims.play(Keys.Animations.Idle);
		}

		if (this._cursors.up.isDown && this._player.body.touching.down) {
			this._player.setVelocityY(-330);
		}
	}

	private addStars(): void {
		this._stars = this.physics.add.group({
			key: Keys.Images.Star,
			repeat: 11,
			setXY: { x: 12, y: 0, stepX: 70 },
		});

		this._stars.children.iterate((child: ArcadeSprite) => child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8)));
	}

	private collectStar(player: SpriteWithDynamicBody, star: ArcadeSprite): void {
		star.disableBody(true, true);
		this._collectSound.play();

		this._score += 10;
		this._scoreText.setText("Score: " + this._score);

		console.log(this._stars.countActive(true));

		if (this._stars.countActive(true) === 0) {
			this._stars.children.iterate((child: ArcadeSprite) => child.enableBody(true, child.x, 0, true, true));
		}

		const x = player.x < 400 ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

		const bomb = this._bombs.create(x, 16, Keys.Images.Bomb) as ArcadeSprite;
		bomb.setBounce(1);
		bomb.setCollideWorldBounds(true);
		bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
	}

	private createBombs(): void {
		this._bombs = this.physics.add.group();
		this.physics.add.collider(this._bombs, this._platforms);
		this.physics.add.collider(this._player, this._bombs, this.hitBomb.bind(this), null);
	}

	private hitBomb(player: SpriteWithDynamicBody, bomb: ArcadeSprite): void {
		this.physics.pause();

		this._player.setTint(0xff00000);
		this._player.anims.play(Keys.Animations.Idle);

		this._gameOver = true;
	}
}

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	scene: Demo,
	physics: {
		default: "arcade",
		arcade: {
			gravity: { y: 300 },
			debug: false,
		},
	},
};

const game = new Phaser.Game(config);
