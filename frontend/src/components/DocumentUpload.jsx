import { useRef, useState } from "react";
import { FileText, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { uploadDocument } from "../services/documentApi";

export default function DocumentUpload({ onDocumentLoaded }) {
    const fileInput = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [document, setDocument] = useState(null);
    const [error, setError] = useState("");

    function openFilePicker() {
        fileInput.current?.click();
    }

    async function handleFileChange(event) {
        const file = event.target.files?.[0];
        if (!file) return;

        const validExts = [".pdf", ".docx", ".doc", ".pptx", ".ppt", ".txt", ".md"];
        const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();

        if (!validExts.includes(ext)) {
            setError("Supported formats: PDF, DOCX, PPTX, TXT, MD.");
            return;
        }

        setError("");
        setDocument(null);
        setUploading(true);

        try {
            const result = await uploadDocument(file);
            setDocument(result);
            if (onDocumentLoaded) {
                onDocumentLoaded(result);
            }
        } catch (err) {
            console.error("Document upload error:", err);
            setError("Could not process this document. Please try a different file.");
        } finally {
            setUploading(false);
        }
    }

    return (
        <div className="document-upload">
            <input
                ref={fileInput}
                type="file"
                accept=".pdf,.docx,.doc,.pptx,.ppt,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                onChange={handleFileChange}
                hidden
            />

            <button
                type="button"
                className="document-button"
                onClick={openFilePicker}
                disabled={uploading}
                title="Upload Textbook, Notes, PPT, or Research Paper"
            >
                {uploading ? (
                    <>
                        <span className="spinner-dots small"></span>
                        <span>INDEXING RAG...</span>
                    </>
                ) : (
                    <>
                        <Upload size={14} />
                        <span>UPLOAD MATERIAL</span>
                    </>
                )}
            </button>

            {document && (
                <div className="document-status" title={`${document.filename} (${document.chunks || document.new_chunks} knowledge chunks indexed)`}>
                    <span className="document-icon">◈</span>
                    <div>
                        <strong>{document.filename}</strong>
                        <small>
                            {document.chunks || document.new_chunks} chunks • {document.format || "RAG Grounded"}
                        </small>
                    </div>
                </div>
            )}

            {error && (
                <div className="document-error">
                    <AlertCircle size={13} />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}