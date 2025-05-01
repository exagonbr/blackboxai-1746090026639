from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request, HTTPException, Depends
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
import cv2
import asyncio
import os
from deepface import DeepFace
import numpy as np
import uuid

app = FastAPI()

# Environment variable for DeepFace config
DEEPFACE_ENV = os.getenv("DEEPFACE_ENV", "default")

# Dictionary to hold connected websocket clients
clients = []

# Simple in-memory user store and token store for demo purposes
users_db = {
    "admin": "password123"
}
tokens_db = {}

def authenticate_user(username: str, password: str):
    if username in users_db and users_db[username] == password:
        return True
    return False

def create_token():
    return str(uuid.uuid4())

def get_current_user(token: str = None):
    if token in tokens_db.values():
        return True
    raise HTTPException(status_code=401, detail="Invalid or missing token")

@app.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    username = form_data.username
    password = form_data.password
    if not authenticate_user(username, password):
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
