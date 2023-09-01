---
title: 【迁移】Counts矩阵的标准化方法：TMM和VST、RLOG
urlname: Counts-ju-zhen-de-biao-zhun-hua-fang-fa--TMM-he-VST-RLOG
date: 2022-07-27 20:10:38
tags: ['TMM', 'VST', 'RLOG']
---
*   [TMM](https://genomebiology.biomedcentral.com/articles/10.1186/gb-2010-11-3-r25)：The Trimmed Mean of M value by edgeR
*   [VST](http://bioconductor.org/packages/devel/bioc/vignettes/DESeq2/inst/doc/DESeq2.html)：The variance stabilizing transformation by DESeq2
*   [RLOG](http://bioconductor.org/packages/devel/bioc/vignettes/DESeq2/inst/doc/DESeq2.html)：The regularized-logarithm transformation by DESeq2

Counts矩阵来源于[STAR匹配得到的结果](/STAR--yi-jian-jiao-ben)：`df <- read.csv('GSE123379.csv', row.names = 1)`

## 安装补充包

*   [conda activate tcga](/cong-cha-yi-ji-yin-dao-RRA-ju-he)
*   conda install -c bioconda bioconductor-edger -y

## TMM方法

```R
f_counts2TMM <- function(countsMatrix){
    require(edgeR)
    TMM <- DGEList(counts = countsMatrix)
    TMM <- calcNormFactors(TMM, method = 'TMM')
    cpm(TMM, normalized.lib.sizes = TRUE, log=F)
}
countsMatrix <- df[-(1:3)]
TMM <- f_counts2TMM(countsMatrix)
TMM
```

## VST方法

```R
f_counts2VST <- function(countsMatrix){
    require(DESeq2)
    conditions <- factor(rep("Control",ncol(countsMatrix)))
    colData_b <- data.frame(row.names = colnames(countsMatrix), conditions)
    dds <- DESeqDataSetFromMatrix(countData = countsMatrix,
                              colData = colData_b,
                              design = ~ 1)
    vsd <- vst(object=dds, blind=T) 
    assay(vsd)
}
countsMatrix <- df[-(1:3)]
VST <- f_counts2VST(countsMatrix)
VST
```

## RLOG方法

```R
f_counts2RLOG <- function(countsMatrix){
    require(DESeq2)
    conditions <- factor(rep("Control",ncol(countsMatrix)))
    colData_b <- data.frame(row.names = colnames(countsMatrix), conditions)
    dds <- DESeqDataSetFromMatrix(countData = countsMatrix,
                              colData = colData_b,
                              design = ~ 1)
    rld  <- rlog(object=dds, blind=T) 
    assay(rld)
}
countsMatrix <- df[-(1:3)]
RLOG <- f_counts2RLOG(countsMatrix)
RLOG
```