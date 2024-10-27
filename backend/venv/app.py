from flask import Flask, request, jsonify, make_response
from flask_sqlalchemy import SQLAlchemy
from cryptography.fernet import Fernet
from flask_cors import CORS
import os

app = Flask(__name__)

# Configure Flask app to use SQLite
app.config['SQLALCHEMY_DATABASE_URI'] ='sqlite:///journal.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Allow CORS globally for all routes and all origins
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Set up SQLAlchemy
db = SQLAlchemy(app)

# Define the JournalEntry model
class JournalEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.String, nullable=False)

with app.app_context():
    db.create_all()

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
    data = request.get_json(force=True)
    if not data:
        response = make_response(jsonify({"error": "Invalid JSON format or no data provided"}), 400)
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response
    
    #Encrypt the journal entry
    try:
        encrypted_entry = fernet.encrypt(data['entry'].encode())
    except KeyError:
        response = make_response(jsonify({"error": "Missing 'entry' field"}), 400)
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response
    
    # Create and save a new journal entry to the database
    new_entry = JournalEntry(content=encrypted_entry.decode(), timestamp=data['timestamp'])
    db.session.add(new_entry)
    db.session.commit()

    response = make_response(jsonify({"message": "Journal entry submitted successfully", "entry_id": new_entry.id}), 200)
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response

@app.route('/entries', methods=['Get'])
def get_entries():
    # Retrieve all journal entries
    entries = JournalEntry.query.all()
    decrypted_entries = [
        {
            "id": entry.id,
            "content": fernet.decrypt(entry.content.encode()).decode(),
            "timestamp": entry.timestamp
        }
        for entry in entries
    ]
    response = make_response(jsonify(decrypted_entries), 200)
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response

if __name__ == '__main__':
    app.run(debug=True)
