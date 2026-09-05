import { useState, useRef } from "react";
import { transcribeVoice } from "../services/api";

function VoiceButton({ onTranscript }) {
    const [recording, setRecording] = useState(false);
    const recorderRef = useRef(null);
    const chunksRef = useRef([]);

    async function startRecording() {
        try {
            const stream =
                await navigator.mediaDevices.getUserMedia({
                    audio: true
                });

            const recorder =
                new MediaRecorder(stream);

            recorderRef.current = recorder;
            chunksRef.current = [];

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            recorder.onstop = async () => {
                const audioBlob = new Blob(
                    chunksRef.current,
                    {
                        type: "audio/webm"
                    }
                );

                try {
                    const result =
                        await transcribeVoice(audioBlob);

                    if (result.text) {
                        onTranscript(result.text);
                    }
                } catch (error) {
                    console.error(
                        "Voice transcription error:",
                        error
                    );
                }

                stream
                    .getTracks()
                    .forEach((track) => track.stop());
            };

            recorder.start();

            setRecording(true);

        } catch (error) {
            console.error(
                "Microphone error:",
                error
            );
        }
    }

    function stopRecording() {
        if (
            recorderRef.current &&
            recorderRef.current.state !== "inactive"
        ) {
            recorderRef.current.stop();
        }

        setRecording(false);
    }

    function toggleRecording() {
        if (recording) {
            stopRecording();
        } else {
            startRecording();
        }
    }

    return (
        <button
            type="button"
            className={`voice-button ${
                recording ? "recording" : ""
            }`}
            onClick={toggleRecording}
            title={
                recording
                    ? "Stop recording"
                    : "Talk to Lilly"
            }
        >
            {recording ? "■" : "🎙"}
        </button>
    );
}

export default VoiceButton;