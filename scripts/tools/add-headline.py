#!/usr/bin/env python3
"""
TIER Golf Mockup - Add Headline Text
Adds professional headline and subheadline to enhanced mockup

Usage:
    python add-headline.py tier-golf-hero-1920x1080.png
"""

import sys
from PIL import Image, ImageDraw, ImageFont
import textwrap

def add_headline_to_mockup(input_path, output_path=None):
    """Add professional headline text to mockup"""

    # Load the enhanced mockup
    img = Image.open(input_path)
    if img.mode != 'RGBA':
        img = img.convert('RGBA')

    # Create drawing context
    draw = ImageDraw.Draw(img)

    # Try to load professional fonts (fallback to system fonts)
    fonts = {
        'headline': None,
        'subheadline': None,
        'cta': None
    }

    # Try different font paths for macOS
    font_paths = [
        '/System/Library/Fonts/SFCompact.ttf',
        '/System/Library/Fonts/SFNS.ttf',
        '/System/Library/Fonts/Helvetica.ttc',
        '/System/Library/Fonts/HelveticaNeue.ttc',
        '/Library/Fonts/Arial.ttf',
    ]

    # Load fonts with fallback
    try:
        for path in font_paths:
            try:
                fonts['headline'] = ImageFont.truetype(path, 72)
                fonts['subheadline'] = ImageFont.truetype(path, 32)
                fonts['cta'] = ImageFont.truetype(path, 24)
                print(f"✅ Loaded font: {path}")
                break
            except:
                continue
    except:
        pass

    # Fallback to default if needed
    if not fonts['headline']:
        print("⚠️  Using default fonts")
        fonts['headline'] = ImageFont.load_default()
        fonts['subheadline'] = ImageFont.load_default()
        fonts['cta'] = ImageFont.load_default()

    # Text content
    headline = "Elevate Your Golf Game"
    subheadline = "Professional analytics across all your devices"
    cta = "Start Your Journey →"

    # Safe area margins
    margin = 120

    # Calculate text positioning (top-left of safe area)
    headline_x = margin
    headline_y = margin + 40  # 40px below safe area top

    # Text colors
    headline_color = (26, 29, 35, 255)  # Dark navy (TIER brand)
    subheadline_color = (99, 102, 112, 180)  # Gray with transparency
    cta_color = (255, 255, 255, 255)  # White
    cta_bg_color = (34, 139, 34, 255)  # Green

    # Draw headline with subtle shadow
    # Shadow first (offset slightly)
    shadow_offset = 2
    draw.text(
        (headline_x + shadow_offset, headline_y + shadow_offset),
        headline,
        font=fonts['headline'],
        fill=(0, 0, 0, 30)  # Subtle black shadow
    )

    # Main headline
    draw.text(
        (headline_x, headline_y),
        headline,
        font=fonts['headline'],
        fill=headline_color
    )

    # Get headline height for positioning subheadline
    headline_bbox = draw.textbbox((headline_x, headline_y), headline, font=fonts['headline'])
    headline_height = headline_bbox[3] - headline_bbox[1]

    # Draw subheadline
    subheadline_y = headline_y + headline_height + 24  # 24px gap
    draw.text(
        (headline_x, subheadline_y),
        subheadline,
        font=fonts['subheadline'],
        fill=subheadline_color
    )

    # Get subheadline height for CTA positioning
    subheadline_bbox = draw.textbbox((headline_x, subheadline_y), subheadline, font=fonts['subheadline'])
    subheadline_height = subheadline_bbox[3] - subheadline_bbox[1]

    # Draw CTA button
    cta_y = subheadline_y + subheadline_height + 48  # 48px gap

    # Get CTA text size
    cta_bbox = draw.textbbox((0, 0), cta, font=fonts['cta'])
    cta_text_width = cta_bbox[2] - cta_bbox[0]
    cta_text_height = cta_bbox[3] - cta_bbox[1]

    # CTA button dimensions
    cta_padding_x = 32
    cta_padding_y = 16
    cta_button_width = cta_text_width + (cta_padding_x * 2)
    cta_button_height = cta_text_height + (cta_padding_y * 2)

    # Draw CTA button background with rounded corners
    cta_button_rect = [
        headline_x,
        cta_y,
        headline_x + cta_button_width,
        cta_y + cta_button_height
    ]

    # Button shadow
    shadow_rect = [
        cta_button_rect[0] + 2,
        cta_button_rect[1] + 2,
        cta_button_rect[2] + 2,
        cta_button_rect[3] + 2
    ]
    draw.rounded_rectangle(shadow_rect, radius=8, fill=(0, 0, 0, 30))

    # Button background
    draw.rounded_rectangle(cta_button_rect, radius=8, fill=cta_bg_color)

    # CTA text (centered in button)
    cta_text_x = headline_x + cta_padding_x
    cta_text_y = cta_y + cta_padding_y
    draw.text(
        (cta_text_x, cta_text_y),
        cta,
        font=fonts['cta'],
        fill=cta_color
    )

    # Save output
    if not output_path:
        output_path = input_path.replace('.png', '-with-headline.png')

    img.convert('RGB').save(output_path, 'PNG', quality=95)

    return output_path

def create_variations(base_image):
    """Create multiple headline variations"""

    variations = [
        {
            'name': 'default',
            'headline': 'Elevate Your Golf Game',
            'subheadline': 'Professional analytics across all your devices',
            'cta': 'Start Your Journey →'
        },
        {
            'name': 'data-driven',
            'headline': 'Data-Driven Golf Excellence',
            'subheadline': 'Real-time insights from tee to green',
            'cta': 'Get Started →'
        },
        {
            'name': 'performance',
            'headline': 'Master Your Performance',
            'subheadline': 'Track, analyze, and improve every round',
            'cta': 'Try It Free →'
        }
    ]

    outputs = []

    for var in variations:
        print(f"\n📝 Creating variation: {var['name']}")

        # Load base image
        img = Image.open(base_image)
        if img.mode != 'RGBA':
            img = img.convert('RGBA')

        draw = ImageDraw.Draw(img)

        # Load fonts
        try:
            font_paths = [
                '/System/Library/Fonts/SFCompact.ttf',
                '/System/Library/Fonts/SFNS.ttf',
                '/System/Library/Fonts/Helvetica.ttc',
                '/System/Library/Fonts/HelveticaNeue.ttc',
            ]

            headline_font = None
            for path in font_paths:
                try:
                    headline_font = ImageFont.truetype(path, 72)
                    subheadline_font = ImageFont.truetype(path, 32)
                    cta_font = ImageFont.truetype(path, 24)
                    break
                except:
                    continue

            if not headline_font:
                headline_font = ImageFont.load_default()
                subheadline_font = ImageFont.load_default()
                cta_font = ImageFont.load_default()
        except:
            headline_font = ImageFont.load_default()
            subheadline_font = ImageFont.load_default()
            cta_font = ImageFont.load_default()

        # Safe area
        margin = 120
        x = margin
        y = margin + 40

        # Colors
        headline_color = (26, 29, 35, 255)
        subheadline_color = (99, 102, 112, 180)
        cta_color = (255, 255, 255, 255)
        cta_bg_color = (34, 139, 34, 255)

        # Draw headline with shadow
        draw.text((x + 2, y + 2), var['headline'], font=headline_font, fill=(0, 0, 0, 30))
        draw.text((x, y), var['headline'], font=headline_font, fill=headline_color)

        # Get headline height
        headline_bbox = draw.textbbox((x, y), var['headline'], font=headline_font)
        headline_h = headline_bbox[3] - headline_bbox[1]

        # Draw subheadline
        sub_y = y + headline_h + 24
        draw.text((x, sub_y), var['subheadline'], font=subheadline_font, fill=subheadline_color)

        # Get subheadline height
        sub_bbox = draw.textbbox((x, sub_y), var['subheadline'], font=subheadline_font)
        sub_h = sub_bbox[3] - sub_bbox[1]

        # Draw CTA
        cta_y = sub_y + sub_h + 48
        cta_bbox = draw.textbbox((0, 0), var['cta'], font=cta_font)
        cta_w = cta_bbox[2] - cta_bbox[0]
        cta_h = cta_bbox[3] - cta_bbox[1]

        # Button dimensions
        btn_w = cta_w + 64
        btn_h = cta_h + 32

        # Button shadow
        draw.rounded_rectangle([x + 2, cta_y + 2, x + btn_w + 2, cta_y + btn_h + 2], radius=8, fill=(0, 0, 0, 30))

        # Button background
        draw.rounded_rectangle([x, cta_y, x + btn_w, cta_y + btn_h], radius=8, fill=cta_bg_color)

        # CTA text
        draw.text((x + 32, cta_y + 16), var['cta'], font=cta_font, fill=cta_color)

        # Save
        output_name = base_image.replace('.png', f'-{var["name"]}.png')
        img.convert('RGB').save(output_name, 'PNG', quality=95)
        outputs.append(output_name)

        print(f"   ✅ Saved: {output_name}")

    return outputs

def main():
    if len(sys.argv) < 2:
        print("❌ Usage: python add-headline.py input-image.png")
        print("   Example: python add-headline.py tier-golf-hero-1920x1080.png")
        sys.exit(1)

    input_path = sys.argv[1]

    print("=" * 60)
    print("📝 TIER GOLF MOCKUP - ADD HEADLINE TEXT")
    print("=" * 60)
    print()

    try:
        # Create headline variations
        print("🎨 Creating headline variations...")
        outputs = create_variations(input_path)

        print()
        print("=" * 60)
        print("✨ HEADLINE VARIATIONS COMPLETE!")
        print("=" * 60)
        print()
        print("📁 Output files:")
        for output in outputs:
            print(f"   • {output}")
        print()
        print("💡 Variations created:")
        print("   1. Default: 'Elevate Your Golf Game'")
        print("   2. Data-Driven: 'Data-Driven Golf Excellence'")
        print("   3. Performance: 'Master Your Performance'")
        print()
        print("🎯 All headlines include:")
        print("   ✅ Professional typography")
        print("   ✅ Subtle text shadows")
        print("   ✅ Subheadline for context")
        print("   ✅ CTA button with hover-ready design")
        print("   ✅ Safe area compliance (120px margins)")
        print()

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
