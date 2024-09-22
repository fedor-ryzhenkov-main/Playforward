from pydub import AudioSegment
from pydub.effects import normalize
import tempfile
import logging
import os

def normalize_audio(input_path, base_path):
    try:
        audio = AudioSegment.from_file(input_path)
        normalized_audio = normalize(audio)
        
        output_dir = os.path.join(base_path, 'normalized')
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, os.path.basename(input_path))
        
        normalized_audio.export(output_path, format="mp3")
        
        return output_path
    except Exception as e:
        logging.error(f"Error normalizing audio: {e}")
        return input_path