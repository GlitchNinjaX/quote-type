const typingText = document.querySelector(".typingText");
const results = document.querySelector(".results");
const timer = document.querySelector(".timer");
const tryAgainBtn = document.querySelector(".tryAgainBtn");

let quote = [];
let currentIndex = 0;
let testRunning = false;
let lengthOfTest = 0;
let testId = null;
let correctCharsTyped = 0;
let totalCharsTyped = 0;

let highScore = localStorage.getItem('highScore') || '0';

async function getRandomQuote() {
  const apiUrl = "https://quoteslate.vercel.app/api/quotes/random?minLength=150&maxLength=350";
  // https://api.quotable.io/api/quotes/random?minLength=150&maxLength=350

  const response = await fetch(apiUrl);

  if (!response.ok) {
    throw new Error("Could not fetch random quote.");
  }

  return await response.json();
}

async function displayQuote() {
  let data = await getRandomQuote();
  let quoteText = data.quote;
  quoteText = quoteText.replaceAll("—", "-").replaceAll("’", "'");
  typingText.innerHTML = quoteText.split(" ").map(word => 
    `<span class="word">${word.split("").map(letter => `<span class="letter">${letter}</span>`).join('')}</span><span class="letter"> </span>`).join('');
  quote = quoteText.split("");
}

function startBackendTimer() {
  testId = setInterval(() => {
    lengthOfTest++;
    timer.textContent = lengthOfTest;
  }, 1000);
}

function tryAgain() {
  clearInterval(testId);

  quote = [];
  currentIndex = 0;
  testRunning = false;
  lengthOfTest = 0;
  testId = null;
  correctCharsTyped = 0;
  totalCharsTyped = 0;

  document.querySelector(".accuracy").innerHTML = '';
  document.querySelector(".wpm").innerHTML = '';
  document.querySelector(".timer").innerHTML = '0';
  document.querySelector(".highScore").innerHTML = '';

  displayQuote();
}

displayQuote();

tryAgainBtn.addEventListener("click", () => {
  tryAgain();
});

document.body.addEventListener("keydown", (event) => {
  if (currentIndex === 0 && !testRunning) {
    testRunning = true;
    startBackendTimer();
  }

  if (testRunning) {
    if (event.key === "Shift") {
      return;
    }

    const currentLetter = quote[currentIndex];
    const letterSpan = typingText.querySelectorAll(".letter")[currentIndex];

    if (event.key === currentLetter) {
      letterSpan.style.backgroundColor = "rgb(0, 100, 0)";
      letterSpan.style.color = "rgb(255, 255, 255)";
      letterSpan.style.borderRadius = "4px";
      correctCharsTyped++;
      currentIndex++;
    } 

    else if (event.key === 'Backspace') {
      if (currentIndex > 0) {
        currentIndex--;
        let prevSpan = typingText.querySelectorAll(".letter")[currentIndex];
        if (prevSpan.style.backgroundColor === "rgb(0, 100, 0)") {
          correctCharsTyped--;
        }
        prevSpan.style.backgroundColor = "rgb(62, 62, 62)";
        prevSpan.style.color = "rgb(255, 255, 255)";
      }
    }
    
    else {
      letterSpan.style.backgroundColor = "rgb(139, 0, 0)";
      letterSpan.style.color = "rgb(255, 255, 255)";
      letterSpan.style.borderRadius = "4px";
      currentIndex++;
    }

    totalCharsTyped++;
    
    const accuracyDisplay = document.querySelector(".accuracy");
    const accuracy = (correctCharsTyped / currentIndex) * 100;
    accuracyDisplay.innerHTML = `${Math.round(accuracy)}% Accuracy`;

    const wpmDisplay = document.querySelector(".wpm");
    if (lengthOfTest > 0) {
      const wpm = (correctCharsTyped / 5) / (lengthOfTest / 60);
      wpmDisplay.innerHTML = `${Math.round(wpm)} WPM`;
    } 
    
    else {
      wpmDisplay.innerHTML = `0 WPM`;
    }

    results.appendChild(wpmDisplay);
    results.appendChild(accuracyDisplay);

    if (currentIndex === quote.length) {
      clearInterval(testId);
      testRunning = false;
      const wpm = (correctCharsTyped / 5) / (lengthOfTest / 60);
      if (wpm > highScore) {
        localStorage.setItem('highScore', wpm);
        highScore = wpm;
        document.querySelector(".highScore").textContent = `Highscore: ${Math.round(wpm)} WPM`;
      }
      else {
        document.querySelector(".highScore").textContent = `Highscore: ${Math.round(highScore)} WPM`;
      }
    }
  }
});
