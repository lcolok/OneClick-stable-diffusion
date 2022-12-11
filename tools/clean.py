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

# 使用 checkAndDelete 函数删除目录
checkAndDelete(trash_dir)
checkAndDelete(miniconda_dir)
checkAndDelete(tmp_dir)