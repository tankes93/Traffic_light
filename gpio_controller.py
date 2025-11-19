# gpio_controller.py

import os

RED_GPIO = 15
YELLOW_GPIO = 12
GREEN_GPIO = 13

# Store current light globally
current_light = 'red'  # Initialize with red as default (safety first!)

# Set initial state to red
os.system(f"gpioset gpiochip0 {RED_GPIO}=1")
os.system(f"gpioset gpiochip0 {YELLOW_GPIO}=0")
os.system(f"gpioset gpiochip0 {GREEN_GPIO}=0")

# Helper for German standard red->red+yellow->green transition
import time
def transition_red_to_green(delay_redyellow=1.0, delay_green=0.0):
    """
    Perform the German standard transition: red -> red+yellow -> green
    delay_redyellow: seconds to keep red+yellow on
    delay_green: optional delay after green
    """
    turn_on('red')
    time.sleep(0.1)  # ensure state is set
    turn_on('red-yellow')
    time.sleep(delay_redyellow)
    turn_on('green')
    if delay_green > 0:
        time.sleep(delay_green)

def turn_off_all():
    global current_light
    print("[GPIO] Turning all LEDs off")
    for gpio in [RED_GPIO, YELLOW_GPIO, GREEN_GPIO]:
        os.system(f"gpioset gpiochip0 {gpio}=0")
    current_light = None

def turn_on(color):
    global current_light

    leds = {
        'red': RED_GPIO,
        'yellow': YELLOW_GPIO,
        'green': GREEN_GPIO
    }


    if color == 'red-yellow':
        # For red-yellow, keep red ON and add yellow (German standard)
        print("[GPIO] RED + YELLOW ON (transition to green)")
        if current_light != 'red':  # Only set red if it wasn't already on
            os.system(f"gpioset gpiochip0 {RED_GPIO}=1")
        os.system(f"gpioset gpiochip0 {YELLOW_GPIO}=1")
        os.system(f"gpioset gpiochip0 {GREEN_GPIO}=0")
        current_light = 'red-yellow'

    elif color == 'red':
        print("[GPIO] Turning on RED")
        os.system(f"gpioset gpiochip0 {RED_GPIO}=1")
        os.system(f"gpioset gpiochip0 {YELLOW_GPIO}=0")
        os.system(f"gpioset gpiochip0 {GREEN_GPIO}=0")
        current_light = 'red'
        
    elif color == 'yellow':
        print("[GPIO] Turning on YELLOW")
        os.system(f"gpioset gpiochip0 {RED_GPIO}=0")
        os.system(f"gpioset gpiochip0 {YELLOW_GPIO}=1")
        os.system(f"gpioset gpiochip0 {GREEN_GPIO}=0")
        current_light = 'yellow'
        
    elif color == 'green':
        print("[GPIO] Turning on GREEN")
        # For transition to green, turn off others first
        os.system(f"gpioset gpiochip0 {RED_GPIO}=0")
        os.system(f"gpioset gpiochip0 {YELLOW_GPIO}=0")
        os.system(f"gpioset gpiochip0 {GREEN_GPIO}=1")
        current_light = 'green'

    elif color == 'off':
        print("[GPIO] Received 'off' command (all off)")
        turn_off_all()

    else:
        print(f"[GPIO] Unknown color: {color}")
