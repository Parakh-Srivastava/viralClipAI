from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json

# Import your existing robust tools
from transcript import Transcriber
from ai_worker import AiWorker
from clipper import create_clips #type: ignore

app = Flask(__name__)
CORS(app) # Allows the React frontend to talk to this script

# SETTINGS
# We use the path you provided. 
# (Later we can make this dynamic if you want to upload files)
VIDEO_PATH = r"C:\Users\parak\Downloads\Untitled video - Made with Clipchamp.mp4"
JSON_PATH = "results.json"

# ---------------------------------------------------------
# STEP 1: ANALYZE (The Logic from your main.py)
# ---------------------------------------------------------
@app.route('/analyze', methods=['POST'])
def analyze_video():
    if not os.path.exists(VIDEO_PATH):
        return jsonify({"status": "error", "message": "Video file not found."}), 404

    try:
        print(f"🚀 Starting analysis for: {VIDEO_PATH}")

        # 1. Transcribe
        print("📝 Step 1: Transcribing...")
        # We initialize here so it doesn't eat RAM until you actually click the button
        transcriber = Transcriber(model_size="base") 
        transcript = transcriber.get_transcript(VIDEO_PATH)
        
        # 2. Analyze with AI
        print("🤖 Step 2: Analyzing...")
        ai = AiWorker()
        reels = ai.get_reels_timestamps(transcript)

        # 3. Save backup to JSON (Just like your script did)
        if reels:
            with open(JSON_PATH, "w") as f:
                json.dump(reels, f, indent=4)
            print(f"✅ Analysis done! Found {len(reels)} clips.")
            
            # Return the data to React
            return jsonify({
                "status": "success",
                "clips": reels 
            })
        else:
            return jsonify({"status": "error", "message": "AI found no clips."}), 500

    except Exception as e:
        print(f"💥 Error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

# ---------------------------------------------------------
# STEP 2: RENDER (Placeholder for now)
# ---------------------------------------------------------
@app.route('/render', methods=['POST'])
def render_video():
    try:
        print("💾 React sent updated timestamps. Saving to JSON...")
        
        data = request.json
        final_clips = data.get('clips') 
        OUTPUT_FOLDER = "rendered_videos" # Folder where videos go

        # 1. Save the plan
        with open(JSON_PATH, "w") as f:
            json.dump(final_clips, f, indent=4)

        # 2. RUN THE CLIPPER
        print("🎬 Starting Video Rendering Engine...")
        filename = create_clips(VIDEO_PATH, JSON_PATH, OUTPUT_FOLDER)

        # 3. generate the URL for the frontend
        video_url = f"http://localhost:5000/videos/{filename}"

        return jsonify({
            "status": "success",
            "message": "Video rendered successfully!",
            "summary_url": video_url
        })

    except Exception as e:
        print(f"Render Error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

# 3. Add a route to serve the video file so React can play it
from flask import send_from_directory

@app.route('/videos/<path:filename>')
def serve_video(filename : str):
    return send_from_directory("rendered_videos", filename)

if __name__ == '__main__':
    print("🚀 Viral Backend is running on http://localhost:5000")
    app.run(debug=True, port=5000)