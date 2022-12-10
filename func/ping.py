region='未知'
ip=''
port=''
    
import threading
import os
import time

def ping_threading(ipDict):
    start_time = time.time()
    # 创建一个事件，用于在成功 ping 通某个 IP 地址后通知其他线程退出
    event = threading.Event()

    # 存储成功 ping 通的 IP 地址
    result = []

    # 为每个 IP 地址创建一个线程，用于 ping 该地址
    for item in ipDict:
        thread = threading.Thread(target=ping_ip, args=(item, result, event))
        thread.start()

    # 如果有线程成功 ping 通了某个 IP 地址，则通知其他线程退出
    if event.wait():
        print('Ping程序运行耗时：%s' % (time.time() - start_time))
        # 返回成功 ping 通的 IP 地址
        return result[0]

def ping_ip(item, result, event):
    # 从字典中获取 IP 地址
    ip = item['ip']

    # 使用 Linux 的 ping 命令测试该 IP 地址是否可以 ping 通
    if os.system('ping -c 1 -w 1 ' + ip) == 0:
        # 如果可以 ping 通，则将该地址添加到结果列表中
        result.append(item)
        # 通知其他线程退出
        event.set()