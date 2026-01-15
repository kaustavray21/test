// input.js

const inputState = {
  nextDx: 0,
  nextDy: 0,
};

let touchStartX = 0;
let touchStartY = 0;

function initInput(isRunningChecker) {
  document.addEventListener("keydown", (e) => {
    if (!isRunningChecker()) return;
    const k = e.key.toLowerCase();
    if (k === "w" || k === "arrowup") {
      inputState.nextDx = 0;
      inputState.nextDy = -1;
    } else if (k === "s" || k === "arrowdown") {
      inputState.nextDx = 0;
      inputState.nextDy = 1;
    } else if (k === "a" || k === "arrowleft") {
      inputState.nextDx = -1;
      inputState.nextDy = 0;
    } else if (k === "d" || k === "arrowright") {
      inputState.nextDx = 1;
      inputState.nextDy = 0;
    }
  });

  document.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].clientX;
      touchStartY = e.changedTouches[0].clientY;
    },
    { passive: false }
  );

  document.addEventListener(
    "touchmove",
    (e) => {
      e.preventDefault();
    },
    { passive: false }
  );

  document.addEventListener(
    "touchend",
    (e) => {
      if (!isRunningChecker()) return;
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const dx = touchEndX - touchStartX;
      const dy = touchEndY - touchStartY;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (Math.abs(dx) > 20) {
          inputState.nextDx = dx > 0 ? 1 : -1;
          inputState.nextDy = 0;
        }
      } else {
        if (Math.abs(dy) > 20) {
          inputState.nextDx = 0;
          inputState.nextDy = dy > 0 ? 1 : -1;
        }
      }
    },
    { passive: false }
  );
}
