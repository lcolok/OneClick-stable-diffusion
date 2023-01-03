import sys
import os
import json

# dir_path = os.path.realpath(os.path.join(os.path.dirname(__file__), '../../'))

# 定义find_repo_root函数，能够求得当前运行的py脚本所在的repo文件夹的根目录路径（而且是最外层的git_repo）
def find_repo_root():
    # 获取当前脚本的绝对路径
    script_path = os.path.abspath(__file__)
    # 初始化存储结果的变量
    result = None
    # 循环求当前路径的父目录，直到找到`.git`文件夹
    while True:
        # 将当前路径的父目录赋值给当前路径
        script_path = os.path.dirname(script_path)
        # 判断当前路径是否存在`.git`文件夹
        if os.path.isdir(os.path.join(script_path, '.git')):
            # 如果存在，将当前路径存储在结果变量中
            result = script_path
        # 判断当前路径是否为根目录（即是否已经搜索到最外层）
        if script_path == '/':
            # 如果是，返回结果变量的值
            return result
        
dir_path = find_repo_root()
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

# 它可以遍历指定目录下的所有子目录，并清除所有 ipynb 文件中的所有输出和执行次数，同时把代码折叠起来，不使用第三方的库
import json

def clean_notebooks(folder):
    # 遍历目录下的所有子目录
    for root, dirs, files in os.walk(folder):
        # 遍历文件列表
        for file in files:
            # 获取文件扩展名
            _, ext = os.path.splitext(file)
            # 如果是 ipynb 文件
            if ext == '.ipynb':
                # 获取文件的完整路径
                file_path = os.path.join(root, file)
                # 读取 ipynb 文件
                with open(file_path, 'r') as f:
                    nb = json.load(f)

                # 遍历所有单元格
                for cell in nb['cells']:
                    # 清除输出
                    cell['outputs'] = []
                    cell['execution_count'] = None
                    cell['metadata'].pop('execution', None)
                    cell['metadata'].pop('collapsed', None)
                    cell['metadata'].pop('tags', None)

                # 写入修改后的 ipynb 文件
                with open(file_path, 'w') as f:
                    json.dump(nb, f, indent=2)

def format_notebooks(folder):
    import black
    # 遍历目录下的所有子目录
    for root, dirs, files in os.walk(folder):
        # 遍历文件列表
        for file in files:
            # 获取文件扩展名
            _, ext = os.path.splitext(file)
            # 如果是 ipynb 文件
            if ext == '.ipynb':
                # 获取文件的完整路径
                file_path = os.path.join(root, file)
                # 使用 black 命令格式化代码
                os.system(f'black {file_path}')

# # 使用black格式化所有ipynb
# format_notebooks(dir_path)

# 使用清理notebook函数
clean_notebooks(dir_path)

pullCMD = f'git config --global http.proxy {proxyURL} && cd {dir_path} && git pull'
print_with_color(pullCMD, keywords)
os.system(pullCMD)

pushCMD = f'git config --global http.proxy {proxyURL} && git config --global user.email 425311101@qq.com && git config --global user.name lcolok && cd {dir_path} && git push'
print_with_color(pushCMD, keywords)
os.system(pushCMD)