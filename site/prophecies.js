/* MY_INSIDE_JOKES — add { keywords: [], lines: [] } for office in-jokes */
const MY_INSIDE_JOKES = [];

const BLOCKLIST = [
  "damn", "hell", "shit", "fuck", "asshole", "bitch", "bastard", "crap",
];

const Oracle = {
  chips: [
    "Will my meeting end on time?",
    "Is the printer plotting against me?",
    "Will the wifi survive today?",
    "Should I check my email?",
    "Is it too early for coffee?",
    "Will Friday ever arrive?",
  ],

  thinkingLines: [
    "The spirits are rummaging through the shared drive...",
    "I consult the ancient calendar invite...",
    "The printer whispers secrets to the void...",
    "Your question echoes in the break room...",
    "I shuffle the deck of pending tickets...",
    "The wifi gods demand a sacrifice...",
    "A spreadsheet opens in another dimension...",
    "Someone is typing loudly nearby...",
    "The fluorescent lights hum their verdict...",
    "I peer into the abyss of your inbox...",
  ],

  attractLines: [
    "Mortals... step closer. Fate awaits in cubicle thirteen.",
    "The orb grows restless. Ask, before the coffee runs cold.",
    "I see unanswered emails in your future. Come, ask me.",
    "The printer has spoken. Do you dare hear more?",
    "Your meeting could have been an oracle. Ask anyway.",
    "The spirits are bored. Entertain them with a question.",
  ],

  recent: [],

  blocked(question) {
    const q = String(question).toLowerCase();
    return BLOCKLIST.some((w) => q.includes(w));
  },

  reset() {
    this.recent = [];
  },

  answer(question, opts = {}) {
    const rng = opts.rng || Math.random;
    const raw = String(question ?? "").trim();
    if (!raw) {
      return {
        category: "empty",
        text: "Speak up, mortal. The dead are hard of hearing.",
      };
    }
    if (this.blocked(raw)) {
      return {
        category: "blocked",
        text: "The veil rejects that question. Ask something the office can survive.",
      };
    }

    const normalized = raw.toLowerCase().replace(/[^\w\s]/g, " ");
    for (const joke of MY_INSIDE_JOKES) {
      if (joke.keywords.some((k) => normalized.includes(k))) {
        return this.pickFrom("inside", joke.lines, rng);
      }
    }

    const category = this.matchCategory(normalized);
    const pool = CATEGORIES[category] || CATEGORIES.generic;
    return this.pickFrom(category, pool, rng);
  },

  matchCategory(normalized) {
    for (const { name, keywords } of CATEGORY_ORDER) {
      if (keywords.some((k) => normalized.includes(k))) return name;
    }
    return "generic";
  },

  pickFrom(category, pool, rng) {
    const available = pool.filter((t) => !this.recent.includes(t));
    const list = available.length ? available : pool.slice();
    const text = list[Math.floor(rng() * list.length)];
    this.recent.push(text);
    if (this.recent.length > 5) this.recent.shift();
    return { category, text };
  },
};

const CATEGORY_ORDER = [
  { name: "meetings", keywords: ["meeting", "standup", "zoom", "calendar", "sync", "agenda"] },
  { name: "wifi and tech and printer", keywords: ["printer", "wifi", "wi-fi", "vpn", "laptop", "computer", "tech", "network", "jam", "toner"] },
  { name: "email", keywords: ["email", "inbox", "reply", "cc", "bcc", "outlook", "slack message"] },
  { name: "coffee and food", keywords: ["coffee", "lunch", "snack", "food", "breakfast", "microwave", "fridge"] },
  { name: "boss", keywords: ["boss", "manager", "supervisor", "director", "one on one"] },
  { name: "deadlines", keywords: ["deadline", "due", "submit", "overdue", "extension", "sprint"] },
  { name: "career", keywords: ["promotion", "raise", "job", "resume", "interview", "title"] },
  { name: "weekend and vacation", keywords: ["weekend", "vacation", "pto", "holiday", "beach", "monday off"] },
  { name: "monday and friday", keywords: ["monday", "friday"] },
  { name: "halloween and ghosts", keywords: ["halloween", "ghost", "spooky", "costume", "witch", "pumpkin"] },
  { name: "luck and yes or no questions", keywords: ["luck", "lucky", "fortune", "fate", "will i", "should i"] },
];

const CATEGORIES = {
  meetings: [
    "The meeting will end on time. The follow-up meeting will not.",
    "Someone will share their screen with the wrong tab open.",
    "The agenda item you skipped will become the loudest topic.",
    "A calendar invite will appear with no description and maximum dread.",
    "You will say you are on mute. You will not be on mute.",
    "The standup will run long because someone brought feelings.",
    "Action items will multiply like unattended reply-all chains.",
    "The room will agree to circle back until the heat death of the office.",
  ],
  boss: [
    "Your manager will nod thoughtfully at news you already sent in writing.",
    "Feedback will arrive five minutes before you log off.",
    "A quick chat will grow roots and become a quarterly theme.",
    "Praise will be vague. The task list will be very specific.",
    "You will be asked how you feel about synergy. Choose words carefully.",
    "The one-on-one will start with how are things and end with headcount math you cannot see.",
    "Your boss will see the deck. The deck will not see your sleep schedule.",
    "Alignment will be requested. Alignment will remain mythical.",
  ],
  deadlines: [
    "The due date is firm in the calendar and soft in the universe.",
    "You will finish at the last minute. So will the person blocking you.",
    "An extension is possible. So is a new deadline wearing a fake mustache.",
    "The sprint will close with one ticket marked somehow done.",
    "Scope will shrink the moment someone important walks by.",
    "You will submit. The portal will spin. The portal always spins.",
    "Tomorrow you will wish yesterday had been louder about priorities.",
    "The report will go out. The typo will go out with it.",
  ],
  "coffee and food": [
    "Your coffee will stay hot for exactly one more minute. Drink wisely.",
    "The break room mug you choose will choose you back, mysteriously.",
    "Someone will heat fish. The spirits cannot help with that.",
    "The good snacks will vanish before noon. Plan accordingly.",
    "You will find the coffee pot empty. You will become the hero or the villain.",
    "Lunch will be rushed. Regret will be seasoned with desk crumbs.",
    "The vending machine will accept your coin and offer nothing but drama.",
    "A free donut will appear. Take it before the thread notices.",
  ],
  "wifi and tech and printer": [
    "The printer knows what you did. It is deciding how to respond.",
    "The wifi will hold until the moment you share your screen.",
    "VPN will connect on the third try, or the fourth, or never with grace.",
    "The printer jam is not mechanical. It is personal.",
    "Update will install during the only demo that mattered today.",
    "Your laptop will wake from sleep when you least want an audience.",
    "The shared drive will spin forever, then reveal one corrupted file.",
    "IT will ask if you restarted. You will restart your soul instead.",
  ],
  email: [
    "Soon you will receive an email that begins with the words, per my last message.",
    "An unread count will stare at you until you learn to blink first.",
    "Reply all will awaken a thread you thought was buried.",
    "The urgent flag will be used on something about parking.",
    "Your draft will send itself in a timeline you refuse to discuss.",
    "Someone will CC the entire floor for a question with two answers.",
    "The out-of-office auto reply will be more helpful than the human.",
    "You will archive hope. New mail will find you anyway.",
  ],
  career: [
    "The promotion is near, like the horizon, or the next reorg slide.",
    "Your skills will shine the day after the big presentation.",
    "A recruiter will appear in your notifications like a polite ghost.",
    "The title change will be real in email and imaginary in budget.",
    "You will update your resume mentally during a very long meeting.",
    "Opportunity knocks softly. It sounds like someone needing coverage.",
    "Your best work will live in a doc nobody opened.",
    "Growth is coming. It may be vertical, lateral, or purely spiritual.",
  ],
  "weekend and vacation": [
    "The weekend will arrive. Your brain will still be in standup.",
    "Vacation photos will load slower than your return inbox.",
    "You will check email on the beach. The oracle sees you.",
    "PTO will be approved after you already bought the tickets.",
    "Sunday night will feel like a prequel to Monday.",
    "Rest will come in five-minute increments between notifications.",
    "The out-of-office message will be poetry nobody reads.",
    "You will return refreshed and mildly haunted by Slack.",
  ],
  "monday and friday": [
    "Monday will start before you finish your first coffee.",
    "Friday will tease you at noon and flee at four.",
    "Monday's calendar is a horror anthology with color coding.",
    "Friday's meeting will be canceled after you already prepared.",
    "The week will peak on Wednesday and lie about it.",
    "Monday motivation will last until the first reply all.",
    "Friday will arrive, but the backlog comes with it.",
    "You will feel Monday on a Thursday. This is normal here.",
  ],
  "luck and yes or no questions": [
    "The answer is yes, but only if you lower your expectations.",
    "The answer is no, delivered with a smile you cannot trust.",
    "Fortune favors the prepared slide deck and the spare charger.",
    "Luck is on your side, hiding behind the copier.",
    "Signs point to maybe, which is how committees are born.",
    "The spirits vote yes. The budget votes present.",
    "Your fate is fifty-fifty, like a coin stuck in the vending machine.",
    "Yes, but not until everyone has had a chance to overthink it.",
  ],
  "halloween and ghosts": [
    "The ghosts of abandoned projects walk the hallway at dusk.",
    "Your costume will be recognized by three people and the printer.",
    "Candy in the kitchen will disappear without a meeting about it.",
    "A spooky email will be someone forwarding a meme from 2019.",
    "The office skeleton is decorative. The project skeleton is real.",
    "Bats are unlikely. Dramatic lighting is guaranteed.",
    "You will hear a creak. It is either the floor or responsibility.",
    "All Hallows Eve favors those who label their food in the fridge.",
  ],
  generic: [
    "The cubicle walls have heard your question. They are not impressed.",
    "A minor miracle will occur near the supply closet.",
    "Paperclips will gather in numbers that feel intentional.",
    "The elevator will stop on every floor except yours, briefly.",
    "Someone will say let's take this offline and never will.",
    "Your pen will vanish. It lives with the other pens now.",
    "The plant on your desk knows more than it admits.",
    "Staplers will jam in symbolic alignment with your week.",
    "A chair will squeak during the quietest moment of the day.",
    "The clock will lie. Trust the coffee machine instead.",
    "You will find a sticky note with no context and great power.",
    "The hallway will smell like ambition and old carpet.",
    "Your badge will fail once, then work, to teach humility.",
    "A fire drill will be practice. Your panic will be authentic.",
    "The water cooler rumor will be wrong but entertaining.",
    "Fluorescent lights will flicker like a passive-aggressive omen.",
    "You will discover a meeting room booked by someone named TBD.",
    "The oracle sees a sticky keyboard and a clean conscience, rarely together.",
    "Destiny waits by the copier. Bring your own paper.",
    "Tomorrow will rhyme with today, uncomfortably.",
    "The spirits advise patience, sarcasm, and a backup charger.",
    "Something minor will go wrong in a way you will retell for years.",
  ],
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = Oracle;
} else {
  window.Oracle = Oracle;
}
