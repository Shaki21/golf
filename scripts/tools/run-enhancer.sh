#!/bin/bash
# TIER Golf Mockup Enhancer - Quick Run Script

echo "🎨 TIER GOLF MOCKUP ENHANCER"
echo "=============================="
echo ""

# Check if image argument provided
if [ -z "$1" ]; then
    echo "❌ Please provide the path to your mockup image"
    echo ""
    echo "Usage:"
    echo "  ./run-enhancer.sh /path/to/your/mockup.png"
    echo ""
    echo "Or place your image as 'original-mockup.png' in this directory"
    echo "and run: ./run-enhancer.sh original-mockup.png"
    exit 1
fi

IMAGE_PATH="$1"

# Check if file exists
if [ ! -f "$IMAGE_PATH" ]; then
    echo "❌ File not found: $IMAGE_PATH"
    exit 1
fi

echo "📂 Input: $IMAGE_PATH"
echo ""

# Run the Python script
python3 mockup-enhancer.py "$IMAGE_PATH"

# Check if successful
if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS! Your enhanced mockups are ready!"
    echo ""
    echo "📂 Open the output files:"
    echo "   open tier-golf-hero-1920x1080.png"
    echo "   open tier-golf-hero-1600x1200.png"
    echo "   open tier-golf-hero-1920x1080-safe.png"
    echo ""
else
    echo ""
    echo "❌ Something went wrong. Check the error message above."
fi
