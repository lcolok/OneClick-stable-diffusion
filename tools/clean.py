import os
import shutil

# 要删除的目录
trash_dir = '/root/.local/share/Trash/'
miniconda_dir = '/root/miniconda3/pkgs/'
tmp_dir = '/tmp/' 

# 定义 checkAndDelete 函数
def checkAndDelete(directory):
    if os.path.exists(directory):
        try:
            shutil.rmtree(directory)
            print("删除成功")
        except:
            print("删除失败")
    else:
        print(f"{directory}已经清理干净")

# 定义 checkAndDeleteForTMP 函数
def checkAndDeleteForTMP(directory):
    if os.path.exists(directory):
        # 获取目录下的所有文件
        items = os.listdir(directory)
        # 遍历文件列表
        for item in items:
            # 构造文件/文件夹的完整路径
            item_path = os.path.join(directory, item)
            # 若文件名中不包含 vscode，或者后缀不是 .sock
            if "vscode" not in item or not item.endswith(".sock"):
                # 判断是文件还是文件夹
                if os.path.isfile(item_path):
                    # 如果是文件，删除文件
                    os.remove(item_path)
                    print(f"{item_path}删除成功")
                else:
                    # 如果是文件夹，删除文件夹及其内容
                    shutil.rmtree(item_path)
                    print(f"{item_path}删除成功")
            else:
                print(f"发现vscode.sock文件，文件名为：{item}，跳过删除")
    else:
        print(f"{directory}已经清理干净")

# 使用 checkAndDelete 函数删除目录
checkAndDelete(trash_dir)
checkAndDelete(miniconda_dir)
checkAndDeleteForTMP(tmp_dir)