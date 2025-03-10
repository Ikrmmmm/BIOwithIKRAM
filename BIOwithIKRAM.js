// Firebase configuration (replace with your Firebase project config)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

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
let timeLeft;
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

// Function to start the quiz
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

// Display the current question
function showQuestion() {
    const currentQuestion = questions[currentQuestionIndex];
    questionDisplay.innerHTML = currentQuestion.question;
    answersDisplay.innerHTML = '';

    // Set timeLeft based on the question index
    if (currentQuestionIndex < 3) {
        timeLeft = 10; // Questions 1, 2, and 3 have 10 seconds
    } else {
        timeLeft = 15; // Questions 4 and 5 have 15 seconds
    }
    timerDisplay.textContent = timeLeft;

    // Display the answers
    for (const [key, value] of Object.entries(currentQuestion.answers)) {
        const button = document.createElement('button');
        button.textContent = value;
        button.addEventListener('click', () => checkAnswer(key));
        answersDisplay.appendChild(button);
    }
}

// Check the user's answer
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
        showQuestion();
        startTimer();
    } else {
        endQuiz();
    }
}

// Start the timer for each question
function startTimer() {
    timer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            checkAnswer('timeup');
        }
    }, 1000);
}

// End the quiz and show the results
function endQuiz() {
    endTime = new Date();
    timeTaken = (endTime - startTime) / 1000; // Time in seconds

    resultsContainer.style.display = 'block';
    resultsContainer.textContent = `You finished the quiz with ${score} points! Time taken: ${timeTaken.toFixed(2)} seconds.`;

    // Save the user's results to Firebase
    db.collection('ranking').add({
        name: userName,
        score: score,
        timeTaken: timeTaken
    });

    // Reset for next quiz
    currentQuestionIndex = 0;
    score = 0;
    setTimeout(() => {
        resultsContainer.style.display = 'none';
        startScreen.style.display = 'block';
        rankingSection.style.display = 'none';
    }, 5000);
}

document.getElementById('start-btn').addEventListener('click', startQuiz);
