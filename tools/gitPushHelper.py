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
    for word in cmd.split(" "):
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
    "&&": "\033[0m",
    "git": "\033[1;31m",
    "user": "\033[1;32m",
    "config": "\033[1;33m",
    "--global": "\033[1;34m",
    "http.proxy": "\033[1;35m",
    "user.email": "\033[1;36m",
    "user.name": "\033[1;37m",
    "http.proxy": "\033[1;38m",
    "proxyURL": "\033[1;39m",
    "cd": "\033[1;31m",
    "dir_path": "\033[1;41m",
}

cmd = f'git config --global http.proxy {proxyURL} && git config --global user.email 425311101@qq.com && git config --global user.name lcolok && cd {dir_path} && git push'
print_with_color(cmd, keywords)

os.system(cmd)