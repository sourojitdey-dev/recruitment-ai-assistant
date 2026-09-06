import json
import jwt
from fastapi import WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import SessionLocal
from app.models.user import User
from app.services.chat_service import answer_user_query
from app.websocket.manager import ws_manager


def get_user_from_token(token: str, db: Session) -> User | None:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")
        if not user_id:
            return None
        return db.query(User).filter(User.id == int(user_id), User.is_active.is_(True)).first()
    except Exception:
        return None


async def handle_chat_websocket(websocket: WebSocket, token: str | None = None):
    await ws_manager.connect(websocket)
    db = SessionLocal()
    current_user: User | None = None

    if token:
        current_user = get_user_from_token(token, db)

    try:
        # Welcome message
        await ws_manager.send_personal_message(
            {
                "type": "system",
                "message": "Connected to AI Career & Recruitment Assistant.",
                "authenticated": current_user is not None,
                "user_name": current_user.name if current_user else "Guest",
            },
            websocket,
        )

        while True:
            data = await websocket.receive_text()
            try:
                payload = json.loads(data)
            except json.JSONDecodeError:
                payload = {"message": data}

            # Handle auth message if token sent after connect
            if payload.get("type") == "auth":
                auth_token = payload.get("token", "")
                user = get_user_from_token(auth_token, db)
                if user:
                    current_user = user
                    await ws_manager.send_personal_message(
                        {
                            "type": "auth_success",
                            "message": f"Authenticated as {user.name} ({user.role})",
                        },
                        websocket,
                    )
                else:
                    await ws_manager.send_personal_message(
                        {"type": "error", "message": "Invalid authentication token"},
                        websocket,
                    )
                continue

            user_text = payload.get("message", "").strip()
            if not user_text:
                continue

            session_id = payload.get("session_id")
            job_id = payload.get("job_id")

            # Fallback mock user if unauthenticated for basic exploration
            effective_user = current_user
            if not effective_user:
                # Find any candidate or create a dummy object for safe public testing
                effective_user = db.query(User).filter(User.role == "candidate").first()
                if not effective_user:
                    effective_user = User(
                        id=0, name="Guest", email="guest@test.com", role="candidate", is_active=True
                    )

            # Signal thinking
            await ws_manager.send_personal_message(
                {"type": "status", "status": "thinking"},
                websocket,
            )

            # Generate response
            response = answer_user_query(
                db=db,
                current_user=effective_user,
                message=user_text,
                session_id=session_id,
                job_id=job_id,
            )

            # Send answer
            await ws_manager.send_personal_message(
                {
                    "type": "answer",
                    "answer": response["answer"],
                    "session_id": response["session_id"],
                    "sources": response["sources"],
                    "advisory_disclaimer": response["advisory_disclaimer"],
                },
                websocket,
            )

    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        ws_manager.disconnect(websocket)
    finally:
        db.close()
