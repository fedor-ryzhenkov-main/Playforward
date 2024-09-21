import yt_dlp
import os
from pydub import AudioSegment

def download_audio(youtube_url, output_path):
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': os.path.join(output_path, '%(title)s.%(ext)s'),
    }
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(youtube_url, download=True)
        filename = ydl.prepare_filename(info)
        
        # Convert to mp3 using pydub
        audio = AudioSegment.from_file(filename)
        mp3_filename = os.path.splitext(filename)[0] + '.mp3'
        audio.export(mp3_filename, format="mp3")
        
        # Remove the original file if it's not already an mp3
        if filename != mp3_filename:
            os.remove(filename)
        
        return mp3_filename