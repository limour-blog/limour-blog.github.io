---
title: 【探索】将BlueLM-7B-Chat转换为标准的GGUF模型
urlname: Convert-BlueLM-7B-Chat-to-the-standard-GGUF-model
index_img: https://api.limour.top/randomImg?d=2024-02-03 22:38:07
date: 2024-02-04 06:38:07
tags: [llama, 探索]
---
## 准备模型
+ [运行环境](/Running-Qwen-on-the-Win10-platform-with-6GB-of-video-memory)
```powershell
# conda create -n llamaConvert python=3.10 git -c conda-forge
# conda activate llamaConvert
# cd D:\llama
# git clone --depth=1 https://github.com/ggerganov/llama.cpp.git
# cd llama.cpp
# python -m pip install -r requirements.txt
# pip install tiktoken
$env:HF_ENDPOINT="https://hf-mirror.com"; python -c "from huggingface_hub import snapshot_download; snapshot_download(repo_id='vivo-ai/BlueLM-7B-Chat-32K', local_dir=r'D:\models\BlueLM-7B')"
# 还是用 vivo-ai/BlueLM-7B-Chat 吧, 32k的 ntkmixed 长度外推方案不知道怎么改
```
+ 初始的模型结构
```txt
BlueLMForCausalLM(
  (model): BlueLMModel(
    (embed_tokens): Embedding(100096, 4096, padding_idx=3)
    (embed_layer_norm): LayerNorm((4096,), eps=1e-06, elementwise_affine=True)
    (layers): ModuleList(
      (0-31): 32 x BlueLMDecoderLayer(
        (self_attn): BlueLMAttention(
          (q_proj): Linear(in_features=4096, out_features=4096, bias=False)
          (k_proj): Linear(in_features=4096, out_features=4096, bias=False)
          (v_proj): Linear(in_features=4096, out_features=4096, bias=False)
          (o_proj): Linear(in_features=4096, out_features=4096, bias=False)
          (rotary_emb): BlueLMRotaryEmbedding()
        )
        (mlp): BlueLMMLP(
          (gate_proj): Linear(in_features=4096, out_features=11008, bias=False)
          (down_proj): Linear(in_features=11008, out_features=4096, bias=False)
          (up_proj): Linear(in_features=4096, out_features=11008, bias=False)
          (act_fn): SiLU()
          (dropout): Dropout(p=0, inplace=False)
        )
        (input_layernorm): BlueLMRMSNorm()
        (post_attention_layernorm): BlueLMRMSNorm()
      )
    )
    (norm): BlueLMRMSNorm()
  )
  (lm_head): Linear(in_features=4096, out_features=100096, bias=False)
)
```
## 归一化 embed
```python
from transformers import AutoModelForCausalLM
import torch

# 提前将 modeling_bluelm.py 中用到 flash_attn 的部分改成 None，反正不真运行，只需要模型结构
tmp = AutoModelForCausalLM.from_pretrained(r'D:\models\BlueLM-7B',
                                     torch_dtype=torch.bfloat16,
                                     trust_remote_code=True)

test_i = torch.arange(0, 10, dtype=torch.long)

embedding = tmp.model.embed_tokens
layer_norm = tmp.model.embed_layer_norm

test_o_o = embedding(test_i)
test_o_o = layer_norm(test_o_o)

for param in embedding.parameters():
    if len(param.shape) > 1:
        param.data = layer_norm(param.data)

test_o_c = embedding(test_i)

print(torch.allclose(test_o_o, test_o_c, atol=1e-4))

del tmp.model.embed_layer_norm
tmp.save_pretrained(r'D:\models\BlueLM')
# 记得将缺失的一些文件手动复制一下
# 顺便删掉config.json里的rope scaling type
```
+ 删除 embed_layer_norm 后的结构
```txt
BlueLMForCausalLM(
  (model): BlueLMModel(
    (embed_tokens): Embedding(100096, 4096, padding_idx=3)
    (layers): ModuleList(
      (0-31): 32 x BlueLMDecoderLayer(
        (self_attn): BlueLMAttention(
          (q_proj): Linear(in_features=4096, out_features=4096, bias=False)
          (k_proj): Linear(in_features=4096, out_features=4096, bias=False)
          (v_proj): Linear(in_features=4096, out_features=4096, bias=False)
          (o_proj): Linear(in_features=4096, out_features=4096, bias=False)
          (rotary_emb): BlueLMRotaryEmbedding()
        )
        (mlp): BlueLMMLP(
          (gate_proj): Linear(in_features=4096, out_features=11008, bias=False)
          (down_proj): Linear(in_features=11008, out_features=4096, bias=False)
          (up_proj): Linear(in_features=4096, out_features=11008, bias=False)
          (act_fn): SiLU()
          (dropout): Dropout(p=0, inplace=False)
        )
        (input_layernorm): BlueLMRMSNorm()
        (post_attention_layernorm): BlueLMRMSNorm()
      )
    )
    (norm): BlueLMRMSNorm()
  )
  (lm_head): Linear(in_features=4096, out_features=100096, bias=False)
)
```
## 测试运行
```powershell
conda activate llamaConvert
cd D:\llama\llama.cpp
python convert.py D:\models\BlueLM --padvocab
Wrote D:\models\BlueLM\ggml-model-f16.gguf
conda activate llamaCpp
cd D:\llama-cublas
.\quantize.exe D:\models\BlueLM\ggml-model-f16.gguf D:\models\BlueLM\ggml-model-Q5_K_M.gguf Q5_K_M
.\main.exe -m D:\models\BlueLM\ggml-model-Q5_K_M.gguf -ngl 25 -c 1024 --interactive-first
```