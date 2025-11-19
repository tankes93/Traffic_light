# Traffic Light Control System

An interactive web-based traffic light controller with realistic German-standard traffic signal transitions. Built with Flask and designed for GPIO-controlled hardware (Raspberry Pi or similar embedded systems).

![Traffic Light Demo](screenshot.png)

## Project Overview

This project implements a fully functional traffic light system with:
• **Web-based control interface** — Beautiful, animated UI with day/night themes
• **Hardware GPIO control** — Direct control of physical LED traffic lights
• **German traffic signal standard** — Authentic red → red+yellow → green transitions
• **Click-rate protection** — Prevents system overload from rapid inputs
• **Real-time synchronization** — UI and hardware LEDs stay perfectly in sync

## Features

### Visual Interface
• **Animated traffic light** with realistic housing and protective shields
• **Day/Night theme toggle** with smooth transitions, clouds, sun, moon, and stars
• **Error overlay system** that prevents rapid-fire clicking (max 3 clicks/second)
• **Smooth transitions** matching real-world traffic signal behavior

### Traffic Light Modes
• **Red Light** — Stop signal (click red light or auto-transition)
• **Red + Yellow** — Prepare to go (German standard transition phase)
• **Yellow Light** — Caution/slow down phase
• **Green Light** — Go signal (click green light to start transition)
• **Blinking Yellow** — Warning mode (click yellow light to toggle)

### Hardware Control
• **GPIO integration** using `gpioset` commands for Raspberry Pi
• **Configurable GPIO pins** (Red: 15, Yellow: 12, Green: 13)
• **Safe defaults** — System initializes to red light (safety first!)
• **State management** — Prevents conflicting light states

## Requirements

• **Python 3.x**
• **Flask** — Web framework for the control server
• **GPIO tools** (`libgpiod`) — For hardware LED control on Linux
• **Modern web browser** — For the control interface

## Installation and Usage

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/tankes93/Traffic_light.git
   cd Traffic_light
   ```

2. **Install Flask:**
   ```bash
   pip install flask
   ```

3. **Install GPIO tools** (on Raspberry Pi/Linux):
   ```bash
   sudo apt-get update
   sudo apt-get install gpiod
   ```

4. **Connect your LEDs** to GPIO pins:
   - Red LED → GPIO 15
   - Yellow LED → GPIO 12
   - Green LED → GPIO 13

### Usage

1. **Start the Flask server:**
   ```bash
   python app.py
   ```

2. **Open your browser** and navigate to:
   ```
   http://localhost:5000
   ```
   
   Or from another device on the same network:
   ```
   http://<raspberry-pi-ip>:5000
   ```

3. **Control the traffic light:**
   - Click **Red** to transition back to red (Green → Yellow → Red)
   - Click **Green** to transition to green (Red → Red+Yellow → Green)
   - Click **Yellow** to toggle blinking warning mode
   - Use the **day/night toggle** in the top-left corner

## Files in This Repo

• `app.py` — Flask web server handling HTTP requests
• `gpio_controller.py` — GPIO control logic and LED state management
• `index.html` — Main dashboard page with traffic light UI
• `static/script.js` — Interactive controls and transition logic
• `static/style.css` — Styling and animations (day/night themes)
• `S50wifi_autoconnect.sh` — WiFi auto-connect script for embedded deployment
• `S99wifi.conf` — WiFi configuration file

## Technical Details

### Traffic Signal Transitions

The system implements authentic German traffic light sequences:

**Transition to Green (German Standard):**
```
Red (2s) → Red + Yellow (1s) → Green
```

**Transition to Red:**
```
Green (0.3s) → Yellow (0.9s) → Red
```

**Blinking Yellow Mode:**
```
Yellow ON ⇄ OFF (500ms intervals)
```

### Click-Rate Protection

To prevent system overload and accidental rapid clicks:
- Tracks click timestamps in a 1-second rolling window
- Blocks input and shows error overlay if ≥3 clicks/second detected
- 3-second cooldown period with visual countdown
- Automatic click history reset

### GPIO Control

The `gpio_controller.py` uses Linux `gpioset` commands:
```python
os.system(f"gpioset gpiochip0 {GPIO_PIN}=1")  # Turn LED on
os.system(f"gpioset gpiochip0 {GPIO_PIN}=0")  # Turn LED off
```

Global state tracking ensures only one light configuration is active at any time.

## WiFi Auto-Connect (Embedded Deployment)

For standalone operation on embedded Linux systems:

1. Configure WiFi credentials in `S99wifi.conf`
2. Copy `S50wifi_autoconnect.sh` to `/etc/init.d/`
3. Make it executable and enable at boot:
   ```bash
   chmod +x /etc/init.d/S50wifi_autoconnect.sh
   ```

The system will automatically connect to WiFi and start the Flask server on boot.

## License

This project is licensed under the MIT License — see the `LICENSE` file for details.


