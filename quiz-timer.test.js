const test = require("node:test");
const assert = require("node:assert/strict");
const { formatElapsedTime, createQuizTimer } = require("./quiz-timer.js");

test("formatElapsedTime renders MM:SS", () => {
  assert.equal(formatElapsedTime(0), "00:00");
  assert.equal(formatElapsedTime(9), "00:09");
  assert.equal(formatElapsedTime(125), "02:05");
  assert.equal(formatElapsedTime(-3), "00:00");
});

test("timer counts only while enabled and running", () => {
  let nowMs = 1_000;
  let intervalHandler;
  let cleared = false;

  const timer = createQuizTimer(null, {
    now: () => nowMs,
    intervalMs: 1000,
    setIntervalFn: (handler) => {
      intervalHandler = handler;
      return 7;
    },
    clearIntervalFn: (id) => {
      if (id === 7) cleared = true;
    }
  });

  timer.start();
  assert.equal(timer.getElapsedSeconds(), 0, "does not run while disabled");

  timer.setEnabled(true);
  timer.start();
  nowMs += 2_400;
  intervalHandler();
  assert.equal(timer.getElapsedSeconds(), 2);

  timer.stop();
  assert.equal(cleared, true);
  nowMs += 5_000;
  assert.equal(timer.getElapsedSeconds(), 2, "stays frozen when stopped");

  timer.reset();
  assert.equal(timer.getElapsedSeconds(), 0);
});

test("disabling timer clears elapsed time", () => {
  let nowMs = 0;
  let intervalHandler;

  const timer = createQuizTimer(null, {
    now: () => nowMs,
    setIntervalFn: (handler) => {
      intervalHandler = handler;
      return 1;
    },
    clearIntervalFn: () => {}
  });

  timer.setEnabled(true);
  timer.start();
  nowMs = 3_100;
  intervalHandler();
  assert.equal(timer.getElapsedSeconds(), 3);

  timer.setEnabled(false);
  assert.equal(timer.getElapsedSeconds(), 0);
  assert.equal(timer.isRunning(), false);
});
