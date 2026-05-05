import BaseGameScene from './BaseGameScene.js';
import { CustomButton } from '../../UI/Button.js';
import { CustomPanel, CustomFailPanel } from '../../UI/Panel.js';
import GameManager from '../GameManager.js';

export class GameScene_4 extends BaseGameScene {
    constructor() {
        super('GameScene_4');
    }
    preload() {
        const path = 'assets/images/Game_4/';

        this.width = this.cameras.main.width;
        this.height = this.cameras.main.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;


        this.load.image('game4_npc_box_mainstreet_fail_01', `${path}game4_npc_box1.png`);
        this.load.image('game4_npc_box_mainstreet_fail_02', `${path}game4_npc_box2.png`);
        this.load.image('game4_npc_box_mainstreet', `${path}game4_npc_box3.png`);

        this.load.image('game4_npc_box_win', `${path}game4_npc_box4.png`);
        this.load.image('game4_npc_box_tryagain', `${path}game4_npc_box5.png`);
        this.load.image('up_btn', `${path}game4_up_button.png`);
        this.load.image('up_btn_click', `${path}game4_up_button_click.png`);
        this.load.image('down_btn', `${path}game4_down_button.png`);
        this.load.image('down_btn_click', `${path}game4_down_button_click.png`);
        this.load.image('left_btn', `${path}game4_left_button.png`);
        this.load.image('left_btn_click', `${path}game4_left_button_click.png`);
        this.load.image('right_btn', `${path}game4_right_button.png`);
        this.load.image('right_btn_click', `${path}game4_right_button_click.png`);


        for (let i = 1; i <= 3; i++) {
            this.load.image(`game4_fail_object${i}`, `${path}game4_fail_object${i}.png`);
            this.load.image(`game4_success_object${i}`, `${path}game4_success_object${i}.png`);
        }

        this.gender = 'M';
        if (localStorage.getItem('player')) {
            this.gender = JSON.parse(localStorage.getItem('player')).gender;
        }
        if (this.gender === 'M') {
            this.load.spritesheet('boy_backstop', path +
                'game4_boy_backstop.png', { frameWidth: 105, frameHeight: 105 });

            this.load.spritesheet('boy_backwalking', path +
                'game4_boy_backwalking.png', { frameWidth: 105, frameHeight: 105 });

            this.load.spritesheet('boy_frontstop', path +
                'game4_boy_frontstop.png', { frameWidth: 105, frameHeight: 105 });

            this.load.spritesheet('boy_frontwalking', path +
                'game4_boy_frontwalking.png', { frameWidth: 105, frameHeight: 105 });

            this.load.spritesheet('boy_leftstop', path +
                'game4_boy_leftstop.png', { frameWidth: 105, frameHeight: 105 });

            this.load.spritesheet('boy_leftwalking', path +
                'game4_boy_leftwalking.png', { frameWidth: 105, frameHeight: 105 });

            this.load.spritesheet('boy_rightstop', path +
                'game4_boy_rightstop.png', { frameWidth: 105, frameHeight: 105 });

            this.load.spritesheet('boy_rightwalking', path +
                'game4_boy_rightwalking.png', { frameWidth: 105, frameHeight: 105 });
        } else {
            this.load.spritesheet('girl_backstop', path +
                'game4_girl_backstop.png', { frameWidth: 105, frameHeight: 105 });

            this.load.spritesheet('girl_backwalking', path +
                'game4_girl_backwalking.png', { frameWidth: 105, frameHeight: 105 });

            this.load.spritesheet('girl_frontwalking', path +
                'game4_girl_frontwalking.png', { frameWidth: 105, frameHeight: 105 });

            this.load.spritesheet('girl_leftstop', path +
                'game4_girl_leftstop.png', { frameWidth: 105, frameHeight: 105 });

            this.load.spritesheet('girl_leftwalking', path +
                'game4_girl_leftwalking.png', { frameWidth: 105, frameHeight: 105 });

            this.load.spritesheet('girl_rightstop', path +
                'game4_girl_rightstop.png', { frameWidth: 105, frameHeight: 105 });

            this.load.spritesheet('girl_rightwalking', path +
                'game4_girl_rightwalking.png', { frameWidth: 105, frameHeight: 105 });
        }

    }

    create() {
        this.createAnimations();

        // Movement settings
        this.moveStep = 60;  // Pixels per move
        this.isMoving = false;

        // Player start position
        this.playerStartX = this.centerX;
        this.playerStartY = 800;
        console.log('Player start position:', this.playerStartX, this.playerStartY);


        this.initGame('game4_bg', 'game4_description', true, false, {
            targetRounds: 3,
            roundPerSeconds: 60000,
            isAllowRoundFail: true,
            isContinuousTimer: true,
            sceneIndex: 4
        });

        //  this.gameUI.descriptionPanel.setVisible(false);

        // Direction buttons
        this.leftBtn = new CustomButton(this, 1500, 950, 'left_btn', 'left_btn_click', () => {
            this.moveDirection('left');
        }, () => { }).setDepth(2);

        this.rightBtn = new CustomButton(this, 1800, 950, 'right_btn', 'right_btn_click', () => {
            this.moveDirection('right');
        }, () => { }).setDepth(2);

        this.upBtn = new CustomButton(this, 1650, 800, 'up_btn', 'up_btn_click', () => {
            this.moveDirection('up');
        }, () => { }).setDepth(2);

        this.downBtn = new CustomButton(this, 1650, 950, 'down_btn', 'down_btn_click', () => {
            this.moveDirection('down');
        }, () => { }).setDepth(2);

        // Character setup
        this.genderKey = this.gender === 'M' ? 'boy' : 'girl';
        console.log('genderKey:', this.genderKey);

        // Use frontstop for boy, frontwalking for girl (girl_frontstop doesn't exist)
        const idleKey = this.gender === 'M' ? 'frontstop' : 'frontwalking';
        this.idleAnimKey = `${this.genderKey}_${idleKey}_anim`;
        this.lastDirection = 'down';

        // Create player at starting position as a normal sprite (NO physics body)
        this.player = this.add.sprite(this.playerStartX, this.playerStartY, `${this.genderKey}_${idleKey}`)
            .setOrigin(0.5, 0.5).setDepth(2).setScale(2);

        this.failObjects = [];
        this.successObjects = [];
        this.maxFailObjects = 9;
        this.maxSuccessObjects = 9;
        this.collectedSuccessObjects = 0;
        this.lives = 3;
        this.placeFailObjects();
        this.placeSuccessObjects();

        this.createWallColliders();

        // Debug: visualize player collision box (set to false to hide)
        this.debugCollider = true;
        this.debugGraphics = this.add.graphics().setDepth(999);

    }

    update(time, delta) {
        if (!this.isGameActive) return;
        super.update(time, delta);

        this.checkFailCollision();
        this.checkSuccessCollection();
    }

    createWallColliders() {
        this.wallRects = [];

        const debugVisible = false;
        // Outer boundary walls
        this.createWall(this.centerX, 160, 2300, 210, debugVisible, true);
        this.createWall(this.centerX + 480, 250, 800, 150, debugVisible, true);
        this.createWall(this.centerX, this.centerY + 450, 2300, 230, debugVisible, true);
        this.createWall(this.centerX + 550, this.centerY + 430, 500, 210, debugVisible, true);

        // Interior walls
        this.createWall(800, 450, 290, 190, debugVisible, true);
        this.createWall(this.centerX - 520, this.centerY + 130, 280, 250, debugVisible, true);
        this.createWall(this.centerX - 430, this.centerY + 90, 400, 140, debugVisible, true);
        this.createWall(this.centerX - 180, this.centerY + 330, 250, 150, debugVisible, true);
        this.createWall(1000, 680, 320, 60, debugVisible, true);
        this.createWall(1050, 500, 750, 120, debugVisible, true);
        // Top-left / right grass/tree area
        this.createWall(100, 350, 250, 180, debugVisible, true);
        // Left side vertical grass path
        this.createWall(0, 520, 150, 980, debugVisible, true);
        // Bottom-left grass
        this.createWall(200, 800, 50, 500, debugVisible, true);
        this.createWall(120, 850, 100, 100, debugVisible, true);
        this.createWall(400, 320, 150, 100, debugVisible, true);
        this.createWall(450, 420, 280, 100, debugVisible, true);

        this.createWall(1100, 850, 180, 120, debugVisible, true);
        this.createWall(1820, 780, 150, 120, debugVisible, true);
        this.createWall(1870, 350, 100, 980, debugVisible, true);
        this.createWall(900, 560, 140, 180, debugVisible, true);
        this.createWall(1350, 600, 150, 330, debugVisible, true);
        this.createWall(1620, 690, 240, 350, debugVisible, true);
        this.createWall(1650, 320, 280, 200, debugVisible, true);

    }
    createWall(x, y, width, height, visible = false, confirmed = false) {
        // Only create a visible rectangle in debug mode — rendering 22+ overlays every frame is expensive
        if (visible) {
            const color = confirmed ? 0x00ff00 : 0xff0000;
            this.add.rectangle(x, y, width, height, color, 0.3).setDepth(500);
        }

        this.wallRects.push({
            x: x - width / 2,
            y: y - height / 2,
            width: width,
            height: height
        });
    }


    moveDirection(direction) {
        if (this.isMoving || !this.isGameActive) return;

        let targetX = this.player.x;
        let targetY = this.player.y;
        let walkAnimKey, stopAnimKey;

        switch (direction) {
            case 'left':
                targetX -= this.moveStep;
                walkAnimKey = `${this.genderKey}_leftwalking_anim`;
                stopAnimKey = `${this.genderKey}_leftstop_anim`;
                break;
            case 'right':
                targetX += this.moveStep;
                walkAnimKey = `${this.genderKey}_rightwalking_anim`;
                stopAnimKey = `${this.genderKey}_rightstop_anim`;
                break;
            case 'up':
                targetY -= this.moveStep;
                walkAnimKey = `${this.genderKey}_backwalking_anim`;
                stopAnimKey = `${this.genderKey}_backstop_anim`;
                break;
            case 'down':
                targetY += this.moveStep;
                walkAnimKey = `${this.genderKey}_frontwalking_anim`;
                stopAnimKey = this.gender === 'M'
                    ? `${this.genderKey}_frontstop_anim`
                    : `${this.genderKey}_frontwalking_anim`;
                break;
        }

        // Manual intersection check against walls using points instead of Arcade physics
        if (this.wouldCollideWithWall(targetX - 20, targetY - 30)) {
            console.log('[GameScene_4] Blocked by wall!');
            return;
        }

        this.lastDirection = direction;
        this.isMoving = true;

        this.player.anims.play(walkAnimKey, true);

        // Smoothly tween the position since arcade physics velocity isn't being used
        this.tweens.add({
            targets: this.player,
            x: targetX,
            y: targetY,
            duration: 250,
            ease: 'Linear',
            onComplete: () => {
                this.isMoving = false;
                this.player.anims.play(stopAnimKey, true);

            }
        });
    }

    wouldCollideWithWall(x, y) {
        const hitBBoxSize = 20;
        // Offset down to the character's feet (sprite is 105px * scale 2 = 210px tall, feet ~90px below center)
        const feetY = y + 90;
        const playerRect = new Phaser.Geom.Rectangle(x - hitBBoxSize / 2, feetY - hitBBoxSize / 2, hitBBoxSize, hitBBoxSize);

        let colliding = false;
        for (const wall of this.wallRects) {
            const wallRect = new Phaser.Geom.Rectangle(wall.x, wall.y, wall.width, wall.height);
            if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, wallRect)) {
                colliding = true;
                break;
            }
        }

        // if (this.debugCollider && this.debugGraphics) {
        //     this.debugGraphics.clear();
        //     // Red when colliding, cyan when free
        //     this.debugGraphics.lineStyle(2, colliding ? 0xff0000 : 0x00ffff, 1);
        //     this.debugGraphics.strokeRect(playerRect.x, playerRect.y, playerRect.width, playerRect.height);
        //     // Show coin collection radius in yellow
        //     this.debugGraphics.lineStyle(1, 0xffff00, 0.6);
        //     this.debugGraphics.strokeCircle(x, y, 80);
        // }

        return colliding;
    }

    /** Check collision with fail objects using distance */
    checkFailCollision() {
        const hitRadius = 80;
        for (const failObj of this.failObjects) {
            if (!failObj.visible) continue;
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, failObj.x, failObj.y);
            if (dist < hitRadius) {
                failObj.setVisible(false);
                this.lives--;
                console.log(`[GameScene_4] Fail object hit! Lives: ${this.lives}`);
                this.handleLose();
                return;
            }
        }
    }

    /** Check collection of success objects using distance */
    checkSuccessCollection() {
        const pickupRadius = 80;
        for (const successObj of this.successObjects) {
            if (!successObj.visible) continue;
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, successObj.x, successObj.y);
            if (dist < pickupRadius) {
                successObj.setVisible(false);
                this.collectedSuccessObjects++;
                console.log(`[GameScene_4] Success object collected! (${this.collectedSuccessObjects}/3)`);
                if (this.collectedSuccessObjects >= 3) {
                    console.log('[GameScene_4] 3 success objects collected! You win!');
                    this.onRoundWin();
                }
                return;
            }
        }
    }

    placeFailObjects() {

        const failObjectPositions = [
            { x: 250, y: 330 },
            { x: 100, y: 500 },
            { x: 600, y: 350 },
            { x: 780, y: 600 },
            { x: 850, y: 280 },
            { x: 1200, y: 380 },
            { x: 1200, y: 580 },
            { x: 1450, y: 450 },
            { x: 1780, y: 650 },
        ];

        Phaser.Utils.Array.Shuffle(failObjectPositions);

        failObjectPositions.forEach(pos => {
            if (this.failObjects.length == this.maxFailObjects) return;
            const randomFail = `game4_fail_object${Phaser.Math.Between(1, 3)}`;
            const failSprite = this.add.image(pos.x, pos.y, randomFail).setDepth(2);
            this.failObjects.push(failSprite);
        });
        console.log(`[GameScene_4] Placed ${this.failObjects.length} fail objects`);
    }

    placeSuccessObjects() {

        const successObjectPositions = [
            { x: 100, y: 700 },
            { x: 280, y: 420 },   // Upper-left corridor
            { x: 600, y: 500 },   // Center path
            { x: 750, y: 300 },
            { x: 1000, y: 300 }, // Upper middle
            { x: 1200, y: 700 },  // Lower-right path
            { x: 1450, y: 350 },
            { x: 1450, y: 650 },
            { x: 1780, y: 450 },// Far right upper
        ];

        Phaser.Utils.Array.Shuffle(successObjectPositions);

        successObjectPositions.forEach(pos => {
            if (this.successObjects.length == this.maxSuccessObjects) return;
            const randomSuccess = `game4_success_object${Phaser.Math.Between(1, 3)}`;
            const successSprite = this.add.image(pos.x, pos.y, randomSuccess).setDepth(2);
            this.successObjects.push(successSprite);
        });
        console.log(`[GameScene_4] Placed ${this.successObjects.length} success objects`);
    }

    enableGameInteraction(enabled) {
        this.canSpawn = enabled;
        this.leftBtn.setVisible(enabled);
        this.rightBtn.setVisible(enabled);
        this.upBtn.setVisible(enabled);
        this.downBtn.setVisible(enabled);

        if (enabled) {
            this.leftBtn.setInteractive();
            this.rightBtn.setInteractive();
            this.upBtn.setInteractive();
            this.downBtn.setInteractive();
        } else {
            this.leftBtn.disableInteractive();
            this.rightBtn.disableInteractive();
            this.upBtn.disableInteractive();
            this.downBtn.disableInteractive();
        }
    }

    /** Reset player position only */
    resetPlayerPosition() {
        this.isMoving = false;
        if (this.player) {
            this.player.x = this.playerStartX;
            this.player.y = this.playerStartY;
            this.player.anims.play(this.idleAnimKey, true);
        }
    }

    resetForNewRound() {
        this.isMoving = false;
        this.lives = 3;
        this.collectedSuccessObjects = 0;

        if (this.player) {
            this.player.x = this.playerStartX;
            this.player.y = this.playerStartY;
            this.player.anims.play(this.idleAnimKey, true);
        }

        // Destroy and re-place items
        if (this.failObjects) {
            this.failObjects.forEach(c => c.destroy());
            this.failObjects = [];
        }
        if (this.successObjects) {
            this.successObjects.forEach(p => p.destroy());
            this.successObjects = [];
        }
        this.placeFailObjects();
        this.placeSuccessObjects();

    }

    showWin() {
        this.showObjectPanel();
    }

    showObjectPanel() {
        const objectPanel = new CustomPanel(this, 960, 600, [{
            content: 'game4_object_description',
            closeBtn: 'close_btn',
            closeBtnClick: 'close_btn_click'
        }]);
        objectPanel.setDepth(1000);
        objectPanel.show();
        objectPanel.setCloseCallBack(() => GameManager.backToMainStreet(this));
    }

    createAnimations() {
        // Skip if already created (e.g. on scene restart)
        if (this.anims.exists('boy_backstop_anim')) return;

        // Boy animations
        this.anims.create({
            key: 'boy_backstop_anim',
            frames: this.anims.generateFrameNumbers('boy_backstop', { start: 0, end: 47 }),
            frameRate: 30,
            repeat: -1
        });
        this.anims.create({
            key: 'boy_backwalking_anim',
            frames: this.anims.generateFrameNumbers('boy_backwalking', { start: 0, end: 66 }),
            frameRate: 30,
            repeat: -1
        });
        this.anims.create({
            key: 'boy_frontstop_anim',
            frames: this.anims.generateFrameNumbers('boy_frontstop', { start: 0, end: 47 }),
            frameRate: 30,
            repeat: -1
        });
        this.anims.create({
            key: 'boy_frontwalking_anim',
            frames: this.anims.generateFrameNumbers('boy_frontwalking', { start: 0, end: 47 }),
            frameRate: 30,
            repeat: -1
        });
        this.anims.create({
            key: 'boy_leftstop_anim',
            frames: this.anims.generateFrameNumbers('boy_leftstop', { start: 0, end: 47 }),
            frameRate: 30,
            repeat: -1
        });
        this.anims.create({
            key: 'boy_leftwalking_anim',
            frames: this.anims.generateFrameNumbers('boy_leftwalking', { start: 0, end: 66 }),
            frameRate: 30,
            repeat: -1
        });
        this.anims.create({
            key: 'boy_rightstop_anim',
            frames: this.anims.generateFrameNumbers('boy_rightstop', { start: 0, end: 47 }),
            frameRate: 30,
            repeat: -1
        });
        this.anims.create({
            key: 'boy_rightwalking_anim',
            frames: this.anims.generateFrameNumbers('boy_rightwalking', { start: 0, end: 66 }),
            frameRate: 30,
            repeat: -1
        });

        // Girl animations
        this.anims.create({
            key: 'girl_backstop_anim',
            frames: this.anims.generateFrameNumbers('girl_backstop', { start: 0, end: 66 }),
            frameRate: 30,
            repeat: -1
        });
        this.anims.create({
            key: 'girl_backwalking_anim',
            frames: this.anims.generateFrameNumbers('girl_backwalking', { start: 0, end: 66 }),
            frameRate: 30,
            repeat: -1
        });
        this.anims.create({
            key: 'girl_frontwalking_anim',
            frames: this.anims.generateFrameNumbers('girl_frontwalking', { start: 0, end: 66 }),
            frameRate: 30,
            repeat: -1
        });
        this.anims.create({
            key: 'girl_leftstop_anim',
            frames: this.anims.generateFrameNumbers('girl_leftstop', { start: 0, end: 66 }),
            frameRate: 30,
            repeat: -1
        });
        this.anims.create({
            key: 'girl_leftwalking_anim',
            frames: this.anims.generateFrameNumbers('girl_leftwalking', { start: 0, end: 66 }),
            frameRate: 30,
            repeat: -1
        });
        this.anims.create({
            key: 'girl_rightstop_anim',
            frames: this.anims.generateFrameNumbers('girl_rightstop', { start: 0, end: 66 }),
            frameRate: 30,
            repeat: -1
        });
        this.anims.create({
            key: 'girl_rightwalking_anim',
            frames: this.anims.generateFrameNumbers('girl_rightwalking', { start: 0, end: 66 }),
            frameRate: 30,
            repeat: -1
        });
    }
}