---
title: 【迁移】cellranger定量：One Library, Multiple Flowcells
urlname: cellranger-ding-liang--One-Library--Multiple-Flowcells
date: 2022-09-25 19:42:28
tags: ['cellranger', 'scVelo']
---
## 重命名R1、R2
+ [原始数据质控](/shi-yong-GATK-zhao-SNP#fastp一键质控)
### 重命名前

├── SRR12391722  
│ ├── SRR12391722\_1.fastq.gz  
│ └── SRR12391722\_2.fastq.gz  
├── SRR12391723  
│ ├── SRR12391723\_1.fastq.gz  
│ └── SRR12391723\_2.fastq.gz  
├── SRR12391724  
│ ├── SRR12391724\_1.fastq.gz  
│ └── SRR12391724\_2.fastq.gz  
└── SRR12391725  
│├── SRR12391725\_1.fastq.gz  
│└── SRR12391725\_2.fastq.gz

### 重命名后

SRX8890106  
├── SRX8890106\_S1\_L001\_R1\_001.fastq.gz  
├── SRX8890106\_S1\_L001\_R2\_001.fastq.gz  
├── SRX8890106\_S1\_L002\_R1\_001.fastq.gz  
├── SRX8890106\_S1\_L002\_R2\_001.fastq.gz  
├── SRX8890106\_S1\_L003\_R1\_001.fastq.gz  
├── SRX8890106\_S1\_L003\_R2\_001.fastq.gz  
├── SRX8890106\_S1\_L004\_R1\_001.fastq.gz  
└── SRX8890106\_S1\_L004\_R2\_001.fastq.gz

## 进行定量

[Running cellranger count](https://support.10xgenomics.com/single-cell-gene-expression/software/pipelines/latest/using/tutorial_ct); [cellranger 安装](https://support.10xgenomics.com/single-cell-gene-expression/software/pipelines/latest/installation)

```bash
#!/bin/bash
export PATH=/opt/cellranger/cellranger-6.1.2:$PATH
db=/opt/cellranger/refdata-gex-GRCh38-2020-A
data=/home/jovyan/work_st/sce/GSE137829/data
work=/home/jovyan/work_st/sce/GSE137829/res
mkdir $work
cd $work
for sample in ${data}/*;
do
echo $sample
sample_res=${sample##*/}
cellranger count --id=$sample_res \
--localcores=12 \
--transcriptome=$db \
--fastqs=$sample \
--sample=$sample_res \
--expect-cells=5000
done
```

*   nano 103.sh
*   chmod +x 103.sh
*   ./103.sh

## 附加：scVelo 细胞轨迹

### 安装依赖

#### cellranger
GRCh38\_rmsk.gtf.gz：[https://genome.ucsc.edu/cgi-bin/hgTables](https://genome.ucsc.edu/cgi-bin/hgTables?hgsid=611454127_NtvlaW6xBSIRYJEBI0iRDEWisITa&clade=mammal&org=Human&db=0&hgta_group=allTracks&hgta_track=rmsk&hgta_table=rmsk&hgta_regionType=genome&position=&hgta_outputType=gff&hgta_outFileName=GRCh38_rmsk.gtf)

![](https://img.limour.top/2023/09/01/64f1cf9a391ae.webp)

```bash
cd /opt/cellranger
wget <Cell Ranger>
wget <References>
tar -xzvf cellranger-6.1.2.tar.gz
tar -xzvf refdata-gex-GRCh38-2020-A.tar.gz
下载 GRCh38_rmsk.gtf.gz 上传阿里云盘
./aliyunpan
login
d GRCh38_rmsk.gtf.gz -saveto /opt/cellranger
gunzip GRCh38_rmsk.gtf.gz
export PATH=/opt/cellranger/cellranger-6.1.2:$PATH
cellranger sitecheck > sitecheck.txt
cellranger upload xxx@fudan.edu.cn sitecheck.txt
cellranger testrun --id=tiny
cellranger upload xxx@fudan.edu.cn tiny/tiny.mri.tgz
```
#### velocyto

```bash
conda create -n velocyto -c conda-forge python=3.7 -y
conda activate velocyto
conda install numpy scipy cython numba matplotlib scikit-learn h5py click -y
pip install pysam
pip install velocyto
velocyto --help
conda install -c bioconda samtools=1.15.1 -y
```

#### scVelo
```bash
conda install -c conda-forge widgetsnbextension -y
jupyter nbextension enable --py widgetsnbextension
# 重启 jupyter
conda create -n scVelo -c conda-forge python=3.7 -y
conda activate scVelo
conda install -c conda-forge scanpy -y
conda install -c conda-forge matplotlib -y
pip install -U scvelo
pip install -U tqdm ipywidgets
conda install -c conda-forge ipykernel -y
python -m ipykernel install --user --name python-scVelo
```

### 准备1：运行 cellranger
data  
├── hPB003  
│ ├── hPB003\_S1\_L001\_R1\_001.fastq.gz  
│ └── hPB003\_S1\_L001\_R2\_001.fastq.gz  
├── hPB004  
│ ├── hPB004\_S1\_L001\_R1\_001.fastq.gz  
│ └── hPB004\_S1\_L001\_R2\_001.fastq.gz  
├── hPB005  
│ ├── hPB005\_S1\_L001\_R1\_001.fastq.gz  
│ └── hPB005\_S1\_L001\_R2\_001.fastq.gz  
├── hPB006  
│ ├── hPB006\_S1\_L001\_R1\_001.fastq.gz  
│ └── hPB006\_S1\_L001\_R2\_001.fastq.gz  
└── hPB007  
├── hPB007\_S1\_L001\_R1\_001.fastq.gz  
└── hPB007\_S1\_L001\_R2\_001.fastq.gz

```bash
#!/bin/bash
export PATH=/opt/cellranger/cellranger-6.1.2:$PATH
db=/opt/cellranger/refdata-gex-GRCh38-2020-A
data=/home/jovyan/upload/zl_liu/data/data/data
work=/home/jovyan/upload/zl_liu/data/data/res
mkdir $work
cd $work
for sample in ${data}/*;
do echo $sample
sample_res=${sample##*/}
cellranger count --id=$sample_res \
--localcores=4 \
--transcriptome=$db \
--fastqs=$sample \
--sample=$sample_res \
--expect-cells=5000
done
```
### 准备2：从cellranger得到loom文件
```bash
conda activate velocyto
#!/bin/bash
db=/opt/cellranger/refdata-gex-GRCh38-2020-A
work=/home/jovyan/upload/zl_liu/data/data/res
rmsk_gtf=/opt/cellranger/GRCh38_rmsk.gtf # 从genome.ucsc.edu下载 
cellranger_gtf=${db}/genes/genes.gtf
ls -lh $rmsk_gtf  $work $cellranger_gtf
for sample in ${work}/*;
do echo $sample
velocyto run10x -m $rmsk_gtf $sample $cellranger_gtf
done
```
### 准备3：从 Seurat 输出 标注 和 UMAP
```r
library(Seurat)
library(tidyverse)
library(stringr)
sce <- readRDS("~/upload/zl_liu/data/pca.rds")
```

```r
f_scVelo_group_by <- function(df, groupN){
    res <- list()
    for(n in unique(as.character(df[[groupN]]))){
        res[[n]] <- df[df[[groupN]] == n,]
    }
    res
}
f_scVelo_get_reduction <- function(dfl, cell.embeddings){
    for(n in names(dfl)){
        dfl[[n]] <- cbind(dfl[[n]], cell.embeddings[rownames(dfl[[n]]),])
    }
    dfl
}
f_scVelo_str_extract_rowN <- function(dfl, grepP='(?=.{10})([AGCT]{16})(?=-1)'){
    for(n in names(dfl)){
        rownames(dfl[[n]]) <- str_extract(rownames(dfl[[n]]), grepP)
    }
    dfl
}

test <- f_scVelo_group_by(sce[[c('patient_id','cell_type_fig3')]], 'patient_id')
test <- f_scVelo_get_reduction(test, sce@reductions$umap@cell.embeddings)
test <- f_scVelo_get_reduction(test, sce@reductions$pca@cell.embeddings)
test <- f_scVelo_str_extract_rowN(test)
```

```r
f_scVelo_label_reduction <- function(dfl, workdir, groupN, outDir){
    outDir = file.path(workdir, outDir, 'velocyto', 'metadata.csv')
    write.csv(dfl[[groupN]], outDir)
}

work='/home/jovyan/upload/zl_liu/data/data/res'
f_scVelo_label_reduction(test, work, 'patient1', 'hPB003')
f_scVelo_label_reduction(test, work, 'patient3', 'hPB004')
f_scVelo_label_reduction(test, work, 'patient4', 'hPB006')
f_scVelo_label_reduction(test, work, 'patient5', 'hPB007')
```
### 运行1: 合并数据
#### 第一步 导入模块

```python
import scvelo as scv
import scanpy as sc
import numpy as np
import pandas as pd
import seaborn as sns 
scv.settings.verbosity = 3  # show errors(0), warnings(1), info(2), hints(3)
scv.settings.set_figure_params('scvelo')  # for beautified visualization
```

#### 第二步 读取数据（时间很长）

```python
loomf = '/home/jovyan/upload/zl_liu/data/data/res/hPB003/velocyto/hPB003.loom'
adata = scv.read(loomf, cache=False)
metadataf = '/home/jovyan/upload/zl_liu/data/data/res/hPB003/velocyto/metadata.csv'
meta = pd.read_csv(metadataf, index_col=0)
```

#### 第三步 取交集并合并数据

```python
tmp = [x for x in  (x[7:23] for x in adata.obs.index) if x in meta.index]
meta = meta.loc[tmp]
adata = adata[[f'hPB003:{x}x' for x in tmp]]

test = meta['cell_type_fig3']
test.index = adata.obs.index
adata.obs['cell_type_fig3'] = test

adata.obsm['X_pca'] =  np.asarray(meta.iloc[:, 4:])
adata.obsm['X_umap'] = np.asarray(meta.iloc[:, 2:4])

sc.pl.pca(adata, color='cell_type_fig3')
sc.pl.umap(adata, color='cell_type_fig3')
```
### 运行2: 计算绘图
#### 计算
```python
scv.pp.moments(adata, n_pcs=30, n_neighbors=30)

scv.tl.recover_dynamics(adata, n_jobs=8)

scv.tl.velocity(adata, mode='dynamical')

scv.tl.velocity_graph(adata, n_jobs=8)

adata.write('hPB003.h5ad')
```

#### 绘图
```python
from matplotlib.pyplot import rc_context
with rc_context({'figure.figsize': (12, 12)}):
    scv.pl.velocity_embedding_stream(adata, basis='umap', color=['cell_type_fig3'], save = "hPB003 velocity embedding stream.svg")
```

![细胞分化轨迹图](https://img.limour.top/2023/09/01/64f1d34304c5a.webp)