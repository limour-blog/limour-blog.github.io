---
title: 【迁移】Rclone备份 VPS 数据到 onedrive
urlname: Rclone-bei-fen-VPS-shu-ju-dao-onedrive
date: 2023-01-30 23:00:16
index_img: https://api.limour.top/randomImg?d=2023-01-30 23:00:16
tags: ['rclone', 'onedrive']
---
## Rclone 挂载 onedrive
+ 下载 [电脑版](https://rclone.org/downloads)，解压，进入目录，左上角文件，打开 PowerShell
+ ./rclone config
+ n
+ onedrive
+ 32 MS OneDrie
+ enter
+ enter
+ 1
+ enter
+ enter
+ 1
+ enter
+ enter
+ 复制下窗口的json
+ enter
+ q
+ 登录服务器
+ mkdir rclone && cd rclone
+ curl https://rclone.org/install.sh | sudo bash
+ rclone config
+ n
+ onedrive
+ 32 MS OneDrie
+ enter
+ enter
+ 1
+ enter
+ n
+ 粘贴token
+ 1
+ enter
+ enter
+ q
## 备份脚本
```bash
#!/bin/bash
tar -zcPf /root/tmp/ngpm_live.tar.gz /root/base/NGPM/letsencrypt/live
# tar -tzvPf /root/tmp/ngpm_live.tar.gz
rclone sync --progress --ignore-errors --transfers=2 \
--exclude='/.*/**' \
--exclude='/.*' \
--exclude='/app/ServerStatus/serverstatus-monthtraffic/**' \
--exclude='/app/WordPress/www/wp-content/cache/**' \
--exclude='/base/NGPM/letsencrypt/live/**' \
--exclude='/base/NGPM/data/logs/**' \
/root od_lk:backup/lk 
```
```bash
nano /root/backup.sh && chmod +x /root/backup.sh
/root/backup.sh
crontab -e
# 30 2 * * 2,4,6 /root/backup.sh
crontab -l
```
## 使用Rclone搭配OneDrive迁移大量数据
之前在自己的小机器上分析，现在需要在学校集群进行分析，因此需要在两个没有公网ip且不互联的服务器之间转移大量数据。因此计划使用Rclone，通过OneDrive进行中转。

### 打包需要转移的数据

```R
data <- list()
ref_sce <- readRDS('~/upload/zl_liu/data/pca.rds')
data$zyy_umi <- ref_sce@assays$RNA@counts
data$zyy_meta <- ref_sce@meta.data
ref_sce <- readRDS('~/work_st/Prognosis/idea_2/fig3.2/fig6/sce.rds')
data$ch_umi <- ref_sce@assays$originalexp@counts
data$ch_meta <- ref_sce@meta.data
# tp_dir <- list(
#     SRX6887739 = '~/work_st/sce/GSE137829/res/SRX6887739/outs/filtered_feature_bc_matrix',
#     SRX6887740 = '~/work_st/sce/GSE137829/res/SRX6887740/outs/filtered_feature_bc_matrix',
#     SRX6887741 = '~/work_st/sce/GSE137829/res/SRX6887741/outs/filtered_feature_bc_matrix',
#     SRX6887742 = '~/work_st/sce/GSE137829/res/SRX6887742/outs/filtered_feature_bc_matrix',
#     SRX8890105 = '~/work_st/sce/GSE137829/res/SRX8890105/outs/filtered_feature_bc_matrix',
#     SRX8890106 = '~/work_st/sce/GSE137829/res/SRX8890106/outs/filtered_feature_bc_matrix'
# )
# counts <- Seurat::Read10X(data.dir = unlist(tp_dir))
# sce <- Seurat::CreateSeuratObject(counts, project = 'GSE137829',
#                             min.cells = 3, min.features = 200)
# data$GSE137829_umi <- sce@assays$RNA@counts
# data$GSE137829_meta <- sce@meta.data
tp_dir <- list(
    P1 = '~/work/GSE137829/GSM4089151_P1_gene_cell_exprs_table.txt.gz',
    P2 = '~/work/GSE137829/GSM4089152_P2_gene_cell_exprs_table.txt.gz',
    P3 = '~/work/GSE137829/GSM4089153_P3_gene_cell_exprs_table.txt.gz',
    P4 = '~/work/GSE137829/GSM4089154_P4_gene_cell_exprs_table.txt.gz',
    P5 = '~/work/GSE137829/GSM4711414_P5_gene_cell_exprs_table.txt.gz',
    P6 = '~/work/GSE137829/GSM4711415_P6_gene_cell_exprs_table.txt.gz'
)
sce <- list()
for (i in names(tp_dir)){
    tmp <- read.table(gzfile(tp_dir[[i]]), header = T)
    umi <- Matrix::as.matrix(x = tmp[-c(1,2)])
    umi <- Matrix::Matrix(data = umi, sparse = T)
    rownames(umi) <- tmp$Symbol
    sce[[i]] <- Seurat::CreateSeuratObject(umi, project = i,
                                min.cells = 3, min.features = 200)
}
sce <- Reduce(merge, sce)
data$geo_umi <- sce@assays$RNA@counts
data$geo_meta <- sce@meta.data
saveRDS(data, '22.10.04.rds')
```

### Rclone挂载OneDrive

*   conda activate jupyter
*   conda install -c conda-forge rclone -y

在两台服务器上挂载同一个OneDrive，第二台可以直接使用第一台的配置，文件路径在 `~/.config/rclone/rclone.conf`

### Rclone上传下载数据

*   rclone copy --ignore-existing --progress --ignore-errors --transfers=1 ./22.10.04.rds onedrive:tmp
*   rclone ls onedrive:tmp
*   rclone copy --ignore-existing --progress --ignore-errors --transfers=1 onedrive:tmp/22.10.04.rds .