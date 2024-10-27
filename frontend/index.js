document.addEventListener("DOMContentLoaded", () => {
    let timeLeft = 600; // 10 minutes in seconds
    const timerElement = document.getElementById("timer");
    const submitButton = document.getElementById("submit-button");
    const journalEntry = document.getElementById("journal-entry");

    const timerInterval = setInterval(() => {
        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;
        timerElement.textContent = `Time Remaining: ${minutes}:${seconds < 10? "0" : ""}${seconds}`;
    
        if (timeLeft === 0) {
            clearInterval(timerInterval);
            journalEntry.disabled = true;
            submitButton.disabled = false; // Enable submit after time runs out
        }

        timeLeft--;
    }, 1000);
});