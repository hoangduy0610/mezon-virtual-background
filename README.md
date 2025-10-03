# Video Background Track Processor

Simple JavaScript library for processing video tracks with background effects using MediaPipe.

## Usage

```javascript
import { SimpleVideoBackground } from 'mezon-background-module';
const stream = await navigator.mediaDevices.getUserMedia({ video: true });
// Create processor
const processor = new SimpleVideoBackground({
  width: 640,
  height: 480,
});

// Initialize
await processor.initialize();

// Process video track
const inputTrack = stream.getVideoTracks()[0];
const outputTrack = await processor.processTrack(inputTrack);

// Control background
processor.setBackgroundMode('blur');
await processor.setBackgroundUrl('/image.jpg');
processor.setBackgroundMode('image');

// Cleanup
processor.destroy();
```

## API

- `setBackgroundMode('none'|'blur'|'image')`
- `setBackgroundUrl(url)` 
- `setBackgroundImage(htmlImageElement)`
- `getOutputCanvas()`
- `destroy()`

## Requirements

MediaPipe scripts must be loaded:

```html
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation.js"></script>
```