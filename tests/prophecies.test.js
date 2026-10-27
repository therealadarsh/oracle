const { test } = require("node:test");
const assert = require("node:assert");
const Oracle = require("../site/prophecies.js");

const SENTENCE_END = /[.!?]$/;
const EMOJI = /[\u{1F300}-\u{1FAFF}]/u;

function allProphecyTexts() {
  const texts = [];
  const src = require("fs").readFileSync(
    require("path").join(__dirname, "../site/prophecies.js"),
    "utf8"
  );
  const block = src.split("const CATEGORIES = {")[1];
  const lines = block.match(/"([^"\\]|\\.)*"/g) || [];
  for (const line of lines) {
    const t = line.slice(1, -1);
    if (t.length > 20 && !t.includes(" ") === false) texts.push(t);
  }
  return texts;
}

function collectFromCategories() {
  const texts = [];
  const re = /^\s+"([^"]+)",?\s*$/gm;
  const src = require("fs").readFileSync(
    require("path").join(__dirname, "../site/prophecies.js"),
    "utf8"
  );
  const catSection = src.slice(src.indexOf("const CATEGORIES = {"));
  let m;
  while ((m = re.exec(catSection)) !== null) {
    const t = m[1];
    if (t.includes(" ") && t.length > 15) texts.push(t);
  }
  return texts;
}

test("keyword: meeting question → meetings", () => {
  Oracle.reset();
  const r = Oracle.answer("will my meeting end on time?");
  assert.equal(r.category, "meetings");
});

test("keyword: printer → wifi and tech and printer", () => {
  Oracle.reset();
  const r = Oracle.answer("is the printer plotting");
  assert.equal(r.category, "wifi and tech and printer");
});

test("keyword: nonsense → generic", () => {
  Oracle.reset();
  const r = Oracle.answer("xyzzy plugh abracadabra");
  assert.equal(r.category, "generic");
});

test("blank and whitespace → empty", () => {
  Oracle.reset();
  assert.equal(Oracle.answer("").category, "empty");
  assert.equal(Oracle.answer("   \t  ").category, "empty");
});

test("blocked word → blocked, text does not echo input", () => {
  Oracle.reset();
  const bad = "what the hell is going on";
  const r = Oracle.answer(bad);
  assert.equal(r.category, "blocked");
  assert.ok(!r.text.toLowerCase().includes("hell"));
});

test("repeatability with rng", () => {
  Oracle.reset();
  let n = 0;
  const rng = () => {
    n += 0.37;
    return n % 1;
  };
  const a = Oracle.answer("printer jam", { rng });
  Oracle.reset();
  n = 0;
  const b = Oracle.answer("printer jam", { rng });
  assert.equal(a.text, b.text);
  assert.equal(a.category, b.category);
});

test("no repeat within 5-answer window (30 runs)", () => {
  Oracle.reset();
  const seen = [];
  for (let i = 0; i < 30; i++) {
    const r = Oracle.answer("will my meeting end on time?");
    const window = seen.slice(-5);
    assert.ok(!window.includes(r.text), `repeat in window: ${r.text}`);
    seen.push(r.text);
  }
});

test("quality gates on all prophecy lines", () => {
  const texts = collectFromCategories();
  assert.ok(texts.length >= 80);
  const uniq = new Set(texts);
  assert.equal(uniq.size, texts.length, "duplicate prophecy text found");
  for (const text of texts) {
    assert.ok(text.trim().length > 0);
    assert.ok(text.split(/\s+/).length <= 30, `too long: ${text}`);
    assert.ok(!EMOJI.test(text), `emoji in: ${text}`);
    assert.ok(SENTENCE_END.test(text.trim()), `punctuation: ${text}`);
  }
});

test("coverage: categories and lists", () => {
  const src = require("fs").readFileSync(
    require("path").join(__dirname, "../site/prophecies.js"),
    "utf8"
  );
  const names = [
    "meetings",
    "boss",
    "deadlines",
    "coffee and food",
    "wifi and tech and printer",
    "email",
    "career",
    "weekend and vacation",
    "monday and friday",
    "luck and yes or no questions",
    "halloween and ghosts",
    "generic",
  ];
  for (const name of names) {
    const key = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(?:^|[,{\\n])\\s*"?${key}"?:\\s*\\[([\\s\\S]*?)\\],?\\s*(?:\\n|$)`, "m");
    const m = src.match(re);
    assert.ok(m, `missing category ${name}`);
    const lines = m[1].match(/"([^"]+)"/g) || [];
    const min = name === "generic" ? 20 : 8;
    assert.ok(lines.length >= min, `${name} has ${lines.length}, need ${min}`);
  }
  assert.equal(Oracle.thinkingLines.length, 10);
  assert.equal(Oracle.attractLines.length, 6);
  assert.equal(Oracle.chips.length, 6);
});

// Sprint 1 additions (CR-001, INC-001, INC-002). Existing tests above are unchanged.

function everyLine() {
  const { CATEGORIES, MY_INSIDE_JOKES } = Oracle.data;
  const lines = [];
  for (const [category, pool] of Object.entries(CATEGORIES)) {
    for (const text of pool) lines.push({ source: category, text });
  }
  for (const joke of MY_INSIDE_JOKES) {
    for (const text of joke.lines) lines.push({ source: "inside jokes", text });
  }
  return lines;
}

const BANNED_TOPICS = [
  "layoff", "layoffs", "laid off", "fired", "firing", "terminated", "salary",
  "paycheck", "money", "budget", "headcount", "reorg", "sick", "illness",
  "health", "doctor",
];

function hasWord(text, word) {
  return new RegExp(`\\b${word}\\b`, "i").test(text);
}

test("data gate: plain ASCII only, so nothing is read aloud as a symbol", () => {
  for (const { source, text } of everyLine()) {
    assert.match(text, /^[A-Za-z0-9 .,!?'-]+$/, `${source}: odd character in: ${text}`);
  }
});

test("data gate: no all-caps words that a robot voice would spell out", () => {
  for (const { source, text } of everyLine()) {
    assert.ok(!/\b[A-Z]{2,}\b/.test(text), `${source}: abbreviation in: ${text}`);
  }
});

test("data gate: no banned topic words or blocklist words in any prophecy", () => {
  for (const { source, text } of everyLine()) {
    for (const word of [...BANNED_TOPICS, ...Oracle.data.BLOCKLIST]) {
      assert.ok(!hasWord(text, word), `${source}: "${word}" in: ${text}`);
    }
  }
});

test("data gate: same length, ending and duplicate rules apply to every line including inside jokes", () => {
  const seen = new Set();
  for (const { source, text } of everyLine()) {
    assert.ok(text.trim().length > 0, `${source}: empty line`);
    assert.ok(text.split(/\s+/).length <= 30, `${source}: too long: ${text}`);
    assert.match(text.trim(), /[.!?]$/, `${source}: no ending punctuation: ${text}`);
    assert.ok(!seen.has(text), `${source}: duplicate: ${text}`);
    seen.add(text);
  }
});

test("blocked: whole words only, so hello and shell are fine", () => {
  for (const ok of ["Hello oracle", "is my shell script ok", "scrap the plan", "Michelle says hi"]) {
    assert.equal(Oracle.blocked(ok), false, ok);
    Oracle.reset();
    assert.notEqual(Oracle.answer(ok).category, "blocked", ok);
  }
  for (const bad of ["what the hell", "damn it", "that is crap!", "Hell."]) {
    assert.equal(Oracle.blocked(bad), true, bad);
  }
});

test("routing: all six chips land in their intended category", () => {
  const expected = [
    "meetings",
    "wifi and tech and printer",
    "wifi and tech and printer",
    "email",
    "coffee and food",
    "monday and friday",
  ];
  Oracle.chips.forEach((chip, i) => {
    Oracle.reset();
    assert.equal(Oracle.answer(chip).category, expected[i], chip);
  });
});

test("routing: Wi-Fi with a hyphen, plurals, and no matches inside other words", () => {
  const cases = [
    ["Will the Wi-Fi survive today?", "wifi and tech and printer"],
    ["Will the wi fi work", "wifi and tech and printer"],
    ["are my meetings cancelled", "meetings"],
    ["will I succeed at the party", "luck and yes or no questions"],
    ["what is my account status", "generic"],
    ["I feel entitled to attention", "generic"],
  ];
  for (const [q, category] of cases) {
    Oracle.reset();
    assert.equal(Oracle.answer(q).category, category, q);
  }
});
