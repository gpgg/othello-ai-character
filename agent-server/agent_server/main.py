import os
import re

import pygame
import requests
from flask import Flask, jsonify, request
from flask_cors import CORS
from openai import OpenAI
from utils import Config
from vits import initialize, save_audio_clip

# VITS Initilization
tts_fn = initialize()

app = Flask(__name__)
CORS(app)

pattern = "Position:([\\d\\D]+)\nJapanese Explanation:([\\d\\D]+)"
repatter = re.compile(pattern)

config = Config()
client = OpenAI(api_key=config.api_key)


def chat_completion(user_input):
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "あなたはバーチャルユーチューバーで、名前はつばめです。東京大学の五月祭にゲストとして参加しています。"},
            {"role": "user", "content": user_input},
        ]
    )
    
    return response.choices[0].message.content

def request_audio_file(text):
    res = requests.get(f"http://localhost:8081/get_audio/{text}")
    data = res.json()
    filename = data["audio_clip"]
    return filename

def fetch_audio_file(filename, save_path = "wav_files/"):
    res = requests.get(f"http://localhost:8081/files/{filename}")
    save_location = os.path.join(save_path, filename)
    with open(save_location, "wb") as f:
        f.write(res.content)
        
    return save_location
        
def play_wav_file(file_location):
    pygame.init()
    pygame.mixer.init()
    pygame.mixer.music.load(file_location)
    pygame.mixer.music.play()
    while pygame.mixer.music.get_busy():
        pass

@app.route('/api/user_msg', methods=['POST'])
def add_message():
    print(request.mimetype)
    data = request.json
    # data = json.loads(data)
    print(data["user_msg"])
    
    user_message = data["user_msg"]
    response = chat_completion(user_message)
    print(response)
    move, explanation = repatter.findall(response)[0]
    move = move.strip()
    move = move.replace(" ", "")
    x = int(move[1])
    y = int(move[3])
    explanation = explanation.strip()
    print(explanation)
    
    # print("starting requesting audio file")
    # wav_filename = request_audio_file(explanation)
    # print("starting fetching audio file")
    # save_location = fetch_audio_file(wav_filename)
    
    # generate audio file
    filename = save_audio_clip(explanation, tts_fn)
    # play sound
    file_location = os.path.join('./audio_clips/mika', f"{filename}.wav")
    print("play sound")
    play_wav_file(file_location)
    
    response = jsonify({"move": [x, y]})
    # response.headers.add('Access-Control-Allow-Origin', '*')
    return response
  
@app.route("/", methods=["GET"])
def home():
  return "hello"

if __name__ == '__main__':
    app.run(host= '0.0.0.0',debug=True)