#!/usr/bin/env bash
set -e

REG="registry.localhost:5000"

# Backend
docker build -t $REG/backend:1.0.0 ./backend
docker push $REG/backend:1.0.0

# Frontend
docker build -t $REG/frontend:1.0.0 ./frontend
docker push $REG/frontend:1.0.0
