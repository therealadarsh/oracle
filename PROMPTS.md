# Prompts for Cursor, phase by phase

These replace the earlier CURSOR_PROMPTS.md. Same phases, written the way I'd talk to a teammate, with a check at the end of each so we both know when it's done.

## How I use these

Open the folder in Cursor, switch chat to Agent mode, paste one phase, read what comes back, run the checks, then commit. If the checks fail twice I revert and either move on or ask for help. I never paste two phases at once, because when something breaks I want to know which change did it.

Every prompt starts with "Read AGENTS.md and program.md first." That line does real work. Cursor forgets between chats, and those two files are what bring it back up to speed.

ELI5 for the whole thing: you're building a spooky website with a glowing ball. You press a button, ask a question out loud, and the ball takes a moment to think and then answers in a creepy voice.

---

## Phase 0: skeleton

ELI5: build the empty rooms before you put any furniture in them.

```text
Read AGENTS.md and program.md first. We're on phase 0.

I want an empty project that runs and has nothing extra in it. Create index.html, style.css, app.js, prophecies.js, prophecies.test.js and README.md. The page needs a title, the viewport meta tag, my stylesheet and scripts linked (prophecies.js before app.js), and one centered heading that says "The Oracle of Cubicle 13".

Check whether this folder is already a git repository. If it isn't, run git init. If it is, leave the remote and the history alone. Make sure .gitignore exists (it should already ignore results.tsv, .DS_Store, node_modules, .env and .netlify). Create results.tsv with the tab-separated header line from program.md. Then commit everything as "phase 0: skeleton". Don't push, I'll do that.

README.md gets two sentences on what this is, the serve command (python3 -m http.server 8000, then open http://localhost:8000 in Chrome), and the test command (node --test). Nothing else.

No package.json and no dependencies. prophecies.test.js can hold one placeholder test that passes, so the runner has something to run. Tell me in your reply that it's a placeholder.

Done when: I run the serve command, open the page, see the heading, and the browser console is empty. node --test prints one passing test.
```

---

## Phase 1: the look

ELI5: paint the room. Dark walls, candles, fog, and the glowing ball in the middle.

```text
Read AGENTS.md and program.md first. Phase 1, the look. No voice, no logic, no real behavior yet. I just want to stand in front of it and feel like I walked into a haunted office.

Layout, top to bottom, all centered. The title "The Oracle of Cubicle 13" with the subtitle "Speak your question. Receive your fate." Then the stage: a big glowing crystal orb in the middle, a candle on each side that flickers, and two layers of slow fog drifting behind. Under the orb, a prophecy panel with big readable text and aria-live="polite". For now it says "Approach, mortal...". Under that, one large button, "Ask the Oracle" (id ask-btn), and below it a text input (id question-input) with a small Ask button for people who'd rather type. Then a row of six tappable chips in a container with id chips, holding these questions: "Will my meeting end on time?", "Is the printer plotting against me?", "Will the wifi survive today?", "Should I check my email?", "Is it too early for coffee?", "Will Friday ever arrive?". Two small toggles in the top corners, one for sound and one for fullscreen.

The look I'm after: near black with a purple tint (around #0b0713), candle amber (#ffb347) for warmth, ghost green (#9dffb0) and plum (#7a4cff) as the other two colors. Cinzel Decorative for the title and Cormorant Garamond for everything else, both from Google Fonts with serif fallbacks. Build the orb out of layered radial gradients with a slowly turning swirl inside. Put simple inline SVG cobwebs in two corners. I don't want it cartoonish. Think candlelit, a little creepy, a little funny.

The orb has five moods, driven only by document.body.dataset.state:
idle: slow, gentle pulse
listening: green rings ripple out from the orb
thinking: faster purple swirl
speaking: warm amber pulse
error: a short red flicker
If prefers-reduced-motion is on, all of that goes static.

So I can check your work, add a dev helper that only runs when the URL has ?dev=1. Keys 1 to 5 set the state to idle, listening, thinking, speaking, error. That goes in app.js and nothing else does.

It has to hold up on a laptop projected onto a wall and on a phone held upright, with no sideways scrolling on either.

Done when: with ?dev=1 I can press 1 through 5 and see five clearly different looks, the page has no horizontal scroll at 390px wide, and node --test still passes.
```

---

## Phase 2: the brain

ELI5: the oracle's brain is a big notebook of prophecies sorted by topic. It listens for a topic word and reads one out.

```text
Read AGENTS.md and program.md first. Phase 2, the brain. Only prophecies.js changes in this phase. Don't touch app.js or the HTML.

This file has to work in two places: in the browser as a global called Oracle, and in Node through module.exports (set to the Oracle object itself), so I can test it from the terminal.

What I need from it:
Oracle.answer(question, opts) returns { category, text }. opts is optional and can carry rng, a function that returns a number from 0 to 1, so tests can be repeatable.
Oracle.thinkingLines: ten short lines shown while the oracle "thinks". Something like "The spirits are rummaging through the shared drive..."
Oracle.attractLines: six short lines it whispers to lure people over.
Oracle.chips: the same six questions that are on the page.
Oracle.blocked(question): true if the question contains a word from a small blocklist of profanity and slurs.
Oracle.reset(): clears the memory of recent answers, so tests can start clean.

How answer() should behave. A blank question returns category "empty" and a line like "Speak up, mortal. The dead are hard of hearing." A blocked question returns category "blocked" and a stock line that never contains or echoes the question. Otherwise, lowercase the question, strip punctuation, and look for keywords to pick a category. The categories are: meetings, boss, deadlines, coffee and food, wifi and tech and printer, email, career, weekend and vacation, monday and friday, luck and yes or no questions, halloween and ghosts. Each needs at least 8 prophecies. Add a generic category with at least 20, for when nothing matches. And never return a text that was in the last 5 answers.

On tone: dramatic, doomy and funny, like a fortune teller who has sat through too many reply-all chains. These four lines are only here to show the register. Write your own and feel free to beat them:
"The meeting will end on time. The follow-up meeting will not."
"The printer knows what you did. It is deciding how to respond."
"Your coffee will stay hot for exactly one more minute. Drink wisely."
"Soon you will receive an email that begins with the words, per my last message."

The rules in AGENTS.md apply: PG, 30 words at most, speakable, nothing that names a real person or touches money, health or layoffs.

At the top of the file add a clearly marked MY_INSIDE_JOKES section: an empty array of { keywords: [], lines: [] } objects. I'll fill it in with our office's real running jokes. answer() should check it before the built-in categories.

Done when: in the browser console, Oracle.answer("will my meeting end on time?") gives different meeting prophecies on repeat, a nonsense question gives a generic one, and a blank string gives the "empty" line. In the terminal, node -e "console.log(require('./prophecies.js').answer('printer'))" prints an object.
```

---

## Phase 3: the inspector

ELI5: build a tiny robot that checks the notebook has no blank pages, no copies, and nothing too long.

```text
Read AGENTS.md and program.md first. Phase 3, the inspector. Write prophecies.test.js with node:test and node:assert. No packages. Delete the placeholder test.

This file becomes the scoreboard for every phase after this one, so write tests that can really fail. If you find yourself bending a test to get it green, stop. The data is wrong, so fix the data.

What to test:
Keyword matching. A meeting question lands in the meetings category, a printer question lands in the wifi and tech and printer category (use whatever exact names exist), and a nonsense question lands in generic.
Blank and whitespace-only input returns category "empty".
A question with a blocked word returns category "blocked", and the returned text does not contain the user's input.
Repeatability. With the same rng function, two runs give the same result. Call Oracle.reset() between runs.
No repeats. Thirty answers in a row to the same question never repeat a text inside a 5-answer window.
Quality gates over every prophecy in every category: not empty, 30 words or fewer, no emoji, no duplicate text anywhere in the file, ends with sentence punctuation.
Coverage. Every category has at least 8 prophecies and generic has at least 20.
thinkingLines has 10 entries, attractLines has 6, chips has 6.

Run node --test and show me the real output. Tell me if you had to change any prophecy to make a gate pass.

From the moment these pass, this file is locked. I'll hold you to that.
```

Done when: `node --test` is green, and I've skimmed 20 or so prophecies myself and laughed at least once.

---

## Phase 4: the voice

ELI5: teach the ball to talk, slowly, in a low spooky voice.

```text
Read AGENTS.md and program.md first. Phase 4, giving the oracle a voice. Everything goes in app.js.

Write speak(text), which returns a Promise that resolves when the speaking ends. Use window.speechSynthesis.

I know a few things bite people here, so handle them. Voices load late in Chrome, so wait for the voiceschanged event and also cover the case where the voices are already there. Pick a voice in this order: an English male voice by name if one exists (Daniel, Fred, Alex, Google UK English Male), then the first English voice, then the default. Rate around 0.85 and pitch around 0.6. I want slow and low. Chrome cuts long utterances off partway through, so split the text into sentences and speak them one after another. Call speechSynthesis.cancel() before you start, and resolve the Promise on both end and error. If it can ever hang, it will, at the party, in front of everyone. Speech only starts from a user click, so don't try to play anything on page load. The browser will block it.

While it speaks, reveal the prophecy on screen a word at a time, paced roughly to how long the speech should take, so the text and the voice feel connected. If speech isn't available, show the full text at once.

Add a hidden voice picker, a small select behind a gear icon, so I can audition voices. Remember my choice in localStorage inside try/catch, and don't crash if storage is blocked.

For now, wire the typed Ask button to call Oracle.answer on whatever is in the input and then speak() the result. No microphone yet.

Done when: I type "will the wifi survive" and click Ask, I hear a slow low voice, I see the words appear in time with it, switching voices in the picker works, and node --test still passes. Tell me plainly that you couldn't hear it.
```

---

## Phase 5: the ears

ELI5: give the ball ears. It only listens while you press the button, so a noisy office doesn't confuse it.

```text
Read AGENTS.md and program.md first. Phase 5, listening. Everything goes in app.js.

Use window.SpeechRecognition or window.webkitSpeechRecognition. It's push to talk on the "Ask the Oracle" button: click to start, and it stops by itself when the person stops talking. Settings: lang en-US, interimResults true, continuous false, maxAlternatives 1. Show what it hears live in a styled "you said" line. Stop automatically after 8 seconds even if nothing was heard.

Handle every error it can throw: not-allowed, no-speech, audio-capture, network, aborted and service-not-allowed. Each one shows a short, friendly message in the oracle's voice and leaves typing and the chips working. "The spirits cannot hear you. Type your question below." is the kind of thing I mean.

If the recognition API doesn't exist at all (Safari, Firefox), hide the mic button, show a note that says "Type your question or tap one below", and leave everything else alone.

Typing: pressing Enter submits. Chips: clicking one submits that question. All three ways in, voice, typed and chip, go through one function called askOracle(question). I don't want three copies of the same logic.

Don't build the full flow yet. Once a question is captured, call Oracle.answer and speak(), same as phase 4.

Done when: I click the button, allow the mic, ask a question out loud and hear a prophecy. I deny the mic on purpose and get the friendly message with typing still working. I open the page in Safari and see the fallback note. The only things you can check are the code paths and the tests, so list exactly which ones are mine to try.
```

---

## Phase 6: the routine

ELI5: give the oracle a routine of waiting, listening, thinking, speaking and resting, and make sure it can never get stuck.

```text
Read AGENTS.md and program.md first. Phase 6. Refactor app.js into one state machine.

A single function, setState(next), updates document.body.dataset.state and the visible status text. The flow is idle, listening, thinking, speaking, idle. Any state can go to error, and error returns to idle after 3 seconds. Typed and chip questions skip listening and start at thinking.

Thinking lasts a random 2 to 3.5 seconds. While it thinks, rotate through Oracle.thinkingLines on screen every 900 milliseconds. After speaking ends, go back to idle, and keep the last prophecy on screen until the next question.

Ignore every button press, chip click and Enter unless the state is idle. Make the controls look disabled while it isn't.

Add a watchdog. If any non-idle state lasts more than 20 seconds, cancel speech and recognition, show "The spirits have wandered off. Try again.", and go back to idle.

Remove the temporary wiring from phases 4 and 5. Everything goes through askOracle(question) now. Keep the ?dev=1 key helper working.

Done when: I ask three questions in a row with no repeats, I double-click the button fast and nothing doubles up, I click chips while it's speaking and nothing happens, and the watchdog fires if I kill the speech mid-sentence. node --test passes.
```

---

## Phase 7: sound and polish

ELI5: add thunder, creaks and a low hum, and make the oracle call out to people walking past.

```text
Read AGENTS.md and program.md first. Phase 7, sound and polish. No audio files, everything is synthesized with Web Audio.

Create the AudioContext only after the first user click. Sounds: a very quiet low drone while idle, a soft chime when listening starts, a short burst of filtered noise as thunder when a prophecy appears, and a creak on errors.

The sound toggle in the corner mutes everything, including speech. Remember it in localStorage inside try/catch.

Attract mode: after 45 seconds of idle, if sound is on and the person has clicked at least once, the oracle speaks one random line from Oracle.attractLines. Repeat every 60 seconds while idle. Any interaction resets the timer.

Keys: Space to push to talk (only when idle and not typing in the input), F for fullscreen, M to mute. When the URL has ?kiosk=1, hide the mouse cursor after 3 seconds without movement and hide the dev helper and the voice picker gear. The fullscreen button uses the Fullscreen API and does nothing quietly if the browser blocks it. Respect prefers-reduced-motion for anything new that moves.

Done when: I wait 45 seconds after one click and hear the oracle call out, I mute and get complete silence including speech, and Space, F and M all work. Keep app.js under 600 lines. If you can't, tell me.
```

---

## Phase 8: break it

ELI5: try to break it on purpose, so a coworker can't.

```text
Read AGENTS.md and program.md first. Phase 8, hardening. Think of a room full of people poking at it and being a little mean.

Make sure each of these shows a friendly message and leaves typing and chips working: mic permission denied, mic unplugged, recognition network error (wifi off), no speech voices installed, and speechSynthesis throwing.
Cap typed input at 200 characters.
Ignore repeated submits unless the state is idle.
A question with a blocked word gets the stock refusal line. The text itself is never shown on the page or spoken.
User text never goes into the DOM as HTML. Use textContent.
Add a hidden reset on the R key (when not typing) that cancels speech and recognition and returns to idle.
The console stays clean through a session of 10 questions.

Add a short "known limits" section to README.md: Chrome's speech recognition needs internet, Safari and Firefox lack it, voice quality changes from device to device.

Then give me an honest list of the risks you can still see in the code. Don't pad it. If there are only two, list two.

Done when: I can run my party-day script below and every row passes.
```

---

## Phase 9: AI prophecies (optional)

ELI5: instead of reading from the notebook, the oracle phones a very clever friend who makes up a fresh prophecy. If the call fails, it reads from the notebook.

Heads up: Netlify's drag-and-drop deploy doesn't run serverless functions. For this phase, deploy with the Netlify CLI or a site connected to GitHub. The API key goes in an environment variable and never in the code.

```text
Read AGENTS.md and program.md first. Phase 9. This one is optional and I may skip it. Keep it as small as you can.

Create netlify/functions/prophecy.js. It reads the question from a POST body, calls the Anthropic Messages API using the ANTHROPIC_API_KEY environment variable and the model claude-haiku-5-5 with max_tokens 120, and returns { text }.

The function's system prompt: you are the Oracle of Cubicle 13, an ominous and funny fortune teller at an office Halloween party. Reply in one or two short sentences, 30 words or fewer, plain speakable text, PG and workplace-safe. Never repeat the user's words. Never mention real people, money, health, layoffs or protected characteristics. If the question is inappropriate, answer with a short in-character refusal.

In app.js, askOracle checks Oracle.blocked first, before any network call. If it passes, try the function with a 6 second timeout. On any failure, timeout or empty reply, fall back to Oracle.answer, and the person should never notice. Add a 5 second cooldown between AI calls.

Put setup notes in README.md: where the environment variable goes and how to deploy with the CLI. The key must never appear in client code or in git history.

Done when: with the key set I get fresh answers, and with wifi off the notebook still answers.
```

---

## Phase 10: deploy and rehearse

ELI5: put the website online so anyone can open it, then practice once before the party.

Drag the folder onto app.netlify.com/drop and you get an HTTPS link. That matters, because browsers only allow the mic on localhost or HTTPS. Open `your-link/?kiosk=1` in Chrome on the party laptop and press F. Make a QR code for the link with any free generator and put it on a slide so people can try it on their own phones.

### Party-day script

Do this once at the real venue, a day early if you can.

| Step | What to do | A pass looks like |
|---|---|---|
| 1 | Open the deployed link on the party laptop | Loads, empty console |
| 2 | Click once, ask by voice | Live transcript, thinking, spoken prophecy |
| 3 | Ask three questions in a row | No repeats, nothing stuck |
| 4 | Play loud music, ask from three feet away | It hears you, or it asks you to try again |
| 5 | Deny mic permission | Friendly message, typing and chips still work |
| 6 | Turn wifi off | Friendly message, chips still work |
| 7 | Mute | Total silence |
| 8 | Wait 45 seconds after one click | The oracle calls out to the room |
| 9 | Open the link on your phone | Fits the screen, mic permission works |
| 10 | Mumble, or say nothing | A friendly nudge, no freeze |

### Backups

Chrome's speech input needs internet, so keep your phone hotspot ready. Typing and chips work with no mic at all. Record a 30-second screen video of it working, in case everything fails. Use an external speaker and a decent mic, because laptop speakers get lost in a crowded room.

---

## Handing it back to Claude

When a phase is done, or when something feels off, attach the project folder in the Claude desktop app and say "review phase N". Claude reads the code, runs `node --test`, reads the state flow and error handling, and sends back short fix prompts to paste into Cursor. The microphone and the spoken voice still need my own ears, so I tell Claude what I heard.
