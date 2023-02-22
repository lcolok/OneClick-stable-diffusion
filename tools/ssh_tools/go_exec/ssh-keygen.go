package main

import (
	"fmt"
	"io/ioutil"
	"os"
	"os/exec"
	"runtime"

	"github.com/atotto/clipboard"
)

func main() {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		fmt.Println("无法获取用户主目录:", err)
		return
	}

	sshDir := homeDir + "/.ssh"
	pubKeyFile := sshDir + "/id_rsa.pub"

	if _, err := os.Stat(pubKeyFile); os.IsNotExist(err) {
		fmt.Println("未找到SSH公钥文件，将生成新的SSH密钥对。")

		var sshKeygenCmd *exec.Cmd
		switch os := runtime.GOOS; os {
		case "darwin", "linux":
			sshKeygenCmd = exec.Command("ssh-keygen", "-t", "rsa", "-b", "4096")
		case "windows":
			sshKeygenCmd = exec.Command("ssh-keygen.exe", "-t", "rsa", "-b", "4096")
		default:
			fmt.Println("不支持的操作系统:", os)
			return
		}

		err := sshKeygenCmd.Run()
		if err != nil {
			fmt.Println("SSH密钥对生成失败:", err)
			return
		}

		fmt.Println("SSH密钥对生成成功。")

		pubKey, err := ioutil.ReadFile(pubKeyFile)
		if err != nil {
			fmt.Println("读取公钥文件失败:", err)
			return
		}

		err = clipboard.WriteAll(string(pubKey))
		if err != nil {
			fmt.Println("复制到剪贴板失败:", err)
			return
		}

		fmt.Println("您的SSH公钥已经复制到剪贴板中。")

	} else {
		fmt.Println("已找到SSH公钥文件。")
		pubKey, err := ioutil.ReadFile(pubKeyFile)
		if err != nil {
			fmt.Println("读取公钥文件失败:", err)
			return
		}

		err = clipboard.WriteAll(string(pubKey))
		if err != nil {
			fmt.Println("复制到剪贴板失败:", err)
			return
		}

		fmt.Println("您的SSH公钥已经复制到剪贴板中。")
	}
}
