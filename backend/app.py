from flask import Flask, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

# Load course data
with open('courses-info.json', 'r') as f:
    courses = json.load(f)

@app.route('/api/course/<course_name>')
def get_course(course_name):
    # Find course by name
    for course in courses:
        if course_name.lower() in course['title'].lower():
            return jsonify(course)
    return jsonify({'error': 'Not found'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)