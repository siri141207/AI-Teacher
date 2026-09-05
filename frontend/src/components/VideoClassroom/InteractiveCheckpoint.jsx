import { useState, useRef } from "react";
import { 
    AlertCircle, 
    Award, 
    CheckCircle2, 
    HelpCircle, 
    Mic, 
    RefreshCw, 
    Send, 
    Sparkles, 
    Volume2, 
    Zap 
} from "lucide-react";
import { diagnoseMisconception, transcribeVoice, playTeacherAudio } from "../../services/api";

export default function InteractiveCheckpoint({
    checkpoint,
    topic,
    level = "beginner",
    language = "English",
    persona = "lilly",
    onComplete
}) {
    const [selectedOption, setSelectedOption] = useState(null);
    const [textAnswer, setTextAnswer] = useState("");
    const [evaluating, setEvaluating] = useState(false);
    const [evaluation, setEvaluation] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const isMCQ = checkpoint?.type === "mcq" && checkpoint?.options && checkpoint.options.length > 0;

    // Handle voice answer recording
    async function startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                try {
                    setEvaluating(true);
                    const res = await transcribeVoice(audioBlob);
                    const voiceText = res.text || "";
                    setTextAnswer(voiceText);
                    await evaluateAnswer(voiceText);
                } catch (e) {
                    console.error("Audio transcription error:", e);
                } finally {
                    setEvaluating(false);
                }
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Microphone access error:", err);
            alert("Microphone access is needed to answer by voice.");
        }
    }

    function stopRecording() {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    }

    async function handleSubmit() {
        const studentAns = isMCQ ? selectedOption : textAnswer.trim();
        if (!studentAns) return;
        await evaluateAnswer(studentAns);
    }

    async function evaluateAnswer(answerText) {
        setEvaluating(true);
        try {
            const res = await diagnoseMisconception({
                topic,
                question: checkpoint.question,
                student_answer: answerText,
                expected_answer: checkpoint.correct_answer,
                language,
                level,
                persona
            });
            setEvaluation(res);

            // Have teacher speak the feedback
            const feedbackText = res.is_correct 
                ? (res.encouragement || "Great job! That's completely correct.")
                : `${res.explanation} ${res.alternative_analogy || ""}`;
            
            playTeacherAudio({
                text: feedbackText,
                language,
                persona
            }).catch(() => {});

        } catch (err) {
            console.error("Misconception diagnosis failed:", err);
            // Fallback evaluation
            const isMatch = answerText.toLowerCase().includes(checkpoint.correct_answer.toLowerCase().slice(0, 4));
            setEvaluation({
                is_correct: isMatch,
                confidence_score: 0.8,
                diagnosed_misconception: isMatch ? null : "Reviewing the inverse relationship between parameters.",
                explanation: isMatch ? "Spot on! You nailed the core idea." : `The expected answer was: ${checkpoint.correct_answer}.`,
                alternative_analogy: "Remember how fluids flow faster through wider openings with less resistance.",
                remedial_example: "Double checking the formula helps solidify the rule.",
                followup_check_question: "Ready to continue?",
                encouragement: "Keep going, you are making great progress!"
            });
        } finally {
            setEvaluating(false);
        }
    }

    function handleFinish() {
        if (onComplete) {
            onComplete({
                question: checkpoint.question,
                student_answer: isMCQ ? selectedOption : textAnswer,
                correct_answer: checkpoint.correct_answer,
                is_correct: evaluation?.is_correct || false
            });
        }
    }

    return (
        <div className="checkpoint-overlay">
            <div className="checkpoint-modal">
                <div className="checkpoint-header">
                    <div className="checkpoint-badge">
                        <HelpCircle size={16} />
                        <span>IN-LESSON CONCEPT CHECK</span>
                    </div>
                    <div className="checkpoint-subtext">
                        The AI Teacher is checking your understanding before advancing.
                    </div>
                </div>

                <div className="checkpoint-question-card">
                    <h3>{checkpoint.question}</h3>
                    {checkpoint.hint && (
                        <div className="checkpoint-hint">
                            <Sparkles size={14} />
                            <span>Hint: {checkpoint.hint}</span>
                        </div>
                    )}
                </div>

                {!evaluation ? (
                    <div className="checkpoint-answer-area">
                        {isMCQ ? (
                            <div className="mcq-options-grid">
                                {checkpoint.options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        className={`mcq-option-btn ${selectedOption === option ? "selected" : ""}`}
                                        onClick={() => setSelectedOption(option)}
                                    >
                                        <span className="opt-letter">
                                            {String.fromCharCode(65 + idx)}
                                        </span>
                                        <span className="opt-text">{option}</span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="open-answer-box">
                                <textarea
                                    className="open-textarea"
                                    placeholder="Explain in your own words..."
                                    value={textAnswer}
                                    onChange={(e) => setTextAnswer(e.target.value)}
                                    rows={3}
                                />
                                <div className="voice-answer-row">
                                    <button
                                        type="button"
                                        className={`voice-mic-btn ${isRecording ? "recording" : ""}`}
                                        onClick={isRecording ? stopRecording : startRecording}
                                    >
                                        <Mic size={16} />
                                        {isRecording ? "Recording... (Click to stop)" : "Speak Answer"}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="checkpoint-submit-bar">
                            <button
                                type="button"
                                className="submit-answer-btn"
                                disabled={evaluating || (!selectedOption && !textAnswer.trim())}
                                onClick={handleSubmit}
                            >
                                {evaluating ? "Diagnosing Understanding..." : "Submit Answer ➤"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className={`diagnosis-result-card ${evaluation.is_correct ? "correct" : "remedial"}`}>
                        <div className="result-header">
                            {evaluation.is_correct ? (
                                <>
                                    <CheckCircle2 size={24} className="icon-correct" />
                                    <div>
                                        <h4>Excellent Understanding!</h4>
                                        <p>{evaluation.encouragement}</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <AlertCircle size={24} className="icon-remedial" />
                                    <div>
                                        <h4>Let's Clarify This Concept</h4>
                                        <p>Misconception Identified: {evaluation.diagnosed_misconception || "Common mental model trap"}</p>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="diagnosis-body">
                            <div className="explanation-paragraph">
                                <strong>Teacher's Explanation:</strong> {evaluation.explanation}
                            </div>

                            {evaluation.alternative_analogy && (
                                <div className="analogy-box">
                                    <div className="analogy-title">
                                        <Zap size={14} /> Real-World Analogy:
                                    </div>
                                    <p>{evaluation.alternative_analogy}</p>
                                </div>
                            )}

                            {evaluation.remedial_example && (
                                <div className="remedial-box">
                                    <strong>Concrete Example:</strong> {evaluation.remedial_example}
                                </div>
                            )}

                            {evaluation.followup_check_question && !evaluation.is_correct && (
                                <div className="followup-box">
                                    <small>QUICK CHECK:</small>
                                    <p>{evaluation.followup_check_question}</p>
                                </div>
                            )}
                        </div>

                        <div className="diagnosis-footer">
                            <button
                                type="button"
                                className="continue-lesson-btn"
                                onClick={handleFinish}
                            >
                                Continue Video Lesson ▶
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
