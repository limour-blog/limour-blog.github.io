---
title: 【记录】使用 circacompare 分析生物节律
urlname: shi-yong-circacompare-fen-xi-sheng-wu-jie-lv
index_img: https://api.limour.top/randomImg?d=2024-11-08 15:50:20
date: 2024-11-08 23:50:20
tags: 节律
---
circacompare 是一个专为分析生物节律数据而设计的 R 包。它的主要功能是比较不同条件下的节律参数，例如振幅、周期和相位。circacompare 使用非线性混合效应模型来拟合节律数据，这使得它在处理具有重复测量和复杂实验设计的数据时表现出色。与 circacompare 相比，[MetaCycle](./shi-yong--JTK-CYCLE--suan-fa-fen-xi-sheng-wu-jie-lv) 是另一个流行的 R 包，用于生物节律分析。MetaCycle 提供了多种算法（如 ARSER、JTK_CYCLE 和 Lomb-Scargle）来检测时间序列数据中的周期性信号。它的优势在于能够处理大规模数据集，并且适用于各种不同的实验条件。

## conda安装包
```bash
conda create -n zct conda-forge::r-tidyverse conda-forge::r-irkernel
conda run -n zct Rscript -e "IRkernel::installspec(name='zct', displayname='zct')"
conda run -n zct Rscript -e "install.packages('circacompare')"
```

## 导入包和数据
```R
library(tidyverse)
library(circacompare)
library(ggplot2)

dt <- readr::read_csv('./circacompare.CSV') %>% 
mutate(group = factor(group)) %>% 
mutate(organ = factor(organ)) %>% 
mutate(project = factor(project))
```

## 两组比较
```R
s_symbol = 'Bmal1' 
s_organ = 'Heart'
s_project = 'compare1'

# 根据参数选择数据
dt_s <- dt %>% 
subset(symbol == s_symbol & organ == s_organ & project == s_project)  %>% 
mutate(group = factor(group))
# 进行比较
result <- circacompare(x = dt_s, col_time = "time", col_group = "group", col_outcome = "measure", alpha_threshold = 1)
# 查看统计汇总
result$summary
circacompare:::extract_model_coefs(result$fit)

# 查看绘图
save_plot <- result$plot + 
theme_minimal() +  
ggtitle(paste(c(s_symbol, s_organ), collapse = '_')) +
theme(plot.title = element_text(hjust = 0.5))

save_plot

# 保存图为 pdf
{pdf(file = paste0('pdf/', paste(c(s_symbol, s_organ, s_project), collapse = '_'), '.pdf'), width = 6, height = 6)
 print(save_plot)
dev.off()}
```

## 单组绘图
```R
s_symbol = 'Rev-erbα' 
s_organ = 'Kidney'
s_project = 'KO-AL'

# 根据参数选择数据
dt_s <- dt %>% 
subset(symbol == s_symbol & organ == s_organ & project == s_project)  %>% 
mutate(group = factor(group))

# 进行统计分析
options(show.error.messages = F, warn = -1)
result <- try({
  circa_single(
    x = dt_s, col_time = "time", col_outcome = "measure", period = 24, alpha_threshold = 1,
    timeout_n = 100000,
    control = list(
      main_params = c("k", "alpha", "phi")
    )
  )
}, silent = TRUE)
options(show.error.messages = T, warn = 1)
# “k”表示中值，“alpha”表示振幅，“phi”表示相位。引入的额外参数是“tau”表示周期。


# 查看统计汇总
result$summary
circacompare:::extract_model_coefs(result$fit)

# 查看绘图
save_plot <- result$plot + 
theme_minimal() +  
ggtitle(paste(c(s_symbol, s_organ), collapse = '_')) +
theme(plot.title = element_text(hjust = 0.5))

save_plot

# 保存图为 pdf
{pdf(file = paste0('pdf/', paste(c(s_symbol, s_organ, s_project), collapse = '_'), '.pdf'), width = 6, height = 6)
 print(save_plot)
dev.off()}
```

## 周期和衰减参数
```R
s_symbol = 'Bmal1' 
s_organ = 'Heart'
s_project = 'compare1'

# 根据参数选择数据
dt_s <- dt %>% 
subset(symbol == s_symbol & organ == s_organ & project == s_project)  %>% 
mutate(group = factor(group))

# 进行统计分析
options(show.error.messages = F, warn = -1)
result <- try({
  circa_single(
    x = dt_s, col_time = "time", col_group = "group", col_outcome = "measure", period = 24, alpha_threshold = 1,
    timeout_n = 100000,
    control = list(
      main_params = c("k", "alpha", "phi"),
      decay_params = c("alpha"),
      grouped_params = c("alpha", "alpha_decay")
    )
  )
}, silent = TRUE)
options(show.error.messages = T, warn = 1)
# “k”表示中值，“alpha”表示振幅，“phi”表示相位。引入的额外参数是“tau”表示周期。

# 进行统计分析
result <- try({
  circacompare(
    x = dt_s, "time", "group", "measure", period = NA, alpha_threshold = 1,
    timeout_n = 100000,
    control = list(
      main_params = c("k", "alpha", "phi", "tau"),
      decay_params = c("alpha"),
      grouped_params = c("alpha", "alpha_decay"),
      period_min = 24, period_max = 24
    )
  )
}, silent = TRUE)
# “k”表示中值，“alpha”表示振幅，“phi”表示相位。引入的额外参数是“tau”表示周期。

# 查看统计汇总
result$summary
circacompare:::extract_model_coefs(result$fit)

# 查看绘图
save_plot <- result$plot + 
theme_minimal() +  
ggtitle(paste(c(s_symbol, s_organ), collapse = '_')) +
theme(plot.title = element_text(hjust = 0.5))

save_plot

# 保存图为 pdf
{pdf(file = paste0('pdf/', paste(c(s_symbol, s_organ, s_project), collapse = '_'), '_decay.pdf'), width = 6, height = 6)
 print(save_plot)
dev.off()}
```