console.log('Content script loaded');
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'process_screenshot') {
      const { dataUrl, x1, y1, x2, y2 } = message;
      const img = new Image();
      img.src = dataUrl;
  
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculate the width and height considering all drag directions
        const startX = Math.min(x1, x2);
        const startY = Math.min(y1, y2);
        const width = Math.abs(x2 - x1);
        const height = Math.abs(y2 - y1);
  
        // Get the device pixel ratio
        const pixelRatio = window.devicePixelRatio;
  
        // Adjust coordinates and dimensions based on the pixel ratio
        const adjustedX = startX * pixelRatio;
        const adjustedY = startY * pixelRatio;
        const adjustedWidth = width * pixelRatio;
        const adjustedHeight = height * pixelRatio;
  
        canvas.width = adjustedWidth;
        canvas.height = adjustedHeight;
  
        ctx.drawImage(img, adjustedX, adjustedY, adjustedWidth, adjustedHeight, 0, 0, adjustedWidth, adjustedHeight);
  
        const croppedDataUrl = canvas.toDataURL('image/png');
  
        sendResponse({ croppedDataUrl });
      };
  
      return true; // Indicate that the response will be sent asynchronously
    }
  });
  