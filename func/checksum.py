import os
import hashlib
import time

def generate_checksum(folder_path, print_elapsed_time=False):
    # 开始计时
    start_time = time.time()
    # 创建 sha256 哈希对象
    checksum = hashlib.sha256()
    # 遍历文件夹
    with os.scandir(folder_path) as entries:
        # 对文件和子文件夹按照字母顺序排序
        sorted_entries = sorted(entries, key=lambda entry: entry.name)
        for entry in sorted_entries:
            # 若为子文件夹，则递归调用 generate_checksum()
            if entry.is_dir():
                # 递归调用 generate_checksum()
                checksum.update(generate_checksum(entry.path).encode())
            # 若为文件，则更新文件名哈希值
            else:
                checksum.update(entry.name.encode())
    # 结束计时
    elapsed_time = time.time() - start_time
    # 输出所用时间
    if print_elapsed_time:
        print(f'生成校验码耗时: {elapsed_time:.2f} 秒')
    # 返回十六进制哈希值
    return checksum.hexdigest()

# # 示例用法：调用 generate_checksum 函数生成校验码
# code = generate_checksum(
#     folder_path='/output/content/stable-diffusion-v2-768',
#     print_elapsed_time=True
# )
# # 输出校验码
# print(code)

def find_folder(root_folder, checksum):
    start_time = time.time()
    # 先计算根目录的校验和
    root_checksum = generate_checksum(root_folder)
    if root_checksum == checksum:
        elapsed_time = time.time() - start_time
        print(f'\033[32m在目录 {root_folder} 下，找到校验和为【{checksum}】的目录，耗时: {elapsed_time:.2f} 秒，文件路径为：{root_folder}\033[0m')
        return root_folder
    # 遍历目录树
    for root, dirs, files in os.walk(root_folder):
        for folder in dirs:
            folder_path = os.path.join(root, folder)
            folder_checksum = generate_checksum(folder_path)
            if folder_checksum == checksum:
                elapsed_time = time.time() - start_time
                print(f'\033[32m在目录 {root_folder} 下，找到校验和为【{checksum}】的目录，耗时: {elapsed_time:.2f} 秒，文件路径为：{folder_path}\033[0m')
                return folder_path
    elapsed_time = time.time() - start_time
    print(f'\033[31m在目录 {root_folder} 下，未找到校验和为【{checksum}】的目录，耗时: {elapsed_time:.2f} 秒\033[0m')
    return None

# # 示例用法：调用find_folder来查找对应文件夹的路径
# find_folder('/input1', 'c7ee605be833a2d9')


# onlyDir的方法只对文件夹进行哈希值的记录，排除掉其他文件名的记录，这对拥有众多文件的文件目录来说，比较能够节省搜索时间的方法

def generate_checksum_onlyDir(folder_path, print_elapsed_time=False):
    # 开始计时
    start_time = time.time()
    # 创建 sha256 哈希对象
    checksum = hashlib.sha256()
    # 遍历文件夹
    with os.scandir(folder_path) as entries:
        # 对文件和子文件夹按照字母顺序排序
        sorted_entries = sorted(entries, key=lambda entry: entry.name)
        for entry in sorted_entries:
            # 若为子文件夹，则递归调用 generate_checksum()
            if entry.is_dir():
                checksum.update(entry.name.encode())

    # 结束计时
    elapsed_time = time.time() - start_time
    # 输出所用时间
    if print_elapsed_time:
        print(f'生成校验码耗时: {elapsed_time:.2f} 秒')
    # 返回十六进制哈希值
    return checksum.hexdigest()

def find_folder_onlyDir(root_folder, checksum):
    start_time = time.time()
    # 先计算根目录的校验和
    root_checksum = generate_checksum_onlyDir(root_folder)
    if root_checksum == checksum:
        elapsed_time = time.time() - start_time
        print(f'\033[32m在目录 {root_folder} 下，找到校验和为【{checksum}】的目录，耗时: {elapsed_time:.2f} 秒，文件路径为：{root_folder}\033[0m')
        return root_folder
    # 遍历目录树
    for root, dirs, files in os.walk(root_folder):
        for folder in dirs:
            folder_path = os.path.join(root, folder)
            folder_checksum = generate_checksum_onlyDir(folder_path)
            if folder_checksum == checksum:
                elapsed_time = time.time() - start_time
                print(f'\033[32m在目录 {root_folder} 下，找到校验和为【{checksum}】的目录，耗时: {elapsed_time:.2f} 秒，文件路径为：{folder_path}\033[0m')
                return folder_path
    elapsed_time = time.time() - start_time
    print(f'\033[31m在目录 {root_folder} 下，未找到校验和为【{checksum}】的目录，耗时: {elapsed_time:.2f} 秒\033[0m')
    return None