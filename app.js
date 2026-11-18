(() => {
  const storageKey = "campus-stores.shift.v2";
  const root = document.getElementById("campus-stores");
  const q = (selector) => root.querySelector(selector);
  const requests = [
    {
      id: "RQ-214",
      club: "Film Society",
      event: "Courtyard screening",
      owner: "Isha Rao",
      due: "Fri 8 pm",
      items: ["HDMI projector", "Portable speaker", "USB-C → HDMI adapter"],
      note: "Playback is from a USB-C-only laptop. The host will collect at 4 pm.",
    },
    {
      id: "RQ-209",
      club: "Debate Union",
      event: "Finals rehearsal",
      owner: "Tara Shah",
      due: "Sat 10 am",
      items: ["Wireless microphone"],
      note: "Rehearsal runs into the evening.",
    },
    {
      id: "RQ-217",
      club: "Photo Circle",
      event: "Street portrait walk",
      owner: "Dev Menon",
      due: "Sat noon",
      items: ["Digital camera"],
      note: "Collection on Saturday morning.",
    },
  ];
  const assets = [
    { id: "PR-04", type: "HDMI projector", model: "BenQ MH550", bin: "A2" },
    {
      id: "PR-06",
      type: "HDMI projector",
      model: "Epson EB-X49",
      bin: "Workshop",
      repair: true,
    },
    { id: "SP-02", type: "Portable speaker", model: "JBL Eon One", bin: "B1" },
    { id: "SP-05", type: "Portable speaker", model: "Bose S1", bin: "B2" },
    {
      id: "AD-12",
      type: "USB-C → HDMI adapter",
      model: "Belkin AVC002",
      bin: "C4",
    },
    {
      id: "AD-15",
      type: "USB-C → HDMI adapter",
      model: "Anker A8312",
      bin: "C4",
    },
    { id: "MI-09", type: "Wireless microphone", model: "Shure BLX", bin: "B3" },
    { id: "CA-03", type: "Digital camera", model: "Sony A6400", bin: "D2" },
  ];
  const people = [
    "Isha Rao",
    "Kabir Sen",
    "Leela Das",
    "Tara Shah",
    "Dev Menon",
  ];
  const shifts = [
    {
      time: "Friday · 3:45 pm",
      title: "Pickup at the counter",
      text: "Kabir is here for the Film Society screening. The film starts at four. Can he leave with everything he needs?",
      next: "Move to return time",
    },
    {
      time: "Friday · 7:30 pm",
      title: "The kit comes back in pieces",
      text: "Kabir has brought back the projector and speaker. “Leela still has the adapter. She’ll drop it off tomorrow at nine.” Take the return and hand over to the morning shift.",
      next: "Move to next morning",
    },
    {
      time: "Saturday · 9:00 am",
      title: "Morning shift",
      text: "You’ve just taken over. Leela walks in with an adapter. Work out what was outstanding from the screening and close the loan for the right item.",
    },
  ];
  const pages = [
    ["Requests", "clipboard-list"],
    ["Inventory", "package"],
    ["Loan register", "book-open"],
    ["Desk book", "messages-square"],
  ];
  // Desk clock and due times in minutes from Friday midnight, so the register can flag overdue slips.
  const clockAt = [945, 1170, 1980];
  const dueAt = {
    "Fri 8 pm": 1200,
    "Sat 9 am": 1980,
    "Sat 10 am": 2040,
    "Sat noon": 2160,
  };
  const dueTimes = Object.keys(dueAt);
  const original = () => ({
    version: 2,
    check: "",
    followup: "",
    tab: "Requests",
    phase: 0,
    selected: "",
    filter: "All items",
    loans: [
      {
        num: 401,
        req: "RQ-209",
        asset: "MI-09",
        who: "Tara Shah",
        due: "Sat 10 am",
        back: false,
      },
    ],
    notes: [],
    editing: false,
    onlyOpen: true,
    notice: "Sample shift · All records are fictional.",
  });
  let s = original();
  const getAsset = (id) => assets.find((x) => x.id === id);
  const getReq = (id) => requests.find((x) => x.id === id);
  const out = (id) => s.loans.find((l) => l.asset === id && !l.back);
  const late = (l) => !l.back && dueAt[l.due] < clockAt[s.phase];
  const openFor = (req) => s.loans.filter((l) => l.req === req && !l.back);
  // Accept the label as staff would type it: "ad12", "AD 12", "ad-12".
  const findUnit = (label) => {
    const k = String(label).toUpperCase().replace(/[^A-Z0-9]/g, "");
    return assets.find((a) => a.id.replace(/[^A-Z0-9]/g, "") === k);
  };
  const unitLine = (a) => a.type + " · " + a.model + " · bin " + a.bin;
  const esc = (x) =>
    String(x).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const opts = (list) =>
    list
      .map(([v, t]) => '<option value="' + esc(v) + '">' + esc(t) + "</option>")
      .join("");
  const btn = (label, act, val = "", style = "") =>
    '<button type="button" data-action="' +
    act +
    '" data-val="' +
    esc(val) +
    '" class="' +
    style +
    '">' +
    esc(label) +
    "</button>";
  const head = (title, sub, control = "") =>
    '<div class="sectionhead"><div><h2>' +
    title +
    "</h2><small>" +
    sub +
    "</small></div>" +
    control +
    "</div>";
  const row = (label, sub, right) =>
    '<div class="row"><div><strong>' +
    esc(label) +
    "</strong><small>" +
    esc(sub) +
    "</small></div><div>" +
    right +
    "</div></div>";
  const badge = (t, good = false) =>
    '<span class="tag' + (good ? " good" : "") + '">' + esc(t) + "</span>";
  function requestPage() {
    let html = head(
      "Approved requests",
      "Student Activities Office · 3 approved forms",
    );
    if (s.selected) {
      const r = getReq(s.selected);
      html +=
        btn("Back to list", "close") +
        '<div class="record"><small>' +
        r.id +
        " · Approved</small><h3>" +
        r.event +
        "</h3><p>" +
        r.club +
        " · Filed by " +
        r.owner +
        "</p><p><b>Return by</b> " +
        r.due +
        "</p><p><b>Approved equipment</b></p><ul>" +
        r.items.map((x) => "<li>" + x + "</li>").join("") +
        "</ul><p>" +
        r.note +
        "</p></div>";
    } else
      html += requests
        .map((r) =>
          row(
            r.event,
            r.id + " · " + r.club,
            btn("View form", "request", r.id),
          ),
        )
        .join("");
    return html;
  }
  function inventory() {
    let html = head(
      "Inventory",
      "Physical units · home shelf and current availability",
    );
    html +=
      '<div class="buttons"><label>Show <select data-filter>' +
      opts(
        ["All items", "On shelf", "On loan", "In repair"].map((f) => [f, f]),
      ) +
      "</select></label></div>";
    for (const a of assets) {
      const status = a.repair
        ? "In repair"
        : out(a.id)
          ? "On loan"
          : "On shelf";
      if (s.filter !== "All items" && s.filter !== status) continue;
      html += row(
        a.id + " · " + a.type,
        a.model + " · " + a.bin,
        badge(status, status === "On shelf"),
      );
    }
    return html;
  }
  function register() {
    let html = head(
      "Loan register",
      "One slip per physical unit",
      s.editing
        ? btn("Cancel", "cancel")
        : btn("New issue slip", "new", "", "primary"),
    );
    if (s.editing) {
      const available = assets.filter((a) => !a.repair && !out(a.id));
      const select = (label, key, options) =>
        "<label><span>" +
        label +
        '</span><select name="' +
        key +
        '" required><option value="">Select…</option>' +
        opts(options) +
        "</select></label>";
      return (
        html +
        '<form data-issue><div class="form">' +
        select(
          "Approved request",
          "req",
          requests.map((r) => [r.id, r.id + " · " + r.club]),
        ) +
        select(
          "Unit leaving the desk",
          "asset",
          available.map((a) => [a.id, a.id + " · " + unitLine(a)]),
        ) +
        select(
          "Collected by",
          "who",
          people.map((p) => [p, p]),
        ) +
        select(
          "Return by",
          "due",
          dueTimes.map((d) => [d, d]),
        ) +
        '</div><button type="submit" class="primary">Save issue slip</button></form>'
      );
    }
    html += checkin();
    html +=
      '<div class="buttons">' +
      ["Outstanding", "All slips"]
        .map(
          (v, i) =>
            '<button type="button" data-action="scope" data-val="' +
            i +
            '" aria-pressed="' +
            (s.onlyOpen === (i === 0)) +
            '">' +
            v +
            "</button>",
        )
        .join("") +
      "</div>";
    const shown = s.loans
      .filter((l) => !s.onlyOpen || !l.back)
      .slice()
      .reverse();
    if (!shown.length) html += "<p>No outstanding slips.</p>";
    for (const l of shown) {
      const a = getAsset(l.asset),
        r = getReq(l.req);
      const holder = l.with
        ? "With " + l.with + (l.expected ? ", expected " + l.expected : "")
        : "";
      html +=
        '<div class="row"><div><strong>' +
        esc("L-" + l.num + " · " + l.asset + " · " + a.type) +
        "</strong><small>" +
        esc(a.model + " · bin " + a.bin + " · " + l.req + " " + r.club) +
        "</small><small>" +
        esc("Issued to " + l.who + " · Due " + l.due) +
        "</small>" +
        (holder && !l.back
          ? '<small class="holder">' + esc(holder) + "</small>"
          : "") +
        "</div><div>" +
        (l.back
          ? badge("Returned" + (l.returnedBy ? " by " + l.returnedBy : ""))
          : late(l)
            ? '<span class="tag late">Overdue</span>'
            : badge("Out")) +
        "</div></div>";
    }
    return html;
  }
  // Returns start from the unit in the staff member's hand, not from a slip.
  function checkin() {
    let html =
      '<form data-checkin class="checkin"><label><span>Check in a returned item</span><small>Read the label on the unit in your hand.</small><input name="label" autocomplete="off" spellcheck="false" placeholder="e.g. AD-12" value="' +
      esc(s.check) +
      '" required /></label><button type="submit" class="primary">Find slip</button></form>';
    if (s.followup) {
      const left = openFor(s.followup);
      const r = getReq(s.followup);
      if (left.length)
        html +=
          '<form data-followup class="card"><b>' +
          esc(r.id + " " + r.club + " is not complete.") +
          "</b><p>" +
          esc(
            "Still out: " +
              left.map((l) => l.asset + " (" + getAsset(l.asset).type + ")").join(", ") +
              ". Who has it now, and when will it come back? This goes on the slip for the next shift.",
          ) +
          '</p><div class="form"><label><span>Now with</span><select name="with" required><option value="">Select…</option>' +
          opts(people.map((p) => [p, p])) +
          '</select></label><label><span>Expected back</span><select name="expected" required><option value="">Select…</option>' +
          opts(dueTimes.map((d) => [d, d])) +
          '</select></label></div><button type="submit">Save on slip</button> ' +
          btn("Skip", "skip") +
          "</form>";
    }
    if (!s.check) return html;
    const unit = findUnit(s.check);
    if (!unit)
      return (
        html +
        '<div class="card warn" role="alert"><b>No unit is labelled “' +
        esc(s.check) +
        "”.</b><p>Check the label again. Nothing has been closed.</p></div>"
      );
    const l = out(unit.id);
    if (l) {
      const r = getReq(l.req);
      return (
        html +
        '<form data-close class="card ok"><b>' +
        esc(unit.id + " matches open slip L-" + l.num + ".") +
        "</b><ul><li>" +
        esc(unitLine(unit)) +
        "</li><li>" +
        esc(r.id + " · " + r.club + " · " + r.event) +
        "</li><li>" +
        esc("Issued to " + l.who + " · Due " + l.due + (late(l) ? " · Overdue" : "")) +
        "</li>" +
        (l.with
          ? "<li>" + esc("Handover: with " + l.with + (l.expected ? ", expected " + l.expected : "")) + "</li>"
          : "") +
        '</ul><input type="hidden" name="num" value="' +
        l.num +
        '" /><div class="form"><label><span>Returned by</span><select name="by" required>' +
        opts(people.map((p) => [p, p])) +
        '</select></label></div><button type="submit" class="primary">' +
        esc("Close L-" + l.num + " · shelve in " + unit.bin) +
        "</button></form>"
      );
    }
    const same = s.loans.filter(
      (x) => !x.back && getAsset(x.asset).type === unit.type,
    );
    let msg = unit.repair
      ? unit.id + " is booked into repair (" + unit.bin + "), not on loan."
      : unit.id + " (" + unit.model + ") is not on loan. The register has it on the shelf in bin " + unit.bin + ".";
    let advice = "Nothing has been closed.";
    if (same.length && !unit.repair) {
      const x = same[0],
        xa = getAsset(x.asset);
      msg +=
        " The open " + unit.type + " slip is L-" + x.num + " for " + xa.id + " (" + xa.model + ", bin " + xa.bin + "), " + x.req + (x.with ? ", with " + x.with : "") + ".";
      advice =
        "Don’t close L-" + x.num + " with this unit. Check bin " + xa.bin + " for the " + xa.model + ": if it’s there, the wrong unit left at pickup and the slips need correcting; if not, " + xa.id + " is still missing. Nothing has been closed.";
    }
    return (
      html +
      '<div class="card warn" role="alert"><b>Wrong unit for this return.</b><p>' +
      esc(msg) +
      "</p><p>" +
      esc(advice) +
      "</p></div>"
    );
  }
  function deskbook() {
    let html = head(
      "Desk book",
      "Messages from clubs and notes for the next shift",
    );
    const entries = [
      [
        "Friday · 3:20 pm",
        "Isha Rao · Film Society",
        "Kabir Sen is picking up our whole screening kit. Please issue it in his name. I’m setting up in the courtyard.",
      ],
      [
        "Friday · 3:30 pm",
        "Tara Shah · Debate Union",
        "Our microphone stays with me overnight. I’ll return it by 10 am Saturday.",
      ],
    ];
    if (s.phase >= 1)
      entries.push([
        "Friday · 7:30 pm",
        "Kabir Sen · Film Society",
        "I brought the projector and speaker. Leela Das has our adapter. She’ll be at the counter at 9 am tomorrow.",
      ]);
    for (const n of s.notes)
      entries.push([shifts[n.phase].time, "Counter handover", n.text]);
    for (const [t, author, body] of entries.slice().reverse())
      html +=
        '<article class="record"><small>' +
        esc(t) +
        "</small><h3>" +
        esc(author) +
        "</h3><p>" +
        esc(body) +
        "</p></article>";
    return (
      html +
      '<form data-note><div class="form"><label class="full"><span>Note for the next shift</span><textarea name="note" rows="2" maxlength="400" required></textarea></label></div><button type="submit">Add handover note</button></form>'
    );
  }
  const screens = {
    Requests: requestPage,
    Inventory: inventory,
    "Loan register": register,
    "Desk book": deskbook,
  };
  function paint() {
    const phase = shifts[s.phase];
    q("[data-clock]").textContent = phase.time;
    q("[data-shift-title]").textContent = phase.title;
    q("[data-shift]").textContent = phase.text;
    const advance = q('[data-action="advance"]');
    advance.hidden = !phase.next;
    advance.textContent = phase.next || "";
    q("[data-nav]").innerHTML = pages
      .map(
        ([n, icon]) =>
          '<button type="button" data-action="tab" data-val="' +
          n +
          '" aria-pressed="' +
          (s.tab === n) +
          '"><svg aria-hidden="true" class="store-icon"><use href="#icon-' +
          icon +
          '"></use></svg>' +
          n +
          "</button>",
      )
      .join("");
    q("[data-page]").innerHTML = screens[s.tab]();
    if (q("[data-filter]")) q("[data-filter]").value = s.filter;
    const closing = q("[data-close]");
    if (closing) {
      const l = s.loans.find((x) => x.num === Number(closing.num.value));
      closing.by.value = l.with || l.who;
    }
    q("[data-status]").textContent = s.notice;
  }
  function commit(msg) {
    if (msg) s.notice = msg;
    paint();
    try {
      localStorage.setItem(storageKey, JSON.stringify(s));
    } catch {
      q("[data-status]").textContent +=
        " Browser storage is unavailable. Progress lasts for this visit.";
    }
  }
  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-action]");
    if (!b) return;
    const v = b.dataset.val;
    switch (b.dataset.action) {
      case "restart":
        s = original();
        break;
      case "advance":
        if (s.phase < 2) s.phase++;
        s.notice = "Shift time updated.";
        break;
      case "tab":
        s.tab = v;
        s.editing = false;
        break;
      case "close":
        s.selected = "";
        break;
      case "request":
        s.selected = v;
        break;
      case "new":
        s.editing = true;
        break;
      case "cancel":
        s.editing = false;
        break;
      case "scope":
        s.onlyOpen = v === "0";
        break;
      case "skip":
        s.followup = "";
        break;
    }
    commit();
  });
  root.addEventListener("change", (e) => {
    if (e.target.matches("[data-filter]")) {
      s.filter = e.target.value;
      commit();
    }
  });
  root.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    const form = new FormData(f);
    if (f.matches("[data-note]")) {
      const text = String(form.get("note")).trim();
      if (!text) return;
      s.notes.push({ phase: s.phase, text });
      commit("Handover note saved.");
      return;
    }
    if (f.matches("[data-checkin]")) {
      s.check = String(form.get("label")).trim();
      commit();
      q('[name="label"]')?.focus();
      return;
    }
    if (f.matches("[data-close]")) {
      const l = s.loans.find((x) => x.num === Number(form.get("num")));
      const by = String(form.get("by"));
      if (!l || l.back || !people.includes(by)) return;
      l.back = true;
      l.returnedBy = by;
      s.check = "";
      s.followup = openFor(l.req).length ? l.req : "";
      commit(
        l.asset + " checked in from " + by + ". Slip L-" + l.num + " closed; shelve in " + getAsset(l.asset).bin + ".",
      );
      return;
    }
    if (f.matches("[data-followup]")) {
      const who = String(form.get("with")),
        exp = String(form.get("expected"));
      if (!people.includes(who) || !dueAt[exp]) return;
      const left = openFor(s.followup);
      for (const l of left) Object.assign(l, { with: who, expected: exp });
      s.followup = "";
      commit(
        "Handover saved on " + left.map((l) => "L-" + l.num).join(", ") + ": with " + who + ", expected " + exp + ".",
      );
      return;
    }
    if (!f.matches("[data-issue]")) return;
    const [req, asset, who, due] = ["req", "asset", "who", "due"].map((k) =>
      form.get(k),
    );
    const unit = getAsset(asset),
      r = getReq(req);
    if (!r || !unit || unit.repair || out(asset) || !people.includes(who))
      return;
    if (!r.items.includes(unit.type)) {
      q("[data-status]").textContent =
        "This equipment type is outside the approved request. Choose an approved unit.";
      return;
    }
    if (
      s.loans.some(
        (l) => l.req === req && !l.back && getAsset(l.asset).type === unit.type,
      )
    ) {
      q("[data-status]").textContent =
        "The approved quantity of this equipment type is already on loan.";
      return;
    }
    const num = Math.max(...s.loans.map((l) => l.num)) + 1;
    s.loans.push({ num, req, asset, who, due, back: false });
    s.editing = false;
    commit("Issued " + asset + " to " + who + " on slip L-" + num + ".");
  });
  function restore(d) {
    if (
      !d ||
      d.version !== 2 ||
      typeof d.check !== "string" ||
      (d.followup && !getReq(d.followup)) ||
      !Object.hasOwn(screens, d.tab) ||
      !shifts[d.phase] ||
      (d.selected && !getReq(d.selected)) ||
      !Array.isArray(d.notes) ||
      !d.notes.every(
        (n) => n && shifts[n.phase] && typeof n.text === "string",
      ) ||
      !Array.isArray(d.loans) ||
      !d.loans.length ||
      !d.loans.every(
        (l) =>
          l &&
          getReq(l.req) &&
          getAsset(l.asset) &&
          Number.isInteger(l.num) &&
          (l.with === undefined || people.includes(l.with)) &&
          (l.expected === undefined || Object.hasOwn(dueAt, l.expected)) &&
          (l.returnedBy === undefined || people.includes(l.returnedBy)),
      )
    )
      return;
    s = {
      ...original(),
      ...d,
      loans: d.loans.map((l) => ({ ...l })),
      notes: d.notes.map((n) => ({ ...n })),
    };
    paint();
  }
  paint();
  try {
    restore(JSON.parse(localStorage.getItem(storageKey)));
  } catch {
    // Keep the fresh shift when storage is unavailable or the saved data is invalid.
  }
})();
