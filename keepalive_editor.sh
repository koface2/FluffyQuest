#!/bin/bash
# keepalive_editor.sh: Simulate editor activity in Codespaces by creating and deleting a temp file

while true; do
  echo "$(date)" > .keepalive_tmp
  sleep 2
  rm -f .keepalive_tmp
  sleep 58
done
