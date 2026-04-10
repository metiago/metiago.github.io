---
title: 'Serving LLM Locally (Without a GPU)'
date: "2025-09-03"
draft: true
---

The goal is to run a real LLM behind a REST API on a low-cost machine, understand the serving stack, and measure basic performance.

This tutorial walks through **serving a local LLM using Docker**, running entirely on CPU (Raspberry Pi 5 + SSD), and ends with **latency and throughput measurements**.

No cloud. No GPU. Just fundamentals.

## Workflow overview

```
Client (curl / app)
   ↓ HTTP
LLM Runtime (llama.cpp)
   ↓
Model (Phi-3 mini, GGUF)
```

## Install Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
```

Verify:

```bash
docker run hello-world
```

---

## Choose the runtime

We use **llama.cpp**, a lightweight LLM runtime optimized for *CPU*, *ARM*, *low memory*. Also note that the key point here is that
the runtime provides the REST API — the model does not.


## Download a compatible model (GGUF)

For CPU inference, we need a **small model**, **quantized** and **GGUF format**

Example:

* **Phi-3 Mini 4K Instruct**
* Quantization: `q4_k_m`

**Note:** Hugging Face repos often contain **multiple files**. Only `.gguf` files are valid for llama.cpp.

Download the model at:

```bash
wget https://huggingface.co/TheBloke/Phi-3-mini-4k-instruct-GGUF/resolve/main/Phi-3-mini-4k-instruct-q4_k_m.gguf
```

Place it in:

```bash
./models/Phi-3-mini-4k-instruct-q4_k_m.gguf
```

---

## Build the Docker image

Create a simple `Dockerfile`:

```yml
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# System deps
RUN apt update && apt install -y \
    git cmake build-essential \
    python3 python3-pip \
    curl wget \
    libopenblas-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Build llama.cpp
RUN git clone https://github.com/ggerganov/llama.cpp.git
WORKDIR /app/llama.cpp

RUN cmake -B build \
    -DLLAMA_BLAS=ON \
    -DLLAMA_BLAS_VENDOR=OpenBLAS \
    && cmake --build build --config Release -j$(nproc)

EXPOSE 8000

ENTRYPOINT ["./build/bin/llama-server"]
```

Build:

```bash
docker build -t llama-pi .
```

---

## Run the model with Docker Compose

What this does ? It loads the model, starts an HTTP server, uses 4 CPU threads and exposes an OpenAI-compatible API.

```yml
version: "3.9"

services:
  llama-api:
    image: llama-pi
    container_name: llama-api
    ports:
      - "8000:8000"
    volumes:
      - ./models:/models
    restart: unless-stopped
    command: >
      -m /models/Phi-3-mini-4k-instruct-q4.gguf
      --host 0.0.0.0
      --port 8000
      -t 4
```

## Test the REST API

```bash
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      { "role": "user", "content": "Explain what an LLM runtime is" }
    ],
    "max_tokens": 100
  }'
```

If this works, is because the runtime is alive, the model is loaded, and you have a local LLM API. The output should be something like this below.

```json
{
  "models": [
    {
      "name": "Phi-3-mini-4k-instruct-q4.gguf",
      "model": "Phi-3-mini-4k-instruct-q4.gguf",
      "modified_at": "",
      "size": "",
      "digest": "",
      "type": "model",
      "description": "",
      "tags": [
        ""
      ],
      "capabilities": [
        "completion"
      ],
      "parameters": "",
      "details": {
        "parent_model": "",
        "format": "gguf",
        "family": "",
        "families": [
          ""
        ],
        "parameter_size": "",
        "quantization_level": ""
      }
    }
  ],
  "object": "list",
  "data": [
    {
      "id": "Phi-3-mini-4k-instruct-q4.gguf",
      "object": "model",
      "created": 1770059503,
      "owned_by": "llamacpp",
      "meta": {
        "vocab_type": 1,
        "n_vocab": 32064,
        "n_ctx_train": 4096,
        "n_embd": 3072,
        "n_params": 3821079552,
        "size": 2392493568
      }
    }
  ]
}
```

### Test asking a question

```json
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "phi",
    "messages": [
      { "role": "user", "content": "What is an LLM runtime?" }
    ],
    "max_tokens": 150,
    "temperature": 0.7
  }'
```

```json
{
  "choices": [
    {
      "finish_reason": "length",
      "index": 0,
      "message": {
        "role": "assistant",
        "content": " LLM runtime refers to the environment and infrastructure used to execute and manage the operations of a Large Language Model (LLM),
        such as GPT-3 or similar advanced AI models developed by organizations like Microsoft. This runtime includes the hardware (like GPUs or TPUs),
        software frameworks, and libraries that support the model's functionality, allowing it to process and generate natural language responses
        or perform text-based tasks. Here are some key components of an LLM runtime:**Hardware**: LLMs require significant
        computational resources, so they are typically run on specialized hardware such as high-end GPUs or TPUs.
        These hardware components provide the necessary processing power and memory"
      }
    }
  ],
  "created": 1770061079,
  "model": "Phi-3-mini-4k-instruct-q4.gguf",
  "system_fingerprint": "b7914-9f682fb64",
  "object": "chat.completion",
  "usage": {
    "completion_tokens": 150,
    "prompt_tokens": 11,
    "total_tokens": 161
  },
  "id": "chatcmpl-Tw8HC3CxvXRGZDljCMf880F60ep4Bblg",
  "timings": {
    "cache_n": 0,
    "prompt_n": 11,
    "prompt_ms": 1078.738,
    "prompt_per_token_ms": 98.06709090909091,
    "prompt_per_second": 10.197100686172174,
    "predicted_n": 150,
    "predicted_ms": 41860.764,
    "predicted_per_token_ms": 279.07176000000004,
    "predicted_per_second": 3.5833077485160088
  }
}
```


## Measure basic latency

```bash
time curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "messages":[{"role":"user","content":"Hello"}],
    "max_tokens": 50
  }'
```

Observe:

* Total request time
* CPU usage

---

### Time To First Token (TTFT)

```bash
curl -N http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "stream": true,
    "messages":[{"role":"user","content":"Hello"}]
  }'
```

TTFT directly impacts UX.

---

## Measure throughput

llama.cpp logs provide:

```
tokens per second
```

Example:

```
eval time = 6.5s, tokens = 120, speed = 18.4 tok/s
```

You can also test concurrency:

```bash
for i in {1..3}; do
  curl -s http://localhost:8000/v1/chat/completions \
    -d '{"messages":[{"role":"user","content":"Hi"}]}' &
done
wait
```

Observe:

* Latency degradation
* CPU saturation


## Final thought

> Running a local LLM isn’t about replacing cloud APIs — it’s about **understanding the system you’re building on top of**.

If you can serve a model yourself, you can reason about:

* cost
* latency
* scale
* failures

And that’s where real engineering starts.