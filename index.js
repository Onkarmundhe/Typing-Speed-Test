// Common English words categorized by difficulty
const wordLists = {
    easy: [
        'the', 'be', 'to', 'of', 'and', 'in', 'that', 'have', 'it', 'for',
        'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but',
        'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an',
        'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so',
        'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when'
    ],
    medium: [
        'people', 'think', 'other', 'time', 'year', 'could', 'some', 'them',
        'see', 'make', 'know', 'like', 'into', 'just', 'your', 'now', 'than',
        'then', 'more', 'these', 'want', 'way', 'look', 'first', 'also',
        'new', 'because', 'day', 'use', 'work', 'life', 'each', 'right',
        'world', 'must', 'start', 'great', 'where', 'while', 'might', 'feel'
    ],
    hard: [
        'through', 'between', 'important', 'children', 'business', 'service',
        'experience', 'education', 'different', 'information', 'available',
        'community', 'government', 'development', 'management', 'international',
        'technology', 'particular', 'university', 'environment', 'production',
        'organization', 'knowledge', 'understanding', 'opportunity', 'research'
    ]
};

function randomWord() {
    // Determine difficulty based on current WPM/accuracy
    let difficulty;
    const currentAccuracy = accuracy || 100;
    
    if (currentAccuracy > 95) {
        // High accuracy - mix all difficulties
        difficulty = Math.random() < 0.4 ? 'easy' : 
                    Math.random() < 0.7 ? 'medium' : 'hard';
    } else if (currentAccuracy > 85) {
        // Medium accuracy - mix easy and medium
        difficulty = Math.random() < 0.6 ? 'easy' : 'medium';
    } else {
        // Low accuracy - mostly easy words
        difficulty = Math.random() < 0.8 ? 'easy' : 'medium';
    }

    const wordList = wordLists[difficulty];
    return wordList[Math.floor(Math.random() * wordList.length)];
}

const gameTime = 60 * 1000; // 60 seconds in milliseconds
window.timer = null;
window.gameStart = null;
window.pauseTime = 0;

let accuracy = 100;
let streak = 0;
let totalKeystrokes = 0;
let correctKeystrokes = 0;

function addClass(el,name) {
  el.className += ' '+name;
}
function removeClass(el,name) {
  el.className = el.className.replace(name,'');
}

function formatWord(word) {
  return `<div class="word"><span class="letter">${word.split('').join('</span><span class="letter">')}</span></div>`;
}

function newGame() {
  document.getElementById('words').innerHTML = '';
  // Generate 400 words for the 60-second test
  for (let i = 0; i < 400; i++) {
    document.getElementById('words').innerHTML += formatWord(randomWord());
  }
  addClass(document.querySelector('.word'), 'current');
  addClass(document.querySelector('.letter'), 'current');
  document.getElementById('info').innerHTML = '60';
  window.timer = null;
  
  // Reset stats
  accuracy = 100;
  streak = 0;
  totalKeystrokes = 0;
  correctKeystrokes = 0;
  window.gameStart = null;
  document.getElementById('accuracy').innerHTML = `Accuracy: ${accuracy}%`;
  document.getElementById('streak').innerHTML = `Current Streak: ${streak}`;

  // Position cursor at the first letter
  positionCursor();
}

function getWpm() {
  const words = [...document.querySelectorAll('.word')];
  const lastTypedWord = document.querySelector('.word.current');
  const lastTypedWordIndex = words.indexOf(lastTypedWord);
  const typedWords = words.slice(0, lastTypedWordIndex);
  const correctWords = typedWords.filter(word => {
    const letters = [...word.children];
    const incorrectLetters = letters.filter(letter => letter.className.includes('incorrect'));
    return incorrectLetters.length === 0;
  });
  
  // Since we're now using exactly 1 minute, we can simplify the calculation
  // If the game ends early, we'll still calculate based on actual time elapsed
  const timeElapsed = Math.min(60, (new Date().getTime() - window.gameStart) / 1000);
  const minutesElapsed = timeElapsed / 60;
  
  return Math.round((correctWords.length / minutesElapsed) * 10) / 10;
}

function gameOver() {
  clearInterval(window.timer);
  addClass(document.getElementById('game'), 'over');
  const result = getWpm();
  document.getElementById('info').innerHTML = `WPM: ${result}`;
}

function updateStats(isCorrect) {
  totalKeystrokes++;
  if (isCorrect) {
    correctKeystrokes++;
    streak++;
  } else {
    streak = 0;
  }
  
  accuracy = Math.round((correctKeystrokes / totalKeystrokes) * 100);
  document.getElementById('accuracy').innerHTML = `Accuracy: ${accuracy}%`;
  document.getElementById('streak').innerHTML = `Current Streak: ${streak}`;
}

function toggleTheme() {
  const body = document.body;
  const currentTheme = body.getAttribute('data-theme');
  body.setAttribute('data-theme', currentTheme === 'light' ? 'dark' : 'light');
}

// Add new function to handle cursor positioning
function positionCursor() {
  const nextLetter = document.querySelector('.letter.current');
  const nextWord = document.querySelector('.word.current');
  const cursor = document.getElementById('cursor');
  
  if (nextLetter) {
    const rect = nextLetter.getBoundingClientRect();
    const gameRect = document.getElementById('game').getBoundingClientRect();
    
    // Add a small transition to smooth cursor movement
    cursor.style.transition = 'all 0.1s ease';
    cursor.style.top = (rect.top - gameRect.top + 2) + 'px';
    cursor.style.left = (rect.left - gameRect.left) + 'px';
  } else if (nextWord) {
    // If no current letter (at word end), position cursor at the end of the current word
    const rect = nextWord.getBoundingClientRect();
    const gameRect = document.getElementById('game').getBoundingClientRect();
    
    cursor.style.transition = 'all 0.1s ease';
    cursor.style.top = (rect.top - gameRect.top + 2) + 'px';
    cursor.style.left = (rect.right - gameRect.left) + 'px';
  }
}

document.getElementById('game').addEventListener('keyup', ev => {
  const key = ev.key;
  const currentWord = document.querySelector('.word.current');
  const currentLetter = document.querySelector('.letter.current');
  const expected = currentLetter?.innerHTML || ' ';
  const isLetter = key.length === 1 && key !== ' ';
  const isSpace = key === ' ';
  const isBackspace = key === 'Backspace';
  const isFirstLetter = currentLetter === currentWord.firstChild;

  if (document.querySelector('#game.over')) {
    return;
  }

  console.log({key,expected});

  if (!window.timer && isLetter) {
    window.timer = setInterval(() => {
      if (!window.gameStart) {
        window.gameStart = (new Date()).getTime();
      }
      const currentTime = (new Date()).getTime();
      const msPassed = currentTime - window.gameStart;
      const sPassed = Math.round(msPassed / 1000);
      const sLeft = Math.round((gameTime / 1000) - sPassed);
      if (sLeft <= 0) {
        gameOver();
        return;
      }
      document.getElementById('info').innerHTML = sLeft + '';
    }, 1000);
  }

  if (isLetter) {
    if (currentLetter) {
      const isCorrect = key === expected;
      addClass(currentLetter, isCorrect ? 'correct' : 'incorrect');
      removeClass(currentLetter, 'current');
      if (currentLetter.nextSibling) {
        addClass(currentLetter.nextSibling, 'current');
      }
      updateStats(isCorrect);
    }
    positionCursor(); // Position cursor immediately after letter
  }

  if (isSpace) {
    if (expected !== ' ') {
      const lettersToInvalidate = [...document.querySelectorAll('.word.current .letter:not(.correct)')];
      lettersToInvalidate.forEach(letter => {
        addClass(letter, 'incorrect');
      });
    }
    removeClass(currentWord, 'current');
    addClass(currentWord.nextSibling, 'current');
    if (currentLetter) {
      removeClass(currentLetter, 'current');
    }
    addClass(currentWord.nextSibling.firstChild, 'current');
    positionCursor(); // Position cursor immediately after space
  }

  if (isBackspace) {
    if (currentLetter && isFirstLetter) {
      // make prev word current, last letter current
      removeClass(currentWord, 'current');
      addClass(currentWord.previousSibling, 'current');
      removeClass(currentLetter, 'current');
      addClass(currentWord.previousSibling.lastChild, 'current');
      removeClass(currentWord.previousSibling.lastChild, 'incorrect');
      removeClass(currentWord.previousSibling.lastChild, 'correct');
    }
    if (currentLetter && !isFirstLetter) {
      // move back one letter, invalidate letter
      removeClass(currentLetter, 'current');
      addClass(currentLetter.previousSibling, 'current');
      removeClass(currentLetter.previousSibling, 'incorrect');
      removeClass(currentLetter.previousSibling, 'correct');
    }
    if (!currentLetter) {
      addClass(currentWord.lastChild, 'current');
      removeClass(currentWord.lastChild, 'incorrect');
      removeClass(currentWord.lastChild, 'correct');
    }
    positionCursor(); // Position cursor immediately after backspace
  }

  // move lines / words
  if (currentWord.getBoundingClientRect().top > 250) {
    const words = document.getElementById('words');
    const margin = parseInt(words.style.marginTop || '0px');
    words.style.marginTop = (margin - 35) + 'px';
    positionCursor(); // Reposition cursor after moving lines
  }
});

document.getElementById('newGameBtn').addEventListener('click', () => {
  gameOver();
  newGame();
});

document.getElementById('themeBtn').addEventListener('click', toggleTheme);

newGame();
