# Phase 2: The Art of Quantization
**Date:** 2026-07-18 | **Engine:** Hugging Face `transformers` + `bitsandbytes` | **Hardware:** RTX 3060 (6GB)

### 1. The Windows "Triton Wall"
During setup, we attempted to install `autoawq` (an optimized library for running AWQ formats) and hit a wall because its dependency, `triton`, lacks native Windows support. This is a common local MLOps hurdle. The industry standard workaround on Windows is either using Docker/WSL2 or using cross-platform libraries like `llama.cpp` or `bitsandbytes`.

### 2. BitsAndBytes 4-bit Quantization (NF4)
We successfully loaded a 3 Billion parameter model (`Qwen2.5-3B-Instruct`) natively on Windows using Hugging Face `transformers` integrated with `bitsandbytes`.

**The Math (Unquantized vs Quantized):**
* **FP16 (Unquantized):** 3,000,000,000 × 2 bytes = **~6.0 GB VRAM**. (Would crash our GPU instantly upon receiving a prompt).
* **NF4 (4-bit Quantized):** 3,000,000,000 × 0.5 bytes = **~1.5 GB VRAM**. (Fits effortlessly, leaving over 4GB for context and KV Cache).

### 3. Inference Metrics Analysis
* **Tokens/sec:** 11.54 (Down from 17.21 t/s on the 1.5B unquantized model).
* **Why the speed drop?** 
  1. We doubled the parameters (from 1.5B to 3B), which naturally takes more compute.
  2. **Dequantization Overhead:** `bitsandbytes` stores the model in 4-bit, but the GPU must mathematically convert those weights back up to 16-bit on-the-fly inside the GPU registers to do the matrix multiplication. This conversion process takes time, resulting in a slightly slower token generation rate.

### 4. Key Takeaway
Quantization trades a tiny bit of speed and perplexity for a massive reduction in VRAM. It is the absolute key to running capable intelligence on consumer hardware constraints.
