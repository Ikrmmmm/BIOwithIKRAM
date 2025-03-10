// Firebase configuration (replace with your Firebase project config)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Import Firebase functions (adjusted to Firebase 9.x modular imports)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Variables for quiz and DOM elements
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

// Function to update the ranking list in the DOM
function updateRanking(ranking) {
    ranking.sort((a, b) => {
        if (b.score === a.score) {
            return a.timeTaken - b.timeTaken;
        }
        return b.score - a.score;
    });

    rankingList.innerHTML = '';
    ranking.forEach((entry, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${entry.name}: ${entry.score} points (${entry.timeTaken.toFixed(2)} seconds)`;
        rankingList.appendChild(li);
    });
}

// Real-time listener for Firestore updates
onSnapshot(collection(db, 'ranking'), (snapshot) => {
    const ranking = [];
    snapshot.forEach((doc) => {
        ranking.push(doc.data());
    });
    updateRanking(ranking); // Update the ranking UI when Firestore changes
});

// Function to delete ranking history after 15 minutes
function deleteRankingAfter15Minutes() {
    setTimeout(async () => {
        const rankingRef = collection(db, 'ranking');
        const snapshot = await getDocs(rankingRef);
        snapshot.forEach(async (doc) => {
            await deleteDoc(doc.ref);
        });
        alert("The ranking has been reset after 15 minutes.");
        updateRanking([]); // Clear the ranking in the UI
    }, 900000); // 15 minutes in milliseconds (15 * 60 * 1000)
}

deleteRankingAfter15Minutes();

// Start the quiz
function startQuiz() {
    userName = document.getElementById('name').value.trim();
    if (!userName) {
        alert("Please enter your name!");
        return;
    }
    startScreen.style.display = 'none';
    quizScreen.style.display = 'block';
    rankingSection.style.display = 'block'; // Show ranking section
    startTime = new Date();
    showQuestion();
    startTimer();
}

function showQuestion() {
    const currentQuestion = questions[currentQuestionIndex];
    questionDisplay.innerHTML = currentQuestion.question;
    answersDisplay.innerHTML = '';

    if (currentQuestionIndex < 3) {
        timeLeft = 10;
    } else {
        timeLeft = 15;
    }
    timerDisplay.textContent = timeLeft;

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

    // Add participant's score and time to Firestore
    addDoc(collection(db, 'ranking'), {
        name: userName,
        score: score,
        timeTaken: timeTaken
    });
}

// Event listener for starting the quiz
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('start-btn').addEventListener('click', startQuiz);
});


// Wait for the DOM to be fully loaded before adding event listener
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('start-btn').addEventListener('click', startQuiz);
});
