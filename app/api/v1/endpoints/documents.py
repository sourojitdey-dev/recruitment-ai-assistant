from pathlib import Path
from uuid import uuid4
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_roles
from app.models.company import Company
from app.models.knowledge_chunk import KnowledgeChunk
from app.models.knowledge_document import KnowledgeDocument
from app.models.user import User
from app.schemas.document import DocumentIndexResponse, DocumentResponse
from app.services.document_loader import extract_document_text
from app.services.vector_store import index_knowledge_document

router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
)

DOCUMENTS_STORAGE_DIR = Path("storage/documents")


@router.post(
    "/",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
)
def upload_document(
    file: UploadFile = File(...),
    document_type: str = Form("company_policy"),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("recruiter", "admin")
    ),
):
    if current_user.company_id is None and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not associated with a company",
        )

    DOCUMENTS_STORAGE_DIR.mkdir(parents=True, exist_ok=True)

    original_filename = file.filename or "document.pdf"
    stored_filename = f"{uuid4()}_{original_filename}"
    file_path = DOCUMENTS_STORAGE_DIR / stored_filename

    file_content = file.file.read()
    with open(file_path, "wb") as doc_file:
        doc_file.write(file_content)

    # Extract text from uploaded document
    try:
        extracted_text = extract_document_text(file_path, file.content_type)
    except Exception as e:
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not read document text: {e}",
        )

    new_doc = KnowledgeDocument(
        filename=original_filename,
        file_path=str(file_path),
        content_type=file.content_type or "application/octet-stream",
        document_type=document_type,
        extracted_text=extracted_text,
        company_id=current_user.company_id,
        uploaded_by=current_user.id,
        indexing_status="pending",
    )

    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)

    # Automatically index the document into vector chunks
    try:
        index_knowledge_document(db, new_doc)
    except Exception:
        # Non-fatal if index fails initially
        pass

    return DocumentResponse(
        id=new_doc.id,
        filename=new_doc.filename,
        file_path=new_doc.file_path,
        content_type=new_doc.content_type,
        document_type=new_doc.document_type,
        company_id=new_doc.company_id,
        uploaded_by=new_doc.uploaded_by,
        indexing_status=new_doc.indexing_status,
        created_at=new_doc.created_at,
        extracted_text_preview=new_doc.extracted_text[:300] if new_doc.extracted_text else None,
    )


@router.get(
    "/",
    response_model=list[DocumentResponse],
)
def list_documents(
    current_user: User = Depends(
        require_roles("recruiter", "admin")
    ),
    db: Session = Depends(get_db),
):
    query = db.query(KnowledgeDocument)
    if current_user.role != "admin":
        query = query.filter(KnowledgeDocument.company_id == current_user.company_id)

    docs = query.order_by(KnowledgeDocument.id.desc()).all()
    return [
        DocumentResponse(
            id=d.id,
            filename=d.filename,
            file_path=d.file_path,
            content_type=d.content_type,
            document_type=d.document_type,
            company_id=d.company_id,
            uploaded_by=d.uploaded_by,
            indexing_status=d.indexing_status,
            created_at=d.created_at,
            extracted_text_preview=d.extracted_text[:300] if d.extracted_text else None,
        )
        for d in docs
    ]


@router.get(
    "/{document_id}",
    response_model=DocumentResponse,
)
def get_document(
    document_id: int,
    current_user: User = Depends(
        require_roles("recruiter", "admin")
    ),
    db: Session = Depends(get_db),
):
    query = db.query(KnowledgeDocument).filter(KnowledgeDocument.id == document_id)
    if current_user.role != "admin":
        query = query.filter(KnowledgeDocument.company_id == current_user.company_id)

    doc = query.first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )

    return DocumentResponse(
        id=doc.id,
        filename=doc.filename,
        file_path=doc.file_path,
        content_type=doc.content_type,
        document_type=doc.document_type,
        company_id=doc.company_id,
        uploaded_by=doc.uploaded_by,
        indexing_status=doc.indexing_status,
        created_at=doc.created_at,
        extracted_text_preview=doc.extracted_text[:500] if doc.extracted_text else None,
    )


@router.post(
    "/{document_id}/index",
    response_model=DocumentIndexResponse,
)
def reindex_document(
    document_id: int,
    current_user: User = Depends(
        require_roles("recruiter", "admin")
    ),
    db: Session = Depends(get_db),
):
    query = db.query(KnowledgeDocument).filter(KnowledgeDocument.id == document_id)
    if current_user.role != "admin":
        query = query.filter(KnowledgeDocument.company_id == current_user.company_id)

    doc = query.first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )

    chunks_count = index_knowledge_document(db, doc)
    return DocumentIndexResponse(
        document_id=doc.id,
        indexing_status=doc.indexing_status,
        chunks_created=chunks_count,
        message=f"Successfully indexed {chunks_count} vector chunks.",
    )


@router.delete(
    "/{document_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_document(
    document_id: int,
    current_user: User = Depends(
        require_roles("recruiter", "admin")
    ),
    db: Session = Depends(get_db),
):
    query = db.query(KnowledgeDocument).filter(KnowledgeDocument.id == document_id)
    if current_user.role != "admin":
        query = query.filter(KnowledgeDocument.company_id == current_user.company_id)

    doc = query.first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )

    # Delete chunks
    db.query(KnowledgeChunk).filter(KnowledgeChunk.document_id == doc.id).delete(synchronize_session=False)

    # Delete physical file
    file_path = Path(doc.file_path)
    if file_path.exists():
        try:
            file_path.unlink()
        except Exception:
            pass

    db.delete(doc)
    db.commit()
    return None
