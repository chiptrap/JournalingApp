from flask import Flask, request, jsonify, make_response
from cryptography.fernet import Fernet
from flask_cors import CORS
import os

app = Flask(__name__)

# Allow CORS globally for all routes and all origins
CORS(app, resources={r"/*": {"origins": "*"}})

# Generate or load encryption key
if not os.path.exists("secret.key"):
    key = Fernet.generate_key()
    with open("secret.key", "wb") as key_file:
        key_file.write(key)
else:
    with open("secret.key", "rb") as key_file:
        key = key_file.read()

fernet = Fernet(key)

# Store journal entries
journal_entries = {}

@app.route('/')
def hello():
    return "Hello, World!"

@app.route('/submit', methods=['POST', 'OPTIONS'])
def submit_journal():
    if request.method == 'OPTIONS':
        # CORS preflight handling
        response = make_response("", 200)
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        return response

    # Handle POST request
    print(f"Headers received: {request.headers}")
    data = request.json
    print(f"Data received: {data}")

    if 'entry' not in data:
        response = make_response(jsonify({"error": "No journal entry provided"}), 400)
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response

    # Encrypt the journal entry
    encrypted_entry = fernet.encrypt(data['entry'].encode())

    # Store with a unique identifier (for simplicity, we'll use a count)
    entry_id = len(journal_entries) + 1
    journal_entries[entry_id] = {"content": encrypted_entry, "timestamp": data['timestamp']}

    print(f"Entry ID: {entry_id}, Encrypted Entry: {encrypted_entry}")

    response = make_response(jsonify({"message": "Journal entry submitted successfully", "entry_id": entry_id}), 200)
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response

if __name__ == '__main__':
    app.run(debug=True)
