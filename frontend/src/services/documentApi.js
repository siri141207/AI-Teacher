const API_URL = "http://127.0.0.1:8000/api";

// ======================================================
// UPLOAD PDF
// ======================================================

export async function uploadDocument(file) {
    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch(
        `${API_URL}/documents/upload`,
        {
            method: "POST",
            body: formData
        }
    );

    if (!response.ok) {
        const detail = await response.text();

        throw new Error(
            `Document upload failed: ${response.status} ${detail}`
        );
    }

    return response.json();
}


// ======================================================
// SEARCH PDF
// ======================================================

export async function searchDocument(
    query,
    topK = 5
) {
    const response = await fetch(
        `${API_URL}/documents/search`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                query,
                top_k: topK
            })
        }
    );

    if (!response.ok) {
        const detail = await response.text();

        throw new Error(
            `Document search failed: ${response.status} ${detail}`
        );
    }

    return response.json();
}