import os,sys
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