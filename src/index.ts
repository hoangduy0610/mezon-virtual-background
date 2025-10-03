// Simple track-based API
export { SimpleVideoBackground } from './SimpleVideoBackground';
export { VideoTrackProcessor } from './VideoTrackProcessor';
export type { VideoTrackProcessorOptions } from './VideoTrackProcessor';

// Core utilities
export { MediaPipeService } from './mediapipe-service';
export { CanvasUtils } from './canvas-utils';

// Configuration
export { 
    MEDIAPIPE_CONFIG 
} from './config';

// Core types
export type {
    BackgroundType,
    MediaPipeResults,
    MediaPipeCamera,
    MediaPipeSegmentation,
    CanvasContext
} from './types';