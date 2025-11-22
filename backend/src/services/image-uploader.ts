import axios from 'axios';
import { config } from '../config/env.js';
import fs from 'fs/promises';

export interface UploadResult {
    url: string;
    deleteUrl?: string;
}

/**
 * Uploads an image to a public hosting service and returns the URL
 */
export async function uploadImage(imagePath: string): Promise<UploadResult> {
    // Try imgbb.com if API key is available
    if (config.imgbbApiKey) {
        return uploadToImgbb(imagePath);
    }

    // Fallback: convert to base64 data URL
    console.log('⚠️  No image hosting configured, using base64 data URL');
    return convertToDataUrl(imagePath);
}

async function uploadToImgbb(imagePath: string): Promise<UploadResult> {
    console.log('📤 Uploading image to imgbb.com...');

    try {
        const imageBuffer = await fs.readFile(imagePath);
        const base64Image = imageBuffer.toString('base64');

        const formData = new FormData();
        formData.append('image', base64Image);

        const response = await axios.post(
            `https://api.imgbb.com/1/upload?key=${config.imgbbApiKey}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        if (response.data.success) {
            console.log('✓ Image uploaded successfully');
            return {
                url: response.data.data.url,
                deleteUrl: response.data.data.delete_url,
            };
        } else {
            throw new Error('imgbb upload failed');
        }
    } catch (error) {
        console.error('Error uploading to imgbb:', error);
        console.log('Falling back to base64 data URL');
        return convertToDataUrl(imagePath);
    }
}

async function convertToDataUrl(imagePath: string): Promise<UploadResult> {
    const imageBuffer = await fs.readFile(imagePath);
    const base64Image = imageBuffer.toString('base64');

    // Detect mime type from file extension
    const ext = imagePath.split('.').pop()?.toLowerCase();
    const mimeType = ext === 'png' ? 'image/png' :
        ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' :
            ext === 'gif' ? 'image/gif' :
                ext === 'webp' ? 'image/webp' : 'image/png';

    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    console.log('✓ Converted to base64 data URL');
    return { url: dataUrl };
}
