from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import toml

from chatbot import setup_model, cultural_chat
from assistant import cultural_assistant_translate
from calendar_ai import setup_calendar_model, get_upcoming_events, get_event_info
from planner import generate_travel_plan

app = Flask(__name__)
CORS(app)  # Enables access from 127.0.0.1:5500 and others

# Load API Key from config.toml
config = toml.load("config.toml")
api_key = config["GOOGLE"]["API_KEY"]

# Setup shared model
model = setup_model(api_key)

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.json
    prompt = data.get("prompt", "")
    result = cultural_chat(model, prompt)
    return jsonify({"response": result})

@app.route("/api/translate", methods=["POST"])
def translate():
    data = request.json
    prompt = data.get("prompt")
    language = data.get("language")
    translated_text, audio_path = cultural_assistant_translate(model, prompt, language)
    return send_file(audio_path, mimetype="audio/mpeg", as_attachment=True)

@app.route("/api/calendar", methods=["GET"])
def calendar():
    events = get_upcoming_events()
    return jsonify(events)

@app.route("/api/event", methods=["GET"])
def event_info():
    event_name = request.args.get("name")
    location = request.args.get("location")
    response = get_event_info(model, event_name, location)
    return jsonify({"response": response})

@app.route("/api/plan", methods=["POST"])
def plan():
    details = request.json
    result = generate_travel_plan(model, details)
    return jsonify({"response": result})

if __name__ == "__main__":
    app.run(debug=True)
