from pydub import AudioSegment
from pydub.effects import normalize
import tempfile
import logging

def normalize_audio(input_path):
    try:
        audio = AudioSegment.from_file(input_path)
        normalized_audio = normalize(audio)
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.mp3')
        temp_file.close()
        output_path = temp_file.name
        normalized_audio.export(output_path, format="mp3")
        return output_path
    except Exception as e:
        logging.error(f"Error normalizing audio: {e}")
        return input_path