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

from fastapi.middleware.cors import CORSMiddleware

from SentinelID.backend.models import Base, User, Alert

DATABASE_URL = "sqlite:///./sentinelid.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development, restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Environment variable for DeepFace config
DEEPFACE_ENV = os.getenv("DEEPFACE_ENV", "default")

# Dictionary to hold connected websocket clients and tokens
clients = []
tokens_db = {}

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_user(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def create_master_user():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.is_master == True).first()
        if not user:
            master_user = User(
                username="admin",
                hashed_password=get_password_hash("password123"),
                is_master=True
            )
            db.add(master_user)
            db.commit()
    finally:
        db.close()

def authenticate_user(db: Session, username: str, password: str):
    user = get_user(db, username)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

def create_token():
    return str(uuid.uuid4())

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    create_master_user()

@app.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = SessionLocal()
    try:
        user = authenticate_user(db, form_data.username, form_data.password)
        if not user:
            return JSONResponse(status_code=400, content={"detail": "Incorrect username or password"})
        token = create_token()
        tokens_db[user.username] = token
        return {"access_token": token, "token_type": "bearer"}
    finally:
        db.close()

@app.get("/")
async def root():
    return HTMLResponse("<h1>SentinelID Backend Running</h1>")

@app.get("/alerts")
async def get_alerts(token: str = None):
    if token is None or token not in tokens_db.values():
        raise HTTPException(status_code=401, detail="Unauthorized")
    db = SessionLocal()
    try:
        alerts = db.query(Alert).order_by(Alert.timestamp.desc()).all()
        return alerts
    finally:
        db.close()

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
            await websocket.send_text(f"Message text was: {data}")
    except WebSocketDisconnect:
        clients.remove(websocket)

# Placeholder for video stream processing and face detection
async def process_video_stream(stream_url):
    cap = cv2.VideoCapture(stream_url)
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        try:
            detections = DeepFace.extract_faces(rgb_frame, detector_backend='opencv')
            for face in detections:
                print("Face detected:", face)
        except Exception as e:
            print("DeepFace detection error:", e)
        await asyncio.sleep(0.01)
    cap.release()
