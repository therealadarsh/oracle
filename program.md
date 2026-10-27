# program.md: how we build this

This file runs the loop. AGENTS.md is how I want you to behave. This file is what we're doing and how we decide whether a change stays.

I borrowed the shape from Karpathy's autoresearch. There, a human writes the plan in plain Markdown, the agent works on one file at a time, one number decides what survives, and anything that doesn't improve the number gets thrown away with git. It's a much more serious project than mine, but the structure fits a build with a deadline just as well.

## The goal

A browser oracle that takes a person from "I pressed the button" to "I heard a prophecy" in under 10 seconds, with no freezes, in a loud room, on flaky wifi. That's the whole product.

## The score

An attempt is kept only if two things pass:

1. `node --test` is fully green.
2. The manual checks listed under the current phase in PROMPTS.md pass, as far as you can run them.

Green tests aren't enough on their own. I can't unit test a spooky orb or a creepy voice, so every phase also has a short list of things I'll click and listen to. You can't hear anything, so tell me which checks you ran and which ones are mine.

## The loop

1. Read AGENTS.md, this file, and the current phase in PROMPTS.md.
2. Write your plan in 3 to 6 lines, with a check for each step.
3. Make the change. One phase, small steps.
4. Run `node --test`. Load the page and run the phase's checks as far as you can.
5. If it passes, commit with a message like `phase 4: speak() with sentence chunking`. If it doesn't, run `git reset --hard` back to the last commit.
6. Append one line to results.tsv.
7. Stop and report. I decide when the next phase starts.

Unlike autoresearch, I don't want you looping all night. This is a build, not a search. One phase per run, then I take a look.

## Crashes

If something errors, read the actual error, fix the obvious cause, run it again. If it fails twice, revert and report. Don't keep guessing.

## What stays fixed

In autoresearch the agent can't touch the file that scores it, otherwise it could just change the scoring. Same rule here:

- `prophecies.test.js` can't be weakened once phase 3 passes. Adding tests is fine.
- `AGENTS.md` and `program.md` are read only.
- No new dependencies.
- Typing and chips always work. If a change breaks that, it's discarded, whatever else it does.

## Size and simplicity

app.js stays under about 600 lines so you can read the whole file before every edit. If a change adds a pile of tangled code for a tiny gain, I don't want it, even when the check passes. Deleting code and getting the same result is a win, and I'd like you to say so when it happens.

## results.tsv

Tab separated, one line per attempt, never committed. Create it in phase 0 with this header, then append to it:

```
phase	commit	tests_passed	tests_total	status	note
```

Status is `keep`, `discard` or `crash`. Notes are short and honest, like "chunking fixes the 15 second cutoff" or "voice picker broke on first load, reverted". Failures matter as much as wins, because later I want to know what already didn't work.

## The phases

0 skeleton, 1 theme, 2 prophecy engine, 3 tests (locked afterward), 4 voice out, 5 voice in, 6 state machine, 7 sound and polish, 8 hardening, 9 optional AI, 10 deploy and rehearsal. The prompt and the checks for each are in PROMPTS.md.
