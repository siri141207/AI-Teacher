import { useState, useEffect, useRef } from "react";
import { 
    Activity, 
    Atom, 
    Code2, 
    Compass, 
    Cpu, 
    Flame, 
    Layers, 
    Play, 
    Sliders, 
    Sparkles, 
    Zap 
} from "lucide-react";

export default function WhiteboardVisualizer({
    visualType = "whiteboard",
    visualPayload = {},
    subject = "general",
    chapterTitle = ""
}) {
    // Determine active type
    const type = visualType || "whiteboard";

    return (
        <div className="whiteboard-visualizer-container">
            <div className="whiteboard-header">
                <div className="whiteboard-meta">
                    <span className="live-badge">
                        <span className="live-dot"></span> LIVE WHITEBOARD
                    </span>
                    <span className="whiteboard-subject">
                        {subject.toUpperCase()} // {type.toUpperCase()}
                    </span>
                </div>
                <div className="whiteboard-title">{chapterTitle}</div>
            </div>

            <div className="whiteboard-canvas-area">
                {type === "simulation" && (
                    <PhysicsSimulation payload={visualPayload} />
                )}

                {type === "formula" && (
                    <FormulaVisualizer payload={visualPayload} />
                )}

                {type === "diagram" && (
                    <BiologyDiagram payload={visualPayload} />
                )}

                {type === "code_sandbox" && (
                    <CodeSandbox payload={visualPayload} />
                )}

                {type === "timeline" && (
                    <HistoryTimeline payload={visualPayload} />
                )}

                {(type === "consent" || subject.toLowerCase().includes("consent")) && (
                    <ConsentVisualizer payload={visualPayload} />
                )}

                {(type === "whiteboard" || (!["simulation", "formula", "diagram", "code_sandbox", "timeline", "consent"].includes(type) && !subject.toLowerCase().includes("consent"))) && (
                    <DefaultWhiteboard payload={visualPayload} />
                )}
            </div>
        </div>
    );
}

/* ============================================================
   1. PHYSICS INTERACTIVE SIMULATION (e.g. Ohm's Law or Newton's Law)
============================================================ */
function PhysicsSimulation({ payload }) {
    const simType = payload?.sim_type || "ohm_law";
    
    // State for Ohm's Law: V = I * R => I = V / R
    const [voltage, setVoltage] = useState(payload?.initial_params?.voltage || 12);
    const [resistance, setResistance] = useState(payload?.initial_params?.resistance || 4);
    const current = (voltage / Math.max(resistance, 0.1)).toFixed(2);
    const power = (voltage * current).toFixed(2);

    // Canvas animation for electron flow
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        let animationFrameId;
        let offset = 0;

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw circuit wire
            ctx.strokeStyle = "rgba(0, 218, 255, 0.3)";
            ctx.lineWidth = 4;
            ctx.strokeRect(40, 30, canvas.width - 80, canvas.height - 60);

            // Resistor box
            const rx = canvas.width / 2 - 40;
            const ry = 20;
            ctx.fillStyle = "#031420";
            ctx.fillRect(rx, ry, 80, 24);
            ctx.strokeStyle = "#ffb703";
            ctx.strokeRect(rx, ry, 80, 24);
            ctx.fillStyle = "#ffb703";
            ctx.font = "11px monospace";
            ctx.fillText(`R = ${resistance}Ω`, rx + 14, ry + 16);

            // Battery / Voltage source
            const bx = 30;
            const by = canvas.height / 2 - 25;
            ctx.fillStyle = "#00d9ff";
            ctx.fillRect(bx, by, 20, 50);
            ctx.fillStyle = "#01070d";
            ctx.font = "bold 10px sans-serif";
            ctx.fillText(`${voltage}V`, bx + 2, by + 28);

            // Animated electrons (speed proportional to Current I)
            const speed = Math.min(Math.max(current * 0.8, 0.5), 10);
            offset += speed;
            if (offset > 24) offset = 0;

            const w = canvas.width - 80;
            const h = canvas.height - 60;
            const perimeter = 2 * (w + h);
            const numParticles = 24;

            ctx.fillStyle = "#00f0ff";
            for (let i = 0; i < numParticles; i++) {
                const dist = (i * (perimeter / numParticles) + offset * 8) % perimeter;
                let px, py;
                if (dist < w) {
                    px = 40 + dist;
                    py = 30;
                } else if (dist < w + h) {
                    px = 40 + w;
                    py = 30 + (dist - w);
                } else if (dist < 2 * w + h) {
                    px = 40 + w - (dist - (w + h));
                    py = 30 + h;
                } else {
                    px = 40;
                    py = 30 + h - (dist - (2 * w + h));
                }
                ctx.beginPath();
                ctx.arc(px, py, 3, 0, Math.PI * 2);
                ctx.fill();
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => cancelAnimationFrame(animationFrameId);
    }, [voltage, resistance, current]);

    return (
        <div className="physics-sim-panel">
            <div className="sim-title-bar">
                <span className="sim-tag"><Zap size={14} /> Interactive Physics Lab</span>
                <h4>{payload?.title || "Ohm's Law Live Circuit Simulation (V = I × R)"}</h4>
            </div>

            <div className="circuit-display">
                <canvas ref={canvasRef} width={420} height={180} className="circuit-canvas" />
                
                <div className="multimeter-hud">
                    <div className="meter-card volt">
                        <small>VOLTAGE (V)</small>
                        <div className="meter-value">{voltage} V</div>
                    </div>
                    <div className="meter-card ohm">
                        <small>RESISTANCE (R)</small>
                        <div className="meter-value">{resistance} Ω</div>
                    </div>
                    <div className="meter-card amp highlight">
                        <small>CURRENT (I = V/R)</small>
                        <div className="meter-value">{current} A</div>
                    </div>
                    <div className="meter-card watt">
                        <small>POWER (P = V×I)</small>
                        <div className="meter-value">{power} W</div>
                    </div>
                </div>
            </div>

            <div className="sim-controls">
                <div className="control-slider">
                    <label>
                        <span>Voltage (V): <strong>{voltage} V</strong></span>
                    </label>
                    <input 
                        type="range" 
                        min="1" 
                        max="36" 
                        value={voltage} 
                        onChange={(e) => setVoltage(Number(e.target.value))} 
                    />
                </div>
                <div className="control-slider">
                    <label>
                        <span>Resistance (R): <strong>{resistance} Ω</strong></span>
                    </label>
                    <input 
                        type="range" 
                        min="1" 
                        max="20" 
                        value={resistance} 
                        onChange={(e) => setResistance(Number(e.target.value))} 
                    />
                </div>
            </div>

            <div className="sim-takeaway">
                <Sparkles size={14} className="sparkle-icon" />
                <span>
                    {payload?.explanation || `Key Insight: Notice that increasing Resistance restricts the flow, decreasing Current proportionally (I = V / R).`}
                </span>
            </div>
        </div>
    );
}

/* ============================================================
   2. MATHEMATICS FORMULA & FUNCTION PLOTTER
============================================================ */
function FormulaVisualizer({ payload }) {
    const canvasRef = useRef(null);
    const [sliderParam, setSliderParam] = useState(1);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const w = canvas.width;
        const h = canvas.height;
        const cx = w / 2;
        const cy = h / 2;

        // Grid lines
        ctx.strokeStyle = "rgba(0, 218, 255, 0.1)";
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 30) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }
        for (let y = 0; y < h; y += 30) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        // Axes
        ctx.strokeStyle = "rgba(0, 218, 255, 0.4)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(w, cy);
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, h);
        ctx.stroke();

        // Plot function y = sliderParam * sin(x * 0.05) or y = a * x^2
        ctx.strokeStyle = "#00d9ff";
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let px = 0; px < w; px++) {
            const x = (px - cx) * 0.08;
            const y = Math.sin(x * sliderParam) * 45;
            const py = cy - y;
            if (px === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Formula label on canvas
        ctx.fillStyle = "#ffb703";
        ctx.font = "12px monospace";
        ctx.fillText(`f(x) = sin(${sliderParam} · x)`, 20, 25);
    }, [sliderParam]);

    return (
        <div className="formula-visualizer-panel">
            <div className="latex-showcase">
                <div className="latex-formula">
                    {payload?.formula_latex || "f(x) = \\int_{a}^{b} \\psi(x) dx = \\lambda"}
                </div>
                <div className="formula-caption">{payload?.title || "Mathematical Expression"}</div>
            </div>

            <div className="plotter-section">
                <div className="plotter-controls">
                    <span>Frequency / Scale factor: <strong>{sliderParam}x</strong></span>
                    <input 
                        type="range" 
                        min="0.5" 
                        max="4" 
                        step="0.5" 
                        value={sliderParam} 
                        onChange={(e) => setSliderParam(Number(e.target.value))} 
                    />
                </div>
                <canvas ref={canvasRef} width={420} height={160} className="plotter-canvas" />
            </div>

            {payload?.step_by_step && payload.step_by_step.length > 0 && (
                <div className="step-by-step-box">
                    <h5>DERIVATION & STEPS:</h5>
                    <ol>
                        {payload.step_by_step.map((step, idx) => (
                            <li key={idx}>{step}</li>
                        ))}
                    </ol>
                </div>
            )}

            {payload?.key_takeaway && (
                <div className="formula-takeaway">
                    <strong>Rule:</strong> {payload.key_takeaway}
                </div>
            )}
        </div>
    );
}

/* ============================================================
   3. BIOLOGY & ANATOMY LABELED DIAGRAM
============================================================ */
function BiologyDiagram({ payload }) {
    const [selectedOrganelle, setSelectedOrganelle] = useState(0);

    const labels = payload?.labels || [
        { name: "Nucleus", desc: "Houses the genetic material (DNA) and directs cellular activities." },
        { name: "Mitochondria", desc: "The powerhouse of the cell; produces ATP energy via respiration." },
        { name: "Ribosomes", desc: "Synthesizes proteins from amino acid building blocks." },
        { name: "Cell Membrane", desc: "Selectively permeable lipid bilayer regulating entry and exit." }
    ];

    return (
        <div className="biology-diagram-panel">
            <div className="bio-title">
                <Atom size={16} />
                <span>{payload?.organism_or_system || "Cellular Architecture & Functions"}</span>
            </div>

            <div className="bio-interactive-display">
                {/* SVG Visual Model */}
                <div className="cell-svg-wrapper">
                    <svg viewBox="0 0 300 200" className="cell-svg">
                        {/* Outer Membrane */}
                        <ellipse cx="150" cy="100" rx="130" ry="85" fill="rgba(0, 140, 255, 0.15)" stroke="#00d9ff" strokeWidth="3" />
                        {/* Cytoplasm glow */}
                        <ellipse cx="150" cy="100" rx="110" ry="70" fill="rgba(0, 255, 200, 0.05)" />
                        {/* Nucleus */}
                        <circle cx="150" cy="100" r="35" fill={selectedOrganelle === 0 ? "rgba(255, 183, 3, 0.4)" : "rgba(255, 183, 3, 0.2)"} stroke="#ffb703" strokeWidth="2" cursor="pointer" onClick={() => setSelectedOrganelle(0)} />
                        <circle cx="150" cy="100" r="14" fill="#ffb703" />
                        {/* Mitochondria */}
                        <ellipse cx="80" cy="70" rx="20" ry="10" transform="rotate(-20 80 70)" fill={selectedOrganelle === 1 ? "rgba(255, 77, 109, 0.6)" : "rgba(255, 77, 109, 0.3)"} stroke="#ff4d6d" strokeWidth="2" cursor="pointer" onClick={() => setSelectedOrganelle(1)} />
                        <ellipse cx="220" cy="130" rx="20" ry="10" transform="rotate(30 220 130)" fill={selectedOrganelle === 1 ? "rgba(255, 77, 109, 0.6)" : "rgba(255, 77, 109, 0.3)"} stroke="#ff4d6d" strokeWidth="2" cursor="pointer" onClick={() => setSelectedOrganelle(1)} />
                        {/* Ribosomes (dots) */}
                        <circle cx="100" cy="130" r="3" fill="#00f0ff" />
                        <circle cx="115" cy="140" r="3" fill="#00f0ff" />
                        <circle cx="190" cy="70" r="3" fill="#00f0ff" />
                        <circle cx="210" cy="65" r="3" fill="#00f0ff" />
                    </svg>
                </div>

                {/* Organelle Inspector */}
                <div className="organelle-cards">
                    {labels.map((item, idx) => (
                        <div 
                            key={idx} 
                            className={`organelle-item ${selectedOrganelle === idx ? "active" : ""}`}
                            onClick={() => setSelectedOrganelle(idx)}
                        >
                            <div className="organelle-name">
                                <span className="organelle-dot"></span>
                                {item.name}
                            </div>
                            <div className="organelle-desc">{item.desc}</div>
                        </div>
                    ))}
                </div>
            </div>

            {payload?.process_stages && payload.process_stages.length > 0 && (
                <div className="bio-stages">
                    <h6>PROCESS FLOW:</h6>
                    <div className="stages-row">
                        {payload.process_stages.map((stage, i) => (
                            <div key={i} className="stage-chip">
                                <span>{i + 1}</span> {stage}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ============================================================
   4. COMPUTER SCIENCE & CODE SANDBOX
============================================================ */
function CodeSandbox({ payload }) {
    const [currentStep, setCurrentStep] = useState(0);
    const code = payload?.code || `# Binary Search Algorithm
def binary_search(arr, target):
    low = 0
    high = len(arr) - 1

    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1

numbers = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
result = binary_search(numbers, 23)
print(f"Target found at index: {result}")`;

    const steps = payload?.steps || [
        { line: 2, explanation: "Initialize search bounds: low at start (index 0), high at end (index 9)." },
        { line: 6, explanation: "Compute midpoint index: mid = (0 + 9) // 2 = 4 (value: 16)." },
        { line: 9, explanation: "16 < 23, eliminate left half: shift low to mid + 1 (index 5)." },
        { line: 6, explanation: "New midpoint: mid = (5 + 9) // 2 = 7 (value: 56). 56 > 23, shift high to 6." },
        { line: 7, explanation: "Found target 23 at index 5! Returns index in O(log n) time." }
    ];

    const expectedOutput = payload?.expected_output || "Target found at index: 5";

    return (
        <div className="code-sandbox-panel">
            <div className="sandbox-header">
                <div className="sandbox-title">
                    <Code2 size={16} />
                    <span>{payload?.language?.toUpperCase() || "PYTHON"} // EXECUTION FLOW</span>
                </div>
                <div className="step-stepper">
                    <button 
                        type="button"
                        disabled={currentStep === 0} 
                        onClick={() => setCurrentStep(c => Math.max(c - 1, 0))}
                    >
                        ◀ Prev
                    </button>
                    <span>Step {currentStep + 1} of {steps.length}</span>
                    <button 
                        type="button"
                        disabled={currentStep === steps.length - 1} 
                        onClick={() => setCurrentStep(c => Math.min(c + 1, steps.length - 1))}
                    >
                        Next Step ▶
                    </button>
                </div>
            </div>

            <div className="code-editor-mock">
                <pre className="code-display">
                    <code>
                        {code.split("\n").map((line, i) => {
                            const isHighlighted = steps[currentStep]?.line === i + 1;
                            return (
                                <div key={i} className={`code-line ${isHighlighted ? "highlighted" : ""}`}>
                                    <span className="line-num">{i + 1}</span>
                                    <span className="line-text">{line}</span>
                                </div>
                            );
                        })}
                    </code>
                </pre>
            </div>

            <div className="step-explanation-card">
                <div className="step-header">
                    <Cpu size={14} /> Line Execution Inspector:
                </div>
                <p>{steps[currentStep]?.explanation || "Tracing program execution."}</p>
            </div>

            <div className="terminal-output">
                <span className="term-label">TERMINAL OUTPUT:</span>
                <span className="term-text">$ {expectedOutput}</span>
            </div>
        </div>
    );
}

/* ============================================================
   5. HISTORY & SOCIAL CHRONOLOGY TIMELINE
============================================================ */
function HistoryTimeline({ payload }) {
    const events = payload?.events || [
        { year_or_era: "1687", title: "Principia Mathematica", description: "Isaac Newton publishes the 3 Laws of Motion and Universal Gravitation." },
        { year_or_era: "1831", title: "Electromagnetic Induction", description: "Michael Faraday discovers how magnetic fields create electric currents." },
        { year_or_era: "1905", title: "Annus Mirabilis", description: "Albert Einstein revolutionizes physics with Special Relativity and Photoelectric Effect." },
        { year_or_era: "1927", title: "Solvay Conference", description: "Foundations of Quantum Mechanics established by Bohr, Heisenberg, and Planck." }
    ];

    return (
        <div className="history-timeline-panel">
            <div className="timeline-heading">
                <Compass size={16} /> Historical Milestones & Evolution
            </div>

            <div className="timeline-track">
                {events.map((evt, idx) => (
                    <div key={idx} className="timeline-node">
                        <div className="node-marker">
                            <span className="node-dot"></span>
                            <span className="node-year">{evt.year_or_era}</span>
                        </div>
                        <div className="node-card">
                            <h6>{evt.title}</h6>
                            <p>{evt.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ============================================================
   6. DEFAULT HIGH-CONTRAST DIGITAL WHITEBOARD
============================================================ */
function DefaultWhiteboard({ payload }) {
    const headline = payload?.headline || "Core Educational Concept";
    const bullets = payload?.bullet_points || [
        "Fundamental principles explained step-by-step.",
        "Real-world analogies connect theory to practice.",
        "Interactive checkpoints confirm deep understanding."
    ];
    const highlight = payload?.highlight || "Consistent practice creates permanent neural pathways of understanding.";

    return (
        <div className="default-whiteboard-panel">
            <div className="board-headline">
                <Sparkles size={20} className="glow-icon" />
                <h3>{headline}</h3>
            </div>

            <div className="board-bullets">
                {bullets.map((bullet, idx) => (
                    <div key={idx} className="board-card">
                        <div className="card-number">0{idx + 1}</div>
                        <p>{bullet}</p>
                    </div>
                ))}
            </div>

            {highlight && (
                <div className="board-highlight">
                    <div className="highlight-tag">◈ KEY TAKEAWAY</div>
                    <p>{highlight}</p>
                </div>
            )}
        </div>
    );
}

/* ============================================================
   7. CONSENT & BOUNDARIES INTERACTIVE 3D VISUALIZER
============================================================ */
function ConsentVisualizer({ payload }) {
    const [selectedFries, setSelectedFries] = useState(0);
    const [activeBoundary, setActiveBoundary] = useState(1);

    const friesPrinciples = [
        {
            letter: "F",
            word: "Freely Given",
            icon: "🕊️",
            desc: "Consent is a voluntary choice given without pressure, manipulation, fear, or guilt.",
            rule: "If someone is coerced or incapacitated, consent cannot exist."
        },
        {
            letter: "R",
            word: "Reversible",
            icon: "⇄",
            desc: "Anyone has the absolute right to change their mind at any point, even if previously agreed.",
            rule: "Consent can be stopped immediately whenever someone feels uncomfortable."
        },
        {
            letter: "I",
            word: "Informed",
            icon: "💡",
            desc: "Both parties understand exactly what is being agreed to, with total honesty.",
            rule: "Misleading someone invalidates mutual agreement."
        },
        {
            letter: "E",
            word: "Enthusiastic",
            icon: "✨",
            desc: "Consent is about active, positive participation—not silence, endurance, or passivity.",
            rule: "Silence, shrugs, or lack of physical resistance do NOT mean 'yes'."
        },
        {
            letter: "S",
            word: "Specific",
            icon: "🎯",
            desc: "Saying yes to one specific activity or topic does not mean yes to other things.",
            rule: "Each boundary must be respected individually."
        }
    ];

    const boundaries = [
        { level: 1, name: "Core Autonomy", color: "#38bdf8", radius: "80px", desc: "My physical body, private thoughts, personal choices" },
        { level: 2, name: "Comfort Zone", color: "#a855f7", radius: "150px", desc: "Agreed interactions, trusted relationships, shared activities" },
        { level: 3, name: "Social Space", color: "#34d399", radius: "220px", desc: "Everyday communication, public boundaries, casual greetings" }
    ];

    return (
        <div className="consent-visualizer-panel">
            {/* Top Interactive FRIES Framework Tabs */}
            <div className="fries-framework-bar">
                <div className="fries-heading">
                    <Sparkles size={16} className="glow-cyan" />
                    <span>THE F.R.I.E.S. CONSENT STANDARD</span>
                </div>
                <div className="fries-tabs">
                    {friesPrinciples.map((f, idx) => (
                        <button
                            key={idx}
                            type="button"
                            className={`fries-tab ${selectedFries === idx ? "active" : ""}`}
                            onClick={() => setSelectedFries(idx)}
                        >
                            <span className="fries-letter">{f.letter}</span>
                            <span className="fries-word">{f.word}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Interactive Stage: Concentric Boundaries + Card Details */}
            <div className="consent-stage-grid">
                {/* 3D Concentric Boundary Circles */}
                <div className="boundary-circle-viewport">
                    <div className="boundary-title">
                        <Compass size={15} />
                        <span>PERSONAL BOUNDARY CONCENTRIC SPHERES</span>
                    </div>

                    <div className="boundary-circles-container">
                        {boundaries.map((b, idx) => (
                            <div
                                key={b.level}
                                className={`boundary-ring ring-${b.level} ${activeBoundary === b.level ? "focused" : ""}`}
                                onClick={() => setActiveBoundary(b.level)}
                                style={{ width: b.radius, height: b.radius, borderColor: b.color }}
                            >
                                <span className="ring-label" style={{ color: b.color }}>
                                    {b.name}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="active-boundary-desc">
                        <strong style={{ color: boundaries[activeBoundary - 1].color }}>
                            {boundaries[activeBoundary - 1].name}:
                        </strong>
                        <p>{boundaries[activeBoundary - 1].desc}</p>
                    </div>
                </div>

                {/* Selected FRIES Principle Card */}
                <div className="fries-detail-card">
                    <div className="detail-card-header">
                        <span className="detail-icon">{friesPrinciples[selectedFries].icon}</span>
                        <div>
                            <h4>{friesPrinciples[selectedFries].word}</h4>
                            <span className="detail-badge">CORE PRINCIPLE</span>
                        </div>
                    </div>

                    <p className="detail-explanation">
                        {friesPrinciples[selectedFries].desc}
                    </p>

                    <div className="detail-golden-rule">
                        <div className="rule-tag">◈ GOLDEN RULE</div>
                        <p>{friesPrinciples[selectedFries].rule}</p>
                    </div>

                    {/* Interactive Checkmark Confirmation */}
                    <div className="agreement-status-pill">
                        <span className="check-dot">✓</span>
                        <span>Mutual Agreement Confirmed When All 5 Criteria Are Met</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

