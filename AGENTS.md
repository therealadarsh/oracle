# Working agreement for the Oracle of Cubicle 13

I'm building a Halloween oracle for an office party. You talk to a glowing crystal ball in a browser, it thinks for a couple of seconds, and it answers out loud in a creepy voice with a prophecy that's mostly about meetings, printers and coffee. One laptop, one person at a time, a room full of coworkers watching. That last part matters. If it freezes or says something dumb, everyone sees it.

I don't have much time, and I'd rather have a small thing that works than a big thing that almost does. Keep that in mind every time you're tempted to add something.

Read this file at the start of every task. Read program.md too. That one is the actual loop we're running.

## Think before you write code

Don't guess quietly. If my request could mean two things, tell me both, say which one you'd pick, and say why. If something I asked for is harder than it looks, or there's a much simpler way to get the same result, tell me before you build the hard version. I'd honestly rather get a short "this part is unclear, here's my default" than a confident wrong build.

Put your assumptions at the top of your reply in a line or two. If one of them is wrong, I want to spot it fast.

## Keep it small

Write the least code that does the job. No settings panels, no config objects, no helper classes you use once, nothing added "in case we need it later". No error handling for situations that can't happen. If you handle an error, it should be one I could actually trigger at the party: mic denied, wifi down, no voices installed, someone mashing the button.

Rough test: would a sensible senior engineer look at this and ask why it's so big? If yes, shrink it. app.js should stay under about 600 lines. When it gets close, stop and tell me, and we'll decide together whether to split it. Don't split it on your own.

## Touch only what the task needs

Every line you change should trace back to what I just asked for. Don't reformat code you weren't asked about. Don't rename things because you'd have named them differently. Don't rewrite a comment you don't understand. Match the style that's already there, even if you'd do it another way.

If you notice something unrelated that's broken or ugly, mention it in your reply and leave it alone. If your own change leaves an import or a function unused, clean that up. Anything that was already dead before you got here isn't yours to delete.

## Know when you're done

"Done" isn't "I wrote the code." Done is a check I can run and watch pass. Before you start, turn the task into one or more checks: a command with an expected output, or a short list of things I can click. Then build until they pass. For a bug, write the failing check first, then fix it.

The main check is `node --test`. The prophecy tests are the scoreboard, and I treat them as locked once phase 3 is finished. You can add tests. You can't delete one, loosen one, or change what it expects so that it passes. If a test fails, the data or the code is wrong, not the test. If you honestly believe a test is wrong, stop and tell me why.

## Who owns what

- `AGENTS.md` and `program.md` are mine. Don't edit them.
- `prophecies.test.js` is the locked scoreboard after phase 3.
- `prophecies.js`, `app.js`, `index.html` and `style.css` are yours to edit, one phase at a time.
- `results.tsv` is the build log. You append to it. It isn't committed to git.

## The stack, and the walls around it

Plain HTML, CSS and JavaScript. No framework, no bundler, no build step, no npm packages in the app. If you think we need a dependency, ask me first and tell me what it saves.

Speech comes from the browser: the Web Speech API for listening and speechSynthesis for talking. It's push to talk, never always on, because an office is loud and I'd rather the oracle ignore people than hear nonsense.

Typing and the tappable question chips always have to work, even when the microphone doesn't. This is the most important rule in the project. Every other feature is allowed to fail as long as the oracle can still answer something typed.

No image or audio files. Sounds are synthesized with Web Audio. Visuals are CSS, inline SVG or canvas. Fonts come from Google Fonts with a serif fallback.

Never put an API key in the browser code. If we do the AI phase, the key lives in a server-side environment variable and nowhere else.

## The jokes

Office-safe and PG. Funny in a dramatic, doomy way: the printer knows what it did, the meeting could have been an email, the wifi is a fragile peace. Generic workplace stuff only. Nothing about real people by name, layoffs or firing, money, health, or anyone's identity. The oracle never repeats the user's words back inside a prophecy, because somebody will try to make it say something awful.

Prophecies are one or two sentences, 30 words at most, and they have to sound right when a robot voice reads them aloud. No emoji, no symbols, no abbreviations that get spelled out letter by letter.

## When you're stuck

Two strikes. If a fix doesn't work, try one more idea. If that fails too, stop, revert to the last commit, and tell me what you learned. Don't pile a fifth patch onto a broken attempt. A clean revert is cheaper than untangling a mess.

If you're missing information, ask one question and include your default, so I can just say yes.

## When you report back

Keep it short. Tell me what you changed in plain words, the exact command to run, what I should see, and what you couldn't check. You can't hear the voice or use the microphone, so say so when it matters instead of implying it works. No victory lap.
