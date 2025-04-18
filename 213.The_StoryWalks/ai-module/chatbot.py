import google.generativeai as genai

ALLOWED_TOPICS = {
    "culture", "tourism", "village", "villages", "location", "blog",
    "news", "event", "ticket", "booking", "ar", "vr", "guide", "heritage",
    "tradition", "festival", "museum", "attraction", "itinerary"
}

SYSTEM_PROMPT = """You are a helpful cultural tourism chat assistant. 
Only answer questions related to:
- Culture & Tourism
- Villages & Locations
- Blogs, News, Events
- Ticket Booking
- AR/VR Guides

For unrelated topics, reply: "I'm sorry, I only answer questions about cultural tourism and related topics."
"""

def setup_model(api_key):
    genai.configure(api_key=api_key)
    return genai.GenerativeModel('gemini-1.5-pro')

def cultural_chat(model, prompt):
    if not any(topic in prompt.lower() for topic in ALLOWED_TOPICS):
        if prompt.lower().strip() in {"hi", "hello", "hey"}:
            return "Hello! 👋 How can I assist you with cultural tourism today?"
        else:
            return "I'm sorry, I only answer questions about cultural tourism and related topics."
    try:
        chat = model.start_chat()
        response = chat.send_message(SYSTEM_PROMPT + "\n\n" + prompt)
        return response.text
    except Exception as e:
        return f"Error generating response: {e}"
