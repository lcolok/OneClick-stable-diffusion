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

    arch = ""
    
    sm61_list = ['TITAN Xp', 'Tesla P40', 'Tesla P4','1080','1080 Ti', '1070', '1060', '1050']
    sm89_list = ['4090']
    sm86_list = ['3060', '3070', '3080',
                 '3080 Ti', '3090', 'A40', 'A4000', 'A5000']
    sm80_list = ['A100']
    sm75_list = ['2080 Ti', 'Tesla T4']
    sm70_list = ['V100']

    if gpu in sm86_list:
        arch = 'sm86'
    elif gpu in sm80_list:
        arch = 'sm80'
    elif gpu in sm75_list:
        arch = 'sm75'
    elif gpu in sm70_list:
        arch = 'sm70'
    elif gpu in sm89_list:
        arch = 'sm89'
    elif gpu in sm61_list:
        arch = 'sm61'

    return ({"arch": arch, "gpu": gpu})

ipDict = {
    '芜湖': '192.168.0.91',
    '北京': '100.72.64.19',
    '内蒙': '192.168.1.174',
    '泉州': '10.55.146.88',
    '南京': '172.181.217.43',
    '佛山': '192.168.126.12',
}

def autoRegion():
    from func.ping import ping_threading
    global region, proxy
    cb=ping_threading(ipDict)
    region = cb['region']
    proxy = makeCLI(cb['ip'])
    
    # for key in ipDict:
    #     ip = ipDict[key]
    #     if (os.system(f'ping -c 1 -w 1 {ip}') == 0):
    #         # print('OK')
    #         global region, proxy
    #         region = key
    #         proxy = makeCLI(ip)
    #         break
    #     else:
    #         # print('Connection failed')
    #         continue

def getProxyURL(ip):
    return f'http://{ip}:12798'

def makeCLI(ip):
    return f'export http_proxy={getProxyURL(ip)} && export https_proxy={getProxyURL(ip)}'

def setProxyCLI():
    autoRegion()
    ip = ipDict[region]
    proxy = makeCLI(ip)
    proxyURL = getProxyURL(ip)
    return({'region':region,'proxy':proxy,'proxyURL':proxyURL})

def setProxy():

    import os
    import subprocess
    from ipywidgets import interact, widgets
    from IPython.display import display, clear_output
    
    global region, proxy ,proxyURL
    btnArray = []
    region = '未知'
    proxy = 'cd ./'  # 一句没有实际作用的命令作为占位

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
        proxyURL = getProxyURL(ip)
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
            description=i,
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
    clear_output(wait=True)

    if region != '未知':
        autoClick(region)
    else:
        clear_output(wait=True)
        printFail()

    for e in btnArray:
        display(e)
        
    return({'region':region,'proxy':proxy,'proxyURL':proxyURL})

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

import os

def findDir(name, path):
    for root, dirs, files in os.walk(path):
        if name in dirs:
            return os.path.join(root, name)

def findFile(name, path):
    for root, dirs, files in os.walk(path):
        if name in files:
            return os.path.join(root, name)
        

webUIDir = findDir('stable-diffusion-webui','/root/')

extDir = findDir('extensions',webUIDir)

xformersDir = findDir('xformers',webUIDir)
    
def getDirSize(dir):
    size = 0
    for root, dirs, files in os.walk(dir):
        size += sum([os.path.getsize(os.path.join(root, name)) for name in files])
    return size

styleURL = 'https://raw.githubusercontent.com/lcolok/My_SD_styles.csv/main/styles.csv'