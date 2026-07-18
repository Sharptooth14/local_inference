# Phase 3 & 4: API Serving & Context Management
**Date:** 2026-07-18 | **Engine:** Ollama (llama.cpp) | **Hardware:** RTX 3060 (6GB)

### 1. The Containerization Wall on Windows
While enterprise MLOps relies on Linux-based container tools like `vLLM` and `TGI` (using Docker/Podman), setting up proper GPU Passthrough (CDI) on Windows WSL can be extremely fragile. To bypass this entirely, we pivoted to the absolute king of local Windows constraints: **Ollama / `llama.cpp`**.

### 2. Context Management (KV Cache)
When serving APIs, models use VRAM not just for their weights, but also for the **KV Cache** (Key-Value Cache) to remember the context of the conversation. 
Ollama natively manages this KV cache by:
1. Identifying your exact VRAM constraint (6GB).
2. Tightly limiting the context window size so the KV Cache doesn't overflow.
3. Automatically offloading excess memory to System RAM (CPU) if a request is too large, preventing the dreaded CUDA Out-Of-Memory (OOM) crash that raw Hugging Face `transformers` suffers from.

### 3. Production API Serving
We successfully ran `Qwen2.5-3B` locally and hit it using a standard OpenAI-compatible API endpoint (`http://localhost:11434/v1/chat/completions`). 

**Key Takeaways:**
* You can write standard Python/Node.js code using the official `openai` SDK, point it to `http://localhost:11434/v1`, and it will think it is talking to ChatGPT.
* The API abstracts away the complexity of hardware constraints, quantization, and tensor mathematics.
* You have successfully built a full-stack, local AI infrastructure within a 6GB VRAM constraint!
