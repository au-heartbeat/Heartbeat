#!/bin/bash
set -euo pipefail

clean() {
  echo "🚨 Start to clean related resources"
  pids="$(lsof -ti:4321,4322)"

  if [ -n "$pids" ]; then
      echo "Terminating processes on port 4321..."
      echo "$pids" | xargs kill -9
      echo "Processes terminated."
  else
      echo "No processes found on port 4321."
  fi

  docker ps -a | grep stub | awk '{print $1}' | xargs docker container stop | xargs docker container rm

  echo "🏆️ Successfully cleaned all related resources"
}

go_to_frontend_dir() {
  current_dir="${PWD}"
  dir_name=$(basename "$current_dir")

  if [ "$dir_name" == "frontend" ]; then
    echo "now"
  else
    cd frontend
  fi
}

clean

echo "🐣 Start to start services"
echo "frontend"
go_to_frontend_dir
nohup pnpm run start &

echo "backend"
cd ../backend
nohup ./gradlew bootRun &

echo "stubs"
cd ../stubs
podman-compose -f docker-compose.yaml up -d stubs

cd ../frontend

echo "🏆️ Successfully start the services"
