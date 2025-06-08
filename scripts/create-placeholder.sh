#!/bin/bash

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "ImageMagick is required but not installed. Please install it first."
    echo "You can install it using: brew install imagemagick"
    exit 1
fi

# Create a simple profile placeholder image
convert -size 200x200 xc:lightgray \
    -fill white \
    -draw "circle 100,100 100,160" \
    -draw "circle 100,70 100,90" \
    assets/images/profile-placeholder.png 