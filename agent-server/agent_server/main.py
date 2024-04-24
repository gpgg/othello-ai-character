from openai import OpenAI
from utils import Config
import re

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

from flask import Flask, request, jsonify
from flask_cors import CORS
app = Flask(__name__)
CORS(app)

@app.route('/api/user_msg', methods=['POST'])
def add_message():
    print(request.mimetype)
    data = request.json
    # data = json.loads(data)
    print(data["user_msg"])
    
    user_message = data["user_msg"]
    response = chat_completion(user_message)
    
    move, explanation = repatter.findall(response)[0]
    move = move.strip()
    x = int(move[1])
    y = int(move[3])
    explanation = explanation.strip()
    print(explanation)
    response = jsonify({"move": [x, y]})
    # response.headers.add('Access-Control-Allow-Origin', '*')
    return response
  
@app.route("/", methods=["GET"])
def home():
  return "hello"

if __name__ == '__main__':
    app.run(host= '0.0.0.0',debug=True)