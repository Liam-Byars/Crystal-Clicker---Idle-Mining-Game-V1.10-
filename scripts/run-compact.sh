#!/bin/bash
cd /home/z/my-project
npx next dev --turbopack -p 3000 &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"

# Wait for server to be ready
for i in $(seq 1 30); do
  if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "Server ready after ${i}s"
    break
  fi
  sleep 1
done

# Call the API
echo "Calling compact-inactive..."
RESPONSE=$(curl -s -X POST http://localhost:3000/api/admin/compact-inactive -H "Content-Type: application/json" 2>&1)
echo "Response: $RESPONSE"

# Kill server
kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null
echo "Done"