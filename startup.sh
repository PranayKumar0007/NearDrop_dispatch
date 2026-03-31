#!/bin/bash
# Azure App Service startup script
# Runs database init + seed before launching the server
set -e

echo "Running database seed..."
python -m backend.seed

echo "Starting NearDrop API..."
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --workers 4
