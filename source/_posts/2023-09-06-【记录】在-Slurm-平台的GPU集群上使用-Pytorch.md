---
title: 【记录】在 Slurm 平台的GPU集群上使用 Pytorch
urlname: 2023-09-06-【记录】在 Slurm 平台的GPU集群上使用 Pytorch
date: 2023-09-06 20:24:43
tags: ['slurm', 'nvidia', torch']
---
先说结论，没有 root 权限的 HPC，千万不要想着用最新版本的 pytorch。自己编译也不行，因为已经不支持 cuda11.7 以下的版本了，而没有 root 权限，既改不了驱动，也装不了 cuda-compat，不要折腾了。 
## 更换 conda
+ 安装 [conda](/-ji-lu--an-zhuang-conda-bing-geng-huan-qing-hua-yuan)
```bash
# 千万不要用系统提供的 conda
# 一定要自己重新 init 一个
# 因为除了自己的 home 目录会正确映射到集群的节点上
# 其他的目录很可能不正确
source ~/.bashrc
conda clean --all
conda install -y nano
```
#### 更换编译器
```bash
#!/bin/bash

### 设置该作业的作业名
#SBATCH --job-name=install-nvidia-gxx

### 指定该作业需要1个节点数
#SBATCH --nodes=1

### 每个节点所运行的进程数为1
#SBATCH --ntasks-per-node=1

### 程序的执行命令
source ~/.bashrc
## https://gist.github.com/ax3l/9489132 查看对应 nvcc 支持的 g++ 版本
conda create -y -n gcc -c conda-forge gcc=9.5.0
source activate gcc
conda install -c conda-forge gxx=9.5.0
gcc -v
g++ -v
```
```bash
source ~/.bashrc
conda run -n gcc whereis gcc
# ~/miniconda3/envs/gcc/bin/gcc
conda run -n gcc whereis g++
# ~/miniconda3/envs/gcc/bin/g++
```

## 检测驱动版本
```bash
#!/bin/bash

### 设置该作业的作业名
#SBATCH --job-name=test-nvidia

### 指定该作业的运行分区，sinfo 获取分区列表
#SBATCH --partition=body

### 指定申请的节点
#SBATCH --nodelist=gpu4

### 排除指定的节点；
#SBATCH --exclude=gpu1

### 指定该作业需要1个节点数
#SBATCH --nodes=1

### 该作业需要1个CPU
#SBATCH --ntasks=1

### 申请1块GPU卡
#SBATCH --gres=gpu:1

### 作业最大的运行时间，超过时间后作业资源会被SLURM回收
#SBATCH --time=0:05:00

### 指定从哪个项目扣费。如果没有这条参数，则从个人账户扣费
#SBATCH --comment public_cluster

### 程序的执行命令
source ~/.bashrc
lspci | grep VGA
### modinfo nvidia
cat /proc/driver/nvidia/version 
### /opt/app/cuda/11.2/extras/demo_suite/bandwidthTest
```

## 安装 pytorch

### 方式一 conda

#### 新版本
```bash
#!/bin/bash

### 设置该作业的作业名
#SBATCH --job-name=install-nvidia

### 指定该作业的运行分区，sinfo 获取分区列表
#SBATCH --partition=body

### 指定申请的节点
#SBATCH --nodelist=gpu4

### 排除指定的节点；
#SBATCH --exclude=gpu1

### 指定该作业需要1个节点数
#SBATCH --nodes=1

### 该作业需要1个CPU
#SBATCH --ntasks=1

### 申请1块GPU卡
#SBATCH --gres=gpu:1

### 指定从哪个项目扣费。如果没有这条参数，则从个人账户扣费
#SBATCH --comment public_cluster

### 程序的执行命令
source ~/.bashrc
conda create -y -n gpu pytorch-cuda=11.8 -c pytorch -c nvidia
conda install -y -n gpu pytorch -c pytorch -c nvidia
conda install -y -n gpu torchvision torchaudio -c pytorch -c nvidia
```
#### 旧版本
```bash
#!/bin/bash

### 设置该作业的作业名
#SBATCH --job-name=install-nvidia

### 指定该作业的运行分区，sinfo 获取分区列表
#SBATCH --partition=body

### 指定申请的节点
#SBATCH --nodelist=gpu4

### 排除指定的节点；
#SBATCH --exclude=gpu1

### 指定该作业需要1个节点数
#SBATCH --nodes=1

### 该作业需要1个CPU
#SBATCH --ntasks=1

### 申请1块GPU卡
#SBATCH --gres=gpu:1

### 指定从哪个项目扣费。如果没有这条参数，则从个人账户扣费
#SBATCH --comment public_cluster

### 程序的执行命令
source ~/.bashrc
source activate gcc
conda create -y -n gpu python=3.9 pytorch=1.10.2=py3.9_cuda11.1_cudnn8.0.5_0 torchvision=*=py39_cu111 torchaudio=*=py39_cu111 cudatoolkit=11.1 -c pytorch
```

### 方式二 编译安装
折腾了几天，发现 cuda11.2 不支持高于 10.0 的 gcc，而低版本的 gcc 在 ninja 上会报错，以后再折腾吧。
#### 获取源码
```bash
source ~/.bashrc
# wget cuda -O -| tar -xf -
# wget cudnn -O -| tar -xf -
git clone --depth=1 --recursive https://github.com/pytorch/pytorch
```
> 对于子模块，可以先不要在`git clone`的时候加上`--recursive`，等主体部分下载完之后，该文件夹中有个隐藏文件称为：`.gitmodules`，把子项目中的`url`地址同样加上`.cnpmjs.org`后缀，然后利用`git submodule sync`更新子项目对应的url，最后再`git submodule update --init --recursive`，即可正常网速clone完所有子项目

> 如果集群无法访问 GitHub，可以先获取源码后，`tar -zcPf /root/tmp/pytorch.tar.gz pytorch` 打包，[上传到集群](/Rclone-bei-fen-VPS-shu-ju-dao-onedrive)，`tar -zxf pytorch.tar.gz` 解包。
```bash
#!/bin/bash

### 设置该作业的作业名
#SBATCH --job-name=ungzip-nvidia

### 指定该作业需要1个节点数
#SBATCH --nodes=1

### 每个节点所运行的进程数为1
#SBATCH --ntasks-per-node=1

### 程序的执行命令
source ~/.bashrc
cd ~
tar -zxf pytorch.tar.gz
```
#### 进行编译
```bash
#!/bin/bash

### 设置该作业的作业名
#SBATCH --job-name=install-nvidia

### 指定该作业的运行分区，sinfo 获取分区列表
#SBATCH --partition=body

### 指定申请的节点
#SBATCH --nodelist=gpu4

### 排除指定的节点；
#SBATCH --exclude=gpu1

### 指定该作业需要1个节点数
#SBATCH --nodes=1

### 该作业需要4个CPU
#SBATCH --ntasks=4

### 申请1块GPU卡
#SBATCH --gres=gpu:1

### 指定从哪个项目扣费。如果没有这条参数，则从个人账户扣费
#SBATCH --comment public_cluster

### 程序的执行命令
source ~/.bashrc
conda create -y -n gpu python=3.10 -c conda-forge
source activate gpu
conda install mkl mkl-include -c conda-forge
conda install cmake -c conda-forge
conda install ninja=1.11.1 -c conda-forge ## 确保是最新版本，不然报错
cd ~/pytorch/
pip install -r requirements.txt
export CMAKE_PREFIX_PATH=${CONDA_PREFIX:-"$(dirname $(which conda))/../"}
export USE_CUDA=1
export USE_CUDNN=1
CUDNN_HOME=~/cuda/cudnn-linux-x86_64-8.9.4.25_cuda11-archive
export CUDNN_LIB_DIR=$CUDNN_HOME/lib
export CUDNN_INCLUDE_DIR=$CUDNN_HOME/include
export CUDNN_LIBRARY=$CUDNN_HOME/lib/libcudnn.so
export CUDNN_LIBRARY_PATH=$CUDNN_LIBRARY
export CUDA_HOME=/opt/app/cuda/11.2
export CMAKE_CUDA_COMPILER=$CUDA_HOME/bin/nvcc
export CMAKE_CUDA_ARCHITECTURES="60;70;75;80"
export TORCH_CUDA_ARCH_LIST="6.0;7.0;7.5;8.0"
GCC_HOME=~/miniconda3/envs/gcc
export CUDAHOSTCXX=$GCC_HOME/bin/g++
export CC=$GCC_HOME/bin/gcc
export CXX=$GCC_HOME/bin/g++
export PATH=$CUDA_HOME/bin:$PATH
export LD_LIBRARY_PATH=$CUDA_HOME/lib64:$CUDA_HOME/extras/CUPTI/lib64:$CUDNN_LIB_DIR:$LD_LIBRARY_PATH
rm -rf build
python setup.py develop -allow-unsupported-compiler
```

## 检测 pytorch
```bash
source ~/.bashrc
conda run -n gpu whereis python
## /home/uxxx/miniconda3/envs/gpu/bin/python
nano test.py && chmod +x test.py
```
```python
#!/home/uxxx/miniconda3/envs/gpu/bin/python

# 检测CUDA是否安装正确并能被Pytorch检测
import torch # 如果pytorch安装成功即可导入
print(torch.cuda.is_available()) # 查看CUDA是否可用
print(torch.cuda.device_count()) # 查看可用的CUDA数量
print(torch.version.cuda) # 查看CUDA的版本号

# 检测能否调用CUDA加速
a = torch.Tensor(5,3)
a = a.cuda()
print(a)
```
```bash
#!/bin/bash

### 设置该作业的作业名
#SBATCH --job-name=test-nvidia

### 指定该作业的运行分区，sinfo 获取分区列表
#SBATCH --partition=body

### 指定申请的节点
#SBATCH --nodelist=gpu4

### 排除指定的节点；
#SBATCH --exclude=gpu1

### 指定该作业需要1个节点数
#SBATCH --nodes=1

### 该作业需要1个CPU
#SBATCH --ntasks=1

### 申请1块GPU卡
#SBATCH --gres=gpu:1

### 指定从哪个项目扣费。如果没有这条参数，则从个人账户扣费
#SBATCH --comment public_cluster

### 程序的执行命令
source ~/.bashrc
source activate gpu
cd ~
GCC_HOME=~/miniconda3/envs/gcc
export CC=$GCC_HOME/bin/gcc
export CXX=$GCC_HOME/bin/g++
DRIVER_HOME=/opt/app/nvidia/460.91.03
export PATH=$DRIVER_HOME/bin:$PATH # 重要
export LD_LIBRARY_PATH=$DRIVER_HOME/lib:$LD_LIBRARY_PATH # 重要

python ./test.py
```