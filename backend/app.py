from flask import Flask, jsonify, request
from flask_cors import CORS
import json, os
from google import genai

app = Flask(__name__)
CORS(app)

# set API key (better to use env var in real apps)
client = genai.Client(api_key="AIzaSyCjn1UwXa5LECoLWkNy0wMi2EJb1XNJPVw")

def load_courses():
    try:
        with open("courses-info.json", "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return []

@app.route("/course/<course_code>/chat", methods=["POST"])
def unified_chat_and_flashcard(course_code):
    try:
        data = request.get_json()
        if not data or "message" not in data:
            return jsonify({"error": "Message is required"}), 400

        user_message = data["message"]
        courses = load_courses()

        # match course
        selected_course = next((c for c in courses if c["title"] == course_code), None)
        if not selected_course:
            return jsonify({"error": f"Course {course_code} not found"}), 404

        # build system prompt
        system_prompt = f"""
        You are a flashcard maker for the course: {selected_course['title']}
        Description: {selected_course['Course_Description']}
        Objectives: {selected_course['Course_Objectives']}
        Outcomes: {selected_course['learning_outcomes']}
        
        Student's question: {user_message}
        
        Format your response as JSON:
        {{
          "chat_response": "...",
          "flashcards": [
            {{"front": "...", "back": "..."}}
          ]
        }}
        """

        # call Gemini
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=system_prompt
        )

        text = response.candidates[0].content.parts[0].text

        try:
            data = json.loads(text)
        except Exception:
            # fallback if not valid JSON
            data = {
                "chat_response": text,
                "flashcards": [{"front": "Key concept", "back": text}]
            }

        return jsonify({"success": True, "course_code": course_code, **data})

    except Exception as e:
        print("Error in chat route:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
