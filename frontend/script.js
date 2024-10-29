document.addEventListener("DOMContentLoaded", () => {
    // Initialize the Quill editor as done previously
    const quill = new Quill('#editor', {
        theme: 'snow'
    });

    const registerForm = document.getElementById("register-form");
    const loginForm = document.getElementById("login-form");
    const journalSection = document.getElementById("journal-section");
    const submitEntryButton = document.getElementById("submit-entry-button");
    const viewEntriesButton = document.getElementById("view-entries-button");
    const logoutButton = document.getElementById("logout-button");
    const darkModeToggle = document.getElementById("dark-mode-toggle");
    const timerElement = document.createElement("div");
    const authSection = document.getElementById("auth-section");

    journalSection.insertBefore(timerElement, submitEntryButton);

    let timerInterval;

    // Load dark mode setting from local storage
    if (localStorage.getItem('darkMode') === 'enabled') {
        enableDarkMode();
    }

    // Dark mode toggle functionality
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
        localStorage.setItem('darkMode', 'enabled');
    }

    function disableDarkMode() {
        document.body.classList.remove("dark-mode");
        document.querySelector(".container").classList.remove("dark-mode");
        localStorage.setItem('darkMode', 'disabled');
    }

    // Register a new user
    registerForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const username = document.getElementById("register-username").value;
        const password = document.getElementById("register-password").value;

        fetch('http://127.0.0.1:5000/register', {
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

        fetch('http://127.0.0.1:5000/login', {
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
            localStorage.setItem("access_token", data.access_token);
            authSection.style.display = "none";
            journalSection.style.display = "block";
            startTimer();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Login failed');
        });
    });

    function startTimer() {
        let timeLeft = 600;
        submitEntryButton.disabled = true;

        timerInterval = setInterval(() => {
            let minutes = Math.floor(timeLeft / 60);
            let seconds = timeLeft % 60;
            timerElement.textContent = `Time Remaining: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            
            if (timeLeft === 0) {
                clearInterval(timerInterval);
                timerElement.textContent = "You can now submit your entry.";
                submitEntryButton.disabled = false;
            }
            timeLeft--;
        }, 1000);
    }

    // Submit a journal entry
    submitEntryButton.addEventListener("click", () => {
        // Get the content from the Quill editor
        const entryContent = quill.root.innerHTML;
        const timestamp = new Date().toISOString();
        const token = localStorage.getItem("access_token");

        fetch('http://127.0.0.1:5000/submit', {
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
            quill.setContents([]); // Clear the editor after submission
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

        fetch('http://127.0.0.1:5000/entries', {
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
            entriesList.innerHTML = "";
            data.forEach(entry => {
                const entryDate = new Date(entry.timestamp);
                const formattedDate = entryDate.toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true
                });

                const entryElement = document.createElement("div");
                entryElement.innerHTML = `
                    <p><strong>Timestamp:</strong> ${formattedDate}</p>
                    <div><strong>Content:</strong> ${entry.content}</div>
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

    // Logout functionality
    logoutButton.addEventListener("click", () => {
        localStorage.removeItem("access_token");
        journalSection.style.display = "none";
        authSection.style.display = "block";
        quill.setContents([]);
        timerElement.textContent = "";
        document.getElementById("entries-list").innerHTML = "";
        alert("You have been logged out successfully.");
    });
});
