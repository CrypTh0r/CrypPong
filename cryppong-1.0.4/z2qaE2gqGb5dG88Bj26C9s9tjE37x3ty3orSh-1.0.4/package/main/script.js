const gameArea = document.getElementById('game-area');
gameArea.style.width = '400px';
gameArea.style.height = '400px';

let player1 = { x: 10, y: 170 }; // User-controlled paddle
let player2 = { x: 380, y: 170 }; // Computer-controlled paddle adjusted for the new size
let ball = { x: 200, y: 200, dx: -3, dy: 3, image: 'pictures/ball.png', size: 20 }; // Ball properties with increased speed, image, and bigger size
let player1Score = 0;
let player2Score = 0;
let gamePaused = false;
let upKeyPressed = false;
let downKeyPressed = false;

// Variables to track AI behavior and game difficulty
let rounds = 0;
let aiChallenging = false;
let lastScore = 0; // Track the last score for the AI

// Initial speed and interval variables
let originalInterval = 1000 / 60;
let currentInterval = originalInterval;
let intervalId;

// Update player2 position and make it fit in the new game area
player2.x = 400 - 30; // Adjusted x position for player 2 (AI)

// Event listeners for keyboard input
document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowUp') {
        upKeyPressed = true;
    }
    if (event.key === 'ArrowDown') {
        downKeyPressed = true;
    }
});

document.addEventListener('keyup', function(event) {
    if (event.key === 'ArrowUp') {
        upKeyPressed = false;
    }
    if (event.key === 'ArrowDown') {
        downKeyPressed = false;
    }
});

// Event listeners for touch input
document.addEventListener('touchstart', function(event) {
    const touchY = event.changedTouches[0].clientY;
    if (touchY < player1.y + 30) {
        upKeyPressed = true;
    } else if (touchY > player1.y + 30) {
        downKeyPressed = true;
    }
});

document.addEventListener('touchend', function(event) {
    upKeyPressed = false;
    downKeyPressed = false;
});

function draw() {
    const canvas = gameArea.querySelector('canvas');
    const context = canvas.getContext('2d');

    context.clearRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = '#fff';
    context.fillRect(player1.x, player1.y, 10, 60);

    context.fillRect(player2.x, player2.y, 10, 60);

    // Draw the ball image instead of a rectangle
    let img = new Image();
    img.src = ball.image;
    context.drawImage(img, ball.x, ball.y, ball.size, ball.size);

    // Display scores
    context.font = '20px Arial';
    context.fillStyle = '#fff';
    context.textAlign = 'center';
    context.fillText('Player: ' + player1Score, 50, 30);
    context.fillText('AI: ' + player2Score, 370, 30);
}

function update() {
    if (gamePaused) {
        return;
    }

    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.y <= 0 || ball.y >= gameArea.clientHeight - ball.size) {
        ball.dy = -ball.dy;
    }

    if (upKeyPressed && player1.y > 0) {
        player1.y -= 4;
    }
    if (downKeyPressed && player1.y < gameArea.clientHeight - 60) {
        player1.y += 4;
    }

    // Update player 2 paddle (AI) and keep it within game area boundaries
    if (player2.y < ball.y && player2.y < gameArea.clientHeight - 60) {
        // Add a random factor to the AI's movement to save only 40% of user shots
        let savePercentage = 0.4; // AI saves 40% of shots
        if (Math.random() > savePercentage) {
            player2.y += 3;
        }
    } else if (player2.y > ball.y - 60 && player2.y > 0) {
        player2.y -= 3;
    }

    // Handle ball collisions with paddles and scoring
    if (ball.x <= player1.x + 10 && ball.x + ball.size >= player1.x && ball.y >= player1.y && ball.y <= player1.y + 60) {
        ball.dx = Math.abs(ball.dx); // Move the ball away from the paddle immediately
        increaseSpeed();
    }

    if (ball.x + ball.size >= player2.x && ball.x <= player2.x + 10 && ball.y >= player2.y && ball.y <= player2.y + 60) {
        ball.dx = -Math.abs(ball.dx); // Move the ball away from the paddle immediately
        increaseSpeed();
    }

    // Update scores when the ball passes the paddles
    if (ball.x <= 0) {
        player2Score++;
        resetGame(); // Reset ball position
    } else if (ball.x >= 400) {
        player1Score++;
        resetGame(); // Reset ball position
    }

    // Check if game over condition is met
    if (player1Score >= 10 || player2Score >= 10) {
        // Display game over screen
        clearInterval(intervalId); // Stop the game loop

        // Update game over screen with scores
        document.getElementById('player1-score').textContent = player1Score;
        document.getElementById('player2-score').textContent = player2Score;
        document.getElementById('game-over').classList.add('show'); // Show game over screen
    }
}

function togglePause() {
    gamePaused = !gamePaused;
}

function resetGame() {
    player1 = { x: 10, y: 170 };
    player2 = { x: 380, y: 170 };
    ball = { x: 200, y: 200, dx: -3, dy: 3, image: 'pictures/ball.png', size: 20 };
    rounds = 0;
    aiChallenging = false;
    gamePaused = false;
    resetSpeed();

    // Hide game over screen
    document.getElementById('game-over').classList.remove('show');
}

function resetScores() {
    player1Score = 0; // Reset player 1 score
    player2Score = 0; // Reset player 2 score
    resetGame(); // Reset the game state as well
}

function increaseSpeed() {
    clearInterval(intervalId);
    currentInterval -= 0.25; // Increase speed by decreasing interval time
    intervalId = setInterval(gameLoop, currentInterval);
}

function resetSpeed() {
    clearInterval(intervalId);
    currentInterval = originalInterval;
    intervalId = setInterval(gameLoop, currentInterval);
}

function gameLoop() {
    update();
    draw();
}

// Start the game loop with the initial interval
intervalId = setInterval(gameLoop, currentInterval);

// Assuming you have a reset button in your HTML with the ID 'reset-button'
document.getElementById('reset-button').addEventListener('click', resetScores);