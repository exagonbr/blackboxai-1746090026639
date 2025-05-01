from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request, HTTPException, Depends
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext
import cv2
import asyncio
import os
from deepface import DeepFace
import numpy as np
import uuid

from .models import Base, User, Alert

DATABASE_URL = "sqlite:///./sentinelid.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

app = FastAPI()

# Environment variable for DeepFace config
DEEPFACE_ENV = os.getenv("DEEPFACE_ENV", "default")

# Dictionary to hold connected websocket clients
clients = []

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_user(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def authenticate_user(db: Session, username: str, password: str):
    user = get_user(db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_token():
    return str(uuid.uuid4())

def get_current_user(token: str = None):
    if token in tokens_db.values():
        return True
    raise HTTPException(status_code=401, detail="Invalid or missing token")

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    master_user = db.query(User).filter(User.is_master == True).first()
    if not master_user:
        master_user = User(
            username="admin",
            hashed_password=get_password_hash("password123"),
            is_master=True
        )
        db.add(master_user)
        db.commit()
    db.close()

@app.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = SessionLocal()
    username = form_data.username
    password = form_data.password
    user = authenticate_user(db, username, password)
    db.close()
    if not user:
        return JSONResponse(status_code=400, content={"detail": "Incorrect username or password"})
    token = create_token()
    tokens_db[username] = token
    return {"access_token": token, "token_type": "bearer"}

@app.get("/")
async def get():
    html_content = """
    <html>
        <head>
            <title>SentinelID Real-Time Monitoring</title>
        </head>
        <body>
            <h1>SentinelID Backend Running</h1>
        </body>
    </html>
    """
    return HTMLResponse(content=html_content)

@app.get("/alerts")
async def get_alerts(token: str = None):
    if token is None or token not in tokens_db.values():
        raise HTTPException(status_code=401, detail="Unauthorized")
    db = SessionLocal()
    alerts = db.query(Alert).order_by(Alert.timestamp.desc()).all()
    db.close()
    return alerts

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = None):
    if token is None or token not in tokens_db.values():
        await websocket.close(code=1008)
        return
    await websocket.accept()
    clients.append(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # For simplicity, echo back the data
            await websocket.send_text(f"Message text was: {data}")
    except WebSocketDisconnect:
        clients.remove(websocket)

# Placeholder function for video stream processing and face detection
async def process_video_stream(stream_url):
    cap = cv2.VideoCapture(stream_url)
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        # Convert frame to RGB for DeepFace
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        # Detect faces using DeepFace
        try:
            detections = DeepFace.extract_faces(rgb_frame, detector_backend='opencv')
            # Process detections and send alerts to clients
            for face in detections:
                # For now, just print detection info
                print("Face detected:", face)
                # Here you would send alerts to connected clients
        except Exception as e:
            print("DeepFace detection error:", e)
        await asyncio.sleep(0.01)
    cap.release()
