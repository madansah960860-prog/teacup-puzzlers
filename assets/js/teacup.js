/* Teacup Puzzlers — gentle games. Word ladders, anagrams, missing letters, a daily
   tea-break mix, and decade trivia. All original, all keyboard friendly. Each piece
   runs only if its container is on the page. */
(function () {
  "use strict";

  /* ---------- tabs (accessible) ---------- */
  document.querySelectorAll(".tabs").forEach(function (tabs) {
    var btns = Array.prototype.slice.call(tabs.querySelectorAll(".tab"));
    var panels = btns.map(function (b) { return document.getElementById(b.getAttribute("aria-controls")); });
    function select(i) {
      btns.forEach(function (b, k) {
        b.setAttribute("aria-selected", k === i ? "true" : "false");
        b.tabIndex = k === i ? 0 : -1;
        if (panels[k]) panels[k].hidden = k !== i;
      });
    }
    btns.forEach(function (b, i) {
      b.addEventListener("click", function () { select(i); });
      b.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          var ni = (i + (e.key === "ArrowRight" ? 1 : btns.length - 1)) % btns.length;
          btns[ni].focus(); select(ni); e.preventDefault();
        }
      });
    });
    select(0);
  });

  function up(s) { return (s || "").toUpperCase().replace(/[^A-Z]/g, ""); }

  /* ---------- word ladders (fill the missing rungs) ---------- */
  var LADDERS = [
    { title: "From COLD to WARM", rungs: ["COLD", "CORD", "WORD", "WARD", "WARM"],
      clues: { 1: "A length of thin rope or an electrical flex", 2: "A single unit of language", 3: "A hospital room, or a child in someone's care" } },
    { title: "From CAT to DOG", rungs: ["CAT", "COT", "DOT", "DOG"],
      clues: { 1: "A small bed for a baby", 2: "A small round mark, like the one over an i" } },
    { title: "From HEAD to TAIL", rungs: ["HEAD", "HEAL", "TEAL", "TELL", "TALL", "TAIL"],
      clues: { 1: "To make or become well again", 2: "A blue-green color, or a small duck", 3: "To share a story or some news", 4: "Of great height" } }
  ];
  var ladderHost = document.getElementById("ladder");
  if (ladderHost) {
    var lh = "";
    LADDERS.forEach(function (L, li) {
      lh += '<div class="game" data-ladder="' + li + '"><h3>' + L.title + '</h3>';
      L.rungs.forEach(function (word, i) {
        if (i === 0 || i === L.rungs.length - 1) {
          lh += '<div class="game__row"><span class="rung">' + word + '</span></div>';
        } else {
          lh += '<div class="game__row"><input type="text" maxlength="' + word.length + '" data-ans="' + word + '" aria-label="Rung ' + i + '"> <span class="ladder-clue">' + L.clues[i] + '</span></div>';
        }
      });
      lh += '<div class="toolbar"><button type="button" class="btn" data-lcheck="' + li + '">Check</button><button type="button" class="btn btn--ghost" data-lreveal="' + li + '">Reveal</button></div><p class="msg" data-lmsg="' + li + '" role="status"></p></div>';
    });
    ladderHost.innerHTML = lh;
    ladderHost.addEventListener("click", function (e) {
      var cb = e.target.closest("[data-lcheck]"), rb = e.target.closest("[data-lreveal]");
      if (cb) {
        var box = cb.closest("[data-ladder]"), ins = box.querySelectorAll("input"), all = true;
        ins.forEach(function (inp) {
          var ok = up(inp.value) === inp.getAttribute("data-ans");
          inp.classList.toggle("ok", ok); inp.classList.toggle("no", !ok && inp.value.length > 0);
          if (!ok) all = false;
        });
        box.querySelector("[data-lmsg]").textContent = all ? "Lovely — the ladder is complete!" : "Not quite. Each rung changes just one letter from the one above.";
      }
      if (rb) {
        var box2 = rb.closest("[data-ladder]");
        box2.querySelectorAll("input").forEach(function (inp) { inp.value = inp.getAttribute("data-ans"); inp.classList.add("ok"); inp.classList.remove("no"); });
        box2.querySelector("[data-lmsg]").textContent = "Here is the finished ladder.";
      }
    });
  }

  /* ---------- anagrams ---------- */
  var ANAGRAMS = [
    { w: "TEAPOT", h: "You pour from it" }, { w: "BISCUIT", h: "A sweet treat with tea" },
    { w: "KETTLE", h: "It whistles when it boils" }, { w: "SAUCER", h: "A small plate beneath a cup" },
    { w: "HONEY", h: "Made by busy bees" }, { w: "LEMON", h: "A yellow citrus slice" },
    { w: "SPOON", h: "You stir with it" }, { w: "SCONE", h: "Served with jam and cream" },
    { w: "SUGAR", h: "A sweet spoonful" }, { w: "COASTER", h: "It keeps rings off the table" }
  ];
  function scramble(word) {
    var a = word.split(""), seed = 0, i;
    for (i = 0; i < word.length; i++) seed += word.charCodeAt(i) * (i + 1);
    for (i = a.length - 1; i > 0; i--) { seed = (seed * 1103515245 + 12345) & 0x7fffffff; var j = seed % (i + 1); var t = a[i]; a[i] = a[j]; a[j] = t; }
    var s = a.join("");
    return s === word ? word.split("").reverse().join("") : s;
  }
  function anagramBlock(list, hostId) {
    var host = document.getElementById(hostId); if (!host) return;
    var h = "";
    list.forEach(function (item, i) {
      h += '<div class="game" data-ana="' + i + '"><p class="scramble">' + scramble(item.w) + '</p>' +
        '<p class="ladder-clue">Hint: ' + item.h + ' (' + item.w.length + ' letters)</p>' +
        '<div class="game__row"><input type="text" data-ans="' + item.w + '" aria-label="Your answer"> ' +
        '<button type="button" class="btn" data-acheck="' + i + '">Check</button>' +
        '<button type="button" class="btn btn--ghost" data-areveal="' + i + '">Reveal</button></div>' +
        '<p class="msg" data-amsg="' + i + '" role="status"></p></div>';
    });
    host.innerHTML = h;
    host.addEventListener("click", function (e) {
      var cb = e.target.closest("[data-acheck]"), rb = e.target.closest("[data-areveal]");
      if (cb) { var box = cb.closest("[data-ana]"), inp = box.querySelector("input"), ok = up(inp.value) === inp.getAttribute("data-ans");
        inp.classList.toggle("ok", ok); inp.classList.toggle("no", !ok);
        box.querySelector("[data-amsg]").textContent = ok ? "That's it — well solved!" : "Not yet. Rearrange the letters and try again."; }
      if (rb) { var box2 = rb.closest("[data-ana]"), inp2 = box2.querySelector("input"); inp2.value = inp2.getAttribute("data-ans"); inp2.classList.add("ok"); inp2.classList.remove("no");
        box2.querySelector("[data-amsg]").textContent = "The answer is " + inp2.getAttribute("data-ans") + "."; }
    });
  }
  anagramBlock(ANAGRAMS, "anagram");

  /* ---------- missing letters ---------- */
  var MISSING = [
    { pat: "GA_DEN", ans: "R", full: "GARDEN", h: "Where flowers and vegetables grow" },
    { pat: "WI_DOW", ans: "N", full: "WINDOW", h: "You look out through it" },
    { pat: "KIT_HEN", ans: "C", full: "KITCHEN", h: "Where meals are cooked" },
    { pat: "UM_RELLA", ans: "B", full: "UMBRELLA", h: "It keeps the rain off" },
    { pat: "BL_NKET", ans: "A", full: "BLANKET", h: "It keeps you warm in bed" },
    { pat: "TEA_OT", ans: "P", full: "TEAPOT", h: "You brew tea in it" }
  ];
  var missHost = document.getElementById("missing");
  if (missHost) {
    var mh = "";
    MISSING.forEach(function (m, i) {
      mh += '<div class="game" data-miss="' + i + '"><p class="scramble">' + m.pat.replace("_", "–") + '</p>' +
        '<p class="ladder-clue">Hint: ' + m.h + '</p>' +
        '<div class="game__row"><span class="game__label">Missing letter:</span><input type="text" maxlength="1" data-ans="' + m.ans + '" aria-label="Missing letter"> ' +
        '<button type="button" class="btn" data-mcheck="' + i + '">Check</button>' +
        '<button type="button" class="btn btn--ghost" data-mreveal="' + i + '">Reveal</button></div>' +
        '<p class="msg" data-mmsg="' + i + '" role="status"></p></div>';
    });
    missHost.innerHTML = mh;
    missHost.addEventListener("click", function (e) {
      var cb = e.target.closest("[data-mcheck]"), rb = e.target.closest("[data-mreveal]");
      if (cb) { var box = cb.closest("[data-miss]"), inp = box.querySelector("input"), m = MISSING[+box.getAttribute("data-miss")], ok = up(inp.value) === m.ans;
        inp.classList.toggle("ok", ok); inp.classList.toggle("no", !ok);
        box.querySelector("[data-mmsg]").textContent = ok ? "Yes — the word is " + m.full + "." : "Not quite — try another letter."; }
      if (rb) { var box2 = rb.closest("[data-miss]"), m2 = MISSING[+box2.getAttribute("data-miss")]; box2.querySelector("input").value = m2.ans; box2.querySelector("input").classList.add("ok");
        box2.querySelector("[data-mmsg]").textContent = "The word is " + m2.full + "."; }
    });
  }

  /* ---------- today's tea break (daily mix) ---------- */
  var todayHost = document.getElementById("today");
  if (todayHost) {
    var d = new Date(), seed = d.getFullYear() * 366 + d.getMonth() * 31 + d.getDate();
    var aIdx = seed % ANAGRAMS.length, mIdx = (seed * 7) % MISSING.length;
    todayHost.innerHTML =
      "<h3>Today's anagram</h3><div id=\"anagram\"></div>" +
      "<h3>Today's missing letter</h3><div id=\"missing\"></div>";
    anagramBlock([ANAGRAMS[aIdx]], "anagram");
    // reuse missing block for one item
    var one = MISSING[mIdx], mhost = document.getElementById("missing");
    mhost.innerHTML = '<div class="game" data-miss="0"><p class="scramble">' + one.pat.replace("_", "–") + '</p>' +
      '<p class="ladder-clue">Hint: ' + one.h + '</p>' +
      '<div class="game__row"><span class="game__label">Missing letter:</span><input type="text" maxlength="1" data-ans="' + one.ans + '" aria-label="Missing letter"> ' +
      '<button type="button" class="btn" data-mcheck="0">Check</button><button type="button" class="btn btn--ghost" data-mreveal="0">Reveal</button></div>' +
      '<p class="msg" data-mmsg="0" role="status"></p></div>';
    mhost.addEventListener("click", function (e) {
      var cb = e.target.closest("[data-mcheck]"), rb = e.target.closest("[data-mreveal]"), inp = mhost.querySelector("input");
      if (cb) { var ok = up(inp.value) === one.ans; inp.classList.toggle("ok", ok); inp.classList.toggle("no", !ok);
        mhost.querySelector("[data-mmsg]").textContent = ok ? "Yes — the word is " + one.full + "." : "Not quite — try another letter."; }
      if (rb) { inp.value = one.ans; inp.classList.add("ok"); mhost.querySelector("[data-mmsg]").textContent = "The word is " + one.full + "."; }
    });
  }

  /* ---------- decade trivia ---------- */
  var DECADES = {
    "1950s": [
      { q: "Jonas Salk's vaccine, announced effective in 1955, prevented which disease?", o: ["Measles", "Polio", "Influenza", "Smallpox"], a: 1 },
      { q: "Which famous theme park opened in California in 1955?", o: ["Disneyland", "Knott's Berry Farm", "Six Flags", "Cedar Point"], a: 0 },
      { q: "Ray Kroc began franchising which hamburger chain in 1955?", o: ["Burger King", "Wendy's", "McDonald's", "White Castle"], a: 2 },
      { q: "A spinning toy you twirl around your waist became a craze in the late 1950s. What was it?", o: ["The yo-yo", "The hula hoop", "The frisbee", "The pogo stick"], a: 1 },
      { q: "Mattel introduced which famous fashion doll in 1959?", o: ["Raggedy Ann", "Barbie", "Chatty Cathy", "Betsy Wetsy"], a: 1 }
    ],
    "1960s": [
      { q: "In July 1969, Apollo 11 astronauts became the first people to walk where?", o: ["The South Pole", "The Moon", "Mount Everest", "The ocean floor"], a: 1 },
      { q: "The U.S. Postal Service introduced what five-digit system in 1963?", o: ["Area codes", "ZIP codes", "Bar codes", "Serial numbers"], a: 1 },
      { q: "The first Super Bowl was played in which year?", o: ["1960", "1963", "1967", "1970"], a: 2 },
      { q: "Which landmark civil rights law was signed in 1964?", o: ["The Civil Rights Act", "The Homestead Act", "The GI Bill", "The Social Security Act"], a: 0 },
      { q: "A popular portable music format introduced in the 1960s was the what?", o: ["Compact disc", "Audio cassette tape", "MP3 player", "Eight-track's successor"], a: 1 }
    ],
    "1970s": [
      { q: "Which technology company was founded in 1976?", o: ["Microsoft", "Apple", "Google", "Dell"], a: 1 },
      { q: "In 1976 the United States celebrated a milestone anniversary of its founding. Which one?", o: ["Centennial (100)", "Sesquicentennial (150)", "Bicentennial (200)", "Tricentennial (300)"], a: 2 },
      { q: "An early, wildly popular home video game of the 1970s simulated what sport?", o: ["Table tennis (Pong)", "Bowling", "Golf", "Boxing"], a: 0 },
      { q: "Which home video format for recording and watching movies arrived in the 1970s?", o: ["DVD", "VHS", "Blu-ray", "Streaming"], a: 1 },
      { q: "Handheld electronic devices for doing sums became affordable in the 1970s. What were they?", o: ["Pagers", "Pocket calculators", "Cell phones", "Laptops"], a: 1 }
    ],
    "1980s": [
      { q: "A colorful twisting puzzle cube became a worldwide craze in the early 1980s. What is it called?", o: ["The Rubik's Cube", "The Slinky", "The Etch A Sketch", "The Simon game"], a: 0 },
      { q: "NASA launched the first reusable space shuttle, Columbia, in which year?", o: ["1979", "1981", "1984", "1986"], a: 1 },
      { q: "Which shiny digital format for music arrived in the early 1980s?", o: ["The vinyl record", "The compact disc (CD)", "The cassette", "The MiniDisc"], a: 1 },
      { q: "A cable channel devoted to music launched in 1981. What were its call letters?", o: ["ESPN", "CNN", "MTV", "HBO"], a: 2 },
      { q: "Which device, once the size of a brick and very expensive, first appeared for consumers in the 1980s?", o: ["The mobile phone", "The microwave", "The transistor radio", "The answering machine"], a: 0 }
    ]
  };
  var decHost = document.getElementById("decades");
  if (decHost) {
    var keys = Object.keys(DECADES);
    var th = '<div class="tabs"><div class="tablist" role="tablist" aria-label="Choose a decade">';
    keys.forEach(function (k, i) { th += '<button type="button" class="tab" role="tab" id="dtab-' + i + '" aria-controls="dpanel-' + i + '" aria-selected="' + (i === 0) + '">The ' + k + '</button>'; });
    th += '</div>';
    keys.forEach(function (k, i) {
      th += '<div class="tabpanel" id="dpanel-' + i + '" role="tabpanel" aria-labelledby="dtab-' + i + '"' + (i === 0 ? "" : " hidden") + '><div id="dquiz-' + i + '"></div></div>';
    });
    th += "</div>";
    decHost.innerHTML = th;
    keys.forEach(function (k, i) { renderQuiz(DECADES[k], document.getElementById("dquiz-" + i), "d" + i); });
    // re-run tab wiring for this freshly built .tabs
    wireTabs(decHost.querySelector(".tabs"));
  }

  function wireTabs(tabs) {
    if (!tabs) return;
    var btns = Array.prototype.slice.call(tabs.querySelectorAll(".tab"));
    var panels = btns.map(function (b) { return document.getElementById(b.getAttribute("aria-controls")); });
    function select(i) { btns.forEach(function (b, k) { b.setAttribute("aria-selected", k === i ? "true" : "false"); b.tabIndex = k === i ? 0 : -1; if (panels[k]) panels[k].hidden = k !== i; }); }
    btns.forEach(function (b, i) { b.addEventListener("click", function () { select(i); }); });
    select(0);
  }

  function renderQuiz(list, host, tag) {
    if (!host) return;
    var score = 0;
    host.innerHTML = list.map(function (item, qi) {
      return '<div class="quiz" data-q="' + qi + '"><p class="quiz__q">' + (qi + 1) + ". " + item.q + '</p><ul class="quiz__opts">' +
        item.o.map(function (opt, oi) { return '<li><button type="button" class="quiz__opt" data-o="' + oi + '">' + opt + "</button></li>"; }).join("") +
        "</ul></div>";
    }).join("") + '<p class="quiz__bar" id="' + tag + '-score" role="status">Score: 0 of ' + list.length + "</p>";
    host.addEventListener("click", function (e) {
      var b = e.target.closest(".quiz__opt"); if (!b) return;
      var box = b.closest(".quiz"); if (box.getAttribute("data-done")) return;
      box.setAttribute("data-done", "1");
      var qi = +box.getAttribute("data-q"), oi = +b.getAttribute("data-o"), correct = list[qi].a;
      box.querySelectorAll(".quiz__opt").forEach(function (btn) { var o = +btn.getAttribute("data-o"); btn.disabled = true; if (o === correct) btn.classList.add("right"); else if (o === oi) btn.classList.add("wrong"); });
      if (oi === correct) score++;
      document.getElementById(tag + "-score").textContent = "Score: " + score + " of " + list.length;
    });
  }
})();
