def getArch():

    from subprocess import getoutput

    global gpu
    gpu = ""

    s = getoutput('nvidia-smi -a')

    if 'Tesla T4' in s:
        gpu = 'Tesla T4'
    elif 'P100' in s:
        gpu = 'P100'
    elif 'V100' in s:
        gpu = 'V100'
    elif 'A100' in s:
        gpu = 'A100'
    elif 'NVIDIA TITAN Xp' in s:
        gpu = 'TITAN Xp'
    elif 'A40' in s:
        gpu = 'A40'
    elif 'A4000' in s:
        gpu = 'A4000'
    elif 'A5000' in s:
        gpu = 'A5000'
    elif 'NVIDIA GeForce RTX 2080 Ti' in s:
        gpu = '2080 Ti'
    elif 'NVIDIA GeForce RTX 3060' in s:
        gpu = '3060'
    elif 'NVIDIA GeForce RTX 3070' in s:
        gpu = '3070'
    elif 'NVIDIA GeForce RTX 3080' in s:
        gpu = '3080'
    elif 'NVIDIA GeForce RTX 3080 Ti' in s:
        gpu = '3080 Ti'
    elif 'NVIDIA GeForce RTX 3090' in s:
        gpu = '3090'
    elif 'NVIDIA GeForce RTX 4090' in s:
        gpu = '4090'
    else:
        gpu = 'Not Found'

    # 关于各型号GPU与架构的资料可参考这里：
    # https://arnon.dk/matching-sm-architectures-arch-and-gencode-for-various-nvidia-cards/
    # https://qiita.com/k_ikasumipowder/items/1142dadba01b42ac6012

    arch = ""

    sm89_list = ['4090']
    sm86_list = ['3060', '3070', '3080',
                 '3080 Ti', '3090', 'A40', 'A4000', 'A5000']
    sm80_list = ['A100']
    sm75_list = ['2080 Ti', 'Tesla T4']
    sm70_list = ['V100']

    if gpu in sm86_list:
        arch = 'sm86'
    elif gpu in sm80_list:
        arch = 'sm80'
    elif gpu in sm75_list:
        arch = 'sm75'
    elif gpu in sm70_list:
        arch = 'sm70'
    elif gpu in sm89_list:
        arch = 'sm89'

    return ({"arch": arch, "gpu": gpu})
