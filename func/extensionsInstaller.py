import os,sys
import subprocess
sys.path.append('../') # 把上级路径也加入到系统路径中，这样就能够找到func
from func.env import setProxy,getExtDir,findDir,getDirSize
import ipywidgets as widgets
from subprocess import getoutput
from IPython.display import display,clear_output
from urllib.parse import urlparse

try:
    proxy,region
except NameError:
    cb=setProxy()
    proxy=cb['proxy']
    region=cb['region']
    clear_output(wait=True)

def update():
    extDir=getExtDir()
    root_dir=extDir
    
    """
    在给定的根目录下遍历一级目录，并执行git pull操作，如果更新失败则进行3次重试。
    忽略隐藏目录和非GitHub repo目录。
    :param root_dir: 根目录
    """
    # 遍历一级目录
    for item in os.listdir(root_dir):
        # 忽略隐藏目录和非repo目录
        if item.startswith('.') or not os.path.isdir(os.path.join(root_dir, item, '.git')):
            continue

        # 进入repo目录并执行git pull操作
        repo_dir = os.path.join(root_dir, item)
        print(f'正在更新{item}...')
        for i in range(3):  # 最多进行3次重试
            try:
                subprocess.check_call(['git', 'pull'], cwd=repo_dir)
                break  # 更新成功后跳出循环
            except subprocess.CalledProcessError:
                if i < 2:  # 如果不是最后一次重试则继续
                    continue
                print(f'更新{item}失败')


def install(extURL,extFileSize):
    
    btn = widgets.Button(
    value=False,
    description='安装拓展',
    disabled=False,
    button_style='', # 'success', 'info', 'warning', 'danger' or ''
    # tooltip='Description',
    # icon='check' # (FontAwesome names without the `fa-` prefix)
    )

    def checkInstalled(targetExtDir,firstInstall):
        fileSize = getDirSize(targetExtDir)
        print('拓展文件夹体积大小：'+str(fileSize))
        if fileSize>=extFileSize :
            if firstInstall==True:
                btn.description='安装成功!'
                btn.button_style='success'
                btn.icon='check'
            else:
                btn.description='已经安装过'
                btn.button_style='info'
                btn.icon='check-circle'
        else:
            # !rm -rf {dirpath}
            btn.description="文件大小不一致，安装失败"
            btn.button_style='danger'
            btn.icon='exclamation-triangle'

    def autoInstall(obj):
        extDir=getExtDir()    
        o=urlparse(extURL)
        extPath=o.path
        (_, extName) = os.path.split(extPath)
        
        targetExtDir = os.path.join(extDir,extName)
        if os.path.exists(targetExtDir):
            checkInstalled(targetExtDir,False)
        else:
            import subprocess
            try:
                btn.description='安装中...'
                btn.button_style='warning'
                btn.icon='download'
                obj = subprocess.check_call(
                    f'{proxy} &&\
                    cd {extDir} &&\
                    git clone {extURL}',
                    shell=True,
                    universal_newlines=True,
                    stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                )
                if obj==0:
                    checkInstalled(targetExtDir,True)
            except subprocess.CalledProcessError as e:
                print("Exception on process, rc=", e.returncode, "output=", e.output)

    # btn.on_click(install_language_pack)
    display(btn)
    autoInstall(btn)