import type { MediaPipeCamera, MediaPipeSegmentation, MediaPipeResults } from './types';
import { MEDIAPIPE_CONFIG } from './config';

// Extend Window interface for MediaPipe globals
declare global {
    interface Window {
        SelfieSegmentation: new (config: { locateFile: (file: string) => string }) => MediaPipeSegmentation;
        Camera: new (videoElement: HTMLVideoElement, config: {
            onFrame: () => Promise<void>;
            width: number;
            height: number;
        }) => MediaPipeCamera;
    }
}

export class MediaPipeService {
    private segmentation: MediaPipeSegmentation | null = null;
    private camera: MediaPipeCamera | null = null;
    
    /**
     * Checks if MediaPipe libraries are loaded
     */
    static isAvailable(): boolean {
        return !!(window.SelfieSegmentation && window.Camera);
    }
    
    /**
     * Waits for MediaPipe libraries to load
     */
    static async waitForLoad(timeout = 10000): Promise<boolean> {
        const startTime = Date.now();
        
        while (!this.isAvailable() && Date.now() - startTime < timeout) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        return this.isAvailable();
    }
    
    /**
     * Initializes MediaPipe segmentation
     */
    async initializeSegmentation(onResults: (results: MediaPipeResults) => void): Promise<void> {
        if (!MediaPipeService.isAvailable()) {
            throw new Error('MediaPipe libraries not available');
        }
        
        this.segmentation = new window.SelfieSegmentation({
            locateFile: (file: string) => `${MEDIAPIPE_CONFIG.selfieSegmentationUrl}/${file}`,
        });
        
        if (!this.segmentation) {
            throw new Error('Failed to initialize MediaPipe segmentation');
        }
        
        this.segmentation.setOptions({ 
            modelSelection: MEDIAPIPE_CONFIG.modelSelection 
        });
        this.segmentation.onResults(onResults);
    }
    
    /**
     * Initializes camera
     */
    async initializeCamera(videoElement: HTMLVideoElement, width: number, height: number): Promise<void> {
        if (!this.segmentation) {
            throw new Error('Segmentation must be initialized before camera');
        }
        
        this.camera = new window.Camera(videoElement, {
            onFrame: async () => {
                if (this.segmentation) {
                    await this.segmentation.send({ image: videoElement });
                }
            },
            width,
            height,
        });
        
        if (!this.camera) {
            throw new Error('Failed to initialize camera');
        }
        
        await this.camera.start();
    }
    
    /**
     * Stops the camera and cleans up resources
     */
    stop(): void {
        if (this.camera?.stop) {
            this.camera.stop();
        }
        this.camera = null;
        this.segmentation = null;
    }
    
    /**
     * Checks if the service is initialized
     */
    isInitialized(): boolean {
        return !!(this.segmentation && this.camera);
    }
}