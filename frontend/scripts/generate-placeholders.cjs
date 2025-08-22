const fs = require('fs');
const path = require('path');

// List of placeholder images needed
const placeholders = [
  // AI Tests
  'push-ups.jpg',
  'squats.jpg',
  'abs.jpg',
  'knee-push-ups.jpg',
  'knee-raises.jpg',
  
  // Trainers
  'trainer-maria.jpg',
  'trainer-hendrik.jpg',
  'trainer-keirin.jpg',
  'trainer-laura.jpg',
  'trainer-marti.jpg',
  'trainer-krete.jpg',
  
  // Challenges
  'challenge-january.jpg',
  'challenge-summer.jpg',
  'challenge-back.jpg',
  
  // Vox Populi
  'vox-populi-1.jpg',
  'vox-populi-2.jpg',
  'vox-populi-3.jpg',
  
  // Profile/avatars
  'avatar-1.jpg',
  'avatar-2.jpg',
  'avatar-3.jpg',
  'current-user.jpg',
  
  // Videos
  'video-thumbnail-1.jpg',
  'video-thumbnail-2.jpg',
  'video-thumbnail-3.jpg',
  
  // Programs
  'program-1.jpg',
  'program-2.jpg',
];

const imagesDir = path.join(__dirname, '..', 'public', 'images');

// Create a simple SVG placeholder with text
function createPlaceholderSVG(filename) {
  const name = filename.replace('.jpg', '').replace(/-/g, ' ');
  const width = 800;
  const height = 600;
  
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="#3e4551"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="24" fill="#60cc56">
      ${name}
    </text>
    <text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="16" fill="#888">
      Placeholder Image
    </text>
  </svg>`;
}

// Check and create placeholders
placeholders.forEach(filename => {
  const filepath = path.join(imagesDir, filename);
  
  if (!fs.existsSync(filepath)) {
    // For now, we'll create an SVG and save it as the filename
    // In production, you'd convert this to actual JPG or use a placeholder service
    const svgContent = createPlaceholderSVG(filename);
    const svgFilepath = filepath.replace('.jpg', '.svg');
    
    // Create a temporary SVG file
    fs.writeFileSync(svgFilepath, svgContent);
    console.log(`✅ Created placeholder: ${filename} (as SVG)`);
  } else {
    console.log(`✓ Exists: ${filename}`);
  }
});

console.log('\n📌 Note: SVG placeholders created. In production, replace with actual images.');
console.log('📌 You may need to update image references from .jpg to .svg in the code.');