// DOM-Elemente
const settingsView = document.getElementById('settings-view');
const timerView = document.getElementById('timer-view');
const timeInput = document.getElementById('time-input');
const startBtn = document.getElementById('start-btn');
const timeDisplay = document.getElementById('time-display');
const errorMessage = document.getElementById('error-message');
const timerControls = document.getElementById('timer-controls');
const pauseBtn = document.getElementById('pause-btn');
const plusOneBtn = document.getElementById('plus-one-btn');
const minusOneBtn = document.getElementById('minus-one-btn');
const plusTenPercentBtn = document.getElementById('plus-ten-percent-btn');
const plusTwentyPercentBtn = document.getElementById('plus-twenty-percent-btn');
const checklistInput = document.getElementById('checklist-input');
const checklistDisplayContainer = document.getElementById('checklist-display-container');
const checklistDisplay = document.getElementById('checklist-display');

// Timer-Variablen
let timerInterval, totalSeconds, initialTotalSeconds;
let isPaused = false;

function startTimer() {
    const minutes = parseFloat(timeInput.value.replace(',', '.'));
    if (isNaN(minutes) || minutes <= 0) {
        errorMessage.textContent = 'Bitte eine gültige Zahl > 0 eingeben.';
        timeInput.focus();
        return;
    }
    errorMessage.textContent = '';

    totalSeconds = minutes * 60;
    initialTotalSeconds = totalSeconds;
    isPaused = false;

    renderChecklist();
    settingsView.style.display = 'none';
    timerView.style.display = 'flex';
    timerControls.style.display = 'flex';
    pauseBtn.textContent = 'Pause';

    updateDisplay(totalSeconds);
    timerInterval = setInterval(tick, 1000);
}

function tick() {
    if (isPaused) return;
    totalSeconds--;
    updateDisplay(totalSeconds);

    if (totalSeconds < 0) {
        clearInterval(timerInterval);
        timerInterval = null; // Set to null to indicate it's stopped
        timeDisplay.textContent = "Bitte abgeben";
        timeDisplay.classList.remove('time-warning', 'time-danger');
        timeDisplay.classList.add('time-expired');
        // timerControls.style.display = 'none'; // Keep controls visible
    }
}

function updateDisplay(seconds) {
    if (seconds < 0) return;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    timeDisplay.textContent = formattedTime;

    // Clear all dynamic classes first
    timeDisplay.classList.remove('time-warning', 'time-danger', 'time-expired');

    // Then add the appropriate class back if needed
    if (initialTotalSeconds > 0) {
        const percentage = (seconds / initialTotalSeconds);
        if (percentage <= 0.10) {
            timeDisplay.classList.add('time-danger');
        } else if (percentage <= 0.30) {
            timeDisplay.classList.add('time-warning');
        }
    }
}

function togglePause() {
    if (totalSeconds < 0) return; // Do not allow pause when timer is expired
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? 'Weiter' : 'Pause';
}

function addMinute() {
    if (totalSeconds < 0) return; // Do not allow adding minutes when timer is expired
    totalSeconds += 60;
    initialTotalSeconds += 60;
    updateDisplay(totalSeconds);
}

function subtractMinute() {
    if (totalSeconds < 0) return; // Do not allow subtracting minutes when timer is expired
    initialTotalSeconds = Math.max(totalSeconds, initialTotalSeconds - 60);
    totalSeconds = Math.max(0, totalSeconds - 60);
    updateDisplay(totalSeconds);
}

function addPercentage(percentage) {
    const timeToAdd = Math.round(initialTotalSeconds * percentage);

    if (totalSeconds < 0) {
        totalSeconds = 0; // Timer war abgelaufen, starte bei 0
        timerControls.style.display = 'flex'; // Blende Steuerung wieder ein
        if (!timerInterval) { // Starte Intervall neu, falls es gestoppt wurde
            timerInterval = setInterval(tick, 1000);
        }
    }
    totalSeconds += timeToAdd;
    // initialTotalSeconds wird absichtlich nicht erhöht,
    // da sich die Prozente auf die ursprünglich eingestellte Zeit beziehen sollen.
    updateDisplay(totalSeconds);
}

// checklistDisplay removed, using Top/Bottom instead
const checklistDisplayTop = document.getElementById('checklist-display-top');
const checklistDisplayBottom = document.getElementById('checklist-display-bottom');
const checklistContainerTop = document.getElementById('checklist-container-top');
const checklistContainerBottom = document.getElementById('checklist-container-bottom');

// ... (existing code)

function renderChecklist() {
    // Vordefinierte Regeln sammeln
    const selectedPredefinedItems = [];
    document.querySelectorAll('.predefined-rule.active').forEach(ruleElement => {
        selectedPredefinedItems.push(ruleElement.textContent);
    });

    // Eigene Notizen sammeln
    const customItems = checklistInput.value.split('\n')
        .filter(item => item.trim() !== '')
        .map(item => item.trim() + '!');

    // Alle Regeln
    const allItems = [...selectedPredefinedItems, ...customItems];

    checklistDisplayTop.innerHTML = '';
    checklistDisplayBottom.innerHTML = '';

    if (allItems.length > 0) {
        // Split logic: Half top, Half bottom
        const halfIndex = Math.ceil(allItems.length / 2);
        const topItems = allItems.slice(0, halfIndex);
        const bottomItems = allItems.slice(halfIndex);

        const createListItem = (text) => {
            const li = document.createElement('li');
            li.textContent = text;
            return li;
        };

        topItems.forEach(text => checklistDisplayTop.appendChild(createListItem(text)));
        bottomItems.forEach(text => checklistDisplayBottom.appendChild(createListItem(text)));

        checklistContainerTop.style.display = 'block';
        checklistContainerBottom.style.display = bottomItems.length > 0 ? 'block' : 'none';

    } else {
        checklistContainerTop.style.display = 'none';
        checklistContainerBottom.style.display = 'none';
    }
}

// Event-Listener
startBtn.addEventListener('click', startTimer);
timeInput.addEventListener('keyup', (event) => { if (event.key === 'Enter') startTimer(); });
pauseBtn.addEventListener('click', togglePause);
plusOneBtn.addEventListener('click', addMinute);
minusOneBtn.addEventListener('click', subtractMinute);
plusTenPercentBtn.addEventListener('click', () => addPercentage(0.10));
plusTwentyPercentBtn.addEventListener('click', () => addPercentage(0.20));


// Rule Toggling Logic
document.querySelectorAll('.predefined-rule').forEach(rule => {
    rule.addEventListener('click', () => {
        rule.classList.toggle('active');
    });
});

// Dark Mode Logic
window.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    // Function to set dark mode state
    const setDarkMode = (isDark) => {
        if (isDark) {
            document.body.classList.add('dark-mode');
            darkModeToggle.checked = true;
        } else {
            document.body.classList.remove('dark-mode');
            darkModeToggle.checked = false;
        }
    };

    // Check for saved dark mode preference
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDarkMode);

    // Listener for toggle switch
    darkModeToggle.addEventListener('change', () => {
        const isChecked = darkModeToggle.checked;
        localStorage.setItem('darkMode', isChecked);
        setDarkMode(isChecked);
    });
});
