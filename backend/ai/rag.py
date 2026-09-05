import os
import pickle
from typing import List, Dict, Any, Union

DATA_DIR = "data"

INDEX_PATH = os.path.join(
    DATA_DIR,
    "documents.index"
)

CHUNKS_PATH = os.path.join(
    DATA_DIR,
    "chunks.pkl"
)

os.makedirs(DATA_DIR, exist_ok=True)

# --------------------------------------------------
# Embedding Model (Lazy Loaded)
# --------------------------------------------------

_embedding_model = None


def get_embedding_model():
    global _embedding_model
    if _embedding_model is None:
        from sentence_transformers import SentenceTransformer
        _embedding_model = SentenceTransformer(
            "all-MiniLM-L6-v2"
        )
    return _embedding_model


# --------------------------------------------------
# Split Text Into Chunks
# --------------------------------------------------

def split_text(
    text: str,
    chunk_size: int = 800,
    overlap: int = 100
) -> List[str]:

    text = text.replace("\r\n", "\n")

    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        start += chunk_size - overlap

    return chunks


# --------------------------------------------------
# Create Embeddings
# --------------------------------------------------

def create_embeddings(
    chunks: List[str]
):
    model = get_embedding_model()
    embeddings = model.encode(
        chunks,
        convert_to_numpy=True
    )
    return embeddings.astype("float32")


# --------------------------------------------------
# Build / Replace FAISS Index
# --------------------------------------------------

def build_index(
    chunks: List[str]
):
    if not chunks:
        return 0

    embeddings = create_embeddings(
        chunks
    )

    import faiss
    dimension = embeddings.shape[1]

    index = faiss.IndexFlatL2(
        dimension
    )

    index.add(embeddings)

    faiss.write_index(
        index,
        INDEX_PATH
    )

    with open(
        CHUNKS_PATH,
        "wb"
    ) as file:
        pickle.dump(
            chunks,
            file
        )

    return len(chunks)


# --------------------------------------------------
# Append Chunks to Existing Index
# --------------------------------------------------

def append_to_index(new_chunks: List[str]):
    if not new_chunks:
        return 0

    existing_chunks = []
    if os.path.exists(CHUNKS_PATH):
        try:
            with open(CHUNKS_PATH, "rb") as file:
                existing_chunks = pickle.load(file)
        except Exception:
            existing_chunks = []

    all_chunks = existing_chunks + new_chunks
    return build_index(all_chunks)


# --------------------------------------------------
# Search Documents
# --------------------------------------------------

def search_documents(
    query: str,
    top_k: int = 5
) -> List[str]:

    if not os.path.exists(INDEX_PATH) or not os.path.exists(CHUNKS_PATH):
        return []

    try:
        import faiss
        index = faiss.read_index(INDEX_PATH)
        with open(CHUNKS_PATH, "rb") as file:
            chunks = pickle.load(file)
    except Exception:
        return []

    if not chunks:
        return []

    query_embedding = get_embedding_model().encode(
        [query],
        convert_to_numpy=True
    ).astype("float32")

    number_of_results = min(
        top_k,
        len(chunks)
    )

    distances, indices = index.search(
        query_embedding,
        number_of_results
    )

    results = []
    for position in indices[0]:
        if 0 <= position < len(chunks):
            results.append(chunks[position])

    return results


def search_documents_detailed(
    query: str,
    top_k: int = 5
) -> List[Dict[str, Any]]:

    if not os.path.exists(INDEX_PATH) or not os.path.exists(CHUNKS_PATH):
        return []

    try:
        index = faiss.read_index(INDEX_PATH)
        with open(CHUNKS_PATH, "rb") as file:
            chunks = pickle.load(file)
    except Exception:
        return []

    if not chunks:
        return []

    query_embedding = get_embedding_model().encode(
        [query],
        convert_to_numpy=True
    ).astype("float32")

    number_of_results = min(top_k, len(chunks))
    distances, indices = index.search(query_embedding, number_of_results)

    results = []
    for dist, position in zip(distances[0], indices[0]):
        if 0 <= position < len(chunks):
            results.append({
                "text": chunks[position],
                "score": float(dist)
            })

    return results