const quizContainer = document.getElementById('quiz');
const resultsContainer = document.getElementById('results');
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz');
const timerDisplay = document.getElementById('time');
const questionDisplay = document.getElementById('question');
const answersDisplay = document.getElementById('answers');
const rankingList = document.getElementById('ranking-list');
const rankingSection = document.getElementById('ranking');

let userName = '';
let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLeft = 5;

const questions = [
    {
        question: "What is an inhibitor?",
        answers: {
            a: "A substance that speeds up a reaction by 2 times",
            b: "Molecules that bind to an enzyme can reduce the rate of enzyme reaction.",
            c: "A type of enzyme which stops reaction to occur"
        },
        correctAnswer: "b"
    },
    {
        question: "Which site does the competitive inhibitor binds to?",
        answers: {
            a: "Active site",
            b: "Siteseeing",
            c: "Allosteric site"
        },
        correctAnswer: "a"
    },
    {
        question: "Which site does the competitive inhibitor binds to?",
        answers: {
            a: "Siteseeing",
            b: "Allosteric site",
            c: "Active site"
        },
        correctAnswer: "b"
    },
    {
       question: `<img src="images/enzyme.jpg" alt="Enzyme Structure" width="150"><br>Which inhibitor binds to the active site of an enzyme?`,
        answers: {
            a: "Non-competitive inhibitor",
            b: "Competitive inhibitor",
            c: "Uncompetitive inhibitor"
        },
        correctAnswer: "b"
    },
    {
       question: `<img src="images/inhibitor.jpg" alt="Inhibitor Mechanism" width="150"><br>What is the role of inhibitors in biological systems?`,
        answers: {
            a: "To increase metabolic rates",
            b: "To regulate enzyme activity",
            c: "To destroy enzymes"
        },
        correctAnswer: "b"
    }
];

const ranking = [];

function startQuiz() {
    userName = document.getElementById('name').value.trim();
    if (!userName) {
        alert("Please enter your name!");
        return;
    }
    startScreen.style.display = 'none';
    quizScreen.style.display = 'block';
    showQuestion();
    startTimer();
}

function showQuestion() {
    const currentQuestion = questions[currentQuestionIndex];
    questionDisplay.textContent = currentQuestion.question;
    answersDisplay.innerHTML = '';
    for (const [key, value] of Object.entries(currentQuestion.answers)) {
        const button = document.createElement('button');
        button.textContent = value;
        button.addEventListener('click', () => checkAnswer(key));
        answersDisplay.appendChild(button);
    }
}

function checkAnswer(selectedAnswer) {
    clearInterval(timer);
    const currentQuestion = questions[currentQuestionIndex];
    if (selectedAnswer === currentQuestion.correctAnswer) {
        resultsContainer.textContent = "Good job! Correct answer.";
        score++;
    } else {
        resultsContainer.textContent = `Wrong! The correct answer is ${currentQuestion.answers[currentQuestion.correctAnswer]}.`;
    }
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        timeLeft = 5;
        timerDisplay.textContent = timeLeft;
        showQuestion();
        startTimer();
    } else {
        endQuiz();
    }
}

function startTimer() {
    timer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            resultsContainer.textContent = "Time's up! Moving to the next question.";
            currentQuestionIndex++;
            if (currentQuestionIndex < questions.length) {
                timeLeft = 5;
                timerDisplay.textContent = timeLeft;
                showQuestion();
                startTimer();
            } else {
                endQuiz();
            }
        }
    }, 1000);
}

function endQuiz() {
    quizScreen.style.display = 'none';
    resultsContainer.style.display = 'block';
    resultsContainer.textContent = `${userName}, your score is ${score}/${questions.length}.`;
    ranking.push({ name: userName, score: score });
    updateRanking();
    rankingSection.style.display = 'block';
}

function updateRanking() {
    ranking.sort((a, b) => b.score - a.score);
    rankingList.innerHTML = '';
    ranking.forEach((entry, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${entry.name}: ${entry.score}`;
        rankingList.appendChild(li);
    });
}

document.getElementById('start-btn').addEventListener('click', startQuiz);
