import os
from typing import List
from moviepy import VideoFileClip # type: ignore
from faster_whisper import WhisperModel # type: ignore

class Transcriber:
    """Extracts audio from video and transcribes it using Faster Whisper."""

    def __init__(self, model_size: str = "base") -> None:
        self.model = WhisperModel(model_size, device="cpu", compute_type="int8")

    def get_transcript(self, video_path: str) -> str:
        audio_path: str = "temp_audio.mp3"
        
        # 'with' ensures the video file is closed after audio extraction
        with VideoFileClip(video_path) as video:
            if video.audio is not None:
                video.audio.write_audiofile(audio_path, codec='mp3', logger=None)
        
        # Add this comment at the end of your transcribe line
        segments, info = self.model.transcribe(audio_path)  # type: ignore
        
        transcript_lines: List[str] = []
        for s in segments:
            timestamp = self._format_time(s.start)
            transcript_lines.append(f"[{timestamp}] {s.text}")
            
        if os.path.exists(audio_path):
            os.remove(audio_path)
            
        return "\n".join(transcript_lines)

    def _format_time(self, seconds: float) -> str:
        m, s = divmod(seconds, 60)
        h, m = divmod(m, 60)
        return f"{int(h):02}:{int(m):02}:{int(s):02}"