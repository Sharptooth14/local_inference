import time
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

def run_awq_inference():
    print("CUDA Available:", torch.cuda.is_available())
    
    # We'll use Qwen2.5-3B-Instruct in AWQ format.
    # A 3 Billion parameter model in 16-bit would take ~6GB just for weights, 
    # crashing our 6GB card once context is added. 
    # But in 4-bit AWQ, it takes only ~1.8GB!
    model_id = "Qwen/Qwen2.5-3B-Instruct-AWQ"
    
    print(f"\nLoading AWQ Quantized Model: {model_id}...")
    
    tokenizer = AutoTokenizer.from_pretrained(model_id)
    
    start_load = time.time()
    
    # transformers will automatically detect the AWQ format and use autoawq to load it efficiently
    model = AutoModelForCausalLM.from_pretrained(
        model_id,
        torch_dtype=torch.float16,
        device_map="cuda"
    )
    
    print(f"Model loaded in {time.time() - start_load:.2f} seconds.")
    
    prompt = "Explain how Activation-aware Weight Quantization (AWQ) works in simple terms."
    messages = [
        {"role": "system", "content": "You are an MLOps engineering expert."},
        {"role": "user", "content": prompt}
    ]
    
    text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    model_inputs = tokenizer([text], return_tensors="pt").to("cuda")

    print("\nGenerating response... (Watch your nvidia-smi. Notice how low the VRAM usage is for a 3B model!)")
    start_gen = time.time()
    
    generated_ids = model.generate(
        model_inputs.input_ids,
        max_new_tokens=250,
        temperature=0.7,
        do_sample=True
    )
    
    end_gen = time.time()
    
    generated_ids = [
        output_ids[len(input_ids):] for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
    ]
    
    response = tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]
    
    gen_time = end_gen - start_gen
    num_tokens = len(generated_ids[0])
    tokens_per_sec = num_tokens / gen_time
    
    print("\n--- Output ---")
    print(response)
    print("\n--- Metrics ---")
    print(f"Generation Time: {gen_time:.2f}s")
    print(f"Tokens Generated: {num_tokens}")
    print(f"Speed: {tokens_per_sec:.2f} tokens/sec")
    
if __name__ == "__main__":
    run_awq_inference()
