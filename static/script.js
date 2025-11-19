let blinking = false;
let blinkInterval;
let currentLight = null;

// Click tracking for error detection
let clickTimes = [];
let isErrorActive = false;

// Timeout management for transitions
let activeTimeouts = [];

function clearAllTimeouts() {
    activeTimeouts.forEach(timeout => clearTimeout(timeout));
    activeTimeouts = [];
}

function addTimeout(callback, delay) {
    const timeoutId = setTimeout(() => {
        callback();
        // Remove this timeout from the active list when it completes
        const index = activeTimeouts.indexOf(timeoutId);
        if (index > -1) {
            activeTimeouts.splice(index, 1);
        }
    }, delay);
    activeTimeouts.push(timeoutId);
    return timeoutId;
}

function initializeTrafficLight() {
    stopBlinking();
    document.querySelectorAll('.circle').forEach(el => el.classList.remove('on'));
    setLight('red');
    
    // Initialize theme toggle
    initializeThemeToggle();
}

function checkClickRate() {
    const now = Date.now();
    clickTimes.push(now);
    
    // Remove clicks older than 1 second
    clickTimes = clickTimes.filter(time => now - time <= 1000);
    
    // If 3 or more clicks in 1 second, show error
    if (clickTimes.length >= 3) {
        showError();
        return true; // Block the action
    }
    
    return false; // Allow the action
}

function showError() {
    if (isErrorActive) return;
    
    isErrorActive = true;
    const errorOverlay = document.getElementById('errorOverlay');
    const progressFill = document.querySelector('.error-progress-fill');
    
    // Reset progress bar
    progressFill.style.animation = 'none';
    progressFill.offsetHeight; // Trigger reflow
    progressFill.style.animation = 'error-countdown 3s linear forwards';
    
    // Show error overlay
    errorOverlay.classList.add('show');
    
    // Clear click history
    clickTimes = [];
    
    // Hide error after 3 seconds
    setTimeout(() => {
        errorOverlay.classList.remove('show');
        isErrorActive = false;
    }, 3000);
}

function initializeThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const backgroundContainer = document.getElementById('background-container');
    
    themeToggle.addEventListener('change', function() {
        if (this.checked) {
            // Switch to night mode
            backgroundContainer.classList.remove('day');
            backgroundContainer.classList.add('night');
        } else {
            // Switch to day mode
            backgroundContainer.classList.remove('night');
            backgroundContainer.classList.add('day');
        }
    });
}

function setLight(color) {
    // Clear any pending timeouts to prevent conflicting transitions
    clearAllTimeouts();
    
    fetch(`/setLight?color=${color}`);
    document.querySelectorAll('.circle').forEach(el => el.classList.remove('on'));
    if (color === 'red' || color === 'yellow' || color === 'green') {
        document.getElementById(color).classList.add('on');
    }
    currentLight = color;
}

function setLightInternal(color) {
    // Internal function that doesn't clear timeouts (for use during transitions)
    fetch(`/setLight?color=${color}`);
    document.querySelectorAll('.circle').forEach(el => el.classList.remove('on'));
    if (color === 'red' || color === 'yellow' || color === 'green') {
        document.getElementById(color).classList.add('on');
    }
    currentLight = color;
}

function startTransitionToGreen() {
    if (checkClickRate()) return; // Check for rapid clicking
    if (currentLight === 'green') return;

    // Clear any existing timeouts and stop blinking
    clearAllTimeouts();
    if (blinking) {
        stopBlinking();
        addTimeout(() => {
            setLight('green');
        }, 100);
        return;
    }

    if (currentLight !== 'red') {
        startTransitionToRed();
        addTimeout(() => {
            startTransitionToGreen();
        }, 2100);
        return;
    }

    // Start with red light only
    setLightInternal('red');

    addTimeout(() => {
        if (!blinking) {
            // Red + yellow phase (German standard)
            document.querySelectorAll('.circle').forEach(el => el.classList.remove('on'));
            document.getElementById('red').classList.add('on');
            document.getElementById('yellow').classList.add('on');
            fetch(`/setLight?color=red-yellow`);
            currentLight = 'red-yellow';
        }
    }, 500);
    addTimeout(() => {
        if (!blinking) {
            setLightInternal('green');
        }
    }, 1500);
}

function startTransitionToRed() {
    if (checkClickRate()) return; // Check for rapid clicking
    if (currentLight === 'red') return;

    // Clear any existing timeouts and stop blinking
    clearAllTimeouts();
    if (blinking) {
        stopBlinking();
        addTimeout(() => {
            setLight('red');
        }, 100);
        return;
    }

    setLightInternal('green');
    addTimeout(() => {
        if (!blinking) { // Only proceed if not interrupted by blinking
            setLightInternal('yellow');
        }
    }, 300);
    addTimeout(() => {
        if (!blinking) { // Only proceed if not interrupted by blinking
            setLightInternal('red');
        }
    }, 1200);
}

function toggleBlinking() {
    if (checkClickRate()) return; // Check for rapid clicking
    
    // Clear any existing timeouts first
    clearAllTimeouts();
    
    const yellow = document.getElementById('yellow');

    if (blinking) {
        stopBlinking();
        addTimeout(() => {
            setLight('red');
        }, 100);
        return;
    }

    stopBlinking();  // ensure no other blinking
    blinking = true;
    currentLight = 'blinking';
    
    // Clear all lights before starting to blink
    document.querySelectorAll('.circle').forEach(el => el.classList.remove('on'));

    blinkInterval = setInterval(() => {
        yellow.classList.toggle('on');
        const isOn = yellow.classList.contains('on');
        fetch(`/setLight?color=${isOn ? 'yellow' : 'off'}`);
    }, 500);
}



function stopBlinking() {
    blinking = false;
    clearInterval(blinkInterval);
    // Clear any active timeouts when stopping blinking
    clearAllTimeouts();
    document.getElementById('yellow').classList.remove('on');
    fetch(`/setLight?color=off`);
}