# NMPA Smart Cargo Inspection System

This project implements the Smart Cargo Inspection System for the New Mangalore Port Authority (NMPA) based on the provided architecture diagram.

## Technology Stack

*   **Frontend**: React (Vite)
*   **Backend**: Node.js, Express
*   **Database**: MongoDB (Mongoose)

## Architecture Overview

The system architecture facilitates a streamlined operational workflow and decision pipeline for cargo inspection:

1.  **Cargo Arrival & Data Entry**: Digital submission of cargo manifests and related documents.
2.  **Automated Risk Evaluation**: An AI-driven service evaluates the submitted data to assess risk levels (Low, Medium, High).
3.  **Cargo Triage & Task Allocation**: Based on the risk level, cargo is flagged and assigned for inspection.
4.  **Focused Inspection**: Inspectors perform physical or document checks depending on the assessed risk.
5.  **Disposition & Record-Keeping**: Final decisions (release, detain, reject) are made, and records are archived.

## Project Structure

*   `frontend/`: The React-based Inspector Portal for monitoring and interacting with cargo data.
*   `backend/`: The Node.js/Express REST API serving as the Data Processing & Management layer.
    *   `models/`: Mongoose schemas defining the data structure (e.g., `Cargo.js`).
    *   `routes/`: API endpoints handling operations according to the workflow stages.

## Getting Started

### Prerequisites

*   Node.js (v18+)
*   MongoDB running locally on `mongodb://127.0.0.1:27017/nmpa_cargo`

### Setup backend

1.  Navigate to the `backend` folder: `cd backend`
2.  Install dependencies: `npm install`
3.  Start the server: `node server.js` (Server runs on port 5000)

### Setup frontend

1.  Navigate to the `frontend` folder: `cd frontend`
2.  Install dependencies: `npm install`
3.  Start the development server: `npm run dev`
