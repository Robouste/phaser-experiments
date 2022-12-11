import "phaser";
import { Keys } from "./keys";
import { ArcadeSprite, BaseSound, CursorKeys, PhysicsGroup, SpriteWithDynamicBody, StaticGroup } from "./types";

export default class Demo extends Phaser.Scene {
	private _platforms: StaticGroup;
	private _player: SpriteWithDynamicBody;
	private _cursors: CursorKeys;
	private _stars: PhysicsGroup;
	private _collectSound: BaseSound;

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

		this.physics.add.collider(this._player, this._platforms);
		this.physics.add.collider(this._stars, this._platforms);
		this.physics.add.overlap(this._player, this._stars, this.collectStar, null, this);
	}

	public update(time: number, delta: number): void {
		this.createBindings();
	}

	private createPlatforms(): void {
		this._platforms = this.physics.add.staticGroup();

		this._platforms.create(400, 568, Keys.Images.Ground).setScale(2).refreshBody();

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
