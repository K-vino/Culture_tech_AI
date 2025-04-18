import google.generativeai as genai

def generate_travel_plan(model, details):
    start = details.get("start", "Salem")
    destination = details.get("destination", "Goa")
    travel_mode = details.get("travel_mode", "Train")
    trip_type = details.get("trip_type", "Solo")
    accommodation = details.get("accommodation", "Hotel")
    language = details.get("language", "English")
    food = details.get("food", [])
    must_include = details.get("must_include", "Beaches")
    must_avoid = details.get("must_avoid", "Crowds")
    accessibility = details.get("accessibility", "None")
    budget = details.get("budget", "₹10,000 - ₹15,000")
    num_days = details.get("num_days", "")

    prompt = f"""
Plan a travel itinerary from {start} to {destination}.
{f"Duration: {num_days} days." if num_days else "You decide the ideal number of days."}

Preferences:
- Travel Mode: {travel_mode}
- Trip Type: {trip_type}
- Accommodation: {accommodation}
- Food: {', '.join(food) if food else 'No specific preference'}
- Must Include: {must_include or 'None'}
- Must Avoid: {must_avoid or 'None'}
- Language: {language}
- Accessibility: {accessibility}
- Budget: {budget}

Include:
- Timeline with activities
- Cost and time management suggestions
- Place-to-place navigation
"""

    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"❌ Error: {e}"
    
##pip install flask flask-cors google-generativeai googletrans==4.0.0-rc1 gtts pandas
