#!/bin/bash

echo "Stopping all containers..."
docker compose -f docker-compose-dev.yml down

echo "Starting containers with fresh build..."
docker compose -f docker-compose-dev.yml up --build -d