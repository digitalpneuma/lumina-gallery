import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const svgPath = join(__dirname, 'client/public/favicon.svg');

async function generateFavicons() {
  try {
    // Generate 32x32 PNG (standard favicon size)
    await sharp(svgPath)
      .resize(32, 32)
      .png()
      .toFile(join(__dirname, 'client/public/favicon.png'));
    console.log('✓ Generated favicon.png (32x32)');

    // Generate 16x16 PNG
    await sharp(svgPath)
      .resize(16, 16)
      .png()
      .toFile(join(__dirname, 'client/public/favicon-16x16.png'));
    console.log('✓ Generated favicon-16x16.png');

    // Generate 32x32 PNG explicitly
    await sharp(svgPath)
      .resize(32, 32)
      .png()
      .toFile(join(__dirname, 'client/public/favicon-32x32.png'));
    console.log('✓ Generated favicon-32x32.png');

    console.log('\n✅ All favicon files generated successfully!');
  } catch (error) {
    console.error('Error generating favicons:', error);
  }
}

generateFavicons();
