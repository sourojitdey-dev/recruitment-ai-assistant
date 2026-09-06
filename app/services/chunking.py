import re
from typing import TypedDict


class TextChunk(TypedDict):
    text: str
    index: int


def clean_text(text: str) -> str:
    """Normalize whitespace and clean special characters."""
    if not text:
        return ""
    # Replace multiple spaces/newlines with single equivalents
    text = re.sub(r"\r\n|\r", "\n", text)
    text = re.sub(r"\t", " ", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def chunk_text(
    text: str,
    chunk_size: int = 500,
    chunk_overlap: int = 100,
) -> list[TextChunk]:
    """
    Split text into overlapping chunks respecting sentence/paragraph boundaries.
    """
    cleaned = clean_text(text)
    if not cleaned:
        return []

    if len(cleaned) <= chunk_size:
        return [{"text": cleaned, "index": 0}]

    paragraphs = cleaned.split("\n\n")
    chunks: list[TextChunk] = []
    current_chunk = ""
    chunk_idx = 0

    for para in paragraphs:
        para = para.strip()
        if not para:
            continue

        # If a single paragraph is longer than chunk_size, split by sentences
        if len(para) > chunk_size:
            sentences = re.split(r"(?<=[.!?])\s+", para)
            for sent in sentences:
                sent = sent.strip()
                if not sent:
                    continue
                if len(current_chunk) + len(sent) + 1 <= chunk_size:
                    current_chunk = f"{current_chunk} {sent}".strip()
                else:
                    if current_chunk:
                        chunks.append({"text": current_chunk, "index": chunk_idx})
                        chunk_idx += 1
                        # Retain overlap from end of current chunk
                        overlap_start = max(0, len(current_chunk) - chunk_overlap)
                        current_chunk = current_chunk[overlap_start:].strip() + " " + sent
                    else:
                        # Single sentence is huge, split by chars
                        while len(sent) > chunk_size:
                            chunks.append({"text": sent[:chunk_size], "index": chunk_idx})
                            chunk_idx += 1
                            sent = sent[chunk_size - chunk_overlap:]
                        current_chunk = sent
        else:
            if len(current_chunk) + len(para) + 2 <= chunk_size:
                current_chunk = f"{current_chunk}\n\n{para}".strip()
            else:
                if current_chunk:
                    chunks.append({"text": current_chunk, "index": chunk_idx})
                    chunk_idx += 1
                    overlap_start = max(0, len(current_chunk) - chunk_overlap)
                    current_chunk = current_chunk[overlap_start:].strip() + "\n\n" + para
                else:
                    current_chunk = para

    if current_chunk.strip():
        chunks.append({"text": current_chunk.strip(), "index": chunk_idx})

    return chunks
