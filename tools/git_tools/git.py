import os

# 获取包含当前脚本的目录
base_dir = os.path.dirname(os.path.abspath(__file__))

# 在当前目录中查找 gitPushHelper.py 文件
if "gitPushHelper.py" in os.listdir(base_dir):
    # 构建 gitPushHelper.py 文件的路径
    path = os.path.join(base_dir, "gitPushHelper.py")
    # 执行 gitPushHelper.py 文件
    os.system(f"python {path}")
else:
    # 在指定目录及其子目录中递归查找 gitPushHelper.py 文件
    search_dir = os.path.join(os.getcwd(), "OneClick-stable-diffusion")
    for root, dirs, files in os.walk(search_dir):
        if "gitPushHelper.py" in files:
            # 构建 gitPushHelper.py 文件的路径
            path = os.path.join(root, "gitPushHelper.py")
            # 执行 gitPushHelper.py 文件
            os.system(f"python {path}")
            break  # 在找到第一个 gitPushHelper.py 文件后停止搜索
    else:  # 如果 for 循环没有遇到 break
        print("未找到 gitPushHelper.py 文件。")
