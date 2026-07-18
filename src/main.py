from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Local LLM Inference API")

class PromptRequest(BaseModel):
    prompt: str
    max_tokens: int = 100

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/generate")
def generate(request: PromptRequest):
    # Placeholder for actual inference logic
    # In future phases, we will integrate llama.cpp, vLLM, or transformers here.
    response_text = f"Mock response for: {request.prompt}"
    
    return {
        "response": response_text,
        "model": "placeholder-model"
    }
