import React, { useState, useRef, useEffect } from "react";

const BAR_COUNT = 12;
const IDLE_HEIGHT = 20;
const TEST_DURATION_MS = 2600;

function playSubBass() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  const ctx = new AudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(55, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 1.2);
  osc.frequency.exponentialRampToValueAtTime(42, ctx.currentTime + 2.4);
  gain.gain.setValueAtTime(0.01, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.28, ctx.currentTime + 0.5);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 2.5);
  return ctx;
}

export default function ImaxPage() {
  const [isImaxExpanded, setIsImaxExpanded] = useState(false);
  const [eqHeights, setEqHeights] = useState(Array(BAR_COUNT).fill(IDLE_HEIGHT));
  const [isTestingSound, setIsTestingSound] = useState(false);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const audioCtxRef = useRef(null);

  function stopSoundTest() {
    clearInterval(intervalRef.current);
    clearTimeout(timeoutRef.current);
    intervalRef.current = null;
    timeoutRef.current = null;
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
  }

  useEffect(() => stopSoundTest, []);

  function triggerImaxSoundTest() {
    if (isTestingSound) return;
    setIsTestingSound(true);

    try {
      audioCtxRef.current = playSubBass();
    } catch {
      audioCtxRef.current = null;
    }

    intervalRef.current = setInterval(() => {
      setEqHeights(
        Array.from({ length: BAR_COUNT }, () => Math.floor(Math.random() * 80) + IDLE_HEIGHT)
      );
    }, 120);

    timeoutRef.current = setTimeout(() => {
      stopSoundTest();
      setEqHeights(Array(BAR_COUNT).fill(IDLE_HEIGHT));
      setIsTestingSound(false);
    }, TEST_DURATION_MS);
  }

  return (
    <main className="view-page">
      <div className="exp-hero imax-hero">
        <span className="tag-imax">TEHNOLOGIE NEXT-GEN</span>
        <h1>
          EXPERIENȚA <span>IMAX® LASER</span>
        </h1>
        <p>
          Ecran gigant de 24 metri lățime, proiecție dublă 4K Laser și acustică calibrată cu laser în Corpul N.
        </p>
      </div>

      <div className="exp-grid">
        <div className="exp-card">
          <h3>
            <i className="fa-solid fa-maximize" aria-hidden="true" /> COMPARATOR INTERACTIV DE IMAGINE
          </h3>
          <p>În IMAX vezi cu până la 26% mai multă imagine față de un cinema standard:</p>
          <div className={`aspect-demo ${isImaxExpanded ? "imax-expanded" : ""}`}>
            <div className="aspect-bars">BANDĂ NEAGRĂ (CINEMA STANDARD 2.39:1)</div>
            <div className="aspect-image">
              <span>{isImaxExpanded ? "CADRU EXTINS IMAX 1.90:1 ACTIV!" : "CADRU STANDARD 2.39:1"}</span>
            </div>
            <div className="aspect-bars">BANDĂ NEAGRĂ (CINEMA STANDARD 2.39:1)</div>
          </div>
          <div className="sim-controls">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => setIsImaxExpanded(false)}
            >
              Mod Standard (2.39:1)
            </button>
            <button
              type="button"
              className="btn-cinema"
              onClick={() => setIsImaxExpanded(true)}
            >
              Activează IMAX (1.90:1)
            </button>
          </div>
        </div>

        <div className="exp-card">
          <h3>
            <i className="fa-solid fa-volume-high" aria-hidden="true" /> TEST ACUSTIC SUB-BASS IMAX 12.1
          </h3>
          <p>
            Simte frecvențele joase generate prin <b>Web Audio API</b>:
          </p>
          <div className="eq-visualizer">
            {eqHeights.map((h, i) => (
              <div key={i} className="eq-bar" style={{ height: `${h}%` }} />
            ))}
          </div>
          <button
            type="button"
            className="btn-cinema"
            style={{ width: "100%", marginTop: "20px" }}
            disabled={isTestingSound}
            onClick={triggerImaxSoundTest}
          >
            <i className="fa-solid fa-wave-square" aria-hidden="true" />{" "}
            {isTestingSound ? "CALIBRARE SUB-BASS..." : "DECLANȘEAZĂ TESTUL AUDIO IMAX"}
          </button>
        </div>
      </div>
    </main>
  );
}
