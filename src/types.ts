// Background Effect Types
export type BackgroundType = "none" | "blur" | "image";

// MediaPipe Types
export interface MediaPipeResults {
    image: HTMLVideoElement;
    segmentationMask: HTMLImageElement;
}

export interface MediaPipeCamera {
    start: () => Promise<void>;
    stop?: () => void;
}

export interface MediaPipeSegmentation {
    setOptions: (options: { modelSelection: number }) => void;
    onResults: (callback: (results: MediaPipeResults) => void) => void;
    send: (input: { image: HTMLVideoElement }) => Promise<void>;
}

// Canvas Types
export interface CanvasContext {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    width: number;
    height: number;
}