#!/bin/sh

CONFIG=/boot/S99wifi.conf

if [ -f "$CONFIG" ]; then
    SSID=$(grep "^SSID=" "$CONFIG" | cut -d= -f2)
    PASSWORD=$(grep "^PASSWORD=" "$CONFIG" | cut -d= -f2)

    if [ -n "$SSID" ]; then
        echo "Connecting to $SSID..."
        blctl connect_ap "$SSID" "$PASSWORD"
        sleep 2
        udhcpc -i bleth0 
    fi
else
    echo "No /boot/S99wifi.conf found"
fi

