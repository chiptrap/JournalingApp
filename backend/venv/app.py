from flask import Flask, request, jsonify, make_response
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from cryptography.fernet import Fernet
from flask_cors import CORS
import os

app = Flask(__name__)

# Configure Flask app to use SQLite and JWT
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///journals.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'  # Replace this with a strong secret key

# Set up CORS and SQLAlchemy
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
db = SQLAlchemy(app)
jwt = JWTManager(app)

# Define User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

# Define JournalEntry model
class JournalEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.String, nullable=False)

# Create the database and tables if they do not exist
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

@app.route('/')
def hello():
    return "Hello, World!"

# User registration route
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json(force=True)
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    # Check if user already exists
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 400

    # Create a new user
    hashed_password = generate_password_hash(password)
    new_user = User(username=username, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201

# User login route
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json(force=True)
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    user = User.query.filter_by(username=username).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({"error": "Invalid username or password"}), 401

    # Create an access token
    access_token = create_access_token(identity=user.id)
    return jsonify({"access_token": access_token}), 200

# Submit a journal entry route (requires authentication)
@app.route('/submit', methods=['POST'])
@jwt_required()
def submit_journal():
    user_id = get_jwt_identity()
    data = request.get_json(force=True)

    if not data:
        return jsonify({"error": "Invalid JSON format or no data provided"}), 400

    try:
        encrypted_entry = fernet.encrypt(data['entry'].encode())
    except KeyError:
        return jsonify({"error": "Missing 'entry' field"}), 400

    # Create and save a new journal entry
    new_entry = JournalEntry(user_id=user_id, content=encrypted_entry.decode(), timestamp=data['timestamp'])
    db.session.add(new_entry)
    db.session.commit()

    return jsonify({"message": "Journal entry submitted successfully", "entry_id": new_entry.id}), 200

# Retrieve all journal entries for the authenticated user
@app.route('/entries', methods=['GET'])
@jwt_required()
def get_entries():
    user_id = get_jwt_identity()
    entries = JournalEntry.query.filter_by(user_id=user_id).all()

    decrypted_entries = [
        {
            "id": entry.id,
            "content": fernet.decrypt(entry.content.encode()).decode(),
            "timestamp": entry.timestamp
        }
        for entry in entries
    ]
    return jsonify(decrypted_entries), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)