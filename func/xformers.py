import os,sys,subprocess
sys.path.append('../') # 把上级路径也加入到系统路径中，这样就能够找到func
from subprocess import getoutput
import ipywidgets as widgets
from IPython.display import display,clear_output
from func.env import getArch,getDirSize,setProxy

import json
from IPython.display import display,clear_output
import ipywidgets as widgets

archWhiteList = ['sm80','sm75','sm70','sm89','sm61','sm86']

hasInstalledBtn = widgets.Button(
    value=False,
    description='已经预装',
    disabled=False,
    button_style='success', # 'success', 'info', 'warning', 'danger' or ''
    tooltip='Description',
    icon='check' # (FontAwesome names without the `fa-` prefix)
    )

finishedInstallBtn = widgets.Button(
    value=False,
    description='完成Xformers安装',
    disabled=False,
    button_style='success', # 'success', 'info', 'warning', 'danger' or ''
    tooltip='Description',
    icon='check' # (FontAwesome names without the `fa-` prefix)
    )

def showToast(arch,gpu):
    print(f'本机GPU为【{gpu}】，对应的英伟达架构名为【{arch}】，已安装匹配【{arch}】架构的Xformers预编译包')

def getXformersDir():
    # 查询已经安装好的xformers所在的目录位置
    XformersDir = subprocess.getoutput('. activate && conda activate py3.10.6 && python -c "import xformers,os;print(os.path.dirname(xformers.__file__));"')
    # print(XformersDir)
    return XformersDir

def installCMD(arch,whlDir,gpu):
    args = [
    '. activate','&&',
    'conda activate py3.10.6','&&',
    'pip uninstall xformers -y','&&',
    f'pip install {whlDir}'
    ]
    cmd = (" ").join(args) 
    os.system(cmd)
    xformersInstalledDir = getXformersDir()
    archTextDir = os.path.join(xformersInstalledDir,'./arch.txt')

    with open(archTextDir,"w") as archText:
        archText.write(arch)

    with  open(archTextDir,'r') as file:
        print(file.read())

    clear_output(wait=True) # 生产环境下清除日志
    showToast(arch,gpu)
    display(finishedInstallBtn)

def downloadWhl(fileDir,fileName,url,ctx):
    proxy=ctx['proxy']
    if (not os.path.exists(fileDir)):
        os.makedirs(fileDir)
    filePath = os.path.join(fileDir,fileName)
    os.system(f'{proxy} && wget -O {filePath} {url}')

def installExec(ctx):
    arch=ctx['arch']
    gpu=ctx['gpu']
    targetWhlSize=ctx['targetWhlSize']
    whlFileName = 'xformers-0.0.14.dev0-cp310-cp310-linux_x86_64.whl'
    whlFileDir = f'/root/autodl-tmp/pkg/Xformers_precompiled/xformers_0.0.14.dev0/{arch}/'
    whlFilePath = os.path.join(whlFileDir,whlFileName)
    url = f'https://github.com/lcolok/Xformers_precompiled/raw/main/linux/{arch}/{whlFileName}'
    print(not os.path.exists(whlFilePath))
    if os.path.exists(whlFilePath)==False:
        print('预编译包不在本地，需要下载...')
        downloadWhl(whlFileDir,whlFileName,url,ctx)
    test_whlSize = os.path.getsize(whlFilePath)
    if targetWhlSize==test_whlSize:
        print('目标文件大小一致，whl文件已经在本地')
        installCMD(arch,whlFilePath,gpu)
    else:
        print('目标文件大小不一样')
        os.system(f'rm -rf {whlFilePath}')
        installExec(ctx)

def checkXformersInstalled():
    # 通过python加载模块来检测是否有安装对应的模块
    result = subprocess.getoutput('. activate && conda activate py3.10.6 && python -c "import xformers,os;print(xformers.__file__);"')
    # print('打印结果——————————————————',result)
    if result!='None':
        return True
    else:
        return False
    
def installXformers(proxy,region):
    cb = getArch()
    arch = cb['arch']
    gpu = cb['gpu']
    targetWhlSize = cb['whlSize']
    
#     try:
#         proxy,region
#     except NameError:
#         cb=setProxy()
#         proxy=cb['proxy']
#         region=cb['region']
#         clear_output(wait=True)
        
    ctx={
        'arch':arch,
        'gpu':gpu,
        'targetWhlSize':targetWhlSize,
        'proxy':proxy,
        'region':region
    }
    
    if arch in archWhiteList:
        installed = checkXformersInstalled()
    
        # print('已经安装了吗？_______________',installed)
        if installed==False:
            installExec(ctx)
        else:
            xformersInstalledDir = getXformersDir()
            # print(xformersInstalledDir)
            archTextDir = os.path.join(xformersInstalledDir,'./arch.txt')
            if os.path.exists(archTextDir):
                with  open(archTextDir,'r') as file:
                    installedArch = file.read()
                # print(installedArch)
                if installedArch!=arch:
                    installExec(ctx)
                else:
                    # 已经预装好了
                    showToast(arch,gpu)
                    display(hasInstalledBtn)
            else:
                installExec(ctx)
    else:
        print(f'没有合适{gpu}的Xformers编译包')
        display(
            widgets.Button(
                value=False,
                description=f'自动跳过安装',
                disabled=False,
                button_style='warning', # 'success', 'info', 'warning', 'danger' or ''
                tooltip='Description',
                icon='check' # (FontAwesome names without the `fa-` prefix)
            )
        )