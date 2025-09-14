from flask import Flask, jsonify, request
from flask_cors import CORS
import json, os, re
from google import genai


app = Flask(__name__)
CORS(app)

with open("../api.txt", "r") as f:
    content = f.read()
    client = genai.Client(api_key=content)




COURSES_FILE = "courses-info.json"
FLASHCARDS_DIR = "flashcards_data"

os.makedirs(FLASHCARDS_DIR, exist_ok=True)

def load_courses():
    try:
        with open(COURSES_FILE, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def load_flashcards(course_code):
    path = os.path.join(FLASHCARDS_DIR, f"{course_code}.json")
    if os.path.exists(path):
        with open(path, "r") as f:
            return json.load(f)
    return []

def save_flashcards(course_code, flashcards):
    path = os.path.join(FLASHCARDS_DIR, f"{course_code}.json")
    with open(path, "w") as f:
        json.dump(flashcards, f, indent=2)

@app.route("/course/<course_code>/chat", methods=["POST"])
def chat(course_code):
    try:
        data = request.get_json()
        if not data or "message" not in data:
            return jsonify({"error": "Message is required"}), 400

        user_message = data["message"]
        courses = load_courses()

        selected_course = next((c for c in courses if c["title"] == course_code), None)
        if not selected_course:
            return jsonify({"error": f"Course {course_code} not found"}), 404

        system_prompt = f"""
You are a flashcard maker for the course: {selected_course['title']}
Description: {selected_course['Course_Description']}
Objectives: {selected_course['Course_Objectives']}
Outcomes: {selected_course['learning_outcomes']}

Student's question: {user_message}

Format your response as JSON and only generate one front and back:
{{
"front": "...", "back": "..."
}}
"""

        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=system_prompt
        )

        text = response.candidates[0].content.parts[0].text
        clean_text = re.sub(r'^```json\s*', '', text)  # remove ```json at the start
        clean_text = re.sub(r'\s*```$', '', clean_text)  # remove ``` at the end

        try:
            data = json.loads(clean_text)
            # Check if it's a single flashcard
            if "front" in data and "back" in data:
                flashcards_from_ai = [data]  # wrap in list
                chat_response = data.get("front", "Here’s a new concept")  # optional: show front as chat message
            else:
                chat_response = data.get("chat_response", "")
                flashcards_from_ai = data.get("flashcards", [])
        except Exception:
            chat_response = text
            flashcards_from_ai = [{"front": "Key concept", "back": text}]

        # Save flashcards
        existing_flashcards = load_flashcards(course_code)
        all_flashcards = existing_flashcards + flashcards_from_ai
        save_flashcards(course_code, all_flashcards)

        return jsonify({
            "success": True,
            "course_code": course_code,
            "chat_response": chat_response,
            "flashcards": flashcards_from_ai  # Only the new flashcards
        })

    except Exception as e:
        print("Error in chat route:", e)
        return jsonify({"error": str(e)}), 500

@app.route("/course/<course_code>/flashcards", methods=["GET"])
def get_flashcards(course_code):
    flashcards = load_flashcards(course_code)
    return jsonify(flashcards)

if __name__ == "__main__":
    app.run(debug=True)
