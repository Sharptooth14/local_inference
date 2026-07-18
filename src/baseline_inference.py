import time
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

def run_baseline():
    print("CUDA Available:", torch.cuda.is_available())
    if not torch.cuda.is_available():
        print("Warning: Running on CPU. This will be very slow.")
        device = "cpu"
    else:
        device = "cuda"
        print(f"GPU: {torch.cuda.get_device_name(0)}")

    # We use Qwen2.5-1.5B as it fits perfectly unquantized (fp16) in 6GB VRAM
    model_id = "Qwen/Qwen2.5-1.5B-Instruct"
    print(f"\nLoading {model_id} into VRAM...")
    
    # Load Tokenizer
    tokenizer = AutoTokenizer.from_pretrained(model_id)
    
    # Load Model
    start_load = time.time()
    model = AutoModelForCausalLM.from_pretrained(
        model_id,
        torch_dtype=torch.float16, # Use 16-bit precision
        device_map=device
    )
    print(f"Model loaded in {time.time() - start_load:.2f} seconds.")
    
    prompt = "Write a short Python function to calculate the Fibonacci sequence."
    messages = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": prompt}
    ]
    
    text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    model_inputs = tokenizer([text], return_tensors="pt").to(device)

    print("\nGenerating response... (Check your nvidia-smi now!)")
    start_gen = time.time()
    
    generated_ids = model.generate(
        model_inputs.input_ids,
        max_new_tokens=200,
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
    run_baseline()
