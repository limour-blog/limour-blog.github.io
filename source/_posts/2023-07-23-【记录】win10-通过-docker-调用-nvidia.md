---
title: 【记录】win10 通过 docker 调用 nvidia
urlname: -ji-lu-win10-tong-guo-docker-diao-yong-nvidia
date: 2023-07-23 20:25:19
index_img: https://api.limour.top/randomImg?d=2023-07-23 20:25:19
tags: ['win10', 'docker', 'nvidia', 'jupyter', 'torch']
excerpt: 这段文字主要介绍了如何在Windows系统上安装和配置新版WSL（Windows Subsystem for Linux），以及安装Docker和使用GPU加速等内容。具体步骤包括访问商店获取WSL，安装Docker，关闭Hyper-V，开启虚拟化平台，启用Hyper-V和WSL等。然后介绍了如何安装WSL2、下载Docker Desktop、配置Docker镜像源等。最后还介绍了如何测试网络访问、安装和配置conda环境、启动Jupyter Notebook等操作。
---
## 新版WSL
1. 访问商店获取 [Windows Subsystem for Linux](https://www.microsoft.com/store/productId/9P9TQF7MRM4R)
2. `wsl --version` 直接跳转到 `4. 安装 Docker`
3. ~~过时教程害人~~
4. 如果已经执行了第2、3步，更新后需要再执行 `wsl -s docker-desktop` [切换回正确的 distro](https://askubuntu.com/questions/1423048/i-am-getting-error-on-windows-subsystem#:~:text=I%20think%20this%20link%20might%20help.%20One%20cause,to%20right%20one%20with%20wsl%20-s%20%3Cdistro_name%3E%20command.)
5. 关闭 Hyper-V，只开启 WSL 和 虚拟化平台 两个可选功能
6. `netsh winsock reset` 然后重启
## 开启 Hyper-V by [壹佰](https://developer.aliyun.com/article/1144836)
1. 将下面内容复制到文本文件中，然后将文件命名为Hyper-V.bat，然后以管理员身份运行，运行完成后重启电脑（可能需要BIOS中开启处理器虚拟化支持）。
```shell
pushd "%~dp0"
dir /b %SystemRoot%\servicing\Packages\*Hyper-V*.mum >hyper-v.txt
for /f %%i in ('findstr /i . hyper-v.txt 2^>nul') do dism /online /norestart /add-package:"%SystemRoot%\servicing\Packages\%%i"
del hyper-v.txt
Dism /online /enable-feature /featurename:Microsoft-Hyper-V-All /LimitAccess /ALL
```
2. 使用 PowerShell 启用 Hyper-V，以管理员身份打开 PowerShell 控制台，运行以下命令：
```shell
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All
```
## 安装 WSL2 by [Ali7](https://zhuanlan.zhihu.com/p/599286889)&[MS](https://learn.microsoft.com/zh-cn/windows/wsl/install-manual#step-3---enable-virtual-machine-feature)
1. 应用商店搜索 [Ubuntu 22.04.2 LTS](https://www.microsoft.com/store/productId/9PN20MSR04DW) 并安装（可以不装）
2. 开启Windows Subsystem for Linux
```shell
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
```
3. 开启虚拟机特性
```shell
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```
4. 下载并安装 [WSL2更新包](https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi)
5. 将WSL2设置成默认
```shell
wsl --set-default-version 2
```
6. 运行商店中安装的 Ubuntu 22.04.2 LTS （可以不装）
## 安装 Docker Desktop  by [追逐时光者](https://zhuanlan.zhihu.com/p/441965046)
1. 下载 [Docker Desktop Installer](https://desktop.docker.com/win/stable/amd64/Docker%20Desktop%20Installer.exe)
2. 换源，在系统右下角托盘图标内右键菜单选择 Settings，打开配置窗口后左侧导航菜单选择 Docker Desktop。编辑窗口内的JSON串：
```json
{
  "builder": {
    "features": {
      "buildkit": true
    },
    "gc": {
      "defaultKeepStorage": "20GB",
      "enabled": true
    }
  },
  "experimental": false,
  "registry-mirrors": [
    "https://hub-mirror.c.163.com/",
    "https://docker.mirrors.ustc.edu.cn/"
  ]
}
```
3. 测试，Powershell 中运行 `docker run hello-world`
## 调用 nvidia by [无人知晓](https://zhuanlan.zhihu.com/p/543280130)&[bpq](https://zhuanlan.zhihu.com/p/610319395)
1. Ubuntu 22.04.2 LTS 中 运行 `nvidia-smi`
![](https://img.limour.top/2023/08/30/64ef3604b91e0.webp)
1. 右键卸载 Ubuntu 22.04.2 LTS，`wsl -l -v` 保证有 docker-desktop 和 docker-desktop-data 就行
2. Powershell 中运行 `docker pull anibali/pytorch:2.0.0-cuda11.8-ubuntu22.04`
3. 启动容器并测试 cuda
```shell
docker run -p 0.0.0.0:8001:8001 --rm -it --name torch --gpus all anibali/pytorch:2.0.0-cuda11.8-ubuntu22.04 /bin/bash
python
```
```python
import torch # 如果pytorch安装成功即可导入
print(torch.cuda.is_available()) # 查看CUDA是否可用
print(torch.cuda.device_count()) # 查看可用的CUDA数量
print(torch.version.cuda) # 查看CUDA的版本号
```
1. 测试网络访问，注意 **`-p 0.0.0.0`**
```
docker run -p 0.0.0.0:8001:8001 --rm -it --name torch --gpus all anibali/pytorch:2.0.0-cuda11.8-ubuntu22.04 python -m http.server 8001
```
## conda by [bpq](https://zhuanlan.zhihu.com/p/610319395)&[LATLAJ](https://www.jianshu.com/p/e1bd6e13d8e4)
```shell
mkdir data # G:\data
docker run -p 0.0.0.0:8001:8001 -it --name torch --gpus all -v //g/data:/app/data anibali/pytorch:2.0.0-cuda11.8-ubuntu22.04 /bin/bash
conda init # 然后退出 bash
docker start torch
docker exec -it torch /bin/bash
conda install nano -c conda-forge
nano ~/.condarc
```
+ [更换清华源](/-ji-lu--an-zhuang-conda-bing-geng-huan-qing-hua-yuan)
## jupyter
```shell
conda create -n jupyter jupyter notebook -c conda-forge
conda activate jupyter
jupyter notebook --ip 0.0.0.0 --port 8001
jupyter notebook --generate-config
nano ~/.jupyter/jupyter_notebook_config.py
jupyter notebook # http://localhost:8001/lab?token=limour
```
```python
c.ServerApp.ip = '*'
c.ServerApp.port = 8001
c.ExtensionApp.open_browser = False
c.ServerApp.token = 'limour'
```
## 添加内核
```
conda activate base
conda install ipykernel -c conda-forge
python -m ipykernel install --user --name pytorch
```
![](https://img.limour.top/2023/08/30/64ef3633df990.webp)
快速启动：`docker exec -it torch /home/user/micromamba/envs/jupyter/bin/jupyter notebook`