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

// Function to update the ranking list in the DOM
function updateRanking(ranking) {
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

// Listen for real-time updates from Firestore
db.collection('ranking').onSnapshot((snapshot) => {
    const ranking = [];
    snapshot.forEach((doc) => {
        ranking.push(doc.data());
    });
    updateRanking(ranking);
});

// Function to delete ranking history after 15 minutes
function deleteRankingAfter15Minutes() {
    setTimeout(async () => {
        // Clear the Firestore collection
        const rankingRef = db.collection('ranking');
        const snapshot = await rankingRef.get();
        snapshot.forEach((doc) => {
            doc.ref.delete();
        });
        alert("The ranking has been reset after 15 minutes.");
        updateRanking([]); // Clear the ranking in the UI
    }, 900000); // 15 minutes in milliseconds (15 * 60 * 1000)
}

// Call the function to start the 15-minute timer
deleteRankingAfter15Minutes();

// Ensure the Start button is clickable
document.getElementById('start-btn').addEventListener('click', function() {
    userName = document.getElementById('name').value.trim();
    if (!userName) {
        alert("Please enter your name!");
        return; // Prevent starting the quiz if no name is entered
    }

    // Hide the start screen and show the quiz section
    startScreen.style.display = 'none';
    quizScreen.style.display = 'block';
    rankingSection.style.display = 'block'; // Show the ranking section

    startTime = new Date();
    showQuestion();
    startTimer();
});

// Function to show the current question
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

    for (const [key, value] of Object.entries(currentQuestion.answers)) {
        const button = document.createElement('button');
        button.textContent = value;
        button.addEventListener('click', () => checkAnswer(key));
        answersDisplay.appendChild(button);
    }
}

// Function to check the answer and update score
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

// Function to start the timer for each question
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

// Function to end the quiz and show the results
function endQuiz() {
    endTime = new Date();
    timeTaken = (endTime - startTime) / 1000;
    quizScreen.style.display = 'none';
    resultsContainer.style.display = 'block';
    resultsContainer.textContent = `${userName}, your score is ${score}/${questions.length}. Time taken: ${timeTaken.toFixed(2)} seconds.`;

    // Add current participant's data to Firestore
    db.collection('ranking').add({
        name: userName,
        score: score,
        timeTaken: timeTaken
    });
}

// Quiz questions (same as before)
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
