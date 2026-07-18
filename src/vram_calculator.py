def calculate_vram(params_billion: float, precision: str, sequence_length: int = 1024, batch_size: int = 1) -> None:
    """
    Calculates estimated VRAM usage for a given model parameter count and precision.
    """
    precision_bytes = {
        "fp32": 4.0,
        "fp16": 2.0,
        "bf16": 2.0,
        "int8": 1.0,
        "int4": 0.5
    }
    
    if precision not in precision_bytes:
        raise ValueError(f"Precision must be one of {list(precision_bytes.keys())}")
        
    bytes_per_param = precision_bytes[precision]
    
    # Weight VRAM: (Parameters in billions) * (Bytes per param) -> GB
    weight_vram_gb = params_billion * bytes_per_param
    
    # CUDA Context Overhead (~500MB - 1GB, let's use 600MB as a baseline)
    cuda_context_gb = 0.6
    
    # KV Cache approximation (simplified formula for demonstration)
    # KV Cache grows linearly with seq_length and batch_size
    # For a 1.5B model, it might be roughly 1MB per token per batch
    kv_cache_gb = (sequence_length * batch_size * 0.001) # Extremely rough approximation
    
    total_vram_gb = weight_vram_gb + cuda_context_gb + kv_cache_gb
    
    print(f"--- VRAM Calculation for {params_billion}B Model in {precision.upper()} ---")
    print(f"Weights VRAM:      {weight_vram_gb:.2f} GB")
    print(f"CUDA Context:      {cuda_context_gb:.2f} GB")
    print(f"KV Cache (approx): {kv_cache_gb:.2f} GB (seq_len={sequence_length}, bs={batch_size})")
    print(f"--------------------------------------------------")
    print(f"TOTAL ESTIMATED:   {total_vram_gb:.2f} GB VRAM")
    
    if total_vram_gb > 6.0:
        print(f"! WARNING: This exceeds your 6GB RTX 3060 limit!")
    else:
        print(f"OK: This will fit comfortably in your 6GB VRAM.")

if __name__ == "__main__":
    # Test our 6GB Constraints
    
    # 1. Qwen-2.5 1.5B in fp16 (Unquantized)
    calculate_vram(1.5, "fp16", sequence_length=4096)
    print()
    
    # 2. Llama-3.1 8B in fp16 (Unquantized - Will it fit?)
    calculate_vram(8.0, "fp16", sequence_length=4096)
    print()
    
    # 3. Llama-3.1 8B in int4 (Quantized - Will it fit now?)
    calculate_vram(8.0, "int4", sequence_length=4096)
