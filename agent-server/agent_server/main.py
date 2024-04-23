from openai import OpenAI
from utils import Config


# config = Config()
# client = OpenAI(api_key=config.api_key)

# response = client.chat.completions.create(
#   model="gpt-3.5-turbo",
#   messages=[
#     {"role": "system", "content": "You are a helpful assistant."},
#     {"role": "user", "content": "Who won the world series in 2020?"},
#     {"role": "assistant", "content": "The Los Angeles Dodgers won the World Series in 2020."},
#     {"role": "user", "content": "Where was it played?"}
#   ]
# )

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
    
    response = jsonify({"move": [5, 3]})
    # response.headers.add('Access-Control-Allow-Origin', '*')
    return response
  
@app.route("/", methods=["GET"])
def home():
  return "hello"

if __name__ == '__main__':
    app.run(host= '0.0.0.0',debug=True)