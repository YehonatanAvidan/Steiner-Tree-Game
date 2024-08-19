import os
import json


class History:
    def __init__(self, filename='history.json'):
        self.history = {}
        self.filename = filename
        if os.path.exists(filename):
            with open(filename, 'r') as f:
                self.history = json.load(f)

    def add(self, name, game_history):
        if name not in self.history:
            self.history[name] = []
        self.history[name].append(game_history)
        self.save()
    
    def save(self):
        with open(self.filename, 'w') as f:
            json.dump(self.history, f)
