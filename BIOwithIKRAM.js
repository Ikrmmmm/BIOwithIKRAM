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
let startTime;
let endTime;
let timeTaken;

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
        question: "Which site does the competitive inhibitor bind to?",
        answers: {
            a: "Active site",
            b: "Siteseeing",
            c: "Allosteric site"
        },
        correctAnswer: "a"
    },
    {
        question: "Which site does the non-competitive inhibitor bind to?",
        answers: {
            a: "Siteseeing",
            b: "Allosteric site",
            c: "Active site"
        },
        correctAnswer: "b"
    },
    {
        question: `<img src="SUBSTRATE.jpg" alt="Substrate" width="150"><br>Which inhibitor binds to the active site of an enzyme?`,
        answers: {
            a: "Substrate",
            b: "Inhibitor B",
            c: "Inhibitor A"
        },
        correctAnswer: "c"
    },
    {
        question: `<img src="SUBSTRATES.jpg" alt="Substrates" width="150"><br>Which one is the allosteric site?`,
        answers: {
            a: "a",
            b: "b",
            c: "c"
        },
        correctAnswer: "b"
    }
];

// Load ranking from local storage or initialize an empty array
let ranking = JSON.parse(localStorage.getItem('ranking')) || [];

// Function to update the ranking list in the DOM
function updateRanking() {
    // Sort the ranking array by score (descending) and timeTaken (ascending)
    ranking.sort((a, b) => {
        if (b.score === a.score) {
            return a.timeTaken - b.timeTaken;
        }
        return b.score - a.score;
    });

    // Clear the current ranking list
    rankingList.innerHTML = '';

    // Display the sorted ranking
    ranking.forEach((entry, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${entry.name}: ${entry.score} points (${entry.timeTaken.toFixed(2)} seconds)`;
        rankingList.appendChild(li);
    });
}

// Show the ranking section as soon as the quiz starts
function startQuiz() {
    userName = document.getElementById('name').value.trim();
    if (!userName) {
        alert("Please enter your name!");
        return;
    }
    startScreen.style.display = 'none';
    quizScreen.style.display = 'block';
    rankingSection.style.display = 'block'; // Show the ranking section
    startTime = new Date();
    showQuestion();
    startTimer();
}

function showQuestion() {
    const currentQuestion = questions[currentQuestionIndex];
    questionDisplay.innerHTML = currentQuestion.question;
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
        timeLeft = (currentQuestionIndex === 3 || currentQuestionIndex === 4) ? 10 : 5;
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
                timeLeft = (currentQuestionIndex === 3 || currentQuestionIndex === 4) ? 10 : 5;
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
    endTime = new Date();
    timeTaken = (endTime - startTime) / 1000;
    quizScreen.style.display = 'none';
    resultsContainer.style.display = 'block';
    resultsContainer.textContent = `${userName}, your score is ${score}/${questions.length}. Time taken: ${timeTaken.toFixed(2)} seconds.`;

    // Add current participant's data to the ranking array
    ranking.push({ name: userName, score: score, timeTaken: timeTaken });

    // Save the updated ranking to local storage
    localStorage.setItem('ranking', JSON.stringify(ranking));

    // Update the ranking list in real time
    updateRanking();
}

// Load and display the ranking when the page loads
updateRanking();

document.getElementById('start-btn').addEventListener('click', startQuiz);
