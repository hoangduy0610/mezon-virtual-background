import type { BackgroundType, MediaPipeResults, CanvasContext } from './types';

export class CanvasUtils {
    private static gradientCache = new Map<string, CanvasGradient>();
    
    static processFrame(
        canvasCtx: CanvasContext,
        results: MediaPipeResults,
        backgroundType: BackgroundType,
        backgroundImage?: HTMLImageElement,
        options = { maskBlur: 3, backgroundBlur: 10 }
    ): void {
        const { context, width, height } = canvasCtx;
        
        context.clearRect(0, 0, width, height);
        context.save();
        
        this.drawBackground(canvasCtx, results, backgroundType, backgroundImage);
        this.applySegmentationMask(canvasCtx, results, options.maskBlur);
        this.drawForeground(canvasCtx, results);
        
        context.restore();
    }
    
    private static drawBackground(
        canvasCtx: CanvasContext,
        results: MediaPipeResults,
        backgroundType: BackgroundType,
        backgroundImage?: HTMLImageElement
    ): void {
        const { context, width, height } = canvasCtx;
        
        switch (backgroundType) {
            case "blur":
                context.filter = `blur(10px)`;
                context.drawImage(results.image, 0, 0, width, height);
                context.filter = 'none';
                break;
                
            case "image":
                if (backgroundImage) {
                    context.drawImage(backgroundImage, 0, 0, width, height);
                }
                break;
                
            default:
                context.filter = 'none';
                context.drawImage(results.image, 0, 0, width, height);
                break;
        }
    }
    
    private static applySegmentationMask(canvasCtx: CanvasContext, results: MediaPipeResults, maskBlur: number): void {
        const { context, width, height } = canvasCtx;
        
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = width;
        maskCanvas.height = height;
        const maskCtx = maskCanvas.getContext('2d');
        
        if (!maskCtx) return;
        
        maskCtx.drawImage(results.segmentationMask, 0, 0, width, height);
        maskCtx.filter = `blur(${maskBlur}px)`;
        
        context.globalCompositeOperation = 'destination-out';
        context.drawImage(maskCanvas, 0, 0);
        context.globalCompositeOperation = 'source-over';
    }
    
    private static drawForeground(canvasCtx: CanvasContext, results: MediaPipeResults): void {
        const { context, width, height } = canvasCtx;
        
        const personCanvas = document.createElement('canvas');
        personCanvas.width = width;
        personCanvas.height = height;
        const personCtx = personCanvas.getContext('2d');
        
        if (!personCtx) return;
        
        personCtx.drawImage(results.image, 0, 0, width, height);
        personCtx.globalCompositeOperation = 'destination-in';
        personCtx.drawImage(results.segmentationMask, 0, 0, width, height);
        
        context.drawImage(personCanvas, 0, 0);
    }
    
    static clearCache(): void {
        this.gradientCache.clear();
    }
}