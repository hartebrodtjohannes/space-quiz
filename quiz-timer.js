(function initQuizTimer(root) {
  function formatElapsedTime(totalSeconds) {
    const safeSeconds = Math.max(0, Math.floor(totalSeconds));
    const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, "0");
    const seconds = String(safeSeconds % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  function createQuizTimer(onTick, options = {}) {
    const now = options.now ?? (() => Date.now());
    const intervalMs = options.intervalMs ?? 1000;
    const setTimerInterval = options.setIntervalFn ?? ((handler, delay) => setInterval(handler, delay));
    const clearTimerInterval = options.clearIntervalFn ?? ((id) => clearInterval(id));

    let enabled = false;
    let running = false;
    let elapsedMs = 0;
    let startedAt = 0;
    let timerId = null;

    function currentElapsedMs() {
      if (!running) return elapsedMs;
      return elapsedMs + (now() - startedAt);
    }

    function emit() {
      if (typeof onTick === "function") {
        onTick(Math.floor(currentElapsedMs() / 1000));
      }
    }

    function clearTicker() {
      if (timerId !== null) {
        clearTimerInterval(timerId);
        timerId = null;
      }
    }

    function stop() {
      if (!running) return;
      elapsedMs = currentElapsedMs();
      running = false;
      clearTicker();
      emit();
    }

    function start() {
      if (!enabled || running) return;
      running = true;
      startedAt = now();
      clearTicker();
      timerId = setTimerInterval(emit, intervalMs);
      emit();
    }

    function reset() {
      elapsedMs = 0;
      if (running) {
        startedAt = now();
      }
      emit();
    }

    function setEnabled(value) {
      const nextEnabled = Boolean(value);
      if (enabled === nextEnabled) return;
      enabled = nextEnabled;
      if (!enabled) {
        stop();
        elapsedMs = 0;
      } else {
        elapsedMs = 0;
      }
      emit();
    }

    return {
      formatElapsedTime,
      start,
      stop,
      reset,
      setEnabled,
      isEnabled: () => enabled,
      isRunning: () => running,
      getElapsedSeconds: () => Math.floor(currentElapsedMs() / 1000)
    };
  }

  const exported = {
    formatElapsedTime,
    createQuizTimer
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = exported;
  }

  root.QuizTimer = exported;
})(typeof globalThis !== "undefined" ? globalThis : window);
