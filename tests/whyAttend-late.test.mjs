import test from "node:test";
import assert from "node:assert/strict";
import {
  bossRounds,
  registrationInfo,
  haulRows,
  MOVE_LABELS,
} from "../src/components/whyAttend/lateLogic.js";

const sample = {
  event: { dates: "26–28 Feb 2027", days: 3, ianaZone: "Asia/Karachi" },
  registration: { deadline: "2027-02-15T23:59:00+05:00", closed: false },
  competitions: [{ id: "a" }, { id: "b" }],
  sessions: [
    { id: "job-fair", day: 2, time: "10:00 AM", type: "Career" },
    { id: "panel", day: 1, type: "Panel" },
    { id: "talk", day: 1, type: "Talk" },
    { id: "workshop", day: 3, type: "Workshop" },
    { id: "network", type: "Networking" },
  ],
};
const before = Date.parse("2026-11-08T12:00:00+05:00");
test("registration remains open before deadline and uses event timezone", () => {
  const result = registrationInfo(sample, before);
  assert.equal(result.closed, false);
  assert.equal(result.text, "15 February 2027");
  assert.ok(result.left > 0);
});
test("deadline and explicit closure both close registration", () => {
  assert.equal(
    registrationInfo(sample, Date.parse("2027-02-16T00:00:00+05:00")).closed,
    true,
  );
  assert.equal(
    registrationInfo(
      { ...sample, registration: { ...sample.registration, closed: true } },
      before,
    ).closed,
    true,
  );
});
test("missing or malformed deadline does not invent registration dates", () => {
  for (const deadline of [undefined, "not-a-date"]) {
    const result = registrationInfo(
      { ...sample, registration: { deadline } },
      before,
    );
    assert.equal(result.closed, false);
    assert.equal(result.text, null);
    assert.equal(result.left, 0);
  }
});
test("all five excuses have one distinct valid move and retain source order", () => {
  const rounds = bossRounds(sample, before);
  assert.deepEqual(
    rounds.map((round) => round.mv),
    ["open", "free", "net", "orbit", "deadline"],
  );
  assert.equal(new Set(rounds.map((round) => round.mv)).size, 5);
  assert.ok(
    rounds.every((round) => MOVE_LABELS[round.mv] && round.say && round.hit),
  );
  assert.match(rounds[4].hit, /registration closes on 15 February 2027/);
});
test("closed-registration boss response avoids urging expired registration", () => {
  const result = bossRounds(sample, Date.parse("2027-03-01T12:00:00Z"))[4].hit;
  assert.match(result, /Next year is a different PROCOM/);
  assert.doesNotMatch(result, /registration closes/);
});
test("haul tallies actual competition/session data and preserves separate career choices", () => {
  const rows = haulRows(sample);
  assert.equal(rows.find((row) => row.k === "Competitions").n, 2);
  assert.equal(rows.find((row) => row.k === "Categories").n, 6);
  assert.equal(rows.find((row) => row.k === "Days on campus").n, 3);
  assert.equal(rows.find((row) => row.k === "Talks, panels & workshops").n, 3);
  assert.equal(rows.find((row) => row.k === "Job Fair").v, "Day 2 · 10:00 AM");
  assert.equal(
    rows.find((row) => row.k === "Job Orbit").v,
    "Browse at your own pace",
  );
});
test("empty haul omits zero tallies and keeps the reference fallbacks", () => {
  const rows = haulRows({});
  assert.equal(
    rows.some((row) => row.k === "Competitions"),
    false,
  );
  assert.equal(
    rows.some((row) => row.k === "Days on campus"),
    false,
  );
  assert.equal(
    rows.some((row) => row.k === "Talks, panels & workshops"),
    false,
  );
  assert.equal(rows.find((row) => row.k === "Job Fair").v, "On campus");
});
