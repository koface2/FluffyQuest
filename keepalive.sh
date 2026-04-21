#!/usr/bin/env bash
# Keeps the Codespace alive by running indefinitely in the background.
# Started automatically via postStartCommand in devcontainer.json.
while true; do
    sleep 240
done
#!/bin/bash
while true; do
  echo "Keeping Codespace alive... $(date)"
  sleep 300
done
