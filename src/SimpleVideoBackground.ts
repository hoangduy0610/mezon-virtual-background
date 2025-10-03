import { VideoTrackProcessor, VideoTrackProcessorOptions } from './VideoTrackProcessor';

export class SimpleVideoBackground {
  private processor: VideoTrackProcessor | null = null;
  private outputTrack: MediaStreamTrack | null = null;

  constructor(options?: VideoTrackProcessorOptions) {
    this.processor = new VideoTrackProcessor(options);
  }

  async initialize(): Promise<void> {
    if (this.processor) {
      await this.processor.initialize();
    }
  }

  async processTrack(inputTrack: MediaStreamTrack): Promise<MediaStreamTrack> {
    if (!this.processor) {
      throw new Error('Processor not initialized');
    }
    
    this.outputTrack = await this.processor.processVideoTrack(inputTrack);
    return this.outputTrack!;
  }

  setBackgroundMode(mode: 'none' | 'blur' | 'image'): void {
    this.processor?.setBackgroundMode(mode);
  }

  async setBackgroundUrl(url: string): Promise<void> {
    if (this.processor) {
      await this.processor.setBackgroundUrl(url);
    }
  }

  setBackgroundImage(image: HTMLImageElement): void {
    this.processor?.setBackgroundImage(image);
  }

  getOutputCanvas(): HTMLCanvasElement | null {
    return this.processor?.getOutputCanvas() || null;
  }

  destroy(): void {
    if (this.outputTrack) {
      this.outputTrack.stop();
    }
    this.processor?.destroy();
    this.processor = null;
    this.outputTrack = null;
  }
}