function createStoryPlayback({ control, open, goTo, refreshNavigation, manualOnly, onResume }) {
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const holds = [4000, 4500, 5500, 6000, 8000, 8000];
  let playing = !manualOnly && !reducedMotion.matches;
  let chapter = 0;
  let phase = "loading";
  let timer = null;

  function clearTimer() {
    clearTimeout(timer);
    timer = null;
  }

  function schedule() {
    clearTimer();
    if (!playing || document.hidden || chapter >= holds.length) return;
    const action = phase === "entry" ? open : () => goTo(chapter + 1);
    const delay = phase === "entry" ? 1500 : holds[chapter];
    if (phase === "entry" || phase === "settled") {
      timer = setTimeout(() => {
        timer = null;
        if (!document.hidden) action();
      }, delay);
    }
  }

  function render() {
    control.hidden = manualOnly || reducedMotion.matches || chapter >= holds.length;
    const label = playing ? "Pause auto-play" : "Play invitation";
    control.dataset.playing = String(playing);
    control.setAttribute("aria-label", label);
    control.title = label;
    refreshNavigation();
  }

  function setPlaying(value) {
    if (playing === value) return;
    playing = value;
    schedule();
    render();
  }

  control.addEventListener("click", () => {
    if (!playing) onResume();
    setPlaying(!playing);
  });
  document.addEventListener("visibilitychange", schedule);
  reducedMotion.addEventListener("change", event => {
    if (event.matches) setPlaying(false);
    render();
  });

  return {
    get playing() { return playing; },
    update(nextChapter, nextPhase) {
      if (chapter === nextChapter && phase === nextPhase) return;
      chapter = nextChapter;
      phase = nextPhase;
      if (chapter >= holds.length) playing = false;
      schedule();
      render();
    },
    pause() { setPlaying(false); },
    restart() {
      chapter = 0;
      phase = "loading";
      playing = !manualOnly && !reducedMotion.matches;
      schedule();
      render();
    }
  };
}
