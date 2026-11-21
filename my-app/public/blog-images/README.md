# Blog Images Directory

Place your blog post images in this directory.

## How to use images in your blog posts:

### Option 1: Relative path (recommended)
Just use the filename in your markdown:
```markdown
![Image description](my-image.jpg)
```

This will automatically resolve to `/blog-images/my-image.jpg`

### Option 2: Absolute path
Use the full path from the public directory:
```markdown
![Image description](/blog-images/my-image.jpg)
```

### Option 3: External URL
Use any external image URL:
```markdown
![Image description](https://example.com/image.jpg)
```

## Image Best Practices:

- Use descriptive filenames (e.g., `react-router-setup.png` instead of `img1.png`)
- Optimize images before uploading (use tools like TinyPNG or ImageOptim)
- Recommended formats: JPG for photos, PNG for screenshots/diagrams, WebP for modern browsers
- Keep file sizes reasonable (< 500KB per image when possible)
- The alt text will be displayed as a caption below the image

