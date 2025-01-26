document.addEventListener('DOMContentLoaded', function() {
    const gameArea = document.getElementById('game-area');
    const player = document.getElementById('player');
    const scoreDisplay = document.getElementById('score');
    const timerDisplay = document.getElementById('timer');
    const modal = document.getElementById('modal');
    const finalScoreDisplay = document.getElementById('final-score');
    const retryBtn = document.getElementById('retry-btn');
    const backgroundMusic = document.getElementById('background-music');
    const buttonSound = document.getElementById('button-sound');
    const bombSound = document.getElementById('bomb-sound');
    const music1 = document.getElementById('music1');
    const music2 = document.getElementById('music2');
    const music3 = document.getElementById('music3');
    const music4 = document.getElementById('music4');

    let score = 0;
    let timeLeft = 45; // 修改: 将初始时间从30改为45
    let gameInterval;
    let isGameOver = false; // 新增变量，用于标记游戏是否结束
    let retryCount = 0; // 新增变量，用于记录玩家点击“再来”按钮的次数
    let totalScore = 0; // 新增变量，用于记录累计福气值
    let touchStartX = 0; // 新增变量，用于记录触摸开始时的X坐标
    let touchMoveX = 0; // 新增变量，用于记录触摸移动时的X坐标

    function createFallingItem() {
        const items = ['yuanbao', 'hongbao', 'fudai', 'jintiao', 'zhuanshi', 'zhihongbao', 'dahongbao', 'bomb'];
        const item = document.createElement('div');
        item.classList.add('falling-item');
        item.style.left = Math.random() * (gameArea.offsetWidth - 50) + 'px';
        item.style.backgroundImage = `url('image/${items[Math.floor(Math.random() * items.length)]}.png')`;
        gameArea.appendChild(item);

        let fallInterval = setInterval(() => {
            const top = parseInt(item.style.top) || 0;
            if (top > gameArea.offsetHeight) {
                clearInterval(fallInterval);
                if (gameArea.contains(item)) {
                    gameArea.removeChild(item);
                }
            } else {
                item.style.top = top + 5 + 'px';
                checkCollision(item);
            }
        }, 20);
    }

    function checkCollision(item) {
        const itemRect = item.getBoundingClientRect();
        const playerRect = player.getBoundingClientRect();

        if (itemRect.bottom >= playerRect.top && itemRect.left < playerRect.right && itemRect.right > playerRect.left) {
            const itemType = item.style.backgroundImage.split('/').pop().split('.')[0];
            if (itemType === 'bomb') {
                bombSound.play();
                endGame();
            } else {
                score += 10;
                scoreDisplay.textContent = `福气值: ${score}`;
                playSound(itemType);
            }
            gameArea.removeChild(item);
        }
    }

    function playSound(itemType) {
        switch (itemType) {
            case 'yuanbao':
            case 'hongbao':
                music1.play();
                break;
            case 'fudai':
            case 'jintiao':
                music2.play();
                break;
            case 'zhuanshi':
            case 'zhihongbao':
                music3.play();
                break;
            case 'dahongbao':
                music4.play();
                break;
        }
    }

    function startGame() {
        isGameOver = false; // 游戏开始时重置游戏结束标志
        gameInterval = setInterval(() => {
            createFallingItem();
            timeLeft--;
            timerDisplay.textContent = `倒计时: ${timeLeft}s`;
            if (timeLeft <= 0) {
                endGame();
            }
        }, 500); // 修改: 将时间间隔从1000毫秒改为500毫秒

        // 新增: 启动一个定时器来持续移动角色
        setInterval(function() {
            movePlayer(0); // 默认情况下不移动，但可以在这里添加逻辑来控制角色的默认移动方向
        }, 20); // 每20毫秒检查一次是否需要移动角色
    }

    function endGame() {
        clearInterval(gameInterval);
        modal.style.display = 'block'; // 修改: 显示模态框
        finalScoreDisplay.textContent = `福气值: ${score}`;
        backgroundMusic.pause();
        isGameOver = true; // 设置游戏结束标志
        totalScore += score; // 累加福气值
    }

    retryBtn.addEventListener('click', function() {
        if (retryCount >= 3) { // 判断点击次数是否超过3次
            alert(`游戏结束，总福气值: ${totalScore}！`); // 提示游戏结束并显示总福气值
            return; // 直接返回，不执行后续代码
        }
        buttonSound.play();
        modal.style.display = 'none';
        score = 0; // 重置当前游戏的福气值
        timeLeft = 45; // 修改: 将倒计时重新设置为45秒
        scoreDisplay.textContent = `福气值: ${totalScore}`; // 显示累计福气值
        timerDisplay.textContent = `倒计时: ${timeLeft}s`;
        startGame();
        backgroundMusic.play();
        retryCount++; // 增加点击次数
    });

    function movePlayer(direction) {
        if (isGameOver) return; // 如果游戏结束，阻止移动
        const left = parseInt(player.style.left) || 0;
        const newLeft = left + direction;
        const minLeft = -player.offsetWidth / 2 + 110; // 修改: 增加左边的移动范围90px，原来为40px，现在为130px
        const maxLeft = gameArea.offsetWidth - player.offsetWidth / 2 + 10; // 减少右边的移动范围20px，原来为90px，现在为70px，进一步调整为110px

        player.style.left = Math.max(minLeft, Math.min(newLeft, maxLeft)) + 'px';
        player.style.bottom = '0'; // 确保玩家角色在屏幕底部
    }

    // 新增: 添加键盘事件监听器
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            movePlayer(-5); // 向左移动
        } else if (e.key === 'ArrowRight') {
            movePlayer(5); // 向右移动
        }
    });

    document.addEventListener('keyup', function(e) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            movePlayer(0); // 停止移动
        }
    });

    // 新增: 检测是否在移动端打开
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const mobileControls = document.getElementById('mobile-controls');

    if (isMobile) {
        mobileControls.style.display = 'block';
    }

    // 确保角色在游戏开始时位于屏幕中央
    player.style.left = '50%';
    player.style.transform = 'translateX(-50%)';

    const startGameBtn = document.getElementById('start-game-btn');
    startGameBtn.addEventListener('click', function() {
        buttonSound.play();
        document.getElementById('welcome-container').style.display = 'none';
        document.getElementById('game-container').style.display = 'block';
        modal.style.display = 'none'; // 修改: 隐藏模态框
        startGame();
        backgroundMusic.play();
    });
});