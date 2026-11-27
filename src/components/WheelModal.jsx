import React, { useState, useEffect, useCallback, useRef } from "react";
import { useCinema } from "../context/CinemaContext";
import { useModalA11y } from "../hooks/useModalA11y";

const SPIN_DURATION_MS = 3250;
const JACKPOT_CHANCE = 0.03;

const STANDARD_PRIZES = [
  { angle: 315, msg: "🎉 Ai câștigat 20% REDUCERE! Folosește codul: STUDENT20" },
  { angle: 225, msg: "🎉 Ai câștigat 20% REDUCERE! Folosește codul: CORPULN" },
  { angle: 135, msg: "🎉 Ai câștigat 20% REDUCERE! Folosește codul: VIP15" }
];

const JACKPOT_PRIZE = {
  angle: 45,
  msg: "👑 JACKPOT 3%! Ai câștigat 2 BILETE FULL VIP GRATIS! Folosește codul: FREEVIP2"
};

function isTypingTarget(element) {
  if (!element) return false;
  const tag = element.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || element.isContentEditable;
}

export default function WheelModal() {
  const { isWheelOpen, setIsWheelOpen, forceVipJackpot, setForceVipJackpot } = useCinema();
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [resultText, setResultText] = useState("");
  const spinTimerRef = useRef(null);

  const closeWheel = useCallback(() => {
    setIsWheelOpen(false);
    setForceVipJackpot(false);
  }, [setIsWheelOpen, setForceVipJackpot]);

  const dialogRef = useModalA11y(isWheelOpen, closeWheel);

  const spinWheel = useCallback(
    (triggeredByKeyG = false) => {
      if (isSpinning) return;
      setIsSpinning(true);
      setResultText("Se învârte roata...");

      const isJackpot = triggeredByKeyG || forceVipJackpot || Math.random() < JACKPOT_CHANCE;
      setForceVipJackpot(false);

      const prize = isJackpot
        ? JACKPOT_PRIZE
        : STANDARD_PRIZES[Math.floor(Math.random() * STANDARD_PRIZES.length)];

      setRotation((prev) => prev - (prev % 360) + 1800 + prize.angle);

      clearTimeout(spinTimerRef.current);
      spinTimerRef.current = setTimeout(() => {
        setResultText(prize.msg);
        setIsSpinning(false);
      }, SPIN_DURATION_MS);
    },
    [isSpinning, forceVipJackpot, setForceVipJackpot]
  );

  useEffect(() => () => clearTimeout(spinTimerRef.current), []);

  useEffect(() => {
    if (!isWheelOpen) {
      setResultText("");
      setIsSpinning(false);
      clearTimeout(spinTimerRef.current);
    }
  }, [isWheelOpen]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      if (typeof e.key !== "string" || e.key.toLowerCase() !== "g") return;
      if (isTypingTarget(document.activeElement)) return;

      if (!isWheelOpen) {
        if (document.querySelector(".modal-open")) return;
        setForceVipJackpot(true);
        setIsWheelOpen(true);
      } else {
        spinWheel(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isWheelOpen, setIsWheelOpen, setForceVipJackpot, spinWheel]);

  if (!isWheelOpen) return null;

  return (
    <div className="modal modal-open">
      <div
        className="modal-content"
        style={{ maxWidth: "500px" }}
        role="dialog"
        aria-modal="true"
        aria-label="Roata Norocului"
        tabIndex={-1}
        ref={dialogRef}
      >
        <div className="modal-header-cc">
          <h2>
            <i className="fa-solid fa-gift" aria-hidden="true" /> ROATA NOROCULUI NIII7
          </h2>
          <p>
            Ai <b>3% șansă</b> să câștigi <b>2 BILETE FULL VIP GRATIS</b>!
          </p>
        </div>

        <div className="wheel-wrapper">
          <div className="wheel-pointer" aria-hidden="true">▼</div>
          <div
            className="wheel-circle"
            data-testid="wheel-circle"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <div className="wheel-seg seg-1">STUDENT20</div>
            <div className="wheel-seg seg-2">CORPULN</div>
            <div className="wheel-seg seg-3">VIP15</div>
            <div className="wheel-seg seg-4">👑 2x VIP FREE</div>
          </div>
        </div>

        <p role="status" className="wheel-result">
          {resultText}
        </p>

        <div className="modal-buttons">
          <button type="button" className="btn-cancel" onClick={closeWheel}>
            Închide
          </button>
          <button
            type="button"
            className="btn-cinema"
            disabled={isSpinning}
            onClick={() => spinWheel(false)}
          >
            {isSpinning ? "SE ÎNVÂRTE..." : "ÎNVÂRTE ROATA!"}
          </button>
        </div>
      </div>
    </div>
  );
}
