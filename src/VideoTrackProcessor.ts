import type { BackgroundType, MediaPipeResults, CanvasContext } from './types';
import { MEDIAPIPE_CONFIG } from './config';
import { CanvasUtils } from './canvas-utils';

export interface VideoTrackProcessorOptions {
  width?: number;
  height?: number;
  maskBlur?: number;
  backgroundBlur?: number;
}

export class VideoTrackProcessor {
  private segmentation: any = null;
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private backgroundType: BackgroundType = 'none';
  private backgroundImage: HTMLImageElement | null = null;
  private outputCanvas: HTMLCanvasElement;
  private outputContext: CanvasRenderingContext2D;
  private isInitialized = false;
  private options: Required<VideoTrackProcessorOptions>;

  constructor(options: VideoTrackProcessorOptions = {}) {
    this.options = {
      width: 640,
      height: 480,
      maskBlur: 3,
      backgroundBlur: 10,
      ...options
    };

    this.canvas = document.createElement('canvas');
    this.canvas.width = this.options.width;
    this.canvas.height = this.options.height;
    this.context = this.canvas.getContext('2d')!;

    this.outputCanvas = document.createElement('canvas');
    this.outputCanvas.width = this.options.width;
    this.outputCanvas.height = this.options.height;
    this.outputContext = this.outputCanvas.getContext('2d')!;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Wait for MediaPipe to load
    await this.waitForMediaPipe();

    console.log('MediaPipe loaded');

    this.segmentation = new (window as any).SelfieSegmentation({
      locateFile: (file: string) => `${MEDIAPIPE_CONFIG.selfieSegmentationUrl}/${file}`,
    });

    this.segmentation.setOptions({
      modelSelection: MEDIAPIPE_CONFIG.modelSelection
    });

    this.isInitialized = true;
  }

  private async waitForMediaPipe(timeout = 10000): Promise<void> {
    const startTime = Date.now();
    while (!(window as any).SelfieSegmentation && Date.now() - startTime < timeout) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (!(window as any).SelfieSegmentation) {
      throw new Error('MediaPipe not loaded');
    }
  }

  async processVideoTrack(inputTrack: MediaStreamTrack): Promise<MediaStreamTrack> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const stream = new MediaStream([inputTrack]);
    const video = document.createElement('video');
    video.srcObject = stream;
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    video.style.visibility = 'hidden';
    document.body.appendChild(video);

    await new Promise(resolve => {
      video.onloadedmetadata = resolve;
    });


    this.setupProcessing(video);

    return this.outputCanvas.captureStream(30).getVideoTracks()[0];
  }

  private setupProcessing(video: HTMLVideoElement): void {
    this.segmentation.onResults((results: MediaPipeResults) => {
      this.processFrame(results);
    });

    const processFrame = async () => {
      if (video.readyState >= 2) {
        await this.segmentation.send({ image: video });
      }
      requestAnimationFrame(processFrame);
    };

    processFrame();
  }

  private processFrame(results: MediaPipeResults): void {
    const { width, height, maskBlur, backgroundBlur } = this.options;
    
    const canvasCtx: CanvasContext = {
      canvas: this.outputCanvas,
      context: this.outputContext,
      width,
      height
    };

    CanvasUtils.processFrame(
      canvasCtx,
      results,
      this.backgroundType,
      this.backgroundImage || undefined,
      { maskBlur, backgroundBlur }
    );
  }

  setBackgroundMode(mode: BackgroundType): void {
    this.backgroundType = mode;
  }

  async setBackgroundUrl(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.backgroundImage = img;
        resolve();
      };
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.crossOrigin = 'anonymous';
      img.src = url;
    });
  }

  setBackgroundImage(image: HTMLImageElement): void {
    this.backgroundImage = image;
  }

  getOutputCanvas(): HTMLCanvasElement {
    return this.outputCanvas;
  }

  destroy(): void {
    this.isInitialized = false;
    this.segmentation = null;
    this.backgroundImage = null;
  }
}