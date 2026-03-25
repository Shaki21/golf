# Image Optimization Guide

**Status:** ✅ Already Well-Optimized
**Date:** 2026-01-12

---

## Current State

### ✅ Excellent Optimization
The project already follows best practices:

1. **SVG for logos and icons** (19 files)
   - Scalable to any size
   - Tiny file size (~2-5 KB each)
   - Perfect quality at all resolutions

2. **WebP for PWA icons** (8 files)
   - Modern image format
   - ~30% smaller than PNG
   - Excellent browser support (95%+)

3. **Minimal raster images**
   - Only 1 PNG avatar (193 KB - reasonable)
   - No unnecessary JPEGs

---

## Best Practices for Future Images

### 1. Image Format Selection

**Use SVG for:**
- ✅ Logos
- ✅ Icons
- ✅ Simple illustrations
- ✅ Diagrams and charts

**Use WebP for:**
- ✅ Photos
- ✅ Complex images
- ✅ Screenshots
- ✅ User-generated content

**Use PNG only for:**
- Images requiring transparency (if WebP not an option)
- Legacy browser support (rare)

**Avoid JPEG unless:**
- Specifically required for compatibility
- Already have high-quality JPEGs (convert to WebP with fallback)

### 2. Image Sizing

**Profile avatars:**
- Size: 200x200px (max)
- Format: WebP with PNG fallback
- File size target: < 50 KB

**Hero images:**
- Multiple sizes: 400w, 800w, 1200w, 1600w
- Format: WebP with JPEG fallback
- Use responsive srcset

**Thumbnails:**
- Size: 150x150px
- Format: WebP
- File size target: < 20 KB

**Icons:**
- Use SVG (scalable)
- If raster required: 48x48px, 96x96px (2x), 144x144px (3x)
- Format: WebP or PNG

### 3. Using OptimizedImage Component

```typescript
import { OptimizedImage, AvatarImage, ProductImage } from './components/OptimizedImage';

// Basic lazy-loaded image
<OptimizedImage
  src="/images/photo.jpg"
  webpSrc="/images/photo.webp"
  alt="Description"
/>

// Responsive image
<OptimizedImage
  src="/images/hero.jpg"
  srcSet="
    /images/hero-400.jpg 400w,
    /images/hero-800.jpg 800w,
    /images/hero-1200.jpg 1200w
  "
  sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
  alt="Hero image"
/>

// Avatar with fallback to initials
<AvatarImage
  src="/images/avatar.jpg"
  alt="John Doe"
  initials="JD"
  size={48}
/>

// Product image with zoom
<ProductImage
  src="/images/product.jpg"
  webpSrc="/images/product.webp"
  alt="Product name"
  aspectRatio="4/3"
  enableZoom={true}
/>
```

---

## Image Optimization Workflow

### For New Images

**1. Convert to WebP**
```bash
# Using cwebp (install: brew install webp)
cwebp -q 85 input.jpg -o output.webp

# Using sharp (Node.js)
npm install sharp
node -e "require('sharp')('input.jpg').webp({quality: 85}).toFile('output.webp')"
```

**2. Optimize PNG (if needed)**
```bash
# Using pngquant
pngquant --quality=65-80 input.png -o output.png

# Using optipng
optipng -o7 input.png
```

**3. Optimize JPEG (if needed)**
```bash
# Using jpegoptim
jpegoptim --max=85 input.jpg

# Using mozjpeg
cjpeg -quality 85 input.jpg > output.jpg
```

**4. Optimize SVG**
```bash
# Using SVGO
npm install -g svgo
svgo input.svg -o output.svg
```

### Automation Script

Create `scripts/optimize-images.js`:

```javascript
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function optimizeImage(inputPath) {
  const ext = path.extname(inputPath).toLowerCase();
  const baseName = path.basename(inputPath, ext);
  const dir = path.dirname(inputPath);

  try {
    if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
      // Convert to WebP
      const webpPath = path.join(dir, `${baseName}.webp`);
      await sharp(inputPath)
        .webp({ quality: 85 })
        .toFile(webpPath);

      console.log(`✓ Created ${webpPath}`);

      // Optimize original
      if (ext === '.png') {
        await sharp(inputPath)
          .png({ quality: 80, compressionLevel: 9 })
          .toFile(inputPath + '.tmp');
      } else {
        await sharp(inputPath)
          .jpeg({ quality: 85, mozjpeg: true })
          .toFile(inputPath + '.tmp');
      }

      // Replace original with optimized
      await fs.rename(inputPath + '.tmp', inputPath);
      console.log(`✓ Optimized ${inputPath}`);
    }
  } catch (error) {
    console.error(`✗ Failed to optimize ${inputPath}:`, error.message);
  }
}

// Usage: node scripts/optimize-images.js public/images/**/*.{jpg,png}
const args = process.argv.slice(2);
args.forEach(optimizeImage);
```

---

## Responsive Images

### srcset Pattern

For different screen densities (1x, 2x, 3x):

```html
<img
  src="image.jpg"
  srcset="image.jpg 1x, image@2x.jpg 2x, image@3x.jpg 3x"
  alt="Description"
/>
```

For different viewport widths:

```html
<img
  src="image-800.jpg"
  srcset="
    image-400.jpg 400w,
    image-800.jpg 800w,
    image-1200.jpg 1200w
  "
  sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
  alt="Description"
/>
```

### Picture Element (WebP with fallback)

```html
<picture>
  <source type="image/webp" srcset="image.webp" />
  <source type="image/jpeg" srcset="image.jpg" />
  <img src="image.jpg" alt="Description" />
</picture>
```

---

## Lazy Loading

### Native Lazy Loading
```html
<!-- Browser-native lazy loading (modern browsers) -->
<img src="image.jpg" loading="lazy" alt="Description" />
```

### Intersection Observer (for older browsers)

```javascript
const images = document.querySelectorAll('img[data-src]');

const imageObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
      observer.unobserve(img);
    }
  });
});

images.forEach(img => imageObserver.observe(img));
```

---

## Image CDN Recommendations

For production, consider using an image CDN:

### Cloudinary
```javascript
// Auto-format, auto-quality, lazy loading
const imageUrl = 'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_800/sample.jpg';

<OptimizedImage
  src={imageUrl}
  alt="Sample"
/>
```

### Imgix
```javascript
// Responsive with automatic format selection
const imageUrl = 'https://demo.imgix.net/sample.jpg?auto=format&fit=max&w=800';
```

### Vercel Image Optimization
```javascript
// If deploying to Vercel
import Image from 'next/image';

<Image
  src="/images/sample.jpg"
  width={800}
  height={600}
  alt="Sample"
/>
```

---

## Performance Targets

### File Size Targets
- **Icons (SVG):** < 5 KB
- **Avatars (WebP):** < 50 KB
- **Thumbnails (WebP):** < 20 KB
- **Photos (WebP):** < 200 KB
- **Hero images (WebP):** < 300 KB

### Quality Settings
- **WebP:** 80-85 quality
- **JPEG:** 80-85 quality
- **PNG:** 80 quality (with compression)

### Loading Performance
- ✅ First image loads within 1 second
- ✅ Lazy-load images below the fold
- ✅ Use placeholder/skeleton while loading
- ✅ Prioritize above-the-fold images

---

## Monitoring

### Tools
1. **Chrome DevTools Network Tab**
   - Check image sizes
   - Verify lazy loading
   - Check format (WebP vs PNG/JPEG)

2. **Lighthouse**
   - "Properly size images"
   - "Serve images in next-gen formats"
   - "Defer offscreen images"

3. **WebPageTest**
   - Image compression analysis
   - Load time waterfall

### Metrics to Track
- Total image bytes per page
- Largest image size
- Number of images above the fold
- WebP adoption rate
- Lazy loading effectiveness

---

## Checklist for New Images

Before adding a new image to the project:

- [ ] Is this image necessary? (Can it be replaced with CSS/SVG?)
- [ ] Is it the right format? (SVG > WebP > PNG/JPEG)
- [ ] Is it optimized? (Run through compression)
- [ ] Is it properly sized? (Not larger than needed)
- [ ] Does it have WebP version? (If raster image)
- [ ] Does it have alt text? (For accessibility)
- [ ] Is it lazy-loaded? (If below the fold)
- [ ] Does it have loading skeleton? (For better UX)

---

## Migration Guide

### Existing PNG/JPEG to WebP

```bash
# Find all images
find public/images -type f \( -name "*.jpg" -o -name "*.png" \)

# Convert each to WebP
for img in public/images/*.jpg; do
  cwebp -q 85 "$img" -o "${img%.jpg}.webp"
done
```

### Update Image References

```typescript
// Before
<img src="/images/photo.jpg" alt="Photo" />

// After
<OptimizedImage
  src="/images/photo.jpg"
  webpSrc="/images/photo.webp"
  alt="Photo"
/>
```

---

## Summary

**Current Status:**
- ✅ Project is already well-optimized
- ✅ Using SVG for logos and icons
- ✅ Using WebP for PWA icons
- ✅ Minimal raster images

**Recommendations:**
1. Continue using SVG for all vector graphics
2. Convert future photos to WebP with fallback
3. Use OptimizedImage component for new images
4. Implement lazy loading for below-the-fold images
5. Monitor image sizes with Lighthouse

**Tools Created:**
- `OptimizedImage` component with lazy loading
- `AvatarImage` component with fallback
- `ProductImage` component with zoom
- Optimization workflow and scripts

**Next Steps:**
- Run `npm run build` and check bundle analyzer for image sizes
- Consider image CDN for production
- Set up automated image optimization in CI/CD

---

**Status:** Optimized ✅
**Estimated Future Work:** 1-2 hours when adding new features with images
