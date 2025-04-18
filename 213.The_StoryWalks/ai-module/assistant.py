import google.generativeai as genai
from googletrans import Translator
from gtts import gTTS
import os

languages = {
    "en": "English",
    "ta": "Tamil",
    "hi": "Hindi",
    "fr": "French",
    "es": "Spanish",
    "de": "German",
    "ja": "Japanese",
}

def cultural_assistant_translate(model, user_prompt, lang_code):
    try:
        response = model.generate_content(user_prompt)
        original_text = response.text

        translator = Translator()
        translated = translator.translate(original_text, dest=lang_code).text

        # Create and save TTS
        tts = gTTS(text=translated, lang=lang_code)
        audio_path = f"tts_{lang_code}.mp3"
        tts.save(audio_path)

        return translated, audio_path
    except Exception as e:
        raise RuntimeError(f"Translation or TTS error: {e}")
