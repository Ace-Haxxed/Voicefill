# VoiceFill

Fill any text field on any website by talking — no AI, no server, no API keys.
Pure browser `SpeechRecognition` (built into Chrome/Edge).

## How it works
1. Click into any text field (search bar, textarea, Gmail compose, etc.)
2. Hold **Alt + Shift + V** and speak
3. Release the keys — your speech is transcribed and typed into the field instantly

A small floating indicator in the bottom-right shows the live transcript while you talk.

## Load it (unpacked, ~30 seconds)
1. Open `chrome://extensions`
2. Toggle **Developer mode** (top right)
3. Click **Load unpacked**
4. Select this folder (`voicefill/`)
5. Go to any site, click a text box, hold Alt+Shift+V, talk

## Notes
- Works on `input`, `textarea`, and `contenteditable` elements (covers ~everywhere you'd type)
- Say "comma", "period", "question mark", or "new line" for basic punctuation — no AI cleanup, just simple word→symbol replacement
- Requires mic permission on first use (Chrome will prompt)
- Chrome/Edge only (Web Speech API isn't in Firefox/Safari)