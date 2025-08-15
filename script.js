// Elementos do DOM
const menu = document.getElementById('menu');
const gameContainer = document.getElementById('game-container');
const gameOverScreen = document.getElementById('game-over');
const shopScreen = document.getElementById('shop');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('final-score');
const shopCoinsElement = document.getElementById('shop-coins');
const skinsContainer = document.getElementById('skins-container');

// Configurações do jogo
const gridSize = 20;
const tileCount = canvas.width / gridSize;

// Variáveis do jogo
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let score = 0;
let coins = 100;
let gameSpeed = 150;
let gameLoop;
let isGameRunning = false;

// Skins disponíveis
const skins = [
    {
        id: 'default',
        name: 'Padrão',
        colorHead: '#2E7D32',
        colorBody: '#4CAF50',
        price: 0,
        owned: true,
        equipped: true
    },
    {
        id: 'blue',
        name: 'Azul',
        colorHead: '#1565C0',
        colorBody: '#2196F3',
        price: 150,
        owned: false,
        equipped: false
    },
    {
        id: 'red',
        name: 'Vermelha',
        colorHead: '#C62828',
        colorBody: '#F44336',
        price: 200,
        owned: false,
        equipped: false
    },
    {
        id: 'rainbow',
        name: 'Arco-Íris',
        colorHead: 'rainbow',
        colorBody: 'rainbow',
        price: 500,
        owned: false,
        equipped: false
    }
];

let currentSkin = skins[0];

// Função para mostrar telas
function showScreen(screenToShow) {
    // Esconde todas as telas
    menu.style.display = 'none';
    gameContainer.style.display = 'none';
    shopScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';

    // Mostra apenas a tela solicitada
    switch (screenToShow) {
        case 'menu':
            menu.style.display = 'block';
            break;
        case 'game':
            gameContainer.style.display = 'block';
            initGame();
            startGame();
            break;
        case 'shop':
            shopScreen.style.display = 'block';
            updateShop();
            break;
        case 'gameOver':
            gameOverScreen.style.display = 'block';
            break;
    }
}

// Inicializa o jogo
function initGame() {
    snake = [
        { x: 5, y: 10 },
        { x: 4, y: 10 },
        { x: 3, y: 10 }
    ];
    spawnFood();
    score = 0;
    scoreElement.textContent = `Pontuação: ${score}`;
    direction = 'right';
    nextDirection = 'right';

    // Desenha o estado inicial imediatamente
    drawGame();
}

// Gera comida
function spawnFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
}

// Desenha o jogo
function drawGame() {
    // Limpa o canvas
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desenha a cobra com a skin atual
    for (let i = 0; i < snake.length; i++) {
        if (currentSkin.id === 'rainbow') {
            // Efeito arco-íris
            const hue = (i * 10 + Date.now() / 50) % 360;
            ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        } else {
            ctx.fillStyle = (i === 0) ? currentSkin.colorHead : currentSkin.colorBody;
        }

        ctx.fillRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize, gridSize);
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize, gridSize);
    }

    // Desenha a comida
    ctx.fillStyle = '#c62828';
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2,
        gridSize / 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// Atualiza o estado do jogo
function updateGame() {
    // Atualiza a direção
    direction = nextDirection;

    // Move a cobra
    const head = { x: snake[0].x, y: snake[0].y };

    switch (direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }

    // Verifica colisões
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount ||
        snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }

    snake.unshift(head);

    // Verifica se comeu a comida
    if (head.x === food.x && head.y === food.y) {
        score++;
        coins++;
        scoreElement.textContent = `Pontuação: ${score}`;
        spawnFood();
    } else {
        snake.pop();
    }
}

// Loop principal do jogo
function gameStep() {
    updateGame();
    drawGame();
}

// Inicia o jogo
function startGame() {
    if (!isGameRunning) {
        isGameRunning = true;
        gameLoop = setInterval(gameStep, gameSpeed);
    }
}

// Game over
function gameOver() {
    clearInterval(gameLoop);
    isGameRunning = false;
    finalScoreElement.textContent = `Pontuação: ${score}`;
    showScreen('gameOver');
}

// Atualiza a loja
function updateShop() {
    shopCoinsElement.textContent = `Moedas: ${coins}`;
    skinsContainer.innerHTML = '';

    skins.forEach(skin => {
        const skinItem = document.createElement('div');
        skinItem.className = 'skin-item';

        const skinPreview = document.createElement('div');
        skinPreview.className = 'skin-preview';
        if (skin.id === 'rainbow') {
            skinPreview.classList.add('rainbow-bg');
        } else {
            skinPreview.style.backgroundColor = skin.colorHead;
        }

        const skinInfo = document.createElement('div');
        skinInfo.className = 'skin-info';
        skinInfo.innerHTML = `<div class="skin-name">${skin.name}</div>
                             <div class="skin-price">${skin.owned ? 'Comprado' : skin.price + ' moedas'}</div>`;

        const actionBtn = document.createElement('button');
        actionBtn.className = 'buy-btn';

        if (skin.equipped) {
            actionBtn.textContent = 'Equipada';
            actionBtn.classList.add('equipped');
            actionBtn.disabled = true;
        } else if (skin.owned) {
            actionBtn.textContent = 'Equipar';
            actionBtn.onclick = () => equipSkin(skin.id);
        } else {
            actionBtn.textContent = 'Comprar';
            actionBtn.onclick = () => buySkin(skin.id);
            if (coins < skin.price) {
                actionBtn.disabled = true;
                actionBtn.style.opacity = '0.6';
            }
        }

        skinItem.appendChild(skinPreview);
        skinItem.appendChild(skinInfo);
        skinItem.appendChild(actionBtn);

        skinsContainer.appendChild(skinItem);
    });
}

// Compra uma skin
function buySkin(skinId) {
    const skin = skins.find(s => s.id === skinId);
    if (coins >= skin.price) {
        coins -= skin.price;
        skin.owned = true;
        updateShop();
    }
}

// Equipa uma skin
function equipSkin(skinId) {
    skins.forEach(skin => skin.equipped = false);
    const skin = skins.find(s => s.id === skinId);
    skin.equipped = true;
    currentSkin = skin;
    updateShop();
}

// Event listeners para teclado
document.addEventListener('keydown', function (e) {
    if (isGameRunning) {
        switch (e.key) {
            case 'ArrowUp': if (direction !== 'down') nextDirection = 'up'; break;
            case 'ArrowDown': if (direction !== 'up') nextDirection = 'down'; break;
            case 'ArrowLeft': if (direction !== 'right') nextDirection = 'left'; break;
            case 'ArrowRight': if (direction !== 'left') nextDirection = 'right'; break;
        }
    }
});

// Event listeners para os botões
document.getElementById('play-btn').addEventListener('click', () => showScreen('game'));
document.getElementById('shop-btn').addEventListener('click', () => showScreen('shop'));
document.getElementById('exit-btn').addEventListener('click', () => {
    if (confirm('Deseja realmente sair do jogo?')) {
        window.close();
    }
});
document.getElementById('try-again-btn').addEventListener('click', () => showScreen('game'));
document.getElementById('game-over-exit').addEventListener('click', () => showScreen('menu'));
document.getElementById('shop-exit').addEventListener('click', () => showScreen('menu'));
document.getElementById('resetBtn').addEventListener('click', () => {
    if (isGameRunning) {
        clearInterval(gameLoop);
        isGameRunning = false;
    }
    showScreen('game');
});

// Inicialização do jogo
function init() {
    // Garante que o canvas está limpo
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Mostra o menu inicial
    showScreen('menu');
}

// Inicia o jogo quando a página carrega
window.addEventListener('DOMContentLoaded', init);