let isCaptureActive = false;

chrome.commands.onCommand.addListener((command) => {
  console.log('Command:', command);
  if (command === "toggle_capture") {
    console.log('capture active: ' + isCaptureActive);
    if (isCaptureActive) {
      // if already active, cancel the capture
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript(
          {
            target: { tabId: tabs[0].id },
            func: endCapture
          }
        );
      });
    } else {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript(
          {
            target: { tabId: tabs[0].id },
            files: ['capture.js']
          }
        );
      });
    }
    isCaptureActive = !isCaptureActive;
  }
});

function endCapture() {
  const overlay = document.getElementById('screenshot-overlay');
  const selectionBox = document.getElementById('selection-box');
  if (overlay) document.body.removeChild(overlay);
  if (selectionBox) document.body.removeChild(selectionBox);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "end_capture") {
        // run command toggle_capture again to end the capture
        console.log('ending capture');
        chrome.commands.onCommand.dispatch("toggle_capture");
      }
    if (message.action === 'capture') {
      console.log('capturing');
      chrome.commands.onCommand.dispatch("toggle_capture");
      processScreenshot(message.coords.x1, message.coords.y1, message.coords.x2, message.coords.y2);
    }
  });
  
  function processScreenshot(x1, y1, x2, y2) {
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        return;
      }
  
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0].id;
  
        chrome.tabs.sendMessage(tabId, { action: 'process_screenshot', dataUrl, x1, y1, x2, y2 }, (response) => {
          if (response && response.croppedDataUrl) {
            saveImage(response.croppedDataUrl);
          }
        });
      });
    });
  }
  
  function saveImage(dataUrl) {
    console.log('data: '+dataUrl)
    chrome.downloads.download({
      url: dataUrl,
      filename: 'screenshot.png'
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
      } else {
        console.log(`Screenshot saved with download ID: ${downloadId}`);
      }
    });
  }