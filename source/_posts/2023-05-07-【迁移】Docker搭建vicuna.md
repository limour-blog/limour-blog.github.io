---
title: 【迁移】Docker搭建vicuna
urlname: -qian-yi--Docker-da-jian-vicuna
date: 2023-05-07 19:50:52
tags: ['docker', 'vicuna']
---
+ 项目地址：[llama-cpp-python](https://github.com/abetlen/llama-cpp-python/pkgs/container/llama-cpp-python)
+ 镜像地址：[hub-mirror](https://github.com/togettoyou/hub-mirror)
+ 模型地址：[ggml-vic13b-q5_1.bin](https://huggingface.co/eachadea/ggml-vicuna-13b-1.1/resolve/main/ggml-vic13b-q5_1.bin)
+ 前端UI地址(目前仍不兼容)：[BetterChatGPT](https://github.com/Limourli-liu/BetterChatGPT)
## 部署Docker镜像
```bash
mkdir -p ~/app/llama && cd ~/app/llama && nano docker-compose.yml
mkdir models && cd models
wget https://huggingface.co/eachadea/ggml-vicuna-13b-1.1/resolve/main/ggml-vic13b-q5_1.bin
cd ~/app/llama
sudo docker-compose up -d
sudo docker-compose logs
```
```yml
version: '3.3'
services:
    llama:
        ports:
            - '1234:8000'
        restart: always
        environment:
            MODEL: /models/ggml-vic13b-q5_1.bin
        volumes:
            - './models:/models'
        image: togettoyou/ghcr.io.abetlen.llama-cpp-python:latest
        command: ["python3", "-m", "llama_cpp.server", "--model", "/models/ggml-vic13b-q5_1.bin"]
```
## 测试是否成功
+ 查看文档：`http://localhost:1234/docs`
```bash
curl http://localhost:1234/v1/chat/completions \
  -H 'Content-Type: application/json' \
  -d '{
  "model": "gpt-3.5-turbo",
  "messages": [{"role": "user", "content": "Hello!"}]
}'
```