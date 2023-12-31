---
title: 【记录】Go 实现 OpenAI API HTTP 代理
urlname: -ji-lu-Go-shi-xian-OpenAI-API-HTTP-dai-li
date: 2023-06-28 19:48:47
tags: ['golang', 'openai', 'docker', 'ngpm']
excerpt: 这段代码是基于GO-OPENAI-PROXY的参考代码，并通过GPT-3.5进行修改。它具有以下优点：支持多个密钥轮询，且对前端透明；可以自定义修改消息；不受网络环境影响；可以编译反代程序。代码中包含了处理HTTP请求和响应的函数，以及一些辅助函数和变量。
---
代码参考自 [GO-OPENAI-PROXY](https://github.com/geekr-dev/openai-proxy)，由 GPT-3.5 辅助修改。
## 优点
+ 支持多key轮询，且key对前端透明
+ 可以对messages进行自定义修改
+ 不受网络环境影响
## 编译反代程序
```go
package main

import (
    "io"
    "io/ioutil"
    "log"
    "net/http"
    "net/url"
    "strings"
    "bytes"
    "encoding/json"
    "time"
    "sync"
)

var (
    target    = "https://api.openai.com" // 目标域名
    mu sync.Mutex
    count int
)

func main() {
    http.HandleFunc("/", handleRequest)
    http.ListenAndServe(":9000", nil)
}

func get1Key(key string) string {
    mu.Lock()
    defer mu.Unlock()

    arr := strings.Split(key, "|")
    randomIndex := count % len(arr)
    count++
    if count > 999999 {
        count = 0
    }
    randomSubstr := arr[randomIndex]
    log.Println("Authorization", randomSubstr)
    return randomSubstr
}

// Get a json decoder for a given requests body
func requestBodyDecoder(request *http.Request) *json.Decoder {
    // Read body to buffer
    body, err := ioutil.ReadAll(request.Body)
    if err != nil {
        log.Printf("Error reading body: %v", err)
        panic(err)
    }

    // Because go lang is a pain in the ass if you read the body then any susequent calls
    // are unable to read the body again....
    // request.Body = ioutil.NopCloser(bytes.NewBuffer(body))

    return json.NewDecoder(ioutil.NopCloser(bytes.NewBuffer(body)))
}

// 在需要设置响应头的地方调用setResponseHeader函数即可
func setResponseHeader(w http.ResponseWriter) {
    w.Header().Set("Access-Control-Allow-Methods", "GET,HEAD,POST,OPTIONS")
    w.Header().Set("Access-Control-Allow-Origin", "*")
    w.Header().Set("Access-Control-Max-Age", "86400")
    w.Header().Set("Access-Control-Allow-Headers", "authorization,content-type")
}

func handleBody(r *http.Request) io.ReadCloser {
    // 读取请求体
    decoder := requestBodyDecoder(r)
    // 解析JSON数据
    var requestData map[string]interface{}
    err := decoder.Decode(&requestData)
    if err != nil {
        // 处理解析JSON数据异常
        log.Printf("Error decoding body: %v", err)
        panic(err)
    }
    // 获取"messages"列表
    messages, ok := requestData["messages"].([]interface{})
    if !ok {
        // "messages"字段不存在或类型不正确
        log.Printf("Error reading messages: %v", ok)
        panic(ok)
    }
    // 按需修改"messages"列表
    // log.Println("debug 5", len(messages), len(messages) > 4)
    if len(messages) > 4 {
        firstMessage, ok := messages[0].(map[string]interface{})
        if !ok {
            // 第一个消息类型不正确
            log.Printf("Error reading firstMessage: %v", ok)
            panic(ok)
        }

        role, roleOk := firstMessage["role"].(string)
        // log.Println("debug 6", roleOk, role, role == "system", strings.EqualFold(role, "system"))
        if roleOk && strings.EqualFold(role, "system") {
            // 将第一个消息移动到倒数第三个位置
            thirdToLastIndex := len(messages) - 3
            messages_copy := make([]interface{}, 0)
            messages_copy = append(messages_copy, messages[0])
            messages_copy = append(messages_copy, messages[thirdToLastIndex:]...)
            messages = append(messages[1:thirdToLastIndex], messages_copy...)
            
            // 更新"messages"列表
            requestData["messages"] = messages
            log.Println("move system role to ", thirdToLastIndex)
        }
    }
    // 将更新后的数据编码为JSON
    var buf bytes.Buffer
    encoder := json.NewEncoder(&buf)
    err = encoder.Encode(requestData)
    if err != nil {
        // 处理编码JSON数据异常
        log.Printf("Error encoding body: %v", err)
        panic(err)
    }

    return ioutil.NopCloser(&buf)
}

func handleRequest(w http.ResponseWriter, r *http.Request) {
    // 过滤无效URL
    _, err := url.Parse(r.URL.String())
    if err != nil {
        log.Println("Error parsing URL: ", err.Error())
        http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
        return
    }

    // 去掉环境前缀（针对腾讯云，如果包含的话，目前我只用到了test和release）
    newPath := strings.Replace(r.URL.Path, "/release", "", 1)
    newPath = strings.Replace(newPath, "/test", "", 1)

    // 拼接目标URL
    targetURL := target + newPath

    // 创建代理HTTP请求
    var proxyReq *http.Request
    // log.Println("debug 1", targetURL, r.Method)
    // log.Println("debug 2", strings.Contains(targetURL, "chat/completions"))
    // log.Println("debug 3", strings.EqualFold(r.Method, "POST"))
    if strings.Contains(targetURL, "chat/completions") && strings.EqualFold(r.Method, "POST")  {
        // log.Println("debug 4-0")
        proxyReq, err = http.NewRequest(r.Method, targetURL, handleBody(r))
    } else {
        // log.Println("debug 4-1")
        proxyReq, err = http.NewRequest(r.Method, targetURL, r.Body)
    }

    if err != nil {
        log.Println("Error creating proxy request: ", err.Error())
        http.Error(w, "Error creating proxy request", http.StatusInternalServerError)
        return
    }

    // 将原始请求头复制到新请求中
    keys := strings.Split(r.Header.Get("Authorization"), " ")
    if len(keys) == 2 {
           r.Header.Set("Authorization", "Bearer " + get1Key(keys[1]))
    }
    if _, ok := r.Header["User-Agent"]; !ok {
        // explicitly disable User-Agent so it's not set to default value
        r.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36")
    }
    proxyReq.Header = http.Header{
        "Content-Type":  []string{"application/json"},
        "Authorization": []string{r.Header.Get("Authorization")},
        "User-Agent":    []string{r.Header.Get("User-Agent")},
    }

    
    // 默认超时时间设置为60s
    client := &http.Client{
        Timeout: 60 * time.Second,
    }

    // 向 OpenAI 发起代理请求
    resp, err := client.Do(proxyReq)
    if err != nil {
        log.Println("Error sending proxy request: ", err.Error())
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    defer resp.Body.Close()

    // 设置响应头
    setResponseHeader(w)
    
    // 将响应状态码设置为原始响应状态码
    w.WriteHeader(resp.StatusCode)

    // 将响应实体写入到响应流中（支持流式响应）
    buf := make([]byte, 1024)
    for {
        if n, err := resp.Body.Read(buf); err == io.EOF || n == 0 {
            return
        } else if err != nil {
            log.Println("error while reading respbody: ", err.Error())
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        } else {
            if _, err = w.Write(buf[:n]); err != nil {
                log.Println("error while writing resp: ", err.Error())
                http.Error(w, err.Error(), http.StatusInternalServerError)
                return
            }
            w.(http.Flusher).Flush()
        }
    }
}
```
```bash
CC=musl-gcc /home/jovyan/go/bin/go1.20.1 build -tags musl -o openai -trimpath -ldflags '-linkmode "external" -extldflags "-static" -s -w -buildid=' ./openai-proxy.go
```
## docker部署
```bash
mkdir -p ~/app/apio && cd ~/app/apio && nano docker-compose.yml
chmod 777 openai
sudo docker-compose up -d && sudo docker-compose logs
```
```yml
version: '3.3'
services:
    apio:
        restart: always
        image: alpine:latest
        volumes:
          - ./openai:/bin/openai
        entrypoint: ["/bin/openai"]
 
networks:
  default:
    external: true
    name: ngpm
```
## Nginx Proxy Manager反代
![](https://img.limour.top/2023/08/30/64ef2d16a4577.webp)
+ [Nginx Proxy Manager](/Docker-bu-shu-Nginx-Proxy-Manager)
## 前端测试
+ [BetterChatGPT](https://github.com/ztjhz/BetterChatGPT)
+ API端点 填入`https://yourdomain/token/v1/chat/completions`
+ API密钥 随便填
