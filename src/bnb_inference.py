import time
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig

def run_bnb_inference():
    print("CUDA Available:", torch.cuda.is_available())
    
    # We will use the base Qwen2.5-3B-Instruct model, but load it in 4-bit directly!
    model_id = "Qwen/Qwen2.5-3B-Instruct"
    
    print(f"\nLoading Model: {model_id} in 4-bit using BitsAndBytes...")
    
    tokenizer = AutoTokenizer.from_pretrained(model_id)
    
    # Configure 4-bit quantization
    quantization_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_compute_dtype=torch.float16,
        bnb_4bit_quant_type="nf4" # NormalFloat4, an optimized 4-bit format
    )
    
    start_load = time.time()
    
    model = AutoModelForCausalLM.from_pretrained(
        model_id,
        quantization_config=quantization_config,
        device_map="cuda"
    )
    
    print(f"Model loaded in {time.time() - start_load:.2f} seconds.")
    
    prompt = "Explain why running machine learning models natively on Windows can sometimes be challenging due to library dependencies."
    messages = [
        {"role": "system", "content": "You are a senior MLOps engineer."},
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
    run_bnb_inference()
