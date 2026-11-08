import fs from "node:fs/promises";
const directory = new URL(
  "../../node_modules/.cache/why-early/",
  import.meta.url,
);
await fs.mkdir(directory, { recursive: true });
const cdp = process.env.CDP_URL || "http://127.0.0.1:9227";
const site = process.env.SITE_URL || "http://localhost:3005";
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
async function key(key, code = key) {
  await send("Input.dispatchKeyEvent", { type: "keyDown", key, code });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key, code });
}
await send("Page.enable");
await send("Runtime.enable");
await send("Network.enable");
await send("Page.bringToFront");
await send("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
});
await send("Page.navigate", { url: site + "/why-attend" });
await delay(100);
await until(
  `!!document.querySelector('#hero-title')&&!document.querySelector('.dino-initialization')`,
);
await evaluate(`document.querySelectorAll('.tmenu__it')[0].focus()`);
await key("ArrowDown");
check(
  await evaluate(
    `document.activeElement===document.querySelectorAll('.tmenu__it')[1]`,
  ),
  "Hero ArrowDown moves focus",
);
await key("ArrowUp");
check(
  await evaluate(
    `document.activeElement===document.querySelectorAll('.tmenu__it')[0]`,
  ),
  "Hero ArrowUp moves focus",
);
await evaluate(`document.querySelector('.tip__next').click()`);
await until(
  `document.querySelector('.js-tipn').textContent==='2'&&document.querySelector('.js-tip').textContent==='There are competitions for tech and non-tech students.'`,
);
console.log("Hero: keyboard menu and full typed next tip passed");
for (const width of [1440, 390]) {
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height: width === 390 ? 844 : 900,
    deviceScaleFactor: 1,
    mobile: width === 390,
  });
  await evaluate(
    `document.querySelector('#path').scrollIntoView({behavior:'instant'});document.querySelector('#tab-compete').focus()`,
  );
  await delay(200);
  await key("End");
  await until(
    `document.querySelector('#tab-learn').getAttribute('aria-selected')==='true'&&document.querySelector('.js-pname').textContent==='Learn'`,
  );
  check(
    await evaluate(
      `document.activeElement.id==='tab-learn'&&document.querySelector('#stage').getAttribute('aria-labelledby')==='tab-learn'`,
    ),
    "Tab panel follows keyboard selection",
  );
  await key("Home");
  await until(`document.querySelector('.js-pname').textContent==='Compete'`);
  await key("ArrowLeft");
  await until(
    `document.querySelector('#tab-learn').getAttribute('aria-selected')==='true'`,
  );
  await evaluate(`document.querySelector('#tab-discover').click()`);
  await until(`document.querySelector('.js-pname').textContent==='Careers'`);
  check(
    await evaluate(
      `document.querySelector('.js-pcta').getAttribute('href')==='#opportunities'&&document.querySelector('.js-pmore').hidden`,
    ),
    "Career CTA and redundant link state",
  );
  const map = await evaluate(
    `({width:document.querySelector('#wmField').clientWidth,path:document.querySelector('.wm__bed').getAttribute('d'),overflow:document.documentElement.scrollWidth>innerWidth,cards:[...document.querySelectorAll('.wnode__card')].map(e=>({x:e.getBoundingClientRect().left,w:e.getBoundingClientRect().width})),walker:document.querySelector('#wmWalker').getBoundingClientRect().toJSON()})`,
  );
  check(
    map.path.includes("C") &&
      !map.overflow &&
      map.cards.every((card) => card.x >= 0 && card.x + card.w <= width),
    "Measured map, responsive cards and no overflow: " + JSON.stringify(map),
  );
  console.log(
    JSON.stringify({
      mapWidth: width,
      keyboard: true,
      careerState: true,
      noOverflow: true,
    }),
  );
}
await send("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
});
await evaluate(
  `document.querySelector('#challenge').scrollIntoView({behavior:'instant'});document.querySelector('#bbField').focus()`,
);
await delay(250);
await key(" ", "Space");
await until(`document.querySelector('#bbField').classList.contains('is-live')`);
await until(`Number(document.querySelector('#bbCount').textContent)>0`, 15000);
console.log("Brick breaker: real keyboard launch and physics collision passed");
await evaluate(`document.querySelectorAll('.brick').forEach(e=>e.click())`);
await until(
  `!document.querySelector('#bbClear').hidden&&document.querySelectorAll('.pm.is-lit').length===5`,
);
check(
  await evaluate(
    `document.querySelector('#bbCount').textContent==='6'&&document.querySelectorAll('.brick.is-broken').length===6&&document.querySelector('#pmState').textContent==='Power meter MAX'`,
  ),
  "All six category selection / complete meter",
);
check(
  await evaluate(
    `document.querySelector('.bbi__t').textContent==='General Challenges'&&!!document.querySelector('.bbi__list li')`,
  ),
  "Category details from reference data",
);
await evaluate(`document.querySelector('#bbAgain').click()`);
await until(
  `document.querySelector('#bbCount').textContent==='0'&&document.querySelector('#bbClear').hidden`,
);
check(
  await evaluate(
    `document.activeElement.id==='bbField'&&document.querySelectorAll('.brick.is-broken').length===0`,
  ),
  "Reset restores board/focus",
);
await evaluate(
  `(()=>{const el=document.querySelector('#bbField'),r=el.getBoundingClientRect();el.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,clientX:r.left+r.width*.7,clientY:r.top+r.height*.8}));el.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,clientX:r.left+r.width*.7,clientY:r.top+r.height*.8}));})()`,
);
await until(`document.querySelector('#bbField').classList.contains('is-live')`);
console.log(
  "Brick breaker: all six taps, details, capsules, MAX meter, reset and pointer launch passed",
);
await evaluate(
  `document.querySelector('#connect').scrollIntoView({behavior:'instant'})`,
);
await until(`document.querySelectorAll('#lobby .av').length===30`, 12000);
await evaluate(`document.querySelector('.lg[data-type="pro"]').click()`);
check(
  await evaluate(
    `document.querySelector('#lobby').dataset.filter==='pro'&&document.querySelector('.lg[data-type="pro"]').getAttribute('aria-pressed')==='true'&&document.querySelector('.lrow[data-type="pro"]').classList.contains('is-hot')`,
  ),
  "Lobby connection highlight",
);
await evaluate(`document.querySelector('.lg[data-type="pro"]').click()`);
check(
  await evaluate(
    `!document.querySelector('#lobby').hasAttribute('data-filter')`,
  ),
  "Lobby toggle off",
);
await evaluate(`document.querySelector('#joinBtn').click()`);
check(
  await evaluate(
    `document.querySelector('#joinBtn').disabled&&document.querySelector('#joinBtn').textContent==='Ready'&&!document.querySelector('#lobbyNote').hidden&&document.querySelector('.av--you').textContent==='You'`,
  ),
  "Join lobby UI",
);
await until(`document.querySelector('#haulYou').textContent.includes('Lobby')`);
console.log(
  "Lobby: seeded join animation, highlight toggle, joining and shared finale state passed",
);
await send("Emulation.setEmulatedMedia", {
  features: [{ name: "prefers-reduced-motion", value: "reduce" }],
});
await send("Page.reload");
await delay(100);
await until(
  `!!document.querySelector('#hero-title')&&!document.querySelector('.dino-initialization')`,
);
await evaluate(
  `document.querySelector('.tip__next').click();document.querySelector('#connect').scrollIntoView({behavior:'instant'})`,
);
await until(`document.querySelectorAll('#lobby .av').length===30`);
check(
  await evaluate(
    `document.querySelector('.js-tip').textContent==='There are competitions for tech and non-tech students.'`,
  ),
  "Reduced motion tip immediately visible",
);
console.log("Reduced motion: tip and lobby ready without animation delays");
check(
  !exceptions.length && !consoleErrors.length,
  JSON.stringify({ exceptions, consoleErrors }),
);
console.log(
  JSON.stringify({
    exceptions,
    consoleErrors,
    result: "all early-section browser checks passed",
  }),
);
await send("Emulation.setEmulatedMedia", {
  features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
});
socket.close();
