from flask import Flask, send_from_directory, request, jsonify
import json

import history

app = Flask(__name__)

user_history_cache = history.History()


@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')


@app.route('/game.js')
def serve_game():
    return send_from_directory('.', 'game.js')


@app.route('/history.js')
def serve_history():
    return send_from_directory('.', 'history.js')

# @app.route('/leaderboard', methods=['GET'])
# def get_leaderboard():
#     sorted_leaderboard = sorted(
#         leaderboard, key=lambda x: x['score'], reverse=True)
#     return jsonify(sorted_leaderboard)


@app.route('/submit-history', methods=['POST'])
def submit_score():
    data = request.get_json()
    # name = data.get('name')
    user_hash = data.get('userHash')
    action_history = data.get('actionHistory')  # Store the action history
    user_history_cache.add(user_hash, action_history)
    return jsonify({'status': 'success'})


if __name__ == "__main__":
    # Make it accessible from other devices
    app.run(host='0.0.0.0', port=5000)
