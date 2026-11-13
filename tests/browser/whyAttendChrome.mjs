const cdp = process.env.CDP_URL || "http://127.0.0.1:9227",
  site = process.env.SITE_URL || "http://localhost:3005";
const targets = await (await fetch(cdp + "/json/list")).json();
const socket = new WebSocket(
  targets.find((target) => target.type === "page").webSocketDebuggerUrl,
);
await new Promise((resolve) =>
  socket.addEventListener("open", resolve, { once: true }),
);
let serial = 0;
const pending = new Map(),
  exceptions = [],
  consoleErrors = [];
socket.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);
  if (data.id) {
    const task = pending.get(data.id);
    pending.delete(data.id);
    if (task) {
      if (data.error) task.reject(data.error);
      else task.resolve(data.result);
    }
  }
  if (data.method === "Runtime.exceptionThrown")
    exceptions.push(
      data.params.exceptionDetails.exception?.description ||
        data.params.exceptionDetails.text,
    );
  if (
    data.method === "Runtime.consoleAPICalled" &&
    data.params.type === "error"
  )
    consoleErrors.push(
      data.params.args
        .map((value) => value.value || value.description)
        .join(" "),
    );
});
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++serial;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function evaluate(expression) {
  const result = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (result.exceptionDetails)
    throw Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
function check(value, message) {
  if (!value) throw Error(message);
}
async function until(expression, ms = 20000) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    try {
      if (await evaluate(expression)) return;
    } catch (error) {
      if (!String(error).includes("context")) throw error;
    }
    await delay(20);
  }
  throw Error("Timed out: " + expression);
}
async function key(key, code = key, modifiers = 0) {
  await send("Input.dispatchKeyEvent", {
    type: "keyDown",
    key,
    code,
    modifiers,
  });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key, code, modifiers });
}
async function navigate(path) {
  await send("Page.navigate", { url: site + path });
  await delay(100);
  await until(
    `!!document.querySelector('h1')&&!document.querySelector('.dino-initialization')`,
  );
}
await send("Page.enable");
await send("Runtime.enable");
await send("Page.bringToFront");
await send("Emulation.setDeviceMetricsOverride", {
  width: 390,
  height: 844,
  deviceScaleFactor: 1,
  mobile: true,
});
await navigate("/why-attend");
check(
  await evaluate(
    `document.querySelector('[data-navcd]').getAttribute('aria-label').includes('Registration closes in')&&document.querySelector('[data-navcd-v]').textContent.includes('D')`,
  ),
  "Registration countdown is populated",
);
await evaluate(`document.querySelector('.nav__burger').click()`);
await until(
  `document.querySelector('.nav__burger').getAttribute('aria-expanded')==='true'`,
);
check(
  await evaluate(
    `document.querySelector('#site-menu').contains(document.activeElement)&&document.body.style.overflow==='hidden'`,
  ),
  "Menu opens with focus and scroll lock",
);
await key("Tab", "Tab", 8);
check(
  await evaluate(
    `document.activeElement===document.querySelector('.nav__burger')`,
  ),
  "Shift+Tab wraps menu focus",
);
await key("Tab", "Tab");
check(
  await evaluate(
    `document.activeElement===document.querySelector('#site-menu a')`,
  ),
  "Tab wraps to first menu link",
);
await key("Escape");
await until(
  `document.querySelector('.nav__burger').getAttribute('aria-expanded')==='false'`,
);
check(
  await evaluate(
    `document.activeElement===document.querySelector('.nav__burger')&&document.body.style.overflow===''&&document.querySelector('#site-menu').inert`,
  ),
  "Escape closes menu and restores focus/scroll",
);
await evaluate(`document.querySelector('.nav__burger').click()`);
await until(
  `document.querySelector('.nav__burger').getAttribute('aria-expanded')==='true'`,
);
await evaluate(`document.querySelector('#site-menu a[href="/about"]').click()`);
await delay(100);
await until(
  `location.pathname==='/about'&&!!document.querySelector('h1')&&!document.querySelector('.why-attend-page')`,
);
check(
  await evaluate(
    `!document.body.style.overflow&&document.querySelector('h1').textContent.includes('PROCOM')`,
  ),
  "Mobile About link navigates and releases lock",
);
console.log(
  "Reference header: countdown, mobile menu, focus wrap, Escape, direct About link passed",
);
await navigate("/why-attend");
await evaluate(`document.querySelector('.xp__btn').click()`);
await until(`!document.querySelector('#xpPanel').hidden`);
check(
  await evaluate(`document.activeElement===document.querySelector('.xp__x')`),
  "Quest log receives focus",
);
await key("Escape");
check(
  await evaluate(
    `document.querySelector('#xpPanel').hidden&&document.activeElement===document.querySelector('.xp__btn')`,
  ),
  "Quest Escape restores trigger",
);
await evaluate(
  `document.querySelector('.xp__btn').click();document.querySelector('.xp__sfx').click()`,
);
await until(
  `document.querySelector('.xp__sfx').getAttribute('aria-pressed')==='true'`,
);
await evaluate(`document.querySelector('.xp__sfx').click()`);
await until(
  `document.querySelector('.xp__sfx').getAttribute('aria-pressed')==='false'`,
);
await evaluate(`document.querySelector('.xp__reset').click()`);
await until(`document.querySelector('.xp__pts').textContent==='0 XP'`);
await evaluate(`document.querySelector('.xp__x').click()`);
check(
  await evaluate(`document.querySelector('#xpPanel').hidden`),
  "Close quest log control",
);
const credits = await evaluate(
  `Number(document.querySelector('.coin b').textContent.split(' ').at(-1))`,
);
await evaluate(
  `document.querySelector('.coin').scrollIntoView({behavior:'instant'});document.querySelector('.coin').click()`,
);
await until(
  `Number(document.querySelector('.coin b').textContent.split(' ').at(-1))===${credits + 1}`,
);
console.log(
  "Quest log and coin: open/close/Escape, reset, sound toggle, persisted credit increment passed",
);
// Use an isolated player profile in this dedicated QA browser.
await evaluate(
  `localStorage.removeItem('procom27-roll');localStorage.removeItem('procom27-board')`,
);
await navigate("/why-attend");
await evaluate(
  `document.querySelector('[data-runner]').scrollIntoView({behavior:'instant'});document.querySelector('.frun__form').requestSubmit()`,
);
await until(`!!document.querySelector('#rRollErr').textContent`);
check(
  await evaluate(
    `document.querySelector('#rRoll').getAttribute('aria-invalid')==='true'&&document.activeElement.id==='rRoll'`,
  ),
  "Invalid runner roll is rejected and focused",
);
await evaluate(`document.querySelector('#rRoll').focus()`);
await send("Input.insertText", { text: "21-1234" });
await until(`document.querySelector('#rRoll').value==='21-1234'`);
await evaluate(`document.querySelector('.frun__form').requestSubmit()`);
await until(
  `document.querySelector('[data-runner]').classList.contains('is-playing')`,
);
check(
  await evaluate(
    `document.querySelector('[data-r-player]').textContent==='21-1234'&&document.activeElement.hasAttribute('data-r-stage')`,
  ),
  "Valid player starts with game focus",
);
await key(" ", "Space");
await delay(200);
check(
  await evaluate(
    `Number(document.querySelector('[data-r-score]').textContent)>0`,
  ),
  "Runner advances after keyboard jump",
);
await until(`!!document.querySelector('.frun__big')`, 15000);
check(
  await evaluate(
    `document.querySelector('[data-r-champ] .frun__roll').textContent==='21-1234'&&JSON.parse(localStorage.getItem('procom27-board')).some(p=>p.roll==='21-1234'&&p.score>0)`,
  ),
  "Game-over score saved to device champion board",
);
await evaluate(`document.querySelector('[data-play]').click()`);
await until(
  `document.querySelector('[data-runner]').classList.contains('is-playing')`,
);
await evaluate(
  `document.querySelector('[data-r-stage]').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}))`,
);
await until(`!!document.querySelector('.frun__big')`, 15000);
await evaluate(`document.querySelector('[data-change]').click()`);
await until(`!!document.querySelector('#rRoll')`);
await until(`document.activeElement.id==='rRoll'`);
console.log(
  "Bit Runner: invalid/valid roll, start, keyboard/pointer jump, score, game over, retry, player change, device leaderboard passed",
);
// Test SPA route cleanup through the current router without creating a new document.
await evaluate(
  `window.__whyDocumentMarker='preserved';history.pushState(null,'','/about')`,
);
await until(
  `location.pathname==='/about'&&!document.querySelector('.why-attend-page')&&!!document.querySelector('h1')`,
);
check(
  await evaluate(
    `__whyDocumentMarker==='preserved'&&!document.body.style.overflow&&getComputedStyle(document.body).fontFamily.includes('Space Grotesk')`,
  ),
  "About SPA transition removes reference shell and typography scope",
);
await evaluate(`history.pushState(null,'','/teams')`);
await until(
  `document.querySelector('h1')?.textContent.toLowerCase().includes('teams')`,
);
await evaluate(`history.pushState(null,'','/')`);
await until(
  `document.querySelector('h1')?.textContent.includes('Where skill meets scale')`,
);
check(
  await evaluate(
    `__whyDocumentMarker==='preserved'&&!document.querySelector('.why-attend-page')&&!document.querySelector('.xp')&&!document.querySelector('.dino-initialization')`,
  ),
  "Existing routes preserve document and remove page effects",
);
console.log(
  "Existing homepage, About and Teams work after SPA navigation with scoped Why styles inactive",
);
const block = await send("Page.addScriptToEvaluateOnNewDocument", {
  source: `for(const name of ['getItem','setItem','removeItem'])Object.defineProperty(Storage.prototype,name,{configurable:true,value(){throw new DOMException('Storage blocked','SecurityError')}})`,
});
await navigate("/why-attend");
check(
  await evaluate(
    `!!document.querySelector('.xp__btn')&&!!document.querySelector('#rRoll')`,
  ),
  "Why page remains usable with browser storage blocked",
);
await evaluate(
  `document.querySelector('.coin').click();document.querySelector('.xp__btn').click();document.querySelector('.xp__sfx').click()`,
);
await navigate("/about");
check(
  await evaluate(
    `!!document.querySelector('h1')&&!document.querySelector('.why-attend-page')`,
  ),
  "About remains usable with browser storage blocked",
);
await send("Page.removeScriptToEvaluateOnNewDocument", {
  identifier: block.identifier,
});
console.log(
  "Storage blocked: page, coin, quest/sound controls and About remain usable",
);
check(
  !exceptions.length && !consoleErrors.length,
  JSON.stringify({ exceptions, consoleErrors }),
);
console.log(
  JSON.stringify({
    exceptions,
    consoleErrors,
    result: "all shared chrome and route checks passed",
  }),
);
socket.close();
