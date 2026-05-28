// --- 1. INTERFACES ---
interface Platform { x: number; y: number; w: number; h: number; platType: string }
interface LevelData { spawnX: number; spawnY: number; platforms: Platform[] }

// --- 2. CONSTANTS & STATE ---
const GRAVITY = 500
const MAX_CHARGE = 300
const CHARGE_RATE = 55
const MOVE_SPEED = 75
const WALL_BOUNCE = 60

let isCharging = false
let chargeLevel = 0
let currentStage = 0
let totalScore = 100

// --- 3. THE LEVELS ---
const levels: LevelData[] = [
    { spawnX: 20, spawnY: 40, platforms: [{ x: -10, y: 0, w: 10, h: 180, platType: "normal" }, { x: 0, y: 80, w: 80, h: 100, platType: "normal" }, { x: 80, y: 100, w: 80, h: 80, platType: "normal" }, { x: 160, y: 80, w: 80, h: 100, platType: "normal" }, { x: 240, y: 110, w: 60, h: 70, platType: "normal" }, { x: 300, y: 50, w: 50, h: 130, platType: "normal" }, { x: 350, y: 80, w: 60, h: 100, platType: "goal" }, { x: 410, y: 0, w: 20, h: 180, platType: "normal" }] },
    { spawnX: 10, spawnY: 40, platforms: [{ x: 0, y: 80, w: 50, h: 40, platType: "normal" }, { x: 100, y: 80, w: 50, h: 40, platType: "normal" }, { x: 180, y: 65, w: 60, h: 15, platType: "normal" }, { x: 280, y: 45, w: 60, h: 15, platType: "normal" }, { x: 380, y: 30, w: 50, h: 120, platType: "goal" }] },
    // LEVEL 3 - Platform before goal extended from 25 to 45
    { spawnX: 10, spawnY: 60, platforms: [{ x: 0, y: 90, w: 50, h: 30, platType: "normal" }, { x: 80, y: 45, w: 40, h: 10, platType: "normal" }, { x: 150, y: 100, w: 20, h: 40, platType: "normal" }, { x: 200, y: 90, w: 45, h: 50, platType: "normal" }, { x: 280, y: 65, w: 45, h: 70, platType: "normal" }, { x: 350, y: 25, w: 60, h: 10, platType: "goal" }] },
    { spawnX: 10, spawnY: 60, platforms: [{ x: 0, y: 100, w: 80, h: 20, platType: "normal" }, { x: 120, y: 40, w: 30, h: 10, platType: "normal" }, { x: 120, y: 80, w: 60, h: 10, platType: "normal" }, { x: 220, y: 90, w: 40, h: 10, platType: "normal" }, { x: 300, y: 60, w: 40, h: 80, platType: "normal" }, { x: 380, y: 100, w: 60, h: 20, platType: "normal" }, { x: 480, y: 70, w: 60, h: 10, platType: "goal" }] }
]

// --- 4. SPRITES & ASSETS ---
const frogIdle = img`
    . . . . . . . . . . . . . . . . 
    . . 7 7 7 . . . . . 7 7 7 . . . 
    . 7 7 1 1 7 7 7 7 7 1 1 7 7 . . 
    . 7 7 1 f 7 7 7 7 7 1 f 7 7 . . 
    7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 . 
    7 7 3 3 7 7 7 7 7 7 7 3 3 7 7 . 
    7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 . 
    7 7 7 7 7 6 6 6 6 6 7 7 7 7 7 . 
    . 7 7 7 7 7 7 7 7 7 7 7 7 7 7 . 
    . . 7 7 . . . . . . . 7 7 . . . 
`
const frogCharging = img`
    . . . . . . . . . . . . . . . . 
    . . 4 4 4 . . . . . 4 4 4 . . . 
    . 4 4 1 1 4 4 4 4 4 1 1 4 4 . . 
    . 4 4 1 f 4 4 4 4 4 1 f 4 4 . . 
    4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 . 
    4 4 2 2 4 4 4 4 4 4 4 2 2 4 4 . 
    4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 . 
    . 4 4 4 . . . . . . . 4 4 4 . . 
`
const starImg = img`
    . . . . . . . . . . . . . . . . 
    . . . . . . . 5 . . . . . . . . 
    . . . . . . 5 5 5 . . . . . . . 
    . . . . 5 5 5 5 5 5 5 . . . . . 
    . . . . . 5 5 5 5 5 . . . . . . 
    . . . . 5 5 5 5 5 5 5 . . . . . 
    . . . . . 5 . . . 5 . . . . . . 
`

let player = sprites.create(frogIdle, SpriteKind.Player)
player.ay = GRAVITY
player.z = 100
scene.cameraFollowSprite(player)
scene.setBackgroundColor(9)

function loadStage(index: number) {
    isCharging = false;
    chargeLevel = 0;
    player.sayText("");

    for (let s of sprites.allOfKind(SpriteKind.Food)) s.destroy()
    for (let b of sprites.allOfKind(SpriteKind.Enemy)) b.destroy()

    let data = levels[index]
    player.setPosition(data.spawnX, data.spawnY)
    player.vx = 0
    player.vy = 0
    player.setImage(frogIdle)

    for (let p of data.platforms) {
        let platImg = image.create(p.w, p.h)
        if (p.platType == "goal") {
            platImg.fill(5)
            platImg.drawLine(0, 0, p.w, 0, 4)
            for (let i = 0; i < 5; i++) platImg.setPixel(Math.randomRange(0, p.w), Math.randomRange(2, p.h), 1)
        } else {
            platImg.fill(13)
            for (let i = 0; i < (p.w * p.h) / 20; i++) {
                platImg.setPixel(Math.randomRange(0, p.w), Math.randomRange(4, p.h), 14)
            }
            platImg.fillRect(0, 0, p.w, 3, 7)
            platImg.drawLine(0, 0, p.w, 0, 6)
            for (let i = 0; i < p.w; i += 2) platImg.setPixel(i, 3, 7)
        }

        let plat = sprites.create(platImg, SpriteKind.Food)
        plat.setPosition(p.x + p.w / 2, p.y + p.h / 2)
        plat.z = 10

        if (p.platType == "goal") {
            let star = sprites.create(starImg, SpriteKind.Enemy)
            star.setPosition(p.x + p.w / 2, p.y - 12)
            star.z = 11
        }
    }
}

// --- CORE LOGIC & PHYSICS ---
game.onUpdate(function () {
    let standing = false
    let onWall = false

    for (let p of sprites.allOfKind(SpriteKind.Food)) {
        let isGoal = (p.image.getPixel(0, 0) == 5);
        if (player.overlapsWith(p)) {
            let oL = player.right - p.left;
            let oR = p.right - player.left;
            let oT = player.bottom - p.top;
            let realOB = p.bottom - player.top;
            let minOverlap = Math.min(Math.min(oL, oR), Math.min(oT, realOB));

            if (minOverlap == oT && player.vy >= 0) {
                player.bottom = p.top;
                player.vy = 0;
                standing = true;
            } else if (!isGoal) {
                if (minOverlap == realOB && player.vy < 0) {
                    player.top = p.bottom;
                    player.vy = 0;
                } else if (minOverlap == oL) {
                    player.right = p.left;
                    if (!standing) player.vx = -WALL_BOUNCE;
                    onWall = true;
                } else if (minOverlap == oR) {
                    player.left = p.right;
                    if (!standing) player.vx = WALL_BOUNCE;
                    onWall = true;
                }
            }
        }
    }

    for (let s of sprites.allOfKind(SpriteKind.Enemy)) {
        if (player.overlapsWith(s)) nextLevel();
    }

    if (standing || onWall) {
        if (Math.abs(player.vx) < 10) player.vx = 0;
        if (controller.A.isPressed()) {
            isCharging = true;
            player.setImage(frogCharging);
            if (chargeLevel < MAX_CHARGE) chargeLevel += CHARGE_RATE;
            let displayPct = Math.floor(Math.min(100, (chargeLevel / MAX_CHARGE) * 100));
            player.sayText(displayPct + "%");
        } else if (isCharging) {
            player.sayText("");
            let finalJump = Math.max(70, Math.min(MAX_CHARGE, chargeLevel));
            player.vy = -finalJump;
            player.vx = MOVE_SPEED;
            isCharging = false;
            chargeLevel = 0;
            player.setImage(frogIdle);
        }
    }

    if (player.y > 220) {
        totalScore -= 10;
        loadStage(currentStage);
    }
})

function nextLevel() {
    player.vx = 0; player.vy = 0;
    totalScore += 100;
    music.baDing.play();
    effects.confetti.startScreenEffect(500);
    currentStage++;
    if (currentStage < levels.length) {
        pause(500);
        loadStage(currentStage);
    } else {
        game.over(true);
    }
}

// --- ART & DECORATIONS ---
game.onPaint(function () {
    let hillColor = 3
    let parallaxFactor = 0.2
    let hillPos = (scene.cameraLeft() * parallaxFactor) % 160

    screen.fillCircle(80 - hillPos, 140, 60, hillColor)
    screen.fillCircle(180 - hillPos, 150, 70, hillColor)
    screen.fillCircle(-20 - hillPos, 150, 50, hillColor)

    screen.fillCircle(140, 20, 14, 4)
    screen.fillCircle(140, 20, 10, 5)

    screen.fillRect(0, 0, 160, 16, 15)
    screen.drawLine(0, 16, 160, 16, 1)
    screen.print("SCORE: " + totalScore, 5, 4, 1)
    screen.print("LEVEL: " + (currentStage + 1), 95, 4, 5)
})

game.onUpdateInterval(2500, function () {
    let size = Math.randomRange(10, 25)
    let cloud = sprites.create(image.create(size, 12), SpriteKind.Projectile)
    cloud.image.fillCircle(size / 4, 6, 5, 1)
    cloud.image.fillCircle(size / 2, 6, 6, 1)
    cloud.image.fillCircle((3 * size) / 4, 6, 5, 1)
    cloud.setPosition(scene.cameraLeft() - 30, Math.randomRange(25, 70))
    cloud.vx = Math.randomRange(5, 15)
    cloud.z = -2
    cloud.setFlag(SpriteFlag.Ghost, true)
    cloud.setFlag(SpriteFlag.AutoDestroy, true)
})

loadStage(0)