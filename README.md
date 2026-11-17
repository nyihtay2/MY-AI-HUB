# MY AI HUB

A starter app that brings ChatGPT (OpenAI), Google Gemini, and Meta Llama together.

## Requirements
- Node.js 18+ (Node 20+ recommended)
- API keys for the providers you want to use

## Run locally
1. Unzip the project.
2. Open a terminal in the project folder.
3. Run `npm install`.
4. Copy `.env.example` to `.env`.
5. Add your provider API keys to `.env`.
6. Run `npm start`.
7. Open `http://localhost:3000`.

The app can run with only one provider configured. The other providers will show a clear setup error.

## Provider setup
- OpenAI: set `OPENAI_API_KEY` and optionally `OPENAI_MODEL`.
- Gemini: set `GEMINI_API_KEY` and optionally `GEMINI_MODEL`.
- Llama: set `LLAMA_API_KEY`, `LLAMA_BASE_URL`, and `LLAMA_MODEL` for an OpenAI-compatible service that offers Meta Llama models. Meta Llama is a model family; API access is commonly provided by a model host. Check the provider's current model names and endpoint before configuring.

## Android
This starter is a responsive web app. To package it as an Android app, use Capacitor:
1. Install Android Studio and the Android SDK.
2. Add Capacitor to this project (`npm install @capacitor/core @capacitor/cli`).
3. Initialize Capacitor and add Android (`npx cap init`, `npm install @capacitor/android`, `npx cap add android`).
4. Configure a production web build/hosting strategy and API server URL; do not ship API keys inside the Android app.
5. Sync and open Android Studio (`npx cap sync android`, `npx cap open android`).

A signed APK requires Android Studio signing configuration. This ZIP does not contain a compiled APK.

## Security notes
- Keep all API keys on the server in `.env`; never put them in browser JavaScript or an APK.
- Do not commit `.env` to source control.
- Add authentication, rate limits, usage limits, and HTTPS before public deployment.
- API usage may incur charges from each provider.
