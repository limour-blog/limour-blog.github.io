---
title: 【探索】为Next-Web开发RAG插件
urlname: develop-rag-plugin-for-next-web
index_img: https://api.limour.top/randomImg?d=2024-11-15 20:09:16
date: 2024-11-16 04:09:16
tags: [docker, rag, openai]
---
Dify、FastGPT、LangChain之类的用来做知识库都太过笨重，难以在1C1G的服务器上流畅运行。而 ChatGPT-Next-Web 可以在 Vercel 上免费部署，并且 [NextChat-Awesome-Plugins](https://github.com/ChatGPTNextWeb/NextChat-Awesome-Plugins) 带来的插件功能支持 `RESTful` API 的调用。因此只要用 [FastAPI](https://github.com/fastapi/fastapi) 将嵌入、重排、Qdrant向量检索包装到一起，就可以为 Next-Web 提供一个 RAG 插件。
## 准备工作
+ 已经提前导入了知识库的 [Qdrant](./using-qdrant-for-vector-retrieval) 

![](https://img.limour.top/2024/11/16/6737ad80213d2.webp)

+ 可以正常使用的 [Next-Web](./Aggregating-Azure-and-OpenAI-APIs-with-OneAPI)
+ 一些相关的文件 [Limour-dev/fastapi](https://github.com/Limour-dev/fastapi)
### FastAPI
+ 部署 [fastapi-launcher](https://github.com/Limour-dev/fastapi-launcher)
{% fold info @点开查看调试过程 %}
```bash
mkdir -p ~/app/fastapi && cd ~/app/fastapi && touch Dockerfile && touch docker-compose.yml && touch .env
mkdir -p ~/app/fastapi/app && mkdir -p ~/app/fastapi/app/Plugins
```
+ `nano Dockerfile` 编辑 `Dockerfile`，写入下面的文件
+ `docker build -t limour/fastapi .` 构建镜像
```Dockerfile
FROM python:3.9-alpine
WORKDIR /app
RUN pip3 install --no-cache-dir "fastapi[standard]" httpx
ENTRYPOINT ["fastapi", "dev", "main.py", "--host", "0.0.0.0"]
```
+ `nano ./app/main.py` 编辑 `main.py`，写入下面的文件
```python
import os, importlib
from fastapi import FastAPI
app = FastAPI()
@app.get("/")
def read_root():
    return {"Hello": "World"}

def get_all_files_in_directory(directory, ext=''):
    all_files = []
    for root, dirs, files in os.walk(directory):
        root: str = root[len(directory):]
        root.replace(os.path.sep, '.')
        for file in files:
            if file.endswith(ext):
                file_path = root + '.' + file[:-len(ext)]
                all_files.append(file_path)
    return all_files

for _path in get_all_files_in_directory('Plugins', '.py'):
    plugin = importlib.import_module(_path, 'Plugins')
    plugin.callback(app)
```
+ `nano docker-compose.yml` 编辑 `docker-compose.yml`，写入下面的文件
+ `sudo docker compose up -d` 测试是否正常
```yml
services:
  fastapi:
    image: limour/fastapi
    restart: always
    env_file:
      - .env
    volumes:
      - ./app:/app
      - /etc/localtime:/etc/localtime:ro
 
networks:
  default:
    external: true
    name: ngpm
```
+ 反代 `FastAPI`， 访问可以看到 `"Hello": "World"`

![](https://img.limour.top/2024/11/16/6737b54c2a573.webp)
{% endfold %}

## 包装API
+ `wget -O ./app/Plugins/qdrant.py https://raw.githubusercontent.com/Limour-dev/fastapi/refs/heads/main/Plugins/qdrant.py`
### 配置环境变量
+ `nano .env` 编辑 `.env`，写入下面的文件
+ 依次配置好嵌入、重排和Qdrant数据库
+ `docker compose down && docker compose up -d` 重启
```bash
QDRANT_EMBD_URL=http://localhost:8080/v1/embeddings
QDRANT_EMBD_KEY=no-key
QDRANT_EMBD_MODEL=text-embedding-3-small
QDRANT_RERANK_URL=http://localhost:8081/v1/rerank
QDRANT_RERANK_KEY=no-key
QDRANT_RERANK_MODEL=BAAI/bge-reranker-v2-m3
QDRANT_URL=http://qdrant:6333
QDRANT_KEY=no-key
FASTAPI_KEY=123456
```
{% fold info @点开查看调试过程 %}
### 测试环境
+ 在测试环境编写好脚本后，再转移脚本到 `app/Plugins` 目录下
```bash
conda create -n fastapi conda-forge::fastapi conda-forge::httpx conda-forge::python==3.9
```
### 编写脚本
```bash
wget -O app/Plugins/qdrant.py https://raw.githubusercontent.com/Limour-dev/fastapi/refs/heads/main/Plugins/qdrant.py
```
### 测试脚本
+ 填入自己的信息后，运行 [TestQdrant.py](https://github.com/Limour-dev/fastapi/blob/main/TestQdrant.py)
{% endfold %}
## 配置插件
+ 获取 `openapi.json` ，例如访问 `https://fastapi.limour.top/openapi.json`
+ 将其修改成下面的格式
```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "qdrant",
    "description": "使用 Qdrant 检索知识库进行 RAG",
    "version": "v1.0.0"
  },
  "servers": [
    {
      "url": "https://fastapi.limour.top"
    }
  ],
  "paths": {
    "/qdrant/v1": {
      "post": {
        "operationId": "qdrant",
        "summary": "使用 Qdrant 检索知识库进行 RAG",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["input"],
                "properties": {
                  "input": {
                    "type": "string",
                    "description": "需要在知识库中检索的句子"
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```
+ 将修改后的 json，填入 next-web 的插件中，并设置好 Authoritarian

![](https://img.limour.top/2024/11/16/67384ce3a26aa.webp)
## 测试插件

![](https://img.limour.top/2024/11/16/67384c8ff29e6.webp)