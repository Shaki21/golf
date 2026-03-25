#!/usr/bin/env python3
"""
TIER Golf Mockup Enhancer
Auto-improve device mockup to Apple keynote quality

Usage:
    python mockup-enhancer.py input.png

Outputs:
    - tier-golf-hero-1920x1080.png (16:9 web hero)
    - tier-golf-hero-1600x1200.png (4:3 variant)
    - tier-golf-hero-1920x1080-safe.png (with safe area guides)
"""

import sys
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
import numpy as np

def create_gradient_background(width, height):
    """Create subtle gradient background (top: light, bottom: slightly darker)"""
    # Create gradient from #FCFCFC (top) to #F5F5F5 (bottom)
    gradient = Image.new('RGB', (width, height), color='#FCFCFC')
    draw = ImageDraw.Draw(gradient, 'RGBA')

    for y in range(height):
        # Calculate color for this row
        ratio = y / height
        # Top color: (252, 252, 252) -> Bottom: (245, 245, 245)
        r = int(252 - (7 * ratio))
        g = int(252 - (7 * ratio))
        b = int(252 - (7 * ratio))

        draw.line([(0, y), (width, y)], fill=(r, g, b))

    return gradient

def create_radial_vignette(width, height, strength=0.04):
    """Create subtle radial vignette for focus"""
    vignette = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(vignette, 'RGBA')

    center_x, center_y = width * 0.55, height * 0.5  # Centered on MacBook
    max_radius = np.sqrt((width/2)**2 + (height/2)**2)

    for radius_step in range(100, 0, -1):
        radius = max_radius * (radius_step / 100)
        # Opacity increases towards edges
        opacity = int(255 * strength * (1 - radius_step/100))
        draw.ellipse(
            [center_x - radius, center_y - radius, center_x + radius, center_y + radius],
            fill=(0, 0, 0, opacity)
        )

    return vignette

def add_professional_shadow(image, offset_x=0, offset_y=48, blur=96, opacity=0.06):
    """Add soft, professional drop shadow"""
    # Create shadow layer
    shadow = Image.new('RGBA', (image.width + blur*2, image.height + blur*2), (0, 0, 0, 0))

    # Create shadow shape (copy of image alpha channel)
    shadow_draw = ImageDraw.Draw(shadow)

    # Get alpha channel from original image
    if image.mode == 'RGBA':
        alpha = image.split()[3]
    else:
        alpha = Image.new('L', image.size, 255)

    # Create shadow by darkening
    shadow_img = Image.new('RGBA', image.size, (0, 0, 0, int(255 * opacity)))
    shadow_img.putalpha(alpha)

    # Blur the shadow
    shadow_img = shadow_img.filter(ImageFilter.GaussianBlur(radius=blur/2))

    # Position shadow with offset
    shadow_canvas = Image.new('RGBA', (image.width + blur*2, image.height + blur*2), (0, 0, 0, 0))
    shadow_canvas.paste(shadow_img, (blur + offset_x, blur + offset_y))

    return shadow_canvas, blur

def add_dual_shadow(image):
    """Add dual-layer shadow system (contact + ambient)"""
    # Layer 1: Contact shadow (close, sharper)
    contact_shadow, blur1 = add_professional_shadow(
        image,
        offset_x=0,
        offset_y=12,
        blur=24,
        opacity=0.12
    )

    # Layer 2: Ambient shadow (far, softer)
    ambient_shadow, blur2 = add_professional_shadow(
        image,
        offset_x=0,
        offset_y=48,
        blur=96,
        opacity=0.06
    )

    # Combine shadows - ensure same size
    max_blur = max(blur1, blur2)

    # Use the larger canvas size
    max_width = max(contact_shadow.width, ambient_shadow.width)
    max_height = max(contact_shadow.height, ambient_shadow.height)

    # Create new canvas and paste both shadows centered
    combined = Image.new('RGBA', (max_width, max_height), (0, 0, 0, 0))

    # Paste ambient shadow (centered)
    ambient_x = (max_width - ambient_shadow.width) // 2
    ambient_y = (max_height - ambient_shadow.height) // 2
    combined.paste(ambient_shadow, (ambient_x, ambient_y), ambient_shadow)

    # Paste contact shadow on top (centered)
    contact_x = (max_width - contact_shadow.width) // 2
    contact_y = (max_height - contact_shadow.height) // 2
    combined = Image.alpha_composite(combined,
                                    Image.new('RGBA', (max_width, max_height), (0, 0, 0, 0)))
    temp_canvas = Image.new('RGBA', (max_width, max_height), (0, 0, 0, 0))
    temp_canvas.paste(contact_shadow, (contact_x, contact_y), contact_shadow)
    combined = Image.alpha_composite(combined, temp_canvas)

    return combined, max_blur

def add_noise_texture(image, strength=0.06):
    """Add subtle grain/noise for realism"""
    # Create noise
    noise = np.random.randint(0, 50, (image.height, image.width), dtype=np.uint8)
    noise_img = Image.fromarray(noise, mode='L')
    noise_rgba = Image.new('RGBA', image.size)
    noise_rgba.putalpha(noise_img)

    # Apply with low opacity
    enhancer = ImageEnhance.Brightness(noise_rgba)
    noise_rgba = enhancer.enhance(strength)

    # Blend with original
    result = Image.alpha_composite(image.convert('RGBA'), noise_rgba)
    return result

def enhance_mockup(input_path, output_width=1920, output_height=1080):
    """Main enhancement function"""
    print(f"📂 Loading: {input_path}")

    # Load original image
    original = Image.open(input_path)
    if original.mode != 'RGBA':
        original = original.convert('RGBA')

    print(f"   Original size: {original.width}x{original.height}")

    # Create new canvas with gradient background
    print("🎨 Creating gradient background...")
    canvas = create_gradient_background(output_width, output_height)
    canvas = canvas.convert('RGBA')

    # Calculate scaling to fit within canvas (with padding)
    padding = 120  # Safe area margin
    max_width = output_width - (padding * 2)
    max_height = output_height - (padding * 2)

    # Scale original to fit
    scale = min(max_width / original.width, max_height / original.height)
    new_width = int(original.width * scale)
    new_height = int(original.height * scale)

    print(f"📐 Scaling to: {new_width}x{new_height}")
    scaled = original.resize((new_width, new_height), Image.Resampling.LANCZOS)

    # Add dual-layer shadow system
    print("🌑 Adding professional shadows...")
    shadowed, shadow_blur = add_dual_shadow(scaled)

    # Calculate center position (slightly right for visual balance)
    center_x = int(output_width * 0.52)  # 52% from left (slight right bias)
    center_y = int(output_height * 0.5)  # Centered vertically

    # Position with shadow
    shadow_x = center_x - (shadowed.width // 2)
    shadow_y = center_y - (shadowed.height // 2)

    # Composite shadow + image onto canvas
    canvas.paste(shadowed, (shadow_x, shadow_y), shadowed)

    # Add radial vignette for focus
    print("✨ Adding vignette...")
    vignette = create_radial_vignette(output_width, output_height, strength=0.04)
    canvas = Image.alpha_composite(canvas, vignette)

    # Add subtle noise texture
    print("🔲 Adding subtle grain texture...")
    canvas = add_noise_texture(canvas, strength=0.06)

    # Apply micro contrast boost to center area (where MacBook would be)
    print("🎯 Enhancing focal point...")
    enhancer = ImageEnhance.Contrast(canvas)
    enhanced = enhancer.enhance(1.05)

    # Blend enhanced version only in center (focus effect)
    mask = create_radial_vignette(output_width, output_height, strength=0.3)
    # Invert mask (center bright, edges dark)
    mask_array = np.array(mask)[:, :, 3]
    mask_array = 255 - mask_array
    mask_inverted = Image.fromarray(mask_array, mode='L')

    final = Image.composite(enhanced, canvas, mask_inverted)

    print("✅ Enhancement complete!")
    return final

def create_safe_area_guide(width, height, margin=120):
    """Create safe area guide overlay"""
    guide = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(guide)

    # Draw safe area rectangle
    draw.rectangle(
        [margin, margin, width - margin, height - margin],
        outline=(255, 0, 0, 128),
        width=3
    )

    # Add corner markers
    corner_size = 40
    for x, y in [(margin, margin), (width - margin, margin),
                 (margin, height - margin), (width - margin, height - margin)]:
        # Horizontal line
        draw.line([(x - corner_size, y), (x + corner_size, y)], fill=(255, 0, 0, 128), width=2)
        # Vertical line
        draw.line([(x, y - corner_size), (x, y + corner_size)], fill=(255, 0, 0, 128), width=2)

    # Add label
    from PIL import ImageFont
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 24)
    except:
        font = ImageFont.load_default()

    label = f"Safe Area: {margin}px margin"
    draw.text((margin + 20, margin - 50), label, fill=(255, 0, 0, 180), font=font)

    return guide

def main():
    if len(sys.argv) < 2:
        print("❌ Usage: python mockup-enhancer.py input.png")
        print("   Example: python mockup-enhancer.py tier-golf-mockup.png")
        sys.exit(1)

    input_path = sys.argv[1]

    print("=" * 60)
    print("🎨 TIER GOLF MOCKUP ENHANCER")
    print("   Apple Keynote Quality Auto-Enhancement")
    print("=" * 60)
    print()

    try:
        # Variant A: 1920x1080 (16:9 web hero)
        print("📦 Creating Variant A: 1920x1080 (16:9)")
        enhanced_16_9 = enhance_mockup(input_path, 1920, 1080)
        output_a = "tier-golf-hero-1920x1080.png"
        enhanced_16_9.convert('RGB').save(output_a, 'PNG', quality=95)
        print(f"   ✅ Saved: {output_a}")
        print()

        # Variant B: 1600x1200 (4:3)
        print("📦 Creating Variant B: 1600x1200 (4:3)")
        enhanced_4_3 = enhance_mockup(input_path, 1600, 1200)
        output_b = "tier-golf-hero-1600x1200.png"
        enhanced_4_3.convert('RGB').save(output_b, 'PNG', quality=95)
        print(f"   ✅ Saved: {output_b}")
        print()

        # Variant C: 1920x1080 with safe area guides
        print("📦 Creating Variant C: 1920x1080 with safe area")
        enhanced_safe = enhanced_16_9.copy()
        safe_guide = create_safe_area_guide(1920, 1080, margin=120)
        enhanced_safe = Image.alpha_composite(enhanced_safe.convert('RGBA'), safe_guide)
        output_c = "tier-golf-hero-1920x1080-safe.png"
        enhanced_safe.convert('RGB').save(output_c, 'PNG', quality=95)
        print(f"   ✅ Saved: {output_c}")
        print()

        print("=" * 60)
        print("✨ ENHANCEMENT COMPLETE!")
        print("=" * 60)
        print()
        print("📁 Output files:")
        print(f"   • {output_a} (web hero, 16:9)")
        print(f"   • {output_b} (pitch deck, 4:3)")
        print(f"   • {output_c} (with safe area guides)")
        print()
        print("🎯 Improvements applied:")
        print("   ✅ Professional dual-layer shadow system")
        print("   ✅ Subtle gradient background (#FCFCFC → #F5F5F5)")
        print("   ✅ Radial vignette for focal point")
        print("   ✅ Subtle grain texture for realism")
        print("   ✅ Enhanced contrast at focal point")
        print("   ✅ Optimized composition (52% horizontal balance)")
        print()

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
