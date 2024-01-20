---
title: 【迁移】CellTypist 注释免疫细胞亚群
urlname: -qian-yi-CellTypist-zhu-shi-mian-yi-xi-bao-ya-qun
date: 2022-02-22 13:35:24
index_img: https://api.limour.top/randomImg?d=2022-02-22 13:35:24
tags: ['celltypist', '生信', '分群', '注释']
excerpt: 安装CellTypist并配置环境，加载所需的包，加载数据，将Seurat对象转换为scanpy对象，对每个细胞进行观察，对基因矩阵进行注释，组装AnnData对象，进行预测，并将预测结果添加到Seurat对象中。
---
## 安装 CellTypist
+ [配置环境](/-ji-lu--an-zhuang-sheng-xin-de-dai-ma-bian-xie-huan-jing)
```bash
conda create -n celltypist -c conda-forge r-base=4.1.2
conda activate celltypist
conda install -c conda-forge r-seurat=4.1.0 -y
conda install -c conda-forge r-irkernel=1.3 -y
IRkernel::installspec(name='celltypist', displayname='r-celltypist')
conda install -c conda-forge scanpy=1.8.2 -y
/opt/conda/envs/celltypist/bin/pip3 install celltypist -i https://pypi.tuna.tsinghua.edu.cn/simple
conda install -c conda-forge r-reticulate=1.24 -y
python3
import celltypist
celltypist.models.download_models(force_update = False)
```
## 加载包
```R
Sys.setenv(RETICULATE_PYTHON = "/opt/conda/envs/celltypist/bin/python3.8")
library(reticulate)
scanpy = import("scanpy")
celltypist = import("celltypist")
pandas <- import("pandas")
numpy = import("numpy")
py_config()
```
## 加载数据
```R
library(Seurat)
sce <- readRDS("~/upload/yy_zhang_data/scRNA-seq/pca.celltype.rds")
Myeloid <- subset(sce, cell_type=='Myeloid')
```
## seurat 转 scanpy
```R
# 数据矩阵, scanpy与Seurat的行列定义相反
adata.X = numpy$array(t(as.matrix(Myeloid[['RNA']]@counts)))
# 对每个细胞的观察
adata.obs = pandas$DataFrame(Myeloid@meta.data[colnames(Myeloid[['RNA']]@counts),])
# 对基因矩阵的注释
adata.var = pandas$DataFrame(data.frame(gene = rownames(Myeloid[['RNA']]@counts), row.names = rownames(Myeloid[['RNA']]@counts)))
 
# 组装AnnData对象
adata = scanpy$AnnData(X = adata.X, obs=adata.obs, var=adata.var)
```
## 进行预测
```R
model = celltypist$models$Model$load(model = 'Immune_All_AddPIP.pkl')
model$cell_types
scanpy$pp$normalize_total(adata, target_sum=1e4)
scanpy$pp$log1p(adata)
predictions = celltypist$annotate(adata, model = 'Immune_All_AddPIP.pkl', majority_voting = T)
```
## 预测添加到 seurat 对象
```R
Myeloid = AddMetaData(Myeloid, predictions$predicted_labels)
```