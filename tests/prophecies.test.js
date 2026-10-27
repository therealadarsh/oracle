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
