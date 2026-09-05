// Hologram.jsx
// ============================================================
// PHOTOREALISTIC AI TEACHER — NATURAL EXPRESSIONS & GESTURES
//
// Features:
//   • Natural human head gestures: expressive nodding & subtle tilts on syllables
//   • Expressive eyebrow micro-motion on speech emphasis
//   • Natural hand gestures pointing smoothly to 3D topic explanations
//   • Dynamic eye contact: glances at 3D explanations & returns to student
//   • Unified coordinate transform: lips 100% permanently locked to mouth
//   • Word-synchronized phonetic lip-sync with zero drift
//   • Interactive 3D concept overlay with holographic pointer beam
// ============================================================

import React, { useEffect, useRef, useState } from "react";
import { getMouthTarget, getAmplitude, getFrequencyBands } from "../services/audioAnalyzer";

// ─── ASSET MAP ─────────────────────────────────────────────
const ASSETS = {
    closed: "/teacher_mouth_closed.jpg",
    mid:    "/teacher_mouth_mid.jpg",
    open:   "/teacher_mouth_open.jpg",
    point:  "/teacher_gesture_point.jpg"
};

// ─── CONSTANT ANATOMICAL COORDINATES (in 768×1376 space) ───
const MOUTH = {
    cx:      446,   // True horizontal center of her lips
    cy:      547,   // True vertical center of her lips (oral fissure)
    rxInner: 14,    // Inner aperture width
    ryInner: 6,     // Inner aperture height
    rxOuter: 26,    // Outer limit: strictly lips (width 52px)
    ryOuter: 12,    // Outer limit: strictly lips (height 24px)
};

// Neck pivot point for natural human head rotation
const PIVOT = {
    x: 446,
    y: 640
};

// Eyes & Eyebrows
const EYES = {
    leftPupil:  { cx: 423, cy: 504 },
    rightPupil: { cx: 445, cy: 504 },
    browBox:    { x: 405, y: 460, w: 60, h: 25 }
};

// ─── HELPERS ──────────────────────────────────────────────
function lerp(a, b, t) { return a + (b - a) * t; }
function smoothstep(t) { return t * t * (3 - 2 * t); }

// ─── MAIN COMPONENT ───────────────────────────────────────
export default function Hologram({ speaking = false }) {
    const canvasRef = useRef(null);
    const [activeTopic, setActiveTopic] = useState(0);
    const [statusText, setStatusText] = useState("AI TEACHER // ENGAGING");

    // All 60 FPS mutable animation state lives in refs
    const S = useRef({
        lastTime:        0,
        speaking:        false,
        speechTime:      0,
        // Head gestures
        headTilt:        0.0,
        headNod:         0.0,
        // Multi-layer natural head movement seeds
        nodDrift:        0.0,       // slow organic drift
        nodSyllable:     0.0,       // per-syllable micro-nod
        nodEmphasis:     0.0,       // sporadic strong nod on emphasis
        tiltDrift:       0.0,       // slow tilt drift
        tiltJitter:      0.0,       // micro-tilt jitter
        emphasisTimer:   0.0,       // countdown to next emphasis nod
        emphasisPhase:   0.0,       // phase of current emphasis nod
        emphasisActive:  false,     // is an emphasis nod firing?
        lastPower:       0.0,       // previous frame power for peak detection
        peakCooldown:    0.0,       // prevent double-firing syllable taps
        // Hand gestures
        pointWeight:     0.0,
        // Eye contact & gaze
        gazeX:           0.0,
        gazeTarget:      "student",
        nextBlinkTime:   3.8,
        blinkProgress:   0.0,
        isBlinking:      false,
        // Eyebrow lift on emphasis
        browLift:        0.0,
        // Lip-sync
        mouthOpenness:   0.0,
        activeTopicIndex: 0
    });

    const imgs = useRef({
        closed: null, mid: null, open: null, point: null, loaded: false
    });

    const maskRef    = useRef(null);
    const eyeMaskRef = useRef(null);
    const browMaskRef = useRef(null);
    const compRef    = useRef({ canvas: null, ctx: null });
    const rafRef     = useRef(null);

    // Sync speaking prop
    useEffect(() => {
        S.current.speaking = speaking;
        if (!speaking) {
            S.current.speechTime = 0;
            S.current.mouthOpenness = 0.0;
            S.current.gazeTarget = "student";
            setActiveTopic(-1);
            setStatusText("AI TEACHER // ATTENTIVE LISTENING");
        } else {
            setActiveTopic(0);
            setStatusText("EXPLAINING // 3D FOCUS: FREELY GIVEN");
        }
    }, [speaking]);

    /* =========================================================
       1. PRELOAD ASSETS & BUILD PRECISE MASKS
    ========================================================= */
    useEffect(() => {
        let loaded = 0;
        const keys = Object.keys(ASSETS);
        const total = keys.length;

        keys.forEach((key) => {
            const img = new Image();
            img.onload = () => {
                if (++loaded >= total) imgs.current.loaded = true;
            };
            img.src = ASSETS[key];
            imgs.current[key] = img;
        });

        // ── True Lip Mask (centered at 446, 547) ──
        const mCanvas = document.createElement("canvas");
        mCanvas.width  = 768;
        mCanvas.height = 1376;
        const mCtx = mCanvas.getContext("2d");
        const { cx, cy, rxInner, rxOuter, ryOuter } = MOUTH;

        mCtx.save();
        mCtx.translate(cx, cy);
        mCtx.scale(1.0, ryOuter / rxOuter);

        const grad = mCtx.createRadialGradient(0, 0, rxInner, 0, 0, rxOuter);
        grad.addColorStop(0.00, "rgba(0,0,0,1.00)");
        grad.addColorStop(0.40, "rgba(0,0,0,0.96)");
        grad.addColorStop(0.72, "rgba(0,0,0,0.50)");
        grad.addColorStop(0.92, "rgba(0,0,0,0.10)");
        grad.addColorStop(1.00, "rgba(0,0,0,0.00)");

        mCtx.fillStyle = grad;
        mCtx.beginPath();
        mCtx.arc(0, 0, rxOuter, 0, Math.PI * 2);
        mCtx.fill();
        mCtx.restore();
        maskRef.current = mCanvas;

        // ── Eye Gaze Mask ──
        const eCanvas = document.createElement("canvas");
        eCanvas.width  = 768;
        eCanvas.height = 1376;
        const eCtx = eCanvas.getContext("2d");

        [EYES.leftPupil, EYES.rightPupil].forEach(p => {
            const eGrad = eCtx.createRadialGradient(p.cx, p.cy, 2, p.cx, p.cy, 8);
            eGrad.addColorStop(0.0, "rgba(0,0,0,1.0)");
            eGrad.addColorStop(0.6, "rgba(0,0,0,0.75)");
            eGrad.addColorStop(1.0, "rgba(0,0,0,0.0)");
            eCtx.fillStyle = eGrad;
            eCtx.beginPath();
            eCtx.arc(p.cx, p.cy, 8, 0, Math.PI * 2);
            eCtx.fill();
        });
        eyeMaskRef.current = eCanvas;

        // ── Eyebrow Mask for Expression Lifting ──
        const bCanvas = document.createElement("canvas");
        bCanvas.width  = 768;
        bCanvas.height = 1376;
        const bCtx = bCanvas.getContext("2d");
        const bGrad = bCtx.createRadialGradient(435, 472, 8, 435, 472, 34);
        bGrad.addColorStop(0.0, "rgba(0,0,0,1.0)");
        bGrad.addColorStop(0.7, "rgba(0,0,0,0.7)");
        bGrad.addColorStop(1.0, "rgba(0,0,0,0.0)");
        bCtx.fillStyle = bGrad;
        bCtx.beginPath();
        bCtx.ellipse(435, 472, 36, 14, 0, 0, Math.PI * 2);
        bCtx.fill();
        browMaskRef.current = bCanvas;

        // ── Offscreen composite canvas ──
        const cCanvas = document.createElement("canvas");
        cCanvas.width  = 768;
        cCanvas.height = 1376;
        compRef.current = { canvas: cCanvas, ctx: cCanvas.getContext("2d") };

        return () => {
            Object.values(imgs.current).forEach(img => {
                if (img && img.onload) img.onload = null;
            });
        };
    }, []);

    /* =========================================================
       2. 60 FPS RENDER LOOP — EXPRESSIVE HUMAN TEACHER
    ========================================================= */
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        const render = (now) => {
            const st = S.current;
            const dt = Math.min((now - st.lastTime) / 1000, 0.05);
            st.lastTime = now;

            const W = canvas.width;
            const H = canvas.height;

            if (!imgs.current.loaded) {
                ctx.fillStyle = "#070c14";
                ctx.fillRect(0, 0, W, H);
                rafRef.current = requestAnimationFrame(render);
                return;
            }

            const im = imgs.current;
            const nowSec = now / 1000;

            /* ──────────────────────────────────────────────
               A. TEACHING GESTURES & EYE GAZE STATE MACHINE
            ────────────────────────────────────────────── */
            let targetPoint = 0.0;
            let targetGazeX = 0.0; // 0.0 = direct student eye contact

            if (st.speaking) {
                st.speechTime += dt;
                const cycle = st.speechTime % 12.0;

                if (cycle < 3.2) {
                    // PHASE 1: Point to 3D Topic #1 ("Freely Given")
                    targetPoint = 1.0;
                    if (cycle < 1.6) {
                        targetGazeX = -2.2; // Glance at 3D topic
                        st.gazeTarget = "topic";
                    } else {
                        targetGazeX = 0.0;  // Turn back to make direct student eye contact
                        st.gazeTarget = "student";
                    }
                    if (st.activeTopicIndex !== 0) {
                        st.activeTopicIndex = 0;
                        setActiveTopic(0);
                        setStatusText("EXPLAINING // 3D FOCUS: FREELY GIVEN");
                    }
                } else if (cycle < 6.8) {
                    // PHASE 2: Direct explanation with engaging head nods
                    targetPoint = 0.0;
                    targetGazeX = 0.0;
                    st.gazeTarget = "student";
                    if (st.activeTopicIndex !== 1) {
                        st.activeTopicIndex = 1;
                        setActiveTopic(1);
                        setStatusText("EXPLAINING // 3D FOCUS: PERSONAL BOUNDARIES");
                    }
                } else if (cycle < 9.6) {
                    // PHASE 3: Point to 3D Topic #3 ("Always Reversible")
                    targetPoint = 1.0;
                    if (cycle < 8.0) {
                        targetGazeX = -2.0;
                        st.gazeTarget = "topic";
                    } else {
                        targetGazeX = 0.0;
                        st.gazeTarget = "student";
                    }
                    if (st.activeTopicIndex !== 2) {
                        st.activeTopicIndex = 2;
                        setActiveTopic(2);
                        setStatusText("EXPLAINING // 3D FOCUS: ALWAYS REVERSIBLE");
                    }
                } else {
                    // PHASE 4: Warm resting engagement
                    targetPoint = 0.0;
                    targetGazeX = 0.0;
                    st.gazeTarget = "student";
                    if (st.activeTopicIndex !== -1) {
                        st.activeTopicIndex = -1;
                        setActiveTopic(-1);
                        setStatusText("EXPLAINING // DIRECT ENGAGEMENT");
                    }
                }
            } else {
                targetPoint = 0.0;
                targetGazeX = 0.0;
                st.gazeTarget = "student";
            }

            // Smooth cross-fade interpolation
            st.pointWeight = lerp(st.pointWeight, targetPoint, dt * 4.0);
            st.gazeX       = lerp(st.gazeX, targetGazeX, dt * 5.0);

            /* ──────────────────────────────────────────────
               B. NATURAL HUMAN HEAD NODS & EXPRESSIONS
               Multi-layer biomechanical model:
                 Layer 1 — Slow organic drift  (0.55 Hz, always-on)
                 Layer 2 — Syllable micro-nod  (fired on speech amplitude peaks)
                 Layer 3 — Emphasis nod        (sporadic ~3-6 s, strong intentional nod)
                 Tilt   — Slow pendular drift  (0.28 Hz) + micro direction jitter
            ────────────────────────────────────────────── */
            const amp = getAmplitude();
            const bands = getFrequencyBands();
            const power = amp * 2.8 + bands.low * 1.5;

            let targetNod  = 0.0;
            let targetTilt = 0.0;
            let targetBrow = 0.0;

            if (st.speaking) {
                /* --- Layer 1: Slow organic body-sway nod (always on while speaking) ---
                   Combines two slow, slightly detuned sines to avoid periodicity.      */
                const drift1 = Math.sin(nowSec * 0.55 * Math.PI * 2) * 1.1;
                const drift2 = Math.sin(nowSec * 0.31 * Math.PI * 2 + 1.7) * 0.55;
                st.nodDrift = drift1 + drift2;   // range ≈ -1.65 … +1.65 px

                /* --- Layer 2: Per-syllable micro-nod gated by speech power ---
                   Uses a 3.5 Hz oscillator gated hard by power so it only
                   fires when amplitude is above the speaking threshold.              */
                const syllableOsc = Math.sin(nowSec * 3.5 * Math.PI * 2);
                const syllableGate = Math.max(0, Math.min(1, (power - 0.08) * 5.0));
                st.nodSyllable = syllableOsc * syllableGate * 2.4;  // ≈ 2.4 px

                /* --- Layer 3: Sporadic emphasis nod (natural teacher agreement nod) ---
                   Fires every ~3-6 seconds with a random magnitude.                 */
                if (!st.emphasisActive) {
                    st.emphasisTimer -= dt;
                    if (st.emphasisTimer <= 0) {
                        st.emphasisActive = true;
                        st.emphasisPhase  = 0.0;
                        // Next emphasis nod in 3.5 – 7.5 s
                        st.emphasisTimer  = 3.5 + Math.random() * 4.0;
                    }
                } else {
                    // Run a single smooth dip-and-rise (one full nod, ~0.4 s)
                    st.emphasisPhase += dt * 8.0;  // completes in ~0.39 s
                    if (st.emphasisPhase >= 1.0) {
                        st.emphasisActive = false;
                        st.emphasisPhase  = 0.0;
                    }
                }
                // Smoothstep for organic ease-in/out nod shape
                const emphasisCurve = st.emphasisActive
                    ? Math.sin(st.emphasisPhase * Math.PI) * (2.5 + Math.random() * 1.2)
                    : 0.0;
                st.nodEmphasis = emphasisCurve;

                targetNod = st.nodDrift + st.nodSyllable + st.nodEmphasis;

                /* --- Tilt: slow pendular sway + micro directional jitter ---
                   Primary tilt changes direction every ~4 s.                        */
                const tiltBase  = Math.sin(nowSec * 0.28 * Math.PI * 2) * 0.010;
                const tiltQuick = Math.sin(nowSec * 1.15 * Math.PI * 2) * 0.005
                                * Math.min(1, power * 3.0);
                targetTilt = tiltBase + tiltQuick;

                // Eyebrows lift on speech peaks
                targetBrow = Math.max(0, (power - 0.20) * 2.6);

            } else {
                /* --- Idle: gentle breathing-sway, very slow ---                    */
                targetNod  = Math.sin(nowSec * 0.22 * Math.PI * 2) * 0.55
                           + Math.sin(nowSec * 0.13 * Math.PI * 2) * 0.25;
                targetTilt = Math.sin(nowSec * 0.18 * Math.PI * 2) * 0.004;
                targetBrow = 0.0;

                // Reset emphasis state so next speech starts cleanly
                st.emphasisActive = false;
                st.emphasisPhase  = 0.0;
                st.emphasisTimer  = 1.5 + Math.random() * 2.0;
            }

            // Different lerp speeds for organic feel:
            // headNod chases quickly (speech syllables need snappy response)
            // headTilt changes slowly (direction changes are gradual)
            st.headNod  = lerp(st.headNod,  targetNod,  dt * 9.0);
            st.headTilt = lerp(st.headTilt, targetTilt, dt * 3.5);
            st.browLift = lerp(st.browLift, targetBrow, dt * 11);

            /* ──────────────────────────────────────────────
               C. NATURAL IN-PLACE BLINKING
            ────────────────────────────────────────────── */
            if (nowSec >= st.nextBlinkTime && !st.isBlinking) {
                st.isBlinking = true;
                st.blinkProgress = 0.0;
            }
            if (st.isBlinking) {
                st.blinkProgress += dt * 8.0; // ~125ms blink
                if (st.blinkProgress >= 1.0) {
                    st.isBlinking = false;
                    st.blinkProgress = 0.0;
                    st.nextBlinkTime = nowSec + 3.6 + Math.random() * 2.2;
                }
            }

            /* ──────────────────────────────────────────────
               D. WORD-SYNCHRONIZED LIP TARGET
            ────────────────────────────────────────────── */
            let targetMouth = 0.0;
            if (st.speaking) {
                targetMouth = getMouthTarget();
            }

            const mSpeed = targetMouth > st.mouthOpenness ? dt * 28 : dt * 16;
            st.mouthOpenness = Math.max(0, Math.min(1,
                lerp(st.mouthOpenness, targetMouth, mSpeed)
            ));

            /* ──────────────────────────────────────────────
               E. MULTI-LAYER 60 FPS DRAW (LOCKED LIPS)
            ────────────────────────────────────────────── */
            ctx.clearRect(0, 0, W, H);

            // Save outer context
            ctx.save();

            // Apply unified anatomical head transform around neck pivot (446, 640)
            // Because lipsync is rendered inside THIS SAME transform,
            // the lips stay 100.000% locked to her mouth with ZERO drift!
            ctx.translate(PIVOT.x, PIVOT.y);
            ctx.rotate(st.headTilt);
            ctx.translate(-PIVOT.x, -PIVOT.y + st.headNod);

            // 1. BASE BODY & HEAD
            ctx.drawImage(im.closed, 0, 0, W, H);

            // 2. NATURAL POINTING HAND GESTURE (Aligned with sub-pixel precision)
            if (st.pointWeight > 0.008) {
                ctx.save();
                ctx.globalAlpha = Math.min(1.0, st.pointWeight);
                // Shift by dx=+2, dy=+2 to align her head and face with im.closed
                ctx.drawImage(im.point, 2, 2, W, H);
                ctx.restore();
            }

            // 3. EXPRESSIVE EYEBROW LIFT ON EMPHASIS
            if (st.browLift > 0.02 && browMaskRef.current) {
                const { ctx: cCtx, canvas: cCv } = compRef.current;
                cCtx.clearRect(0, 0, W, H);
                // Draw eyebrow patch lifted upward by 1.8px
                cCtx.drawImage(im.closed, 0, -1.8, W, H);
                cCtx.globalCompositeOperation = "destination-in";
                cCtx.drawImage(browMaskRef.current, 0, 0, W, H);
                cCtx.globalCompositeOperation = "source-over";

                ctx.save();
                ctx.globalAlpha = Math.min(1.0, st.browLift);
                ctx.drawImage(cCv, 0, 0, W, H);
                ctx.restore();
            }

            // 4. EYE GAZE SHIFT & IN-PLACE BLINKING
            const gaze = st.gazeX;
            if (Math.abs(gaze) > 0.1 && eyeMaskRef.current) {
                const { ctx: cCtx, canvas: cCv } = compRef.current;
                cCtx.clearRect(0, 0, W, H);
                cCtx.drawImage(im.closed, gaze, 0, W, H);
                cCtx.globalCompositeOperation = "destination-in";
                cCtx.drawImage(eyeMaskRef.current, 0, 0, W, H);
                cCtx.globalCompositeOperation = "source-over";

                ctx.save();
                ctx.globalAlpha = 0.85;
                ctx.drawImage(cCv, 0, 0, W, H);
                ctx.restore();
            }

            // Natural eyelid blink arc
            if (st.isBlinking) {
                const bHeight = Math.sin(st.blinkProgress * Math.PI) * 7.0;
                ctx.save();
                ctx.fillStyle = "rgba(188, 142, 126, 0.95)";
                ctx.beginPath();
                ctx.ellipse(EYES.leftPupil.cx, EYES.leftPupil.cy - 1, 9, bHeight, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(EYES.rightPupil.cx, EYES.rightPupil.cy - 1, 9, bHeight, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            // 5. TRUE ANATOMICAL LIP-SYNC LOCKED TO HER MOUTH (446, 547)
            const op = st.mouthOpenness;
            if (op > 0.015 && maskRef.current) {
                const { ctx: cCtx, canvas: cCv } = compRef.current;
                cCtx.clearRect(0, 0, W, H);

                // Blend mouth frames
                if (op <= 0.5) {
                    const f = smoothstep(op / 0.5);
                    cCtx.drawImage(im.closed, 0, 0, W, H);
                    cCtx.globalAlpha = f;
                    cCtx.drawImage(im.mid, 0, 0, W, H);
                    cCtx.globalAlpha = 1.0;
                } else {
                    const f = smoothstep((op - 0.5) / 0.5);
                    cCtx.drawImage(im.mid, 0, 0, W, H);
                    cCtx.globalAlpha = f;
                    cCtx.drawImage(im.open, 0, 0, W, H);
                    cCtx.globalAlpha = 1.0;
                }

                // Mask strictly to the lip vermilion border (rx: 26, ry: 12)
                cCtx.globalCompositeOperation = "destination-in";
                cCtx.drawImage(maskRef.current, 0, 0, W, H);
                cCtx.globalCompositeOperation = "source-over";

                // Draw mouth patch directly onto her face inside the unified transform
                ctx.drawImage(cCv, 0, 0, W, H);
            }

            ctx.restore();
            rafRef.current = requestAnimationFrame(render);
        };

        S.current.lastTime = performance.now();
        rafRef.current = requestAnimationFrame(render);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    /* =========================================================
       3. RENDER UI WITH 3D TOPIC EXPLANATIONS
    ========================================================= */
    const isPointing = speaking && (activeTopic === 0 || activeTopic === 2);

    return (
        <div className="teacher-live-container">
            <div className="teacher-viewport-9-16">
                <canvas
                    ref={canvasRef}
                    width={768}
                    height={1376}
                    className="teacher-live-canvas"
                />

                {/* Glowing Holographic Pointer Beam when Pointing */}
                {isPointing && (
                    <div className={`hologram-pointer-beam target-topic-${activeTopic}`} />
                )}

                {/* 3D Floating Educational Overlay */}
                <div className="consent-3d-overlay">
                    <div className="consent-topic-badge">
                        <span className="topic-beacon" />
                        <span className="topic-text">3D CORE LESSON // CONSENT &amp; RESPECT</span>
                    </div>

                    {/* 3D Principle Cards with Dynamic Focus */}
                    <div className={`floating-3d-element badge-agreement ${activeTopic === 0 ? "active-focus" : ""}`}>
                        <span className="badge-icon">✓</span>
                        <div className="badge-content">
                            <strong>Freely Given</strong>
                            <small>No pressure, enthusiastic choice</small>
                        </div>
                        {activeTopic === 0 && <span className="focus-pulse-glow" />}
                    </div>

                    <div className={`floating-3d-element badge-boundaries ${activeTopic === 1 ? "active-focus" : ""}`}>
                        <span className="badge-icon">◎</span>
                        <div className="badge-content">
                            <strong>Personal Boundaries</strong>
                            <small>Clear, honored &amp; protected limits</small>
                        </div>
                        {activeTopic === 1 && <span className="focus-pulse-glow" />}
                    </div>

                    <div className={`floating-3d-element badge-reversible ${activeTopic === 2 ? "active-focus" : ""}`}>
                        <span className="badge-icon">⇄</span>
                        <div className="badge-content">
                            <strong>Always Reversible</strong>
                            <small>Can change mind anytime, without guilt</small>
                        </div>
                        {activeTopic === 2 && <span className="focus-pulse-glow" />}
                    </div>

                    {/* Live Broadcast Tag */}
                    <div className="live-camera-tag">
                        <span className="rec-dot" />
                        <span>AI TEACHER // 3D BROADCAST</span>
                        <span className="gesture-indicator">
                            {statusText}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}