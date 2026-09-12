import os

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from ai.document_processor import extract_pdf_text
from ai.rag import split_text, build_index, search_documents


router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/documents/upload")
async def upload_document(file: UploadFile = File(...)):

    print("========== DOCUMENT UPLOAD STARTED ==========")
    print(f"Filename: {file.filename}")
    print(f"Content type: {file.content_type}")

    try:
        # 1. Check filename
        if not file.filename:
            return JSONResponse(
                status_code=400,
                content={"status": "error", "message": "No file provided."}
            )

        # 2. Check extension
        if not file.filename.lower().endswith(".pdf"):
            return JSONResponse(
                status_code=400,
                content={
                    "status": "error",
                    "message": "Currently only PDF files are supported."
                }
            )

        # 3. Read file
        content = await file.read()

        print(f"Received bytes: {len(content)}")

        if not content:
            return JSONResponse(
                status_code=400,
                content={
                    "status": "error",
                    "message": "Uploaded file contains no data."
                }
            )

        # 4. Save file
        safe_filename = os.path.basename(file.filename)
        file_path = os.path.join(UPLOAD_DIR, safe_filename)

        with open(file_path, "wb") as output:
            output.write(content)

        print(f"Saved file: {file_path}")
        print(f"Saved size: {os.path.getsize(file_path)} bytes")

        # 5. Extract PDF text
        try:
            text = extract_pdf_text(file_path)
        except Exception as error:
            print(f"PDF EXTRACTION ERROR: {error}")

            return JSONResponse(
                status_code=400,
                content={
                    "status": "error",
                    "message": f"Document text extraction failed: {str(error)}"
                }
            )

        print(f"Extracted characters: {len(text)}")

        if not text.strip():
            return JSONResponse(
                status_code=400,
                content={
                    "status": "error",
                    "message": (
                        "Could not extract text from this PDF. "
                        "Make sure the PDF contains selectable text."
                    )
                }
            )

        # 6. Build RAG index
        try:
            chunks = split_text(text)
            number_of_chunks = build_index(chunks)

            print(f"RAG chunks created: {number_of_chunks}")

        except Exception as error:
            print(f"RAG ERROR: {error}")

            return JSONResponse(
                status_code=500,
                content={
                    "status": "error",
                    "message": f"RAG indexing failed: {str(error)}"
                }
            )

        # 7. SUCCESS
        print("========== DOCUMENT UPLOAD SUCCESS ==========")

        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "filename": file.filename,
                "characters": len(text),
                "chunks": number_of_chunks,
                "message": "Document processed successfully."
            }
        )

    except Exception as error:

        print("========== UNEXPECTED UPLOAD ERROR ==========")
        print(str(error))

        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": f"Unexpected upload error: {str(error)}"
            }
        )


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
