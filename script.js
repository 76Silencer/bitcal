class BinaryMathGame {
    constructor(timerDuration = 5) {
        this.remainingQuestions = 10;
        this.currentQuestion = null;
        this.currentAnswer = null;
        this.timer = null;
        this.countdown = timerDuration;
        this.timerDuration = timerDuration;
        this.isGameActive = false;
        this.waitingForNext = false;
        
        this.initializeElements();
        this.bindEvents();
        this.startGame();
    }

    initializeElements() {
        this.remainingQuestionsEl = document.getElementById('remaining-questions');
        this.questionEl = document.getElementById('question');
        this.timerEl = document.getElementById('timer');
        this.answerContainerEl = document.getElementById('answer-container');
        this.answerEl = document.getElementById('answer');
        this.userAnswerInputEl = document.getElementById('user-answer-input');
        this.submitBtn = document.getElementById('submit-btn');
        this.gameOverEl = document.getElementById('game-over');
        this.resultMessageEl = document.getElementById('result-message');
        this.restartBtn = document.getElementById('restart-btn');
        this.mainMenuBtn = document.getElementById('main-menu-btn');
    }

    bindEvents() {
        this.restartBtn.addEventListener('click', () => this.restartGame());
        this.mainMenuBtn.addEventListener('click', () => this.goToMainMenu());
        this.submitBtn.addEventListener('click', () => this.handleSubmit());
        this.userAnswerInputEl.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && this.isGameActive) {
                event.preventDefault(); // 防止回车键触发表单提交等默认行为
                this.handleSubmit();
            }
        });
    }
    
    handleSubmit() {
        if (this.waitingForNext) {
            this.nextQuestion();
        } else {
            this.checkAnswer();
        }
    }

    startGame() {
        this.isGameActive = true;
        this.gameOverEl.style.display = 'none';
        this.answerContainerEl.style.display = 'flex';
        this.updateDisplay();
        this.generateQuestion();
    }

    // 十进制转二进制
    decimalToBinary(decimal) {
        if (decimal === 0) return '0';
        let binary = '';
        let num = decimal;
        while (num > 0) {
            binary = (num % 2) + binary;
            num = Math.floor(num / 2);
        }
        return binary;
    }

    // 生成随机数（1-20）
    getRandomNumber() {
        return Math.floor(Math.random() * 20) + 1;
    }

    // 生成随机数（1-16）
    getRandomNumberForAddSub() {
        return Math.floor(Math.random() * 16) + 1;
    }

    // 生成随机数（1-32）
    getRandomNumberForDivisor() {
        return Math.floor(Math.random() * 32) + 1;
    }

    // 生成随机数（1-10）
    getRandomNumberForMultiply() {
        return Math.floor(Math.random() * 10) + 1;
    }

    // 生成除法运算（确保能整除）
    generateDivision() {
        let divisor, quotient, dividend;
        
        // 确保被除数不超过32，且除数和被除数不相等
        do {
            divisor = this.getRandomNumberForDivisor(); // 除数不超过32
            quotient = this.getRandomNumberForAddSub(); // 商不超过16
            dividend = divisor * quotient;
        } while (dividend > 32 || dividend === divisor);
        
        // 调试信息：检查生成的数字
        console.log(`除法生成 - 除数: ${divisor}, 商: ${quotient}, 被除数: ${dividend}`);
        
        return {
            num1: dividend,
            num2: divisor,
            operator: '÷',
            answer: quotient,
            question: `${this.decimalToBinary(dividend)} ÷ ${this.decimalToBinary(divisor)}`
        };
    }

    // 生成其他运算
    generateOtherOperation() {
        const operators = ['+', '-', '×'];
        const operator = operators[Math.floor(Math.random() * operators.length)];
        
        let num1, num2, answer;
        
        switch (operator) {
            case '+':
                num1 = this.getRandomNumberForAddSub();
                num2 = this.getRandomNumberForAddSub();
                answer = num1 + num2;
                break;
            case '-':
                num1 = this.getRandomNumberForAddSub();
                num2 = this.getRandomNumberForAddSub();
                answer = Math.max(num1, num2) - Math.min(num1, num2);
                break;
            case '×':
                // 乘法两个乘数都是10以内
                num1 = this.getRandomNumberForMultiply();
                num2 = this.getRandomNumberForMultiply();
                answer = num1 * num2;
                break;
        }
        
        return {
            num1: operator === '-' ? Math.max(num1, num2) : num1,
            num2: operator === '-' ? Math.min(num1, num2) : num2,
            operator: operator,
            answer: answer,
            question: `${this.decimalToBinary(operator === '-' ? Math.max(num1, num2) : num1)} ${operator} ${this.decimalToBinary(operator === '-' ? Math.min(num1, num2) : num2)}`
        };
    }

    generateQuestion() {
        // 30%概率生成除法，70%概率生成其他运算
        const isDivision = Math.random() < 0.3;
        
        if (isDivision) {
            this.currentQuestion = this.generateDivision();
        } else {
            this.currentQuestion = this.generateOtherOperation();
        }
        
        this.currentAnswer = this.currentQuestion.answer;
        this.questionEl.textContent = this.currentQuestion.question;
        
        this.startTimer();
    }

    startTimer() {
        clearInterval(this.timer);
        this.countdown = this.timerDuration;
        this.timerEl.textContent = `${this.countdown}秒`;
        this.answerContainerEl.classList.remove('active');
        this.answerEl.textContent = '';
        this.userAnswerInputEl.value = '';
        this.userAnswerInputEl.disabled = false;
        this.userAnswerInputEl.focus();
        this.timerEl.parentElement.style.display = 'block';

        this.timer = setInterval(() => {
            this.countdown--;
            this.timerEl.textContent = this.countdown > 0 ? `${this.countdown}秒` : '时间到';

            if (this.countdown <= 0) {
                this.checkAnswer();
            }
        }, 1000);
    }

    checkAnswer() {
        if (!this.isGameActive) return;

        clearInterval(this.timer);
        this.userAnswerInputEl.disabled = true;
        this.submitBtn.disabled = true;

        const userAnswerStr = this.userAnswerInputEl.value.trim();
        const userAnswer = userAnswerStr === '' ? NaN : parseInt(userAnswerStr, 10);
        const isCorrect = userAnswer === this.currentAnswer;

        this.answerContainerEl.classList.add('active');
        this.timerEl.parentElement.style.display = 'none';
        
        const question = this.currentQuestion;
        const decimalFormat = `${question.num1} ${question.operator} ${question.num2} = ${this.currentAnswer}`;

        if (isCorrect) {
            this.answerEl.innerHTML = `<div>正确!</div><div>${decimalFormat}</div>`;
            this.answerEl.style.color = 'green';
        } else {
            this.answerEl.innerHTML = `<div>错误! 正确答案是 ${this.currentAnswer}</div><div>${decimalFormat}</div>`;
            this.answerEl.style.color = 'red';
        }

        this.waitingForNext = true;
        this.submitBtn.textContent = '下一题';
        this.submitBtn.disabled = false;

        this.handleAnswer(isCorrect);
    }

    handleAnswer(isCorrect) {
        if (!this.isGameActive) return;
        
        if (isCorrect) {
            this.remainingQuestions--;
        } else {
            this.remainingQuestions += 2;
        }
        
        this.updateDisplay();
        
        if (this.remainingQuestions <= 0) {
            this.endGame(true); // 成功
        } else if (this.remainingQuestions > 20) {
            this.endGame(false); // 失败
        }
    }

    nextQuestion() {
        this.waitingForNext = false;
        this.submitBtn.textContent = '提交答案';
        this.timerEl.parentElement.style.display = 'block';
        this.answerContainerEl.classList.remove('active');
        this.answerEl.textContent = ''; // 清空答案内容
        this.generateQuestion();
    }

    updateDisplay() {
        this.remainingQuestionsEl.textContent = this.remainingQuestions;
    }

    endGame(isSuccess) {
        this.isGameActive = false;
        clearInterval(this.timer);
        
        if (isSuccess) {
            this.resultMessageEl.textContent = `恭喜！你成功了！`;
            this.resultMessageEl.style.color = '#22543d';
        } else {
            this.resultMessageEl.textContent = `游戏结束！剩余题目超过20`;
            this.resultMessageEl.style.color = '#742a2a';
        }
        
        this.gameOverEl.style.display = 'block';
        this.answerContainerEl.style.display = 'none';
    }

    restartGame() {
        this.remainingQuestions = 10;
        this.isGameActive = true;
        this.waitingForNext = false;
        this.submitBtn.textContent = '提交答案';
        this.gameOverEl.style.display = 'none';
        this.timerEl.parentElement.style.display = 'block';
        this.answerContainerEl.style.display = 'flex';
        this.answerContainerEl.classList.remove('active');
        this.answerEl.textContent = ''; // 清空答案内容
        this.updateDisplay();
        this.generateQuestion();
    }

    goToMainMenu() {
        document.getElementById('game-header').style.display = 'none';
        document.getElementById('game-area').style.display = 'none';
        document.getElementById('start-screen').style.display = 'flex';
    }
}

// 页面加载完成后启动游戏
document.addEventListener('DOMContentLoaded', () => {
    const startScreen = document.getElementById('start-screen');
    const startBtn = document.getElementById('start-btn');
    const gameHeader = document.getElementById('game-header');
    const gameArea = document.getElementById('game-area');
    let gameInstance = null;

    function showGame() {
        startScreen.style.display = 'none';
        gameHeader.style.display = 'block';
        gameArea.style.display = 'flex';
        // 获取倒计时时长
        const timerRadio = document.querySelector('input[name="timer"]:checked');
        const timerDuration = timerRadio ? parseInt(timerRadio.value, 10) : 5;
        gameInstance = new BinaryMathGame(timerDuration);
    }

    startBtn.addEventListener('click', showGame);
}); 