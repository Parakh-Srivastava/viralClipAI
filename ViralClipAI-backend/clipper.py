import json
import os
from typing import Any, List

try:
    from moviepy import VideoFileClip, concatenate_videoclips
except ImportError:
    from moviepy.editor import VideoFileClip, concatenate_videoclips 
# ------------------------------

def create_clips(video_path: str, json_path: str, output_folder: str):
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    with open(json_path, 'r') as f:
        clips_data: List[Any] = json.load(f)

    with VideoFileClip(video_path) as full_video:
        
        subclips: List[Any] = []
        print(f"Cutting {len(clips_data)} clips from {video_path}...")

        try:
            for clip in clips_data:
                start = clip['start_time']
                end = clip['end_time']
                
                # Helper to convert HH:MM:SS to seconds
                def to_seconds(t: Any) -> float:
                    if isinstance(t, (int, float)): 
                        return float(t)
                    parts = str(t).split(':')
                    h, m, s = map(float, parts)
                    return h * 3600 + m * 60 + s

                start_sec = to_seconds(start)
                end_sec = to_seconds(end)

                try:
                    cut = full_video.subclipped(start_sec, end_sec)
                except AttributeError:
                    cut = full_video.subclip(start_sec, end_sec)
                
                subclips.append(cut)

            final_video = concatenate_videoclips(subclips)
            
            output_filename = "Viral_Summary.mp4"
            output_path = os.path.join(output_folder, output_filename)
            
            print("Writing video file... (This might take a moment)")
            final_video.write_videofile(output_path, codec="libx264", audio_codec="aac")
            print(f"Video successfully saved to: {output_path}")
            return output_filename

        except Exception as e:
            print(f"Clipper Error: {e}")
            raise e