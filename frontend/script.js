document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("register-form");
    const loginForm = document.getElementById("login-form");
    const journalSection = document.getElementById("journal-section");
    const submitEntryButton = document.getElementById("submit-entry-button");
    const viewEntriesButton = document.getElementById("view-entries-button");
    const logoutButton = document.getElementById("logout-button");
    const darkModeToggle = document.getElementById("dark-mode-toggle");
    const timerElement = document.createElement("div");
    journalSection.insertBefore(timerElement, submitEntryButton);

    let timerInterval;

    // Load dark mode setting from local storage
    if (localStorage.getItem('darkMode') === 'enable') {
        enableDarkMode();
    }

    // Dark mode toggle funcctionality
    darkModeToggle.addEventListener("click", () => {
        if (document.body.classList.contains("dark-mode")) {
            disableDarkMode();
        } else {
            enableDarkMode();
        }
    });

    function enableDarkMode() {
        document.body.classList.add("dark-mode");
        document.querySelector(".container").classList.add("dark-mode");
        localStorage.setItem('darkMode', 'enable');
    }

    function disableDarkMode() {
        document.body.classList.remove("dark-mode");
        document.querySelector(".container").classList.remove("dark-move");
        localStorage.setItem('darkMode', 'disable');
    }

    // Register a new user
    registerForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const username = document.getElementById("register-username").value;
        const password = document.getElementById("register-password").value;

        fetch('http://192.168.1.223:5000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Registration failed");
            }
            return response.json();
        })
        .then(data => {
            alert("User registered successfully");
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Registration failed');
        });
    });

    // Login an existing user
    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const username = document.getElementById("login-username").value;
        const password = document.getElementById("login-password").value;

        fetch('http://192.168.1.223:5000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Login failed");
            }
            return response.json();
        })
        .then(data => {
            alert("Login successful");
            // Save the JWT token for future requests
            localStorage.setItem("access_token", data.access_token);
            // Show the journal section after successful login
            document.getElementById("auth-section").style.display = "none";
            journalSection.style.display = "block";

            // Start the 10-minute timer
            startTimer();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Login failed');
        });
    });

    // Function to start the 10-minute timer
    function startTimer() {
        let timeLeft = 10; // 10 minutes in seconds
        submitEntryButton.disabled = true;

        timerInterval = setInterval(() => {
            let minutes = Math.floor(timeLeft / 60);
            let seconds = timeLeft % 60;
            timerElement.textContent = `Time Remaining: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            
            if (timeLeft === 0) {
                clearInterval(timerInterval);
                timerElement.textContent = "You can now submit your entry.";
                submitEntryButton.disabled = false; // Enable submit button after time runs out
            }
            
            timeLeft--;
        }, 1000);
    }

    // Submit a journal entry
    submitEntryButton.addEventListener("click", () => {
        const entryContent = document.getElementById("journal-entry").value;
        const timestamp = new Date().toISOString();
        const token = localStorage.getItem("access_token");

        fetch('http://192.168.1.223:5000/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ entry: entryContent, timestamp })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to submit entry");
            }
            return response.json();
        })
        .then(data => {
            alert("Journal entry submitted successfully");
            document.getElementById("journal-entry").value = ""; // Clear the textarea after successful submission
            // Restart the timer for a new entry
            startTimer();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to submit journal entry');
        });
    });

    // View all journal entries
    viewEntriesButton.addEventListener("click", () => {
        const token = localStorage.getItem("access_token");

        fetch('http://192.168.1.223:5000/entries', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch entries");
            }
            return response.json();
        })
        .then(data => {
            const entriesList = document.getElementById("entries-list");
            entriesList.innerHTML = ""; // Clear the list before displaying new entries
            data.forEach(entry => {
                const entryElement = document.createElement("div");
                entryElement.innerHTML = `
                    <p><strong>Timestamp:</strong> ${entry.timestamp}</p>
                    <p><strong>Content:</strong> ${entry.content}</p>
                    <hr>
                `;
                entriesList.appendChild(entryElement);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to fetch journal entries');
        });
    });
    
    logoutButton.addEventListener("click", () => {
        // Remove the JWT token from local storage
        localStorage.removeItem("access_token");

        // Hide the journal section and show the auth section
        document.getElementById("journal-section").style.display = "none";
        document.getElementById("auth-section").style.display = "block";

        // Clear the journal entry textarea and entries list
        document.getElementById("journal-entry").value = "";
        document.getElementById("entries-list").innerHTML = "";

        alert("You have been logged out successfully.");
    });
});
