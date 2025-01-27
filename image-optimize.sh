#!/bin/bash

# Install ExifTool if not present
if ! command -v exiftool &> /dev/null; then
    echo "ExifTool not found. Please install it first."
    exit 1
fi

# Directory containing images
IMAGE_DIR="assets/images"

# Process all image files
find "$IMAGE_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.webp" \) -exec exiftool -all= -overwrite_original {} \;

# Optimize PNG files
find "$IMAGE_DIR" -type f -iname "*.png" -exec optipng -o5 {} \;

# Optimize JPEG files
find "$IMAGE_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" \) -exec jpegoptim --strip-all {} \;

echo "Image optimization complete!" 