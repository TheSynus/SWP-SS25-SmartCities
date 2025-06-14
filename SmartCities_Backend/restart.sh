#!/bin/bash

echo "Stopping all containers..."
docker compose down

echo "Starting containers with fresh build..."
docker compose up --build -d