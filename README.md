# ViralClipAI

ViralClipAI is a local video repurposing tool. Upload a video, let AI identify promising moments, adjust the suggested timestamps, and render the selected moments into one summary video.
## How it works

1. The React client uploads a source video to the Flask backend.
## Requirements

- Node.js 18 or newer
- Python 3.10 or newer
## Setup

### 1. Install frontend dependencies
### 2. Set up the Python backend

Create or activate a virtual environment, then install the backend packages:
### 3. Prepare Ollama

Start Ollama and download the model used by the backend:
## Run locally

Open two terminals from the project root.
## Available commands

| Command | Purpose |
## Backend API

| Method | Endpoint | Description |
## Project structure

```text
client/                  React interface and editor components
## Troubleshooting

- **Connection error in the client:** make sure `python main.py` is running on port 5000.
- **No clips are returned:** verify Ollama is running and `llama3.2:3b` is installed.
## Current limitations

- Processing is local and can be CPU-intensive.
- The frontend currently uses a fixed backend URL: `http://localhost:5000`.
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
