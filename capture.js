console.log('capture.js loaded');

function initiateCapture() {
  console.log('initiateCapture called');
  let startX, startY, endX, endY;
  let isDrawing = false;

  const overlay = document.createElement('div');
  overlay.id = 'screenshot-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  overlay.style.zIndex = '9999';
  overlay.style.cursor = 'crosshair';
  document.body.appendChild(overlay);

  const selectionBox = document.createElement('div');
  selectionBox.id = 'selection-box';
  selectionBox.style.position = 'absolute';
  selectionBox.style.border = '2px dashed #fff';
  selectionBox.style.zIndex = '10000';
  selectionBox.style.pointerEvents = 'none'; // Ensure the box does not capture mouse events
  document.body.appendChild(selectionBox);

  overlay.addEventListener('mousedown', startSelection);
  overlay.addEventListener('mousemove', drawSelection);
  overlay.addEventListener('mouseup', endSelection);
  document.addEventListener('keydown', cancelCaptureOnEscape);

  function startSelection(e) {
    console.log('startSelection called');
    startX = e.clientX + window.scrollX;
    startY = e.clientY + window.scrollY;
    isDrawing = true;
    selectionBox.style.left = `${startX}px`;
    selectionBox.style.top = `${startY}px`;
    selectionBox.style.width = '0px';
    selectionBox.style.height = '0px';
  }

  function drawSelection(e) {
    if (isDrawing) {
      console.log('drawSelection called', startX, startY, e.clientX, e.clientY);
      endX = e.clientX + window.scrollX;
      endY = e.clientY + window.scrollY;
      selectionBox.style.left = `${Math.min(startX, endX)}px`;
      selectionBox.style.top = `${Math.min(startY, endY)}px`;
      selectionBox.style.width = `${Math.abs(endX - startX)}px`;
      selectionBox.style.height = `${Math.abs(endY - startY)}px`;

      console.log(selectionBox.style.width)
    }
  }

  function endSelection() {
    console.log('endSelection called, startX:', startX, 'startY:', startY, 'endX:', endX, 'endY:', endY);
    isDrawing = false;
    endCapture();
    if (endX !== undefined && endY !== undefined && startX !== endX && startY !== endY) {
      // Adjust the coordinates for the scroll position when capturing the screenshot
      chrome.runtime.sendMessage({ action: 'capture', coords: { x1: startX - window.scrollX, y1: startY - window.scrollY, x2: endX - window.scrollX, y2: endY - window.scrollY } });
    }
    document.removeEventListener('keydown', cancelCaptureOnEscape);
  }
  function cancelCaptureOnEscape(e) {
    if (e.key === 'Escape') {
      console.log('Escape pressed, canceling capture');
      chrome.runtime.sendMessage({ action: 'end_capture' });
    }
    document.removeEventListener('keydown', cancelCaptureOnEscape);
  }
  function endCapture() {
    const overlay = document.getElementById('screenshot-overlay');
    const selectionBox = document.getElementById('selection-box');
    if (overlay) document.body.removeChild(overlay);
    if (selectionBox) document.body.removeChild(selectionBox);
  }
}

initiateCapture();
