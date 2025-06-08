#!/bin/bash

# Create fonts directory if it doesn't exist
mkdir -p assets/fonts

# Base URL for the CDN
BASE_URL="https://rsms.me/inter/font-files"

# Download the font files directly
for weight in Regular Medium SemiBold Bold; do
  curl -L -o "assets/fonts/Inter-${weight}.ttf" "${BASE_URL}/Inter-${weight}.otf"
done 