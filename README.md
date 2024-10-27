# JournalingApp

## Project Overview
The **JournalingApp** is a web application designed for personal journaling. Users can write for a duration of 10 minutes, after which their entry is encrypted and securely stored on a server. These entries can only be accessed 60 days after submission, promoting thoughtful reflection.

## Key Features
- **Timed Writing Session**: Users have 10 minutes to write their journal entry.
- **Review & Submit**: After the 10 minutes, users can review and then submit their entry.
- **Encryption**: Entries are encrypted for security before being saved to the server.
- **Delayed Access**: Journal entries can be accessed only after 60 days, encouraging long-term reflection.

## Technology Stack
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Python (using Flask or FastAPI)
- **Database**: SQL (SQLite or PostgreSQL)
- **Encryption**: Python's `cryptography` library

## Folder Structure
- **frontend/**: Contains HTML, CSS, and JavaScript files for the user interface.
- **backend/**: Contains the Python server files and logic.
- **README.md**: Project overview and documentation (this file).

## Getting Started
1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/JournalingApp.git
   ```

2. **Backend Setup**:
   - Navigate to the `backend` directory.
   - Create a virtual environment:
     ```bash
     python -m venv venv
     ```
   - Activate the virtual environment:
     - For Windows:
       ```bash
       venv\Scripts\activate
       ```
     - For macOS/Linux:
       ```bash
       source venv/bin/activate
       ```
   - Install required dependencies:
     ```bash
     pip install Flask
     ```

3. **Frontend Setup**:
   - Open the `frontend` folder in your browser to interact with the application.

## Contributions
Feel free to contribute to the project by submitting pull requests, reporting issues, or suggesting new features.

## License
This project is licensed under the MIT License.

