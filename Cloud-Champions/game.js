// Spiel-Konfiguration
const config = {
    canvas: null,
    ctx: null,
    width: 800,
    height: 600,
    gravity: 0.8,
    friction: 0.85,
    jumpStrength: 18,
    moveSpeed: 5
};

// Spielzustand
const gameState = {
    score: 0,
    level: 1,
    lives: 3,
    isPaused: false,
    keys: {},
    currentLevel: null,
    bullets: []
};

// Projektil-Klasse
class Bullet {
    constructor(x, y, direction) {
        this.x = x;
        this.y = y;
        this.radius = 5;
        this.speed = 10;
        this.direction = direction; // 1 für rechts, -1 für links
        this.active = true;
    }

    draw(ctx) {
        if (!this.active) return;

        // Projektil als leuchtende Kugel
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Glüheffekt
        ctx.fillStyle = 'rgba(255, 215, 0, 0.5)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 3, 0, Math.PI * 2);
        ctx.fill();
    }

    update() {
        this.x += this.speed * this.direction;

        // Deaktivieren wenn außerhalb des Bildschirms
        if (this.x < 0 || this.x > config.width) {
            this.active = false;
        }
    }

    checkEnemyCollision(enemy) {
        if (!this.active) return false;

        const dx = this.x - (enemy.x + enemy.width / 2);
        const dy = this.y - (enemy.y + enemy.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance < this.radius + enemy.width / 2;
    }
}

// Spieler-Klasse
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 60;
        this.velocityX = 0;
        this.velocityY = 0;
        this.isJumping = false;
        this.facingRight = true;
        this.color = '#FF6B6B';
        this.animationFrame = 0;
        this.animationCounter = 0;
        this.shootCooldown = 0;
        this.maxShootCooldown = 15; // Frames zwischen Schüssen
    }

    draw(ctx) {
        // Körper (Torso)
        ctx.fillStyle = '#4ECDC4';
        const bodyX = this.x + this.width * 0.2;
        const bodyY = this.y + this.height * 0.3;
        const bodyWidth = this.width * 0.6;
        const bodyHeight = this.height * 0.4;
        ctx.fillRect(bodyX, bodyY, bodyWidth, bodyHeight);

        // Kopf
        ctx.fillStyle = '#FFE66D';
        const headRadius = this.width * 0.35;
        const headX = this.x + this.width / 2;
        const headY = this.y + headRadius;
        ctx.beginPath();
        ctx.arc(headX, headY, headRadius, 0, Math.PI * 2);
        ctx.fill();

        // Augen
        ctx.fillStyle = '#000';
        const eyeOffset = this.facingRight ? 3 : -3;
        ctx.beginPath();
        ctx.arc(headX - 5 + eyeOffset, headY - 3, 3, 0, Math.PI * 2);
        ctx.arc(headX + 5 + eyeOffset, headY - 3, 3, 0, Math.PI * 2);
        ctx.fill();

        // Lächeln
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(headX + eyeOffset / 2, headY + 3, 8, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // Arme
        ctx.strokeStyle = '#FFE66D';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        
        const armSwing = Math.sin(this.animationFrame * 0.3) * 10;
        
        // Linker Arm
        ctx.beginPath();
        ctx.moveTo(bodyX + 5, bodyY + 10);
        ctx.lineTo(bodyX - 10, bodyY + 20 + armSwing);
        ctx.stroke();
        
        // Rechter Arm
        ctx.beginPath();
        ctx.moveTo(bodyX + bodyWidth - 5, bodyY + 10);
        ctx.lineTo(bodyX + bodyWidth + 10, bodyY + 20 - armSwing);
        ctx.stroke();

        // Beine
        const legSwing = Math.sin(this.animationFrame * 0.3) * 8;
        
        // Linkes Bein
        ctx.beginPath();
        ctx.moveTo(bodyX + bodyWidth * 0.3, bodyY + bodyHeight);
        ctx.lineTo(bodyX + bodyWidth * 0.2 + legSwing, this.y + this.height);
        ctx.stroke();
        
        // Rechtes Bein
        ctx.beginPath();
        ctx.moveTo(bodyX + bodyWidth * 0.7, bodyY + bodyHeight);
        ctx.lineTo(bodyX + bodyWidth * 0.8 - legSwing, this.y + this.height);
        ctx.stroke();

        // Animation aktualisieren
        if (Math.abs(this.velocityX) > 0.1) {
            this.animationCounter++;
            if (this.animationCounter > 3) {
                this.animationFrame++;
                this.animationCounter = 0;
            }
        }
    }

    update() {
        // Bewegung
        if (gameState.keys['ArrowLeft'] || gameState.keys['a'] || gameState.keys['A']) {
            this.velocityX = -config.moveSpeed;
            this.facingRight = false;
        } else if (gameState.keys['ArrowRight'] || gameState.keys['d'] || gameState.keys['D']) {
            this.velocityX = config.moveSpeed;
            this.facingRight = true;
        } else {
            this.velocityX *= config.friction;
        }

        // Springen
        if ((gameState.keys[' '] || gameState.keys['ArrowUp'] || gameState.keys['w'] || gameState.keys['W']) && !this.isJumping) {
            this.velocityY = -config.jumpStrength;
            this.isJumping = true;
        }

        // Schießen mit Umschalttaste
        if (gameState.keys['Shift']) {
            this.shoot();
        }

        // Cooldown verringern
        if (this.shootCooldown > 0) {
            this.shootCooldown--;
        }

        // Schwerkraft anwenden
        this.velocityY += config.gravity;

        // Position aktualisieren
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Bildschirmgrenzen
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > config.width) this.x = config.width - this.width;

        // Boden-Kollision
        if (this.y + this.height > config.height) {
            this.y = config.height - this.height;
            this.velocityY = 0;
            this.isJumping = false;
        }

        // Tod durch Herunterfallen
        if (this.y > config.height + 100) {
            this.die();
        }
    }

    shoot() {
        if (this.shootCooldown > 0) return;

        // Projektil erstellen
        const bulletX = this.facingRight ? this.x + this.width : this.x;
        const bulletY = this.y + this.height / 2;
        const direction = this.facingRight ? 1 : -1;

        gameState.bullets.push(new Bullet(bulletX, bulletY, direction));
        this.shootCooldown = this.maxShootCooldown;
    }

    die() {
        gameState.lives--;
        updateLivesDisplay();
        
        if (gameState.lives <= 0) {
            gameOver();
        } else {
            this.reset();
        }
    }

    reset() {
        this.x = 50;
        this.y = 100;
        this.velocityX = 0;
        this.velocityY = 0;
        this.isJumping = false;
    }
}

// Plattform-Klasse
class Platform {
    constructor(x, y, width, height, type = 'normal') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
    }

    draw(ctx) {
        // Verschiedene Plattform-Typen
        switch(this.type) {
            case 'grass':
                // Gras-Plattform
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(this.x, this.y, this.width, this.height);
                ctx.fillStyle = '#7CFC00';
                ctx.fillRect(this.x, this.y, this.width, 5);
                break;
            case 'stone':
                // Stein-Plattform
                ctx.fillStyle = '#808080';
                ctx.fillRect(this.x, this.y, this.width, this.height);
                ctx.strokeStyle = '#696969';
                ctx.lineWidth = 2;
                ctx.strokeRect(this.x, this.y, this.width, this.height);
                break;
            default:
                // Normale Plattform
                ctx.fillStyle = '#2E8B57';
                ctx.fillRect(this.x, this.y, this.width, this.height);
                ctx.strokeStyle = '#228B22';
                ctx.lineWidth = 3;
                ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }

    checkCollision(player) {
        return player.x < this.x + this.width &&
               player.x + player.width > this.x &&
               player.y < this.y + this.height &&
               player.y + player.height > this.y;
    }
}

// Münzen-Klasse
class Coin {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 15;
        this.collected = false;
        this.rotation = 0;
    }

    draw(ctx) {
        if (this.collected) return;

        this.rotation += 0.1;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Äußerer Ring
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Innerer Ring
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();

        // Mittelpunkt
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    checkCollision(player) {
        if (this.collected) return false;

        const dx = (player.x + player.width / 2) - this.x;
        const dy = (player.y + player.height / 2) - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.radius + player.width / 3) {
            this.collected = true;
            gameState.score += 100;
            updateScoreDisplay();
            return true;
        }
        return false;
    }
}

// Gegner-Klasse
class Enemy {
    constructor(x, y, moveRange = 100) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.startX = x;
        this.moveRange = moveRange;
        this.speed = 2;
        this.direction = 1;
    }

    draw(ctx) {
        // Körper
        ctx.fillStyle = '#FF4444';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Augen
        ctx.fillStyle = '#FFF';
        ctx.fillRect(this.x + 8, this.y + 10, 8, 8);
        ctx.fillRect(this.x + 24, this.y + 10, 8, 8);

        // Pupillen
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 10, this.y + 12, 4, 4);
        ctx.fillRect(this.x + 26, this.y + 12, 4, 4);

        // Zähne
        ctx.fillStyle = '#FFF';
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(this.x + 5 + i * 8, this.y + this.height - 8, 6, 8);
        }
    }

    update() {
        // Hin- und herbewegen
        this.x += this.speed * this.direction;

        if (this.x > this.startX + this.moveRange || this.x < this.startX) {
            this.direction *= -1;
        }
    }

    checkCollision(player) {
        return player.x < this.x + this.width &&
               player.x + player.width > this.x &&
               player.y < this.y + this.height &&
               player.y + player.height > this.y;
    }
}

// Level-Klasse
class Level {
    constructor(levelNumber) {
        this.levelNumber = levelNumber;
        this.platforms = [];
        this.coins = [];
        this.enemies = [];
        this.goal = null;
        this.generateLevel();
    }

    generateLevel() {
        switch(this.levelNumber) {
            case 1:
                this.level1();
                break;
            case 2:
                this.level2();
                break;
            case 3:
                this.level3();
                break;
            default:
                this.generateRandomLevel();
        }
    }

    level1() {
        // Boden
        this.platforms.push(new Platform(0, 550, config.width, 50, 'grass'));
        
        // Plattformen
        this.platforms.push(new Platform(150, 450, 120, 20, 'grass'));
        this.platforms.push(new Platform(350, 380, 120, 20, 'grass'));
        this.platforms.push(new Platform(550, 310, 120, 20, 'grass'));
        this.platforms.push(new Platform(350, 240, 120, 20, 'grass'));
        this.platforms.push(new Platform(150, 170, 120, 20, 'grass'));
        
        // Münzen
        this.coins.push(new Coin(210, 420));
        this.coins.push(new Coin(410, 350));
        this.coins.push(new Coin(610, 280));
        this.coins.push(new Coin(410, 210));
        this.coins.push(new Coin(210, 140));
        
        // Gegner
        this.enemies.push(new Enemy(200, 510, 80));
        this.enemies.push(new Enemy(400, 340, 100));
        
        // Ziel
        this.goal = { x: 200, y: 100, width: 60, height: 70 };
    }

    level2() {
        // Boden
        this.platforms.push(new Platform(0, 550, 300, 50, 'stone'));
        this.platforms.push(new Platform(500, 550, 300, 50, 'stone'));
        
        // Schwebende Plattformen
        this.platforms.push(new Platform(100, 450, 100, 20, 'stone'));
        this.platforms.push(new Platform(300, 400, 100, 20, 'stone'));
        this.platforms.push(new Platform(500, 350, 100, 20, 'stone'));
        this.platforms.push(new Platform(300, 250, 100, 20, 'stone'));
        this.platforms.push(new Platform(100, 150, 100, 20, 'stone'));
        this.platforms.push(new Platform(600, 200, 150, 20, 'stone'));
        
        // Münzen
        this.coins.push(new Coin(150, 420));
        this.coins.push(new Coin(350, 370));
        this.coins.push(new Coin(550, 320));
        this.coins.push(new Coin(350, 220));
        this.coins.push(new Coin(150, 120));
        this.coins.push(new Coin(675, 170));
        
        // Gegner
        this.enemies.push(new Enemy(120, 410, 60));
        this.enemies.push(new Enemy(320, 360, 60));
        this.enemies.push(new Enemy(520, 310, 60));
        
        // Ziel
        this.goal = { x: 670, y: 120, width: 60, height: 80 };
    }

    level3() {
        // Komplexes Level
        this.platforms.push(new Platform(0, 550, 200, 50, 'grass'));
        this.platforms.push(new Platform(600, 550, 200, 50, 'grass'));
        
        // Treppe nach oben
        for (let i = 0; i < 5; i++) {
            this.platforms.push(new Platform(100 + i * 80, 470 - i * 70, 80, 20, 'stone'));
        }
        
        // Obere Plattformen
        this.platforms.push(new Platform(550, 200, 100, 20, 'stone'));
        this.platforms.push(new Platform(350, 150, 100, 20, 'stone'));
        this.platforms.push(new Platform(550, 100, 100, 20, 'stone'));
        
        // Münzen überall
        for (let i = 0; i < 5; i++) {
            this.coins.push(new Coin(140 + i * 80, 440 - i * 70));
        }
        this.coins.push(new Coin(600, 170));
        this.coins.push(new Coin(400, 120));
        this.coins.push(new Coin(600, 70));
        
        // Viele Gegner
        this.enemies.push(new Enemy(50, 510, 80));
        this.enemies.push(new Enemy(250, 360, 60));
        this.enemies.push(new Enemy(400, 220, 60));
        this.enemies.push(new Enemy(650, 510, 80));
        
        // Ziel
        this.goal = { x: 580, y: 20, width: 60, height: 80 };
    }

    generateRandomLevel() {
        // Zufälliges Level für höhere Level-Nummern
        const numPlatforms = 8 + this.levelNumber;
        const numCoins = 5 + this.levelNumber;
        const numEnemies = 2 + Math.floor(this.levelNumber / 2);

        // Boden
        this.platforms.push(new Platform(0, 550, config.width, 50, 'grass'));

        // Zufällige Plattformen
        for (let i = 0; i < numPlatforms; i++) {
            const x = Math.random() * (config.width - 150);
            const y = 150 + Math.random() * 350;
            const width = 80 + Math.random() * 100;
            this.platforms.push(new Platform(x, y, width, 20, 'stone'));
        }

        // Zufällige Münzen
        for (let i = 0; i < numCoins; i++) {
            const x = 50 + Math.random() * (config.width - 100);
            const y = 100 + Math.random() * 400;
            this.coins.push(new Coin(x, y));
        }

        // Zufällige Gegner
        for (let i = 0; i < numEnemies; i++) {
            const x = Math.random() * (config.width - 100);
            const y = 510;
            this.enemies.push(new Enemy(x, y, 60 + Math.random() * 100));
        }

        // Ziel
        this.goal = { x: config.width - 100, y: 100, width: 60, height: 80 };
    }

    drawGoal(ctx) {
        if (!this.goal) return;

        // Flagge zeichnen
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.goal.x + 5, this.goal.y, 8, this.goal.height);

        // Fahne
        ctx.fillStyle = '#32CD32';
        ctx.beginPath();
        ctx.moveTo(this.goal.x + 13, this.goal.y + 5);
        ctx.lineTo(this.goal.x + 50, this.goal.y + 20);
        ctx.lineTo(this.goal.x + 13, this.goal.y + 35);
        ctx.closePath();
        ctx.fill();

        // Text
        ctx.fillStyle = '#000';
        ctx.font = 'bold 12px Arial';
        ctx.fillText('ZIEL', this.goal.x + 8, this.goal.y + this.goal.height + 15);
    }

    checkGoalReached(player) {
        if (!this.goal) return false;

        return player.x < this.goal.x + this.goal.width &&
               player.x + player.width > this.goal.x &&
               player.y < this.goal.y + this.goal.height &&
               player.y + player.height > this.goal.y;
    }
}

// Spieler initialisieren
let player = new Player(50, 100);

// Tastatur-Events
document.addEventListener('keydown', (e) => {
    gameState.keys[e.key] = true;
    
    // R für Neustart
    if (e.key === 'r' || e.key === 'R') {
        restartGame();
    }
});

document.addEventListener('keyup', (e) => {
    gameState.keys[e.key] = false;
});

// UI-Updates
function updateScoreDisplay() {
    document.getElementById('score').textContent = gameState.score;
}

function updateLevelDisplay() {
    document.getElementById('level').textContent = gameState.level;
}

function updateLivesDisplay() {
    const hearts = '❤️'.repeat(Math.max(0, gameState.lives));
    document.getElementById('lives').textContent = hearts || '💀';
}

// Level nicht geschafft - Level wiederholen
function gameOver() {
    gameState.isPaused = true;
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('currentLevelNumber').textContent = gameState.level;
    document.getElementById('gameOver').classList.remove('hidden');
}

// Level wiederholen (nach Verlust aller Leben)
function retryLevel() {
    gameState.lives = 3; // Leben zurücksetzen
    gameState.isPaused = false;
    gameState.bullets = [];
    gameState.currentLevel = new Level(gameState.level); // Aktuelles Level neu laden
    player.reset();
    player.shootCooldown = 0;
    document.getElementById('gameOver').classList.add('hidden');
    updateLivesDisplay();
}

// Level abgeschlossen
function levelComplete() {
    gameState.isPaused = true;
    document.getElementById('levelScore').textContent = gameState.score;
    document.getElementById('levelComplete').classList.remove('hidden');
}

// Nächstes Level
function nextLevel() {
    gameState.level++;
    gameState.lives = 3; // Leben auf 3 zurücksetzen für jedes neue Level
    gameState.isPaused = false;
    gameState.bullets = [];
    gameState.currentLevel = new Level(gameState.level);
    player.reset();
    player.shootCooldown = 0;
    document.getElementById('levelComplete').classList.add('hidden');
    updateLevelDisplay();
    updateLivesDisplay();
}

// Komplett neu starten (von Level 1, Punkte zurücksetzen)
function restartGame() {
    gameState.score = 0;
    gameState.level = 1;
    gameState.lives = 3;
    gameState.isPaused = false;
    gameState.bullets = [];
    gameState.currentLevel = new Level(1);
    player.reset();
    player.shootCooldown = 0;
    
    document.getElementById('gameOver').classList.add('hidden');
    document.getElementById('levelComplete').classList.add('hidden');
    
    updateScoreDisplay();
    updateLevelDisplay();
    updateLivesDisplay();
}

// Kollisionserkennung mit Plattformen
function checkPlatformCollisions() {
    let onGround = false;

    gameState.currentLevel.platforms.forEach(platform => {
        if (platform.checkCollision(player)) {
            // Von oben auf Plattform landen
            if (player.velocityY > 0 && player.y + player.height - player.velocityY <= platform.y) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.isJumping = false;
                onGround = true;
            }
            // Von unten gegen Plattform stoßen
            else if (player.velocityY < 0 && player.y - player.velocityY >= platform.y + platform.height) {
                player.y = platform.y + platform.height;
                player.velocityY = 0;
            }
            // Seitliche Kollision
            else {
                if (player.x + player.width / 2 < platform.x + platform.width / 2) {
                    player.x = platform.x - player.width;
                } else {
                    player.x = platform.x + platform.width;
                }
                player.velocityX = 0;
            }
        }
    });

    return onGround;
}

// Himmel und Wolken zeichnen
function drawBackground(ctx) {
    // Himmel-Gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, config.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, config.width, config.height);

    // Wolken
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    for (let i = 0; i < 5; i++) {
        const x = (i * 200 + Date.now() / 100) % (config.width + 100);
        const y = 50 + i * 30;
        
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, Math.PI * 2);
        ctx.arc(x + 25, y, 35, 0, Math.PI * 2);
        ctx.arc(x + 50, y, 30, 0, Math.PI * 2);
        ctx.fill();
    }

    // Sonne
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(config.width - 80, 60, 40, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const x1 = config.width - 80 + Math.cos(angle) * 50;
        const y1 = 60 + Math.sin(angle) * 50;
        const x2 = config.width - 80 + Math.cos(angle) * 60;
        const y2 = 60 + Math.sin(angle) * 60;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
}

// Hauptspiel-Loop
function gameLoop() {
    if (gameState.isPaused) {
        requestAnimationFrame(gameLoop);
        return;
    }

    // Canvas löschen
    config.ctx.clearRect(0, 0, config.width, config.height);

    // Hintergrund zeichnen
    drawBackground(config.ctx);

    // Spieler aktualisieren
    player.update();

    // Plattform-Kollisionen prüfen
    checkPlatformCollisions();

    // Level zeichnen
    gameState.currentLevel.platforms.forEach(platform => platform.draw(config.ctx));
    
    // Münzen zeichnen und prüfen
    gameState.currentLevel.coins.forEach(coin => {
        coin.draw(config.ctx);
        coin.checkCollision(player);
    });

    // Projektile aktualisieren und zeichnen
    gameState.bullets.forEach((bullet, bulletIndex) => {
        bullet.update();
        bullet.draw(config.ctx);

        // Inaktive Projektile entfernen
        if (!bullet.active) {
            gameState.bullets.splice(bulletIndex, 1);
            return;
        }

        // Kollision mit Gegnern prüfen
        gameState.currentLevel.enemies.forEach((enemy, enemyIndex) => {
            if (bullet.checkEnemyCollision(enemy)) {
                bullet.active = false;
                gameState.currentLevel.enemies.splice(enemyIndex, 1);
                gameState.score += 50;
                updateScoreDisplay();
            }
        });
    });

    // Gegner aktualisieren und zeichnen
    gameState.currentLevel.enemies.forEach(enemy => {
        enemy.update();
        enemy.draw(config.ctx);
        
        if (enemy.checkCollision(player)) {
            player.die();
        }
    });

    // Ziel zeichnen und prüfen
    gameState.currentLevel.drawGoal(config.ctx);
    if (gameState.currentLevel.checkGoalReached(player)) {
        gameState.score += 500;
        updateScoreDisplay();
        levelComplete();
    }

    // Spieler zeichnen
    player.draw(config.ctx);

    requestAnimationFrame(gameLoop);
}

// Initialisierung
function init() {
    config.canvas = document.getElementById('gameCanvas');
    config.ctx = config.canvas.getContext('2d');
    
    config.canvas.width = config.width;
    config.canvas.height = config.height;

    // Erstes Level laden
    gameState.currentLevel = new Level(1);

    // Event Listeners für Buttons
    document.getElementById('restartBtn').addEventListener('click', retryLevel);
    document.getElementById('nextLevelBtn').addEventListener('click', nextLevel);

    // Spiel starten
    gameLoop();
}

// Spiel starten, wenn DOM geladen ist
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

