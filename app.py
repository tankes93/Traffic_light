from flask import Flask, request, send_from_directory
from gpio_controller import turn_on, turn_off_all
import os

# Serve from root and static/ folders
app = Flask(__name__, static_folder='static', static_url_path='/static')

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/setLight')
def set_light():
    color = request.args.get('color')
    print(f"[Flask] Received color: {color}")
    
    if color == 'off':
        turn_off_all()
    elif color:
        turn_on(color)
    
    return '', 204

if __name__ == '__main__':
    print("[Flask] Starting Traffic Light server on 0.0.0.0:5000")
    app.run(host='0.0.0.0', port=5000)


