---
title: 【记录】OpenWrt配置DNS解析
urlname: openwrt-dns-configuration
index_img: https://api.limour.top/randomImg?d=2024-12-15 06:29:44
date: 2024-12-15 14:29:44
tags: DoH
---
`锐捷雪豹BE50` 的 `游戏加速 QoS` 做得不错，但是没有办法正常的 `PPPoE 拨号`，因此只能用来当二级路由接到 OpenWrt 上。上网设置里使用 `静态IP`，OpenWrt 的 `网络-DHCP/DNS-静态地址分配` 里给它分配了静态地址。但不知道为什么，锐捷的 DNS 解析总出错，因此这里记录一下解决的过程。
## 开启SmartDNS
+ OpenWrt 的 `服务-SmartDNS-设置-常规设置` 的 `启用` 打勾
+ OpenWrt 的 `服务-SmartDNS-设置-常规设置` 的 `自动设置Dnsmasq` 打勾
+ OpenWrt 的 `服务-SmartDNS-上游服务器` 的添加合适的 DNS 服务器
+ 合适的 DNS 服务器可以看 [ipw.cn](https://ipw.cn/doc/else/dns.html)
+ 也可以在 `状态-概览-网络-IPv4 上游` 里看下发的 `DNS 1` 和 `DNS 2`
## 配置SmartDNS
+ OpenWrt 的 `服务-SmartDNS-设置-高级设置` 的 `域名预加载` 打上勾
+ OpenWrt 的 `服务-SmartDNS-设置-高级设置` 的 `缓存过期服务` 去掉勾
+ OpenWrt 的 `服务-SmartDNS-设置-高级设置` 的 `持久化缓存` 去掉勾
+ OpenWrt 的 `服务-SmartDNS-设置-高级设置` 的 `双栈IP优选` 和 `停用IPv6地址解析` 看自己情况
+ OpenWrt 的 `服务-SmartDNS-设置-第二DNS服务器` 的 `启用` 去掉勾
## DNS重定向
+ OpenWrt 的 `网络-DHCP/DNS-常规设置` 的 `DNS 重定向` 打勾
+ OpenWrt 的 `网络-DHCP/DNS-常规设置` 的 `DNS 转发` 设置为 `SmartDNS` 的端口，比如 `127.0.0.1#6353`，一般都自动设置了
## 检查DNS配置
+ CN上游测试 `nslookup github.com 202.96.209.133`
```txt
服务器:  ns-pd.online.sh.cn
Address:  202.96.209.133

非权威应答:
名称:    github.com
Address:  20.205.243.166
```
+ GW上游测试 `nslookup github.com 1.1.1.1`
```txt
服务器:  one.one.one.one
Address:  1.1.1.1

非权威应答:
名称:    github.com
Address:  20.205.243.166
```
+ SmartDNS测试 `nslookup github.com 192.168.88.1`
```txt
服务器:  ImmortalWrt.lan
Address:  192.168.88.1

非权威应答:
名称:    github.com
Address:  20.205.243.166
```
+ 本地DNS测试 `nslookup github.com`
```txt
服务器:  UnKnown
Address:  192.168.110.1

非权威应答:
名称:    github.com
Address:  20.205.243.166
```
+ 关闭v6测试 `nslookup -type=AAAA github.com`
```txt
服务器:  UnKnown
Address:  192.168.110.1

*** 没有 github.com 可以使用的 IPv6 address (AAAA)记录
```
## 附加 DoH
+ [自建DoH服务器](./Self-built-ad-blocking-DoH-server)
+ [SmartDNS 的 TCP 模式简直是神仙](./-Docker-bu-shu-easyconnect)
+ [SmartDNS 的配置项详解](https://pymumu.github.io/smartdns/configuration/)

## 附加 优选ip
+ OpenWrt 的 `系统-软件包-更新` 更新 `smartdns` 相关的所有包到最新版
+ OpenWrt 的 SSH 执行以下命令
```bash
cd /etc/smartdns/

cat > cloudflare.ipv4 <<EOF
173.245.48.0/20
103.21.244.0/22
103.22.200.0/22
103.31.4.0/22
141.101.64.0/18
108.162.192.0/18
190.93.240.0/20
188.114.96.0/20
197.234.240.0/22
198.41.128.0/17
162.158.0.0/15
104.16.0.0/13
104.24.0.0/14
172.64.0.0/13
131.0.72.0/22
EOF
```
+ OpenWrt 的 `服务-SmartDNS-域名规则-域名地址` 添加以下配置，保存，重启
+ 其中 alias 的 ip 从 [CloudflareSpeedTest](https://github.com/XIU2/CloudflareSpeedTest/releases) 处获取
```config
ip-set -name cloudflare -file /etc/smartdns/cloudflare.ipv4
ip-rules ip-set:cloudflare -ip-alias 104.18.47.223,104.16.97.145,173.245.58.79
```
+ 电脑测试是否生效
```powershell
nslookup img.limour.top
```