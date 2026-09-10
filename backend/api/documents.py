import os

from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel

from ai.document_processor import extract_pdf_text
from ai.rag import split_text, build_index, search_documents


router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/documents/upload")
async def upload_document(file: UploadFile = File(...)):

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file provided."
        )

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Currently only PDF files are supported."
        )

    # Read uploaded file
    content = await file.read()

    # Check whether browser actually sent file data
    if not content:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file contains no data."
        )

    print(
        f"Received PDF: {file.filename} | "
        f"Size: {len(content)} bytes"
    )

    # Save uploaded PDF
    safe_filename = os.path.basename(file.filename)
    file_path = os.path.join(UPLOAD_DIR, safe_filename)

    try:
        with open(file_path, "wb") as output:
            output.write(content)
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Could not save uploaded file: {error}"
        )

    # Verify saved file
    saved_size = os.path.getsize(file_path)

    print(
        f"Saved PDF: {file_path} | "
        f"Size: {saved_size} bytes"
    )

    if saved_size == 0:
        raise HTTPException(
            status_code=400,
            detail="Uploaded PDF was saved as an empty file."
        )

    # Extract text
    try:
        text = extract_pdf_text(file_path)
    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=f"Document text extraction failed: {error}"
        )

    if not text.strip():
        raise HTTPException(
            status_code=400,
            detail="Could not extract text from this PDF. Make sure the PDF contains selectable text."
        )

    # Create RAG chunks/index
    try:
        chunks = split_text(text)
        number_of_chunks = build_index(chunks)
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"RAG indexing failed: {error}"
        )

    return {
        "status": "success",
        "filename": file.filename,
        "characters": len(text),
        "chunks": number_of_chunks,
        "message": "Document processed successfully."
    }


class SearchRequest(BaseModel):
    query: str
    top_k: int = 5


@router.post("/documents/search")
def search_document(request: SearchRequest):

    try:
        results = search_documents(
            request.query,
            request.top_k
        )

        return {
            "query": request.query,
            "results": results
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )
