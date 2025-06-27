const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const startScreen = document.getElementById('startScreen');
const gameArea = document.getElementById('gameArea');
const currentDifficultyElement = document.getElementById('currentDifficulty');

// Game variables
let gridSize = 20;
let tileCount;
let snake = [{ x: 10, y: 10 }];
let food = {};
let dx = 0;
let dy = 0;
let score = 0;
let highScore = 0;
let gameRunning = false;
let gameSpeed = 150; // Default medium speed
let selectedSpeed = 150;

// Speed to difficulty name mapping
const speedNames = {
    200: 'Easy',
    150: 'Medium',
    100: 'Hard',
    50: 'Insane',
};

function initCanvas() {
    const isMobile = window.innerWidth <= 768;
    const canvasSize = isMobile ? Math.min(window.innerWidth * 0.9, 350) : 400;

    canvas.width = canvasSize;
    canvas.height = canvasSize;
    gridSize = canvasSize / 20; // Keep 20x20 grid
    tileCount = 20;
}

function selectSpeed(speed) {
    selectedSpeed = speed;
    gameSpeed = speed;

    // Update UI
    document.querySelectorAll('.speed-option').forEach((option) => {
        option.classList.remove('selected');
        if (parseInt(option.dataset.speed) === speed) {
            option.classList.add('selected');
        }
    });
}

function loadHighScore() {
    const saved = window.gameData?.highScore || 0;
    highScore = saved;
    highScoreElement.textContent = highScore;
}

function saveHighScore() {
    if (!window.gameData) window.gameData = {};
    window.gameData.highScore = highScore;
}

function startGame() {
    initCanvas();
    startScreen.style.display = 'none';
    gameArea.style.display = 'block';
    loadHighScore();
    resetGame();
    gameRunning = true;
    currentDifficultyElement.textContent = speedNames[selectedSpeed];
    main();
}

function resetGame() {
    snake = [{ x: 10, y: 10 }];
    dx = 0;
    dy = 0;
    score = 0;
    scoreElement.textContent = score;
    generateFood();
    gameOverElement.style.display = 'none';
}

function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount),
    };

    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood();
            return;
        }
    }
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    for (let i = 0; i < snake.length; i++) {
        const segment = snake[i];
        if (i === 0) {
            ctx.fillStyle = '#45b7d1';
        } else {
            ctx.fillStyle = '#4ecdc4';
        }

        ctx.fillRect(
            segment.x * gridSize + 1,
            segment.y * gridSize + 1,
            gridSize - 2,
            gridSize - 2
        );
    }

    // Draw food
    ctx.fillStyle = '#ff6b6b';
    ctx.shadowColor = '#ff6b6b';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2,
        gridSize / 2 - 2,
        0,
        2 * Math.PI
    );
    ctx.fill();
    ctx.shadowBlur = 0;
}

function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 1;
        scoreElement.textContent = score;
        generateFood();

        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            saveHighScore();
        }
    } else {
        snake.pop();
    }
}

function checkCollision() {
    const head = snake[0];

    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        return true;
    }

    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }

    return false;
}

function gameOver() {
    gameRunning = false;
    finalScoreElement.textContent = score;

    // Set current speed as selected in game over screen
    document.querySelectorAll('#gameOver .speed-option').forEach((option) => {
        option.classList.remove('selected');
        if (parseInt(option.dataset.speed) === selectedSpeed) {
            option.classList.add('selected');
        }
    });

    gameOverElement.style.display = 'block';
}

function restartGame() {
    resetGame();
    gameRunning = true;
    gameSpeed = selectedSpeed;
    currentDifficultyElement.textContent = speedNames[selectedSpeed];
    main();
}

function main() {
    if (!gameRunning) return;

    setTimeout(function onTick() {
        if (dx !== 0 || dy !== 0) {
            moveSnake();

            if (checkCollision()) {
                gameOver();
                return;
            }
        }

        drawGame();

        if (gameRunning) {
            main();
        }
    }, gameSpeed);
}

// Keyboard controls
document.addEventListener('keydown', changeDirection);

function changeDirection(event) {
    if (!gameRunning) return;

    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;

    const keyPressed = event.keyCode;
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    if (keyPressed === LEFT_KEY && !goingRight) {
        dx = -1;
        dy = 0;
    }

    if (keyPressed === UP_KEY && !goingDown) {
        dx = 0;
        dy = -1;
    }

    if (keyPressed === RIGHT_KEY && !goingLeft) {
        dx = 1;
        dy = 0;
    }

    if (keyPressed === DOWN_KEY && !goingUp) {
        dx = 0;
        dy = 1;
    }
}

// Mobile controls
function changeDirectionMobile(direction) {
    if (!gameRunning) return;

    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    switch (direction) {
        case 'left':
            if (!goingRight) {
                dx = -1;
                dy = 0;
            }
            break;
        case 'up':
            if (!goingDown) {
                dx = 0;
                dy = -1;
            }
            break;
        case 'right':
            if (!goingLeft) {
                dx = 1;
                dy = 0;
            }
            break;
        case 'down':
            if (!goingUp) {
                dx = 0;
                dy = 1;
            }
            break;
    }
}

// Touch event handling for better mobile experience
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', function (e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', function (e) {
    if (!gameRunning) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // Minimum swipe distance
    if (Math.abs(deltaX) < 30 && Math.abs(deltaY) < 30) return;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0) {
            changeDirectionMobile('right');
        } else {
            changeDirectionMobile('left');
        }
    } else {
        // Vertical swipe
        if (deltaY > 0) {
            changeDirectionMobile('down');
        } else {
            changeDirectionMobile('up');
        }
    }
});

// Initialize the game
loadHighScore();
window.addEventListener('resize', function () {
    if (gameRunning) {
        initCanvas();
        drawGame();
    }
});
