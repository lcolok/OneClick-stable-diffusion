def ping_threading(ipDict):
    import threading
    import subprocess
    import time
    from queue import Queue

    global proxy, proxyURL
    proxy = 'cd ./'  # 一句没有实际作用的命令作为占位
 

    # 定义工作线程
    WORD_THREAD = 10

    # 将需要 ping 的 ip 加入队列
    IP_QUEUE = Queue() 
    for i in ipDict:
        IP_QUEUE.put({'ip':i['ip'],'region':i['region'],'port':i['port']})

    # 定义一个执行 ping 的函数


    def ping_ip():
        global region,ip,port
        region = '未知'
        port = '',
        ip = ''
        while (not IP_QUEUE.empty()):
            cb = IP_QUEUE.get()
            # print(cb)
            test_ip = cb['ip']
            test_region = cb['region']
            test_port = cb['port']
            res = subprocess.call('ping -c 1 -w 1 %s' % test_ip,stdout=subprocess.PIPE,shell=True)  # linux 系统将 '-n' 替换成 '-c' ，而且设置shell=True，详情请参考：https://xilou.info/p/118
            # 打印运行结果
            if res == 0:
                
                region = test_region
                ip = test_ip
                port = test_port
                print(region,ip,port)
                break
        
    threads = []
    start_time = time.time()
    for i in range(WORD_THREAD):
        thread = threading.Thread(target=ping_ip)
        thread.start()
        threads.append(thread)

    for thread in threads:
        thread.join()
    
    print('Ping程序运行耗时：%s' % (time.time() - start_time))
    return {'region':region,'ip':ip,'port':port}

