document.addEventListener("DOMContentLoaded", () => {
    let timeLeft = 20; // 10 minutes in seconds
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

    submitButton.addEventListener("click", () => {
        const entryContent = journalEntry.ariaValueMax;
        const timestamp = new Date().toISOString();

        fetch('http://localhost:5000/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ entry: entryContent, timestamp: timestamp }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert(data.message);
            } else {
                alert('Failed to submit journal entry.');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('An error occured while submitting the journal entry.');
        });
    });
});