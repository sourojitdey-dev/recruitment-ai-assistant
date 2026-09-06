import os
from pathlib import Path
import pymupdf
import docx


def extract_text_from_pdf(file_path: str | Path) -> str:
    text = ""
    try:
        doc = pymupdf.open(str(file_path))
        for page in doc:
            text += page.get_text() + "\n"
        doc.close()
    except Exception as e:
        # Fallback to pypdf if available
        try:
            from pypdf import PdfReader
            reader = PdfReader(str(file_path))
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        except Exception:
            raise ValueError(f"Failed to extract text from PDF: {e}")
    return text.strip()


def extract_text_from_docx(file_path: str | Path) -> str:
    try:
        doc = docx.Document(str(file_path))
        text = "\n".join([p.text for p in doc.paragraphs if p.text.strip()])
        return text.strip()
    except Exception as e:
        raise ValueError(f"Failed to extract text from DOCX: {e}")


def extract_text_from_txt(file_path: str | Path) -> str:
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read().strip()
    except Exception as e:
        raise ValueError(f"Failed to extract text from text file: {e}")


def extract_document_text(file_path: str | Path, content_type: str | None = None) -> str:
    path = Path(file_path)
    suffix = path.suffix.lower()

    if suffix == ".pdf" or (content_type and "pdf" in content_type):
        return extract_text_from_pdf(path)
    elif suffix in [".docx", ".doc"] or (content_type and "word" in content_type):
        return extract_text_from_docx(path)
    elif suffix in [".txt", ".md", ".json", ".csv"]:
        return extract_text_from_txt(path)
    else:
        # Try text extraction as fallback
        try:
            return extract_text_from_txt(path)
        except Exception:
            raise ValueError(f"Unsupported file format: {suffix}")
