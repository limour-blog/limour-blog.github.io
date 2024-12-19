---
title: 【记录】OpenWrt配置QoS规则
urlname: openwrt-qos-configuration
index_img: https://api.limour.top/randomImg?d=2024-12-16 13:26:24
date: 2024-12-16 21:26:24
tags: QoS
---
在宿舍环境下，QoS可以帮助优化带宽使用，确保关键应用（如视频通话、在线游戏等）获得足够的带宽支持，减少延迟和卡顿现象。其次，QoS还可以通过限制非关键应用的数据流，防止它们占用过多的带宽资源，从而保障其他重要服务的正常运行。此外，QoS还可以实现公平的带宽分配，避免单一用户过度占用资源，影响其他用户的网络体验。因此，尽管会损失硬件转发性能， OpenWrt 仍然是非常有必要开启 QoS 的。

## 更新 kernel
+ 根据版本打开对应的包下载地址：[ImmortalWrt](https://downloads.immortalwrt.org/releases/23.05-SNAPSHOT/targets/ipq807x/generic/packages/) 和 [OpenWrt](https://archive.openwrt.org/releases/23.05.0/targets/ipq807x/generic/packages/)
+ 找到对应的 kernel 更新包下载，比如 `kernel_5.15.171-1-dae069da9eaf18cbc98c1b58b15dc5c9_aarch64_cortex-a53.ipk`
+ OpenWrt 的 `系统-软件包-操作-上传软件包` 上传更新包并安装

## 安装 QoS
+ OpenWrt 的 `系统-软件包-筛选器` 搜索并安装 `luci-app-qos` 和 `luci-app-statistics`

## 关闭硬件加速
+ OpenWrt 的 `网络-防火墙-常用设置-路由/NAT 分载` 关闭 `软件流量分载` 和 `硬件流量分载`
+ OpenWrt 的 `网络-接口-全局网络选项` 开启 `数据包引导`
+ OpenWrt 的 `系统-重启` 执行重启

## 初步配置
+ ssh 登录后台执行下面的命令
+ 其中 `85000` 和 `4000` 分别表示下行和上行带宽，一般写真实带宽的 85%
```bash
cat > /etc/config/qos <<EOF
config classgroup 'Default'
        option classes 'Priority Express Normal Bulk'
        option default 'Normal'

config class 'Priority'
        option packetsize '400'
        option avgrate '10'
        option priority '20'

config class 'Priority_down'
        option packetsize '1000'
        option avgrate '10'

config class 'Express'
        option packetsize '1000'
        option avgrate '50'
        option priority '10'

config class 'Normal'
        option packetsize '1500'
        option packetdelay '100'
        option avgrate '20'
        option priority '5'

config class 'Normal_down'
        option avgrate '20'

config class 'Bulk'
        option avgrate '1'
        option packetdelay '200'

config interface 'wan'                               
        option classgroup 'Default'                  
        option enabled '1'                           
        option upload '4000'                         
        option download '85000' 

config interface 'lan'
        option enabled '1'
        option classgroup 'Default'
        option download '4000'
        option upload '85000'

config reclassify
        option target 'Priority'
        option proto 'udp'
        option ports '53'
        option comment 'DNS'

config reclassify
        option target 'Priority'
        option proto 'icmp'

config classify
        option target 'Express'
        option pktsize '-500'
        option comment 'SDP'
EOF
```

[wiki](https://oldwiki.archive.openwrt.org/doc/uci/qos): Another biggie was the exact meaning of each type. Types are necessary for connection tracking. By default, Classify is not run on a connection that had already been assigned a traffic class, so it is the initial connection-tracked classification. Reclassify can override the traffic class per packet, without altering the connection tracking mark. Default is a fall-back for everything that has not been marked by Classify/Reclassify. Rules get processed by type first (Classify gets processed first, then Reclassify and finally Default) and then based on the order in the configuration file (top to bottom).

## 深入配置
+ OpenWrt 的 `状态-实时信息-连接` 里 `启用DNS查找` 后观察游戏所在的目标地址的特征
+ OpenWrt 的 `网络-QoS-分类规则` 里根据特征添加更细节的规则

## 观察配置
```bash
cat /etc/config/qos 
tc -s qdisc
/usr/lib/qos/generate.sh interface wan
```

## 附加 DSCP
+ 手动给应用打上 DSCP 标记：[Windows配置QoS](./Windows-configuration-QoS-ensures-smooth-network-connectivity-for-important-applications)

## 附加 Wireshark
+ 下载 [Wireshark](https://www.wireshark.org/#downloadLink)
+ 安装时勾选上插件里的 `Sshdump`
+ OpenWrt 的 `系统-软件包-筛选器` 搜索并安装 `tcpdump`（会同时捕获 udp）
+ 打开 Wireshark，选择 `捕获—选项`：

![](https://img.limour.top/2024/12/20/67646241bc3c8.webp)

+ 点击 `SSH remote capture` 标签的前的图标，对远程抓包的参数进行配置

![](https://img.limour.top/2024/12/20/6764628b8bd6f.webp)

+ 输入路由器的ip地址和ssh端口号

![](https://img.limour.top/2024/12/20/676463c5a6c69.webp)

+ 输入路由器用户名和密码

![](https://img.limour.top/2024/12/20/676463fbc10a6.webp)

+ `tcpdump` 设置, `Remote capture filter` 写 `not (port 22)` 就好, 网卡写 `br-lan`

![](https://img.limour.top/2024/12/20/67646455a1173.webp)

+ 选择 `SSH remote capture`，点击 `开始`

![](https://img.limour.top/2024/12/20/6764621cb9cca.webp)

+ 捕获完成后点左上角的红色方块停止捕获

![](https://img.limour.top/2024/12/20/676464cd7938b.webp)