import os,sys
dir_path = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))
sys.path.append(dir_path)
print(sys.path)
from func.env import setProxyCLI

cb=setProxyCLI()
proxy=cb['proxy']
region=cb['region']

cmd = f'{proxy} && git config --global user.email 425311101@qq.com && git config --global user.name lcolok && cd /root/OneClick-stable-diffusion && git push'
print(cmd)
os.system(cmd)