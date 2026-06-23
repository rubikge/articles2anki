const IS_LOCAL = true; // Поменяйте на false перед релизом в прод
const API_URL = IS_LOCAL 
  ? 'http://localhost:8080/api/terms' 
  : 'https://terms-logger-backend-mgwct7ax7q-lm.a.run.app/api/terms';

async function handleAction(tab) {
  // Prevent injection on restricted pages
  if (tab.url && (tab.url.startsWith("chrome://") || tab.url.startsWith("edge://"))) return;

  try {
    // Inject the CSS for the toast
    await chrome.scripting.insertCSS({
      target: { tabId: tab.id },
      files: ["content.css"]
    });

    // Execute script to get title and url
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        return {
          title: document.title,
          url: window.location.href
        };
      }
    });

    if (results && results[0] && results[0].result) {
      const payload = results[0].result;
      
      // Send to backend
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'SuperSecretAnkiToken123'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Backend returned status ${response.status}`);
      }
      
      console.log('Successfully sent data to backend');
    }
  } catch (error) {
    console.error("Error occurred:", error);
    
    // Inject error toast into the tab
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (errorMessage) => {
        const toast = document.createElement('div');
        toast.className = 'terms-logger-error-toast';
        toast.textContent = `Terms Logger Error: ${errorMessage}`;
        document.body.appendChild(toast);
        
        setTimeout(() => {
          toast.remove();
        }, 5000);
      },
      args: [error.message || 'Failed to connect to backend']
    });
  }
}

chrome.action.onClicked.addListener(handleAction);
globalThis.testHandleAction = handleAction;
