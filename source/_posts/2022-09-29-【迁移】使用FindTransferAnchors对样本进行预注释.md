---
title: 【迁移】使用FindTransferAnchors对样本进行预注释
urlname: shi-yong-FindTransferAnchors-dui-yang-ben-jin-hang-yu-zhu-shi
date: 2022-09-29 17:58:50
index_img: https://api.limour.top/randomImg?d=2022-09-29 17:58:50
tags: FindTransferAnchors
---

## 处理参考样本

```R
ref_sce <- readRDS('~/upload/zl_liu/data/pca.rds')
ref_sce <- subset(ref_sce, group == 'CRPC')
table(ref_sce@meta.data$cell_type_fig3)
g2m_genes <- Seurat::CaseMatch(search=Seurat::cc.genes$g2m.genes, 
                               match=rownames(ref_sce))
s_genes <- Seurat::CaseMatch(search=Seurat::cc.genes$s.genes, 
                             match=rownames(ref_sce))
ref_sce <- Seurat::CellCycleScoring(ref_sce, g2m.features=g2m_genes, s.features=s_genes)
ref_sce$CC.Difference <- ref_sce$S.Score - ref_sce$G2M.Score 
ref_sce[["percent.mt"]] <- Seurat::PercentageFeatureSet(ref_sce, pattern = "^MT-")
ref_sce[["percent.ERCC"]] <- Seurat::PercentageFeatureSet(ref_sce, pattern = "^ERCC-")
ref_sce[["percent.rp"]] <- Seurat::PercentageFeatureSet(ref_sce, pattern = "^RP[SL]")
ref_sce <- Seurat::SplitObject(object = ref_sce, split.by = 'orig.ident')
```

### integration

```R
ref_sce <- lapply(X = ref_sce, FUN = function(x) {
    x <- Seurat::SCTransform(x, vst.flavor = "v2",
                           vars.to.regress = c("CC.Difference", "percent.mt", "percent.rp"),
                           verbose = F)
})
features <- Seurat::SelectIntegrationFeatures(object.list = ref_sce, 
                                              assay = rep('SCT', length(ref_sce)))
ref_sce <- Seurat::PrepSCTIntegration(object.list = ref_sce, 
                                      anchor.features = features, 
                                      assay = rep('SCT', length(ref_sce)))
anchors <- Seurat::FindIntegrationAnchors(object.list = ref_sce, 
                                          normalization.method = "SCT",
                                          anchor.features = features, 
                                          assay = rep('SCT', length(ref_sce)))
combined <- Seurat::IntegrateData(anchorset = anchors,
                                 normalization.method = "SCT")
combined <- Seurat::RunPCA(combined, verbose = FALSE)
combined <- Seurat::RunUMAP(combined, 
                            reduction = "pca", dims = 1:30,
                            verbose = FALSE)
Seurat::DimPlot(combined, reduction = "umap", 
                group.by = "cell_type_fig3",
                repel = T, label = T)
```

## 处理预处理完的样本

[样本来自此](/shi-yong-SCTransform-biao-zhun-hua)

### 打个补丁

```R
sce <- readRDS('SRX6887740.rds')
Seurat::DefaultAssay(sce) <- 'RNA'
sce[["percent.rp"]] <- Seurat::PercentageFeatureSet(sce, pattern = "^RP[SL]")
sce <- Seurat::SCTransform(sce, vst.flavor = "v2",
                       vars.to.regress = c("CC.Difference", "percent.mt", "percent.rp"),
                       verbose = F)
```

### FindTransferAnchors

```R
anchors <- Seurat::FindTransferAnchors(reference = combined, query = sce,
                                      normalization.method = "SCT",
                                      reference.assay = 'integrated',
                                      query.assay = 'SCT')
```

### TransferData

```R
predictions <- Seurat::TransferData(anchorset = anchors, 
                            refdata = combined$cell_type_fig3)
sce <- AddMetaData(object = sce, metadata = predictions)
```

### 可视化

```R
sce <- Seurat::RunPCA(sce, verbose = FALSE)
sce <- Seurat::RunUMAP(sce, reduction = "pca", 
                       dims = 1:30, 
                       verbose = FALSE)
Seurat::DimPlot(sce, reduction = "umap", 
                group.by = "predicted.id",
                repel = T, label = T)
```