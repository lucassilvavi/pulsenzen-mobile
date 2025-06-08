#!/bin/bash

# Create images directory if it doesn't exist
mkdir -p assets/images

# Function to create a colored placeholder image
create_placeholder() {
  local filename=$1
  local color=$2
  echo "Creating $filename..."
  echo "iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQAQMAAAC6caSPAAAABlBMVEX///8${color}AAADP2lzRAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5wweEjYE2XyN/gAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAKklEQVR42u3BMQEAAADCoPVP7WsIoAAAAAAAAAAAAAAAAAAAAAAAAAAAeANRtAABqpi5XYAAAAAASUVORK5CYII=" | base64 -d > "assets/images/$filename"
}

# Create profile placeholder
create_placeholder "profile-placeholder.png" "8"

# Create meditation placeholder
create_placeholder "meditation-placeholder.jpg" "f"

# Create sleep placeholder
create_placeholder "sleep-placeholder.jpg" "0" 