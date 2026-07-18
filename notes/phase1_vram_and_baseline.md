# Phase 1: Baseline Setup & The Anatomy of Inference
**Date:** 2026-07-18 | **Engine:** Hugging Face `transformers` | **Hardware:** RTX 3060 (6GB)

### 1. VRAM Calculation Formula for LLMs
Before loading an LLM, an MLOps engineer must calculate if it will fit on the GPU. If `Model + KV Cache > VRAM`, the system crashes with a CUDA Out of Memory (OOM) error or heavily relies on slow CPU RAM.

**The Formula:**
`VRAM_for_Weights = Parameters × Bytes_per_Parameter`

* **FP16 / BF16 (16-bit):** 2 bytes per parameter (Default precision).
* **INT8 (8-bit):** 1 byte per parameter (Quantized).
* **INT4 (4-bit):** 0.5 bytes per parameter (Heavily Quantized).

**Example Calculation (Qwen2.5-1.5B in FP16):**
`1,500,000,000 × 2 bytes = ~3.0 GB`
With ~0.5GB for CUDA context overhead and some space for the KV cache, this fits perfectly within the 6GB VRAM constraint.

### 2. Baseline Inference Metrics
We ran `Qwen2.5-1.5B-Instruct` locally in 16-bit float (FP16) using pure `transformers`.

* **Model Loading:** Full weights placed entirely in VRAM.
* **Speed:** ~17.21 tokens/sec.
* **Analysis:** For an unquantized model using the baseline Hugging Face engine (which lacks optimizations like FlashAttention or PagedAttention by default), ~17 t/s is a solid start. Human reading speed is roughly 4-5 tokens/sec, so this is well above real-time generation. 

### 3. Key Takeaway
Running smaller, unquantized models (like 1.5B) is easy on 6GB VRAM. However, attempting to run larger models (like the 8B class) will immediately crash unless we drastically reduce their memory footprint. This leads into the necessity of quantization (shrinking weights from 16-bit to 4-bit) for larger intelligence.
