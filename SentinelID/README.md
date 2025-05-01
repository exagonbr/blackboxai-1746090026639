# SentinelID: Real-Time Face Detection and Monitoring

## Overview
SentinelID is an advanced surveillance software that uses DeepFace AI for real-time face detection and monitoring. It supports multiple video stream protocols including RTMP, RTSP, RTP, HLS, HTTP, webcam devices, M3U8 videos, and VLC streams. The software provides a comprehensive solution for various security scenarios with a user-friendly interface for live camera views and fast, accurate face detection.

## Key Features
- Real-Time Monitoring: Displays live streams from multiple cameras on a single screen.
- AI Face Detection: Uses DeepFace AI for real-time face identification and analysis.
- 1:1 and 1:N Comparisons: Supports identity verification and identification against large databases.
- Biometric Code Enrollment: Enables efficient enrollment for accurate real-time matching.
- Intuitive Interface: Easy-to-use UI with live feeds and immediate notifications.
- Real-Time Alerts: Notifies operators of detections and potential matches for rapid response.

## Project Structure
- backend/: Python backend using FastAPI, OpenCV, and DeepFace.
- frontend/: Frontend UI using React and Tailwind CSS.
- config/: Configuration files including environment variables.
- requirements.txt: Python dependencies.

## Environment Variables
- DEEPFACE_ENV: Configuration for DeepFace AI environment.

## Next Steps
- Setup backend API for video stream processing and face detection.
- Develop frontend UI for live camera feeds and alerts.
- Implement real-time communication between backend and frontend.
- Test and validate face detection and alert system.
