#!/bin/bash
# Keep the dev server alive - restart it if it dies
cd /home/z/my-project
while true; do
  ./node_modules/.bin/next dev -p 3000 2>&1
  echo "Server exited, restarting in 2s..."
  sleep 2
done
