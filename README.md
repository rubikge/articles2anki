# Terms Logger Scaffold (Articles2Anki)

This project is a scaffold for a Google Chrome extension that extracts terms from a webpage and sends them to a backend service destined for Google Cloud Run.

## Architecture
- **Extension**: A Manifest V3 Chrome extension. Clicking the extension icon extracts the active page's title and URL, and sends them to the backend as a JSON payload. If the backend is unreachable, a toast error notification is injected directly into the webpage DOM.
- **Backend**: A fast and lightweight Fastify server running on Node.js. It listens on `POST /api/terms` and logs the received payload to the console. It includes a `Dockerfile` for Cloud Run deployment and GitHub Actions workflow scaffold.

## Local Development

### 1. Start the Backend
```bash
cd backend
pnpm install
pnpm start
```
The server will start on `http://localhost:8080`.

### 2. Load the Extension
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** in the top right corner.
3. Click **Load unpacked** and select the `extension/` directory.

### 3. Usage
1. Open any standard webpage (or `http://localhost:8080`). Note: Chrome prevents content scripts from running on `chrome://` or Chrome Web Store pages.
2. Click the Terms Logger extension icon.
3. Check the backend terminal to see the logged payload.
4. Stop the backend server and click the icon again to verify the error toast notification.
