from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import json
from werkzeug.utils import secure_filename

# Import your tools
from transcript import Transcriber
from ai_worker import AiWorker
from clipper import create_clips #type: ignore

app = Flask(__name__)
CORS(app)

# DYNAMIC SETTINGS
UPLOAD_FOLDER = "uploaded_videos"
OUTPUT_FOLDER = "rendered_videos"
JSON_PATH = "results.json"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# ---------------------------------------------------------
# STEP 0: DYNAMIC UPLOAD
# ---------------------------------------------------------
@app.route('/upload', methods=['POST'])
def upload_video():
    if 'file' not in request.files:
        return jsonify({"status": "error", "message": "No file provided."}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"status": "error", "message": "No file selected."}), 400
    
    filename = secure_filename(file.filename) #type:ignore
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)
    
    # We return the absolute path so the frontend can send it back to us for analysis
    return jsonify({
        "status": "success",
        "video_path": os.path.abspath(filepath)
    })

# ---------------------------------------------------------
# STEP 1: DYNAMIC ANALYZE
# ---------------------------------------------------------
@app.route('/analyze', methods=['POST'])
def analyze_video():
    data = request.json
    video_path = data.get('video_path') # Now dynamic from React

    if not video_path or not os.path.exists(video_path):
        return jsonify({"status": "error", "message": "Video file not found."}), 404

    try:
        transcriber = Transcriber(model_size="base") 
        transcript = transcriber.get_transcript(video_path)
        
        ai = AiWorker()
        reels = ai.get_reels_timestamps(transcript)

        if reels:
            with open(JSON_PATH, "w") as f:
                json.dump(reels, f, indent=4)
            return jsonify({"status": "success", "clips": reels})
        return jsonify({"status": "error", "message": "AI found no clips."}), 500

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# ---------------------------------------------------------
# STEP 2: DYNAMIC RENDER
# ---------------------------------------------------------
@app.route('/render', methods=['POST'])
def render_video():
    try:
        data = request.json
        final_clips = data.get('clips') 
        video_path = data.get('video_path') # Now dynamic from React

        with open(JSON_PATH, "w") as f:
            json.dump(final_clips, f, indent=4)

        filename = create_clips(video_path, JSON_PATH, OUTPUT_FOLDER)
        video_url = f"http://localhost:5000/videos/{filename}"

        return jsonify({
            "status": "success",
            "summary_url": video_url
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/videos/<path:filename>')
def serve_video(filename): #type:ignore
    return send_from_directory(OUTPUT_FOLDER, filename) #type:ignore

if __name__ == '__main__':
    app.run(debug=True, port=5000)
    CORS(app, resources={r"/*": {"origins": "*"}})