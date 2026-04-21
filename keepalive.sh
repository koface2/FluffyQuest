#!/usr/bin/env bash
# Keeps the Codespace alive by running indefinitely in the background.
# Started automatically via postStartCommand in devcontainer.json.
while true; do
    echo "Keeping Codespace alive... $(date)"
    # Use gp to report Codespace activity if the tool is available
    if command -v gp &>/dev/null; then
        gp sync-done keepalive 2>/dev/null || true
    fi
    sleep 240
done
