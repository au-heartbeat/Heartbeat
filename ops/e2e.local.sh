#!/bin/bash
set -euo pipefail

clean() {
  echo "🚨 Start to clean related resources"
  pids=$(lsof -ti:4321,4322)
  if [ -n "$pids" ]; then
      echo "Terminating processes on port 4321..."
      echo "$pids" | xargs kill -9
      echo "Processes terminated."
  else
      echo "No processes found on port 4321."
  fi
  podman ps -a | grep stub|awk '{print $1}'| xargs podman container stop | xargs podman container rm
  echo "🏆️ Successfully clean all related resources"
}

clean

echo "🐣 Start to start services"
echo "frontend"
# cd frontend
nohup pnpm run start &

echo "backend"
cd ../backend
nohup ./gradlew bootRun &

echo "stubs"
cd ../stubs
podman-compose -f docker-compose.yaml up -d stubs

cd ../frontend

echo "🏆️ Successfully start the services"
