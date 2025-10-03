import { SimpleVideoBackground } from 'mezon-virtual-background';

// Usage example
async function setupVideoBackground() {
  // Create processor
  const processor = new SimpleVideoBackground({
    width: 640,
    height: 480,
    maskBlur: 3,
    backgroundBlur: 10
  });

  // Initialize
  await processor.initialize();

  // Get camera track
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  const inputTrack = stream.getVideoTracks()[0];

  // Process track
  const outputTrack = await processor.processTrack(inputTrack);

  // Use output track
  const outputStream = new MediaStream([outputTrack]);
  document.getElementById('video').srcObject = outputStream;

  // Control background
  processor.setBackgroundMode('blur');
  await processor.setBackgroundUrl('/path/to/image.jpg');
  processor.setBackgroundMode('image');

  // Cleanup when done
  // processor.destroy();
}

// Advanced usage with custom track replacement
async function replaceBackgroundInCall() {
  const processor = new SimpleVideoBackground();
  await processor.initialize();

  // Get original camera track
  const originalStream = await navigator.mediaDevices.getUserMedia({ video: true });
  const originalTrack = originalStream.getVideoTracks()[0];

  // Process it
  const processedTrack = await processor.processTrack(originalTrack);

  // Replace track in existing peer connection
  const peerConnection = new RTCPeerConnection();
  const sender = peerConnection.addTrack(processedTrack, new MediaStream([processedTrack]));

  // Change background dynamically
  processor.setBackgroundMode('blur');
  await processor.setBackgroundUrl('https://example.com/office.jpg');
  processor.setBackgroundMode('image');
}