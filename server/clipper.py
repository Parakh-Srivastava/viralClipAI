import json
import os
from typing import Any, List

# --- MOVIEPY 2.0 IMPORT FIX ---
# In v2.0, everything is under the main 'moviepy' package
try:
    from moviepy import VideoFileClip, concatenate_videoclips # type: ignore
except ImportError:
    # Fallback for v1.x just in case
    from moviepy.editor import VideoFileClip, concatenate_videoclips # type: ignore
# ------------------------------

def create_clips(video_path: str, json_path: str, output_folder: str):
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    # 1. Load the plan
    with open(json_path, 'r') as f:
        clips_data: List[Any] = json.load(f)

    # 2. Load the source video
    # We use 'with' to ensure the file closes automatically (Best Practice)
    with VideoFileClip(video_path) as full_video: # type: ignore
        
        subclips: List[Any] = []
        print(f"✂️ Cutting {len(clips_data)} clips from {video_path}...")

        try:
            # 3. Cut each segment
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

                # --- THE FIX IS HERE ---
                # v2.0 uses .subclipped() instead of .subclip()
                try:
                    cut = full_video.subclipped(start_sec, end_sec) # type: ignore
                except AttributeError:
                    # Fallback if you somehow have v1.x
                    cut = full_video.subclip(start_sec, end_sec) # type: ignore
                
                subclips.append(cut)

            # 4. Merge
            final_video = concatenate_videoclips(subclips) # type: ignore
            
            output_filename = "Viral_Summary.mp4"
            output_path = os.path.join(output_folder, output_filename)
            
            # 5. Write file
            print("💾 Writing video file... (This might take a moment)")
            final_video.write_videofile(output_path, codec="libx264", audio_codec="aac") # type: ignore
            
            print(f"✨ Video successfully saved to: {output_path}")
            return output_filename

        except Exception as e:
            print(f"💥 Clipper Error: {e}")
            raise e