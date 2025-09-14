from flask import Flask, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

# Load courses data
def load_courses():
    try:
        with open("courses-info.json", 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return []


@app.route("/courses", methods=["GET"])
def get_course():
    #get the available courses
    courses = load_courses()
    return jsonify(courses)

if __name__ == "__main__":
    app.run(debug=True)