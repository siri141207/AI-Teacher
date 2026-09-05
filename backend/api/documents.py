import os
from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException
)
from pydantic import BaseModel

from ai.document_processor import (
    extract_document_text
)
from ai.rag import (
    split_text,
    append_to_index,
    build_index,
    search_documents,
    search_documents_detailed
)


router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

SUPPORTED_EXTENSIONS = {
    ".pdf": "PDF Document",
    ".docx": "Word Document (DOCX)",
    ".doc": "Word Document (DOC)",
    ".pptx": "PowerPoint Presentation (PPTX)",
    ".ppt": "PowerPoint Presentation (PPT)",
    ".txt": "Text Notes",
    ".md": "Markdown Notes"
}


# ==================================================
# UPLOAD MULTI-FORMAT DOCUMENT
# ==================================================

@router.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...)
):
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file provided."
        )

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported format '{ext}'. Supported formats: PDF, DOCX, PPTX, TXT, MD."
        )

    file_path = os.path.join(
        UPLOAD_DIR,
        file.filename
    )

    content = await file.read()
    with open(file_path, "wb") as output:
        output.write(content)

    try:
        text = extract_document_text(file_path)
    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=f"Document text extraction failed: {error}"
        )

    if not text.strip():
        raise HTTPException(
            status_code=400,
            detail="Could not extract any readable text from this document."
        )

    chunks = split_text(text)
    # Append to existing index so students can upload textbooks, syllabus and notes together
    total_chunks = append_to_index(chunks)

    return {
        "status": "success",
        "filename": file.filename,
        "format": SUPPORTED_EXTENSIONS.get(ext, ext),
        "characters": len(text),
        "new_chunks": len(chunks),
        "total_chunks": total_chunks,
        "message": f"Successfully parsed {file.filename} into {len(chunks)} searchable knowledge segments."
    }


# ==================================================
# SEARCH DOCUMENT
# ==================================================

class SearchRequest(BaseModel):
    query: str
    top_k: int = 5


@router.post("/documents/search")
def search_document(
    request: SearchRequest
):
    try:
        results = search_documents_detailed(
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