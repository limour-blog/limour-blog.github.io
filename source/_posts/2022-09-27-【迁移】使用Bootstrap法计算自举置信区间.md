---
title: 【迁移】使用Bootstrap法计算自举置信区间
urlname: shi-yong-Bootstrap-fa-ji-suan-zi-ju-zhi-xin-qu-jian
date: 2022-09-27 19:25:08
tags: Bootstrap
---

计算药物LD50用Bliss法最严谨，而改良寇氏法计算的结果误差也不大，因此做了一次改良寇氏法计算LD50的实验。最后需要计算一下结果的可信区间，于是来试试万能的Bootstrap法

## 安装包（这个例子用不上）

*   [conda activate MICE](/shi-yong-MICE-bao-dui-shu-ju-que-shi-zhi-jin-hang-cha-bu)
*   conda install -c conda-forge r-boot=1.3\_28 -y

## 构造样本
| 组别 | 剂量 mg/kg | 动物数 | 死亡数 |
| ---- | ---------- | ------ | ------ |
| 1    | 110.8      | 10     | 0      |
| 2    | 147.7      | 10     | 0      |
| 3    | 196.9      | 10     | 5      |
| 4    | 262.5      | 10     | 8      |
| 5    | 350.0      | 10     | 10     |

```R
data <- list(
    g1 = rep(0,10),
    g2 = rep(0,10),
    g3 = c(rep(0,5),rep(1,5)),
    g4 = c(rep(0,2),rep(1,8)),
    g5 = rep(1,10)
)
```

## 计算自举置信区间

### 定义统计量

```R
ln <- log
ld50 <- function(data){
    g1 <- mean(sample(x = data$g1, size = 10, replace = T))
    g2 <- mean(sample(x = data$g2, size = 10, replace = T))
    g3 <- mean(sample(x = data$g3, size = 10, replace = T))
    g4 <- mean(sample(x = data$g4, size = 10, replace = T))
    g5 <- mean(sample(x = data$g5, size = 10, replace = T))
    sigma_p <- sum(g1, g2, g3, g4, g5)
    exp(ln(350) - ln(4/3)*(sigma_p - 0.5))
}
```

### 计算 the bootstrap percentile interval

```R
set.seed(123)
res <- vector(mode = "list", length = 1000)
for (i in 1:1000){
    res[[i]] <- ld50(data)
}
res <- sort(unlist(res))
hist(res)
quantile(res,0.975)
quantile(res,0.025)
```

### 计算P值

```R
f_Rbisect <- function(lst, value){
    low=1
    high=length(lst)
    if(high == low){return(1)}
    mid=length(lst)%/%2
    if(lst[low] == value & value == lst[low + 1]){
        return(low + 0.5)
    }
    if(lst[high] == value & value == lst[high - 1]){
        return(high - 0.5)
    }
    if (lst[low] >= value){return(low)}
    if (lst[high] <= value){return(high)}
    while (lst[mid] != value) {
        if (value > lst[mid]){
            low  <-  mid + 1
        }else{
            high  <-  mid - 1
        }
        if (high <= low) { break }
        mid  <-  (low+high)%/%2
    }
    while(T){
        mid0 <- mid - 1
        mid2 <- mid + 1
        if(lst[mid0] == lst[mid2]){
            return(mid)
        }
        if(lst[mid0] <= value & value <=lst[mid]){
            if(lst[mid0] == lst[mid]){
                return(mid - 0.5)
            }
            t = (value - lst[mid0])/(lst[mid] - lst[mid0])
            return(mid0 + t)
        }
        if(lst[mid] <= value & value <= lst[mid2]){
            if(lst[mid] == lst[mid2]){
                return(mid + 0.5)
            }
            t = (value - lst[mid])/(lst[mid2] - lst[mid])
            return(mid + t)
        }
        if(value < lst[mid0]){
            mid  <- mid0
        }else{
            mid  <- mid2
        }
    }
}
```

```R
f_Rbisect(res, exp(ln(350) - ln(4/3)*(0+0+0.5+0.8+1 - 0.5)))/1000
```