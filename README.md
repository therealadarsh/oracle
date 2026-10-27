The Oracle of Cubicle 13 is a browser-based Halloween oracle for an office party: you ask a question and it answers with a short, spooky workplace prophecy. It runs as plain HTML, CSS, and JavaScript with no build step.

**Serve:** `conda activate snakeenv`, then `python -m http.server 8000 --directory site`, then open http://localhost:8000 in Chrome.

**Test:** From the project root, run `node --test`.

**Deploy:** Drag the `site` folder to [app.netlify.com/drop](https://app.netlify.com/drop) for a quick HTTPS link (mic works on localhost or HTTPS). For optional AI prophecies (phase 9), connect the repo or use the Netlify CLI so serverless functions run. Set `ANTHROPIC_API_KEY` in the Netlify site environment variables—never in client code or git. The page only tries the AI when the URL has `?ai=1` (for example `/?kiosk=1&ai=1`); without it every answer comes from the built-in notebook and the console stays clean.

**Party laptop:** Open `https://your-site.netlify.app/?kiosk=1`, press **F** for fullscreen, use **Space** to talk, **M** to mute.

### Known limits

Chrome speech recognition needs internet. Safari and Firefox do not support the Web Speech recognition API; typing and question chips still work. Voice quality and available voices differ by device and browser.

### Party-day script

Run at the venue before the party: load the deployed link (empty console); ask by voice once; three questions in a row without repeats; loud room or deny mic (friendly message, typing still works); wifi off (fallback answers); mute (silence); wait 45s after one click for attract line; phone layout and mic; mumble or silence (nudge, no freeze).
