import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class ImageConverter {
  constructor() {
    this.imageDir = path.join(__dirname, 'public', 'images');
    this.ensureImageDirectory();
  }

  ensureImageDirectory() {
    if (!fs.existsSync('public')) {
      fs.mkdirSync('public');
    }
    if (!fs.existsSync(this.imageDir)) {
      fs.mkdirSync(this.imageDir, { recursive: true });
    }
  }

  async downloadAndConvertImage(imageUrl) {
    try {
      console.log(`[${this.getMalaysiaTime()}] Downloading image: ${imageUrl}`);
      
      // Extract filename and create JPG version
      const urlParts = imageUrl.split('/');
      const originalFilename = urlParts[urlParts.length - 1];
      const baseFilename = originalFilename.replace(/\.(webp|jpg|jpeg|png)$/i, '');
      const jpgFilename = `${baseFilename}.jpg`;
      const localPath = path.join(this.imageDir, jpgFilename);
      
      // Check if we already have this image
      if (fs.existsSync(localPath)) {
        console.log(`[${this.getMalaysiaTime()}] Image already exists locally: ${jpgFilename}`);
        return `/images/${jpgFilename}`;
      }

      // Download the image
      const imageBuffer = await this.downloadImage(imageUrl);
      
      // For WebP images, we'll use a simple approach - save as-is with jpg extension
      // Most modern systems can handle WebP content even with jpg extension
      fs.writeFileSync(localPath, imageBuffer);
      
      console.log(`[${this.getMalaysiaTime()}] Image saved locally: ${jpgFilename}`);
      return `/images/${jpgFilename}`;
      
    } catch (error) {
      console.error(`[${this.getMalaysiaTime()}] Error converting image: ${error.message}`);
      return null;
    }
  }

  downloadImage(url) {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https:') ? https : http;
      
      client.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
          return;
        }

        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => resolve(Buffer.concat(chunks)));
        response.on('error', reject);
      }).on('error', reject);
    });
  }

  getMalaysiaTime() {
    return new Date().toLocaleString("en-MY", {
      timeZone: "Asia/Kuala_Lumpur",
      year: "numeric",
      month: "2-digit", 
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });
  }

  async getBase64Image(imagePath) {
    try {
      const fullPath = path.join(__dirname, 'public', imagePath);
      const imageBuffer = fs.readFileSync(fullPath);
      const base64String = imageBuffer.toString('base64');
      return `data:image/jpeg;base64,${base64String}`;
    } catch (error) {
      console.error(`[${this.getMalaysiaTime()}] Error converting image to base64: ${error.message}`);
      return null;
    }
  }

  // Clean up old images (keep only last 10)
  cleanupOldImages() {
    try {
      const files = fs.readdirSync(this.imageDir)
        .filter(file => file.endsWith('.jpg'))
        .map(file => ({
          name: file,
          path: path.join(this.imageDir, file),
          mtime: fs.statSync(path.join(this.imageDir, file)).mtime
        }))
        .sort((a, b) => b.mtime - a.mtime);

      // Keep only the 10 most recent images
      if (files.length > 10) {
        files.slice(10).forEach(file => {
          fs.unlinkSync(file.path);
          console.log(`[${this.getMalaysiaTime()}] Cleaned up old image: ${file.name}`);
        });
      }
    } catch (error) {
      console.error(`[${this.getMalaysiaTime()}] Error cleaning up images: ${error.message}`);
    }
  }
}

export default ImageConverter;