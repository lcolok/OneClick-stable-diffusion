import os

def check_environment(output):
    environments = {
        "AutoDL": {
            "content_path": "/root/autodl-tmp/content",
            "env_name": "AutoDL"
        },
        "OpenBayes": {
            "content_path": "/openbayes/home/content",
            "env_name": "OpenBayes"
        }
    }
    # 检查输出是否包含字符串"autodl"或"openbayes"
    # for i in output:
    if "AutoDL" in output:
        return environments["AutoDL"]
    elif "OpenBayes" in output:
        return environments["OpenBayes"]
    # 如果输出中没有包含上述字符串，则返回空字典
    return {}


def detect_environment():
    # 初始化 content_path 和 env_name 变量
    content_path = None
    env_name = None
    
    commands = []
    
    # 根据条件把命令行存储在列表中
    if os.path.exists('/openbayes/home'):
        commands.append("cd /openbayes/home && chmod +x /etc/welcome && /etc/welcome")
    
    if os.path.exists('/root'):
        commands.append("chmod +x /etc/autodl-motd && /etc/autodl-motd")

    # 遍历命令行列表，执行命令并存储输出
    for command in commands:
        try:
            import subprocess
            # 使用 subprocess 模块执行命令
            r = subprocess.run(command, shell=True, stdout=subprocess.PIPE)
            output = r.stdout
            # 将输出转换为字符串
            output = output.decode()
            # print(output)
            result = check_environment(output)
            content_path = result["content_path"]
            env_name = result["env_name"]
            # 如果检测到环境，则退出循环
            if content_path and env_name:
                break
        except Exception as e:
            # print("无法执行命令：", e)
            continue

    # 打印结果
    if content_path and env_name:
        print("当前运行环境：", env_name)
        print("内容路径：", content_path)
    else:
        print("未检测到当前运行环境")
        
    return {
        "content_path":content_path,
        "env_name":env_name
    }

env_name = detect_environment()['env_name']

def getArch():

    from subprocess import getoutput

    global gpu
    gpu = ""

    s = getoutput('nvidia-smi -a')

    if 'Tesla T4' in s:
        gpu = 'Tesla T4'
    elif 'P100' in s:
        gpu = 'P100'
    elif 'V100' in s:
        gpu = 'V100'
    elif 'A100' in s:
        gpu = 'A100'
    elif 'NVIDIA TITAN Xp' in s:
        gpu = 'TITAN Xp'
    elif 'A40' in s:
        gpu = 'A40'
    elif 'A4000' in s:
        gpu = 'A4000'
    elif 'A5000' in s:
        gpu = 'A5000'
    elif 'NVIDIA GeForce GTX 1080 Ti' in s:
        gpu = '1080 Ti'
    elif 'NVIDIA GeForce RTX 2080 Ti' in s:
        gpu = '2080 Ti'
    elif 'NVIDIA GeForce RTX 3060' in s:
        gpu = '3060'
    elif 'NVIDIA GeForce RTX 3070' in s:
        gpu = '3070'
    elif 'NVIDIA GeForce RTX 3080' in s:
        gpu = '3080'
    elif 'NVIDIA GeForce RTX 3080 Ti' in s:
        gpu = '3080 Ti'
    elif 'NVIDIA GeForce RTX 3090' in s:
        gpu = '3090'
    elif 'NVIDIA GeForce RTX 4090' in s:
        gpu = '4090'
    else:
        gpu = 'Not Found'

    # 关于各型号GPU与架构的资料可参考这里：
    # https://arnon.dk/matching-sm-architectures-arch-and-gencode-for-various-nvidia-cards/
    # https://qiita.com/k_ikasumipowder/items/1142dadba01b42ac6012

    arch = str
    whlSize = int

    sm61_list = ['TITAN Xp', 'Tesla P40', 'Tesla P4',
                 '1080', '1080 Ti', '1070', '1060', '1050']
    sm89_list = ['4090']
    sm86_list = ['3060', '3070', '3080',
                 '3080 Ti', '3090', 'A40', 'A4000', 'A5000']
    sm80_list = ['A100']
    sm75_list = ['2080 Ti', 'Tesla T4']
    sm70_list = ['V100']

    if gpu in sm86_list:
        arch = 'sm86'
        whlSize = 108993677
    elif gpu in sm80_list:
        arch = 'sm80'
        whlSize = 109020527
    elif gpu in sm75_list:
        arch = 'sm75'
        whlSize = 108867109
    elif gpu in sm70_list:
        arch = 'sm70'
        whlSize = 111201556
    elif gpu in sm89_list:
        arch = 'sm89'
        whlSize = 101099488
    elif gpu in sm61_list:
        arch = 'sm61'
        whlSize = 106055982

    return ({"arch": arch, "gpu": gpu, "whlSize": whlSize})

ipDict = [
    {'region': '九天', 'ip': '172.22.17.74', 'port': '3928'}
]

if env_name == 'AutoDL':
    ipDict = [
        {'region': '芜湖', 'ip': '192.168.0.91', 'port': '12798'},
        {'region': '北京', 'ip': '100.72.64.19', 'port': '12798'},
        {'region': '内蒙', 'ip': '192.168.1.174', 'port': '12798'},
        {'region': '泉州', 'ip': '10.55.146.88', 'port': '12798'},
        {'region': '南京', 'ip': '172.181.217.43', 'port': '12798'},
        {'region': '佛山', 'ip': '192.168.126.12', 'port': '12798'},
        {'region': 'A100专区', 'ip': '172.31.1.127', 'port': '12798'},
    ] + ipDict
elif env_name == 'OpenBayes':
    ipDict = [
        {'region': '贝式', 'ip': 'alchemist-experience', 'port': '7890'},
    ] + ipDict

debugging=False

import urllib.request

def proxyWget(url, out, proxyURL):
    # 设置代理
    proxy = urllib.request.ProxyHandler({'http': proxyURL})
    opener = urllib.request.build_opener(proxy)
    urllib.request.install_opener(opener)

    # 下载文件
    file_path, _ = urllib.request.urlretrieve(url, out)

    # 返回已完成下载的文件路径
    return file_path

def getProxyURL(ip,port):
    return f'http://{ip}:{port}'


def autoRegion():
    from func.ping import ping_threading
    global region, proxy, proxyURL
    cb = ping_threading(ipDict)
    # print(cb)
    region = cb['region']
    ip = cb['ip']
    port = cb['port']
    proxy = makeCLI(ip,port)
    proxyURL = getProxyURL(ip,port)

def makeCLI(ip,port):
    return f'export http_proxy={getProxyURL(ip,port)} && export https_proxy={getProxyURL(ip,port)}'


def setProxyCLI():
    autoRegion()
    return({'region': region, 'proxy': proxy, 'proxyURL': proxyURL})


def setProxy():

    import os
    import subprocess
    from ipywidgets import interact, widgets
    from IPython.display import display, clear_output

    global proxyURL
    btnArray = []


    def printSuccess(region):
        # print(f'已挂载【{region}】对应的代理')
        picked.button_style = 'info'
        picked.description = f'在使用【{region}】代理'
        # picked.icon = 'check'

    def printFail():
        # print(f'已挂载【{region}】对应的代理')
        picked.button_style = 'warning'
        picked.description = f'没有合适的代理'
        picked.icon = 'exclamation-triangle'

    def autoClick(region):
        for o in btnArray:  # 取消所有按钮被选中的样式
            o.button_style = ''
            o.icon = ''
        printSuccess(region)
        for k in btnArray:
            if k.description == region:
                k.button_style = 'success'
                k.icon = 'check'

    def btn_eventhandle(obj):
        global region, proxy
        for o in btnArray:  # 取消所有按钮被选中的样式
            o.button_style = ''
            o.icon = ''
        obj.button_style = 'success'
        obj.icon = 'check'
        region = obj.description
        ip = ipDict[region]
        proxy = makeCLI(ip)
        printSuccess(obj.description)

    picked = widgets.Button(
        value=False,
        description=f'自动侦测中...',
        disabled=False,
        button_style='warning',  # 'success', 'info', 'warning', 'danger' or ''
        tooltip='请点击下方的区名',
        icon='question-circle'  # (FontAwesome names without the `fa-` prefix)
    )

    for i in ipDict:
        btn = widgets.Button(
            description=i['region'],
            disabled=False,
            button_style='',  # 'success', 'info', 'warning', 'danger' or ''
            tooltip='Click me',
            # icon='check' # (FontAwesome names without the `fa-` prefix)
        )
        btn.on_click(btn_eventhandle)
        btnArray.append(btn)

    btnArray.insert(0, picked)

    for e in btnArray:
        display(e)

    autoRegion()
    if debugging==False:
        clear_output(wait=True)
    
    if region != '未知':
        autoClick(region)
    else:
        if debugging==False:
            clear_output(wait=True)
        printFail()

    for e in btnArray:
        display(e)

    return({'region': region, 'proxy': proxy, 'proxyURL': proxyURL})

# def checkAndSetProxy():
#     from IPython.display import display,clear_output
#     try:
#         proxy,region
#     except NameError:
#         cb=setProxy()
#         global proxy,region
#         proxy=cb['proxy']
#         region=cb['region']
#         clear_output(wait=True)


installDir = '/root/OneClick-stable-diffusion/'


def findDir(name, path):
    for root, dirs, files in os.walk(path):
        if name in dirs:
            realPath = os.path.join(root, name)
            if '.local/share/Trash' not in realPath:  # 排除在回收站里面的文件夹
                return realPath
    return ''


def findFile(name, path):
    for root, dirs, files in os.walk(path):
        if name in files:
            realPath = os.path.join(root, name)
            if '.local/share/Trash' not in realPath:  # 排除在回收站里面的文件夹
                return realPath
    return ''

def getOneClickDir():
    return findDir('OneClick-stable-diffusion', '/')

def getWebUIDir():
    return findDir('stable-diffusion-webui', '/')

def getExtDir():
    webUIDir = findDir('stable-diffusion-webui', '/')
    extDir = findDir('extensions', webUIDir)
    return extDir

def getXformersDir():
    webUIDir = findDir('stable-diffusion-webui', '/')
    xformersDir = findDir('xformers', webUIDir)
    return xformersDir

# webUIDir = findDir('stable-diffusion-webui', '/root')
# # print('webUIDir:',webUIDir)
# if webUIDir != '':
#     extDir = findDir('extensions', webUIDir)
#     # print('extDir:',extDir)
#     xformersDir = findDir('xformers', webUIDir)
#     # print('xformersDir:',xformersDir)


def getDirSize(dir):
    size = 0
    for root, dirs, files in os.walk(dir):
        size += sum([os.path.getsize(os.path.join(root, name))
                    for name in files])
    return size


styleURL = 'https://raw.githubusercontent.com/lcolok/My_SD_styles.csv/main/styles.csv'
