import httpx
import json
import re
from typing import List, TypedDict, Any

class Reel(TypedDict):
    start_time: str
    end_time: str
    description: str
    virality_score: int

class AiWorker:
    def __init__(self, timeout: int = 300) -> None:
        self.client = httpx.Client(timeout=timeout)
        self.model = "llama3.2" 

    def get_reels_timestamps(self, transcript_data: Any) -> List[Reel]:
        formatted_transcript = self._format_transcript(transcript_data)
        
        if not formatted_transcript:
            print("⚠️ ERROR: Transcript text is empty! AI has nothing to read.")
            return []

        print(f"🧠 AI is reading {len(formatted_transcript)} characters of text...")

        prompt = f"""
        You are a master video editor.
        Below is a transcript of a video with timestamps [MM:SS].
        
        Your Goal: Find 3-5 distinct, funny, or viral segments to cut into short clips (Reels/TikToks).
        
        TRANSCRIPT:
        {formatted_transcript}

        INSTRUCTIONS:
        - Group consecutive lines into a single logical segment.
        - Start time and End time MUST be in "HH:MM:SS" format.
        - Return ONLY raw JSON.

        REQUIRED JSON OUTPUT FORMAT:
        [
            {{
                "start_time": "00:03:59",
                "end_time": "00:04:15",
                "description": "Ned discovers magic",
                "virality_score": 9
            }}
        ]
        """

        try:
            print("⏳ Sending to Llama 3.2...")
            response = self.client.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    "format": "json"
                }
            )
            
            if response.status_code != 200:
                print(f"❌ Ollama Error: {response.status_code} - {response.text}")
                return []

            raw_response = response.json().get('response', '')
            
            # Use the new smart extractor
            return self._extract_json(raw_response)

        except Exception as e:
            print(f"💥 AI Worker Error: {e}")
            return []

    # --- HELPER 1: FORMATTER ---
    def _format_transcript(self, data: Any) -> str:
        try:
            if isinstance(data, str): return data
            if isinstance(data, list):
                output = []
                for entry in data: #type: ignore
                    if isinstance(entry, dict): 
                        t_val = float(entry.get('time', 0) or entry.get('start', 0)) #type: ignore
                        text = entry.get('text', '').strip() #type: ignore
                        minutes = int(t_val)
                        seconds = int((t_val - minutes) * 100)
                        output.append(f"[{minutes:02d}:{seconds:02d}] {text}") #type: ignore
                return "\n".join(output) #type: ignore
            return str(data)
        except Exception:
            return str(data) #type: ignore

    # --- HELPER 2: SMART JSON EXTRACTOR ---
    def _extract_json(self, text: str) -> List[Reel]:
        data = None
        try:
            # 1. Try direct parse
            data = json.loads(text)
        except json.JSONDecodeError:
            # 2. Try regex if direct parse fails
            try:
                match = re.search(r'\{.*\}|\[.*\]', text, re.DOTALL)
                if match:
                    data = json.loads(match.group(0))
            except Exception:
                pass
        
        if data is None:
            print("❌ Could not parse JSON from AI response.")
            return []

        # --- THE FIX FOR YOUR ERROR ---
        # If AI returns a list: [{}, {}] -> Perfect, return it.
        if isinstance(data, list):
            return data #type: ignore
            
        # If AI returns a dict: {"segments": [{}, {}]} -> Unwrap it!
        if isinstance(data, dict):
            # Look for common keys Llama likes to use
            for key in ['segments', 'clips', 'reels', 'timestamps']:
                if key in data and isinstance(data[key], list):
                    print(f"📦 Unwrapped data from key: '{key}'")
                    return data[key] #type: ignore
            
            # If no known keys, maybe the dict IS the single clip? (Rare but possible)
            if 'start_time' in data:
                return [data] #type: ignore

        print("⚠️ Received JSON, but it wasn't a list of clips.")
        return []