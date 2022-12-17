import os,sys
dir_path = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))
sys.path.append(dir_path)
# print(sys.path)
from func.env import setProxyCLI

cb=setProxyCLI()
proxy=cb['proxy']
region=cb['region']
proxyURL=cb['proxyURL']

def print_with_color(string, keywords):
    # 默认颜色设置为绿色
    print("\033[1;32m", end="")

    # 遍历字符串中的每一个字眼
    for word in string.split(" "):
        # 如果这个字眼是关键词，就将它的颜色更改为相应的颜色
        if word in keywords:
            print(keywords[word], end="")
        # 否则，打印出默认颜色
        else:
            print("\033[1;32m", end="")
        print(word, end=" ")

    # 打印出一个换行，并将颜色设置为默认
    print("\033[0m")

keywords = {
    "&&": "\033[0m",# &&：正常颜色
    "git": "\033[1;31m",# git：红色
    "user": "\033[1;32m",# user：绿色
    "config": "\033[1;33m",# config：黄色
    "--global": "\033[1;34m",# --global：蓝色
    "http.proxy": "\033[1;35m",# http.proxy：紫色
    "user.email": "\033[1;36m",# user.email：深蓝色
    "user.name": "\033[1;37m",# user.name：深绿色
    "http.proxy": "\033[1;38m",# http.proxy：深紫色
    "proxyURL": "\033[1;39m",# proxyURL：深红色
    "cd": "\033[1;31m",# cd：红色
    "dir_path": "\033[1;41m",# dir_path：深黑色
}

cmd = f'git config --global http.proxy {proxyURL} && git config --global user.email 425311101@qq.com && git config --global user.name lcolok && cd {dir_path} && git push'
print_with_color(cmd, keywords)

os.system(cmd)