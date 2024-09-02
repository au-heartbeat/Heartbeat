#!/usr/bin/env sh

arch=${1:-backend}

if [ "$arch" = "backend" ]; then
    cd backend || exit
    ./gradlew clean check
else
    cd frontend || exit
    pnpm run build
fi
