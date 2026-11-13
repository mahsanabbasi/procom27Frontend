// Run with a local Chrome remote-debugging endpoint and the development server.
// CDP_URL=http://127.0.0.1:9222 SITE_URL=http://localhost:3005 node tests/browser/whyAttend.mjs
// Uses only Node built-ins; no browser automation dependency. It navigates the first page in the selected Chrome profile.
import fs from "node:fs/promises";
import path from "node:path";
const cdpUrl = process.env.CDP_URL || "http://127.0.0.1:9222";
const siteUrl = process.env.SITE_URL || "http://localhost:3005";
const targets = await (await fetch(new URL("/json/list", cdpUrl))).json();
const target = targets.find((t) => t.type === "page");
if (!target)
  throw Error(
    "No Chrome page target. Launch Chrome with --remote-debugging-port and a dedicated --user-data-dir.",
  );
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  ws.addEventListener("open", resolve, { once: true });
  ws.addEventListener("error", reject, { once: true });
});
let serial = 0;
const pending = new Map(),
  errors = [];
ws.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const item = pending.get(message.id);
    if (item) {
      pending.delete(message.id);
      clearTimeout(item.timeout);
      if (message.error) item.reject(Error(message.error.message));
      else item.resolve(message.result);
    }
  }
  if (message.method === "Runtime.exceptionThrown")
    errors.push(message.params.exceptionDetails.text);
});
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++serial;
    const timeout = setTimeout(() => {
      pending.delete(id);
      reject(Error("CDP timeout: " + method));
    }, 20000);
    pending.set(id, { resolve, reject, timeout });
    ws.send(JSON.stringify({ id, method, params }));
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
try {
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Network.enable");
  await send("Page.bringToFront");
  const assert = (value, message) => {
    if (!value) throw Error(message);
  };
  const until = async (expression, timeout = 18000) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (await evaluate(expression)) return;
      await delay(20);
    }
    throw Error("Timed out: " + expression);
  };
  const runtimeErrors = [];
  ws.addEventListener("message", (event) => {
    const m = JSON.parse(event.data);
    if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error")
      runtimeErrors.push(
        m.params.args.map((a) => a.value || a.description).join(" "),
      );
  });
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  await send("Page.navigate", { url: new URL("/why-attend", siteUrl).href });
  await delay(150);
  await until(
    "!!document.querySelector('#race')&&!document.querySelector('.dino-initialization')",
  );
  await evaluate("document.querySelector('[data-route=fair].rsign').click()");
  assert(
    await evaluate(
      "document.querySelector('#race').dataset.route==='fair'&&document.querySelector('[data-route=fair].rsign').getAttribute('aria-pressed')==='true'&&document.querySelector('#route-fair').classList.contains('is-on')",
    ),
    "Fair route selection",
  );
  await evaluate("document.querySelector('[data-route=orbit].rsign').click()");
  assert(
    await evaluate(
      "document.querySelector('#race').dataset.route==='orbit'&&document.querySelector('#raceSt').textContent==='Route B · Job Orbit'",
    ),
    "Orbit route selection",
  );
  await evaluate("document.querySelector('#route-fair a').click()");
  assert(
    await evaluate(
      "location.pathname==='/why-attend'&&document.querySelector('.toast').textContent.includes('not available')",
    ),
    "Unavailable Job Fair honest notice",
  );
  assert(
    await evaluate("document.querySelector('#tmCount').textContent==='004'"),
    "Reduced-motion ticket visibility",
  );
  await evaluate("document.querySelector('[data-mv=free]').click()");
  await until(
    "document.querySelector('#btText').textContent.includes('doesn’t answer')",
  );
  await evaluate("document.querySelector('[data-mv=free]').click()");
  await until(
    "document.querySelector('#btText').textContent.includes('Hint: try Open to all')",
  );
  for (const key of ["open", "free", "net", "orbit", "deadline"]) {
    await evaluate(`document.querySelector('[data-mv=${key}]').click()`);
    await until(
      `document.querySelector('[data-mv=${key}]').classList.contains('is-used')`,
    );
    await delay(40);
  }
  await until("!document.querySelector('#btWin').hidden");
  assert(
    await evaluate(
      "document.querySelector('#btHp').getAttribute('aria-valuenow')==='0'&&document.querySelector('#haulYou').textContent.includes('Excuses left 0')",
    ),
    "Boss defeat updates personalized haul",
  );
  await evaluate("document.querySelector('#btAgain').click()");
  assert(
    await evaluate(
      "document.querySelector('#btWin').hidden&&document.querySelector('#btHp').getAttribute('aria-valuenow')==='5'&&document.querySelectorAll('.mv.is-used').length===0",
    ),
    "Boss rematch resets health and moves",
  );
  await evaluate(
    "document.querySelector('#next-level [data-register]').click()",
  );
  assert(
    await evaluate(
      "location.pathname==='/why-attend'&&document.querySelector('.toast').textContent.includes('registration')",
    ),
    "Unavailable registration honest notice",
  );
  await evaluate(
    "document.querySelector('.bonus a[href=\"/campus-map\"]').click()",
  );
  assert(
    await evaluate(
      "location.pathname==='/why-attend'&&document.querySelector('.toast').textContent.includes('Campus Map')",
    ),
    "Unavailable bonus link honest notice",
  );
  console.log(
    JSON.stringify({
      careers: true,
      missingDestinationNotice: true,
      ticketsReducedMotion: true,
      bossMissAndHint: true,
      bossFiveRounds: true,
      bossRematch: true,
      personalizedHaul: true,
      registrationNotice: true,
      bonusNotice: true,
    }),
  );
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
  });
  await send("Page.reload");
  await delay(150);
  await until(
    "!!document.querySelector('#tdisp')&&!document.querySelector('.dino-initialization')",
  );
  await evaluate(
    "document.querySelector('#tdisp').scrollIntoView({block:'center',behavior:'instant'})",
  );
  await until("document.querySelector('#tmCount').textContent==='004'");
  await delay(460);
  await evaluate("document.querySelector('#tmBtn').click()");
  assert(
    await evaluate("document.querySelector('#tmCount').textContent==='000'"),
    "Ticket reprint reset",
  );
  await until("document.querySelector('#tmCount').textContent==='001'");
  await until("document.querySelector('#tmCount').textContent==='004'");
  assert(
    await evaluate("document.querySelectorAll('.tk.is-out').length===4"),
    "All printed tickets visible",
  );
  await evaluate(
    "document.querySelector('#battle').scrollIntoView({block:'center',behavior:'instant'});document.querySelector('[data-mv=open]').click()",
  );
  await until("document.querySelector('#btShot').getAnimations().length>0");
  assert(
    await evaluate(
      "document.querySelector('#btYou').classList.contains('is-throw')",
    ),
    "Animated projectile and throw",
  );
  await until(
    "document.querySelector('[data-mv=open]').classList.contains('is-used')",
  );
  await until("document.querySelector('#btRound').textContent==='2'");
  if (process.env.SCREENSHOT_DIR) {
    await fs.mkdir(process.env.SCREENSHOT_DIR, { recursive: true });
    const shot = await send("Page.captureScreenshot", { format: "png" });
    await fs.writeFile(
      path.join(process.env.SCREENSHOT_DIR, "why-attend-boss.png"),
      Buffer.from(shot.data, "base64"),
    );
  }
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  await send("Page.reload");
  await delay(150);
  await until(
    "!!document.querySelector('#race')&&!document.querySelector('.dino-initialization')",
  );
  await evaluate("document.querySelector('[data-route=orbit].rsign').click()");
  assert(
    await evaluate(
      "document.querySelector('#race').dataset.route==='orbit'&&document.documentElement.scrollWidth<=innerWidth",
    ),
    "Mobile route touch target and no overflow",
  );
  assert(
    await evaluate("document.querySelector('#tstrip').tabIndex===0"),
    "Tickets accessible keyboard scroll region",
  );
  console.log(
    JSON.stringify({
      ticketsAnimatedPrint: true,
      bossProjectileAnimation: true,
      mobile390: true,
      errors,
      runtimeErrors,
    }),
  );
  assert(!errors.length && !runtimeErrors.length, "Browser errors");
} finally {
  try {
    await send("Emulation.clearDeviceMetricsOverride");
    await send("Emulation.setEmulatedMedia", { features: [] });
  } finally {
    ws.close();
  }
}
