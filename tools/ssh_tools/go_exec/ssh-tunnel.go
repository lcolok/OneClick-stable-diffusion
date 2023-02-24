package main

import (
	"bufio"
	"fmt"
	"io"
	"os"
	"os/exec"
	"regexp"
	"runtime"
	"strings"
)

func getClipboardContent() (string, error) {
	var out []byte
	var err error

	switch os := runtime.GOOS; os {
	case "darwin":
		cmd := exec.Command("pbpaste")
		out, err = cmd.Output()
	case "linux":
		cmd := exec.Command("xclip", "-selection", "clipboard", "-o")
		out, err = cmd.Output()
	case "windows":
		cmd := exec.Command("powershell", "-command", "Get-Clipboard")
		out, err = cmd.Output()
	}

	if err != nil {
		return "", fmt.Errorf("获取剪贴板内容失败：%v", err)
	}

	return strings.TrimSpace(string(out)), nil
}

func createSSHTunnelForWin(username, host, port, localPort, remotePort string) (string, error) {
	fmt.Println("正在建立连接，请勿关闭，关闭则会中断连接...")
	cmd := exec.Command("ssh", "-L", fmt.Sprintf("%s:localhost:%s", localPort, remotePort), "-p", port, fmt.Sprintf("%s@%s", username, host))

	// 创建管道，将命令的标准输出和标准错误输出保存到管道中
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return "", fmt.Errorf("failed to create stdout pipe: %v", err)
	}
	stderr, err := cmd.StderrPipe()
	if err != nil {
		return "", fmt.Errorf("failed to create stderr pipe: %v", err)
	}

	// 创建多重写入器，将命令的标准输出和标准错误输出同时输出到终端
	cmdWriter := io.MultiWriter(os.Stdout)

	// 启动命令
	if err := cmd.Start(); err != nil {
		return "", fmt.Errorf("failed to start SSH command: %v", err)
	}

	// 在新的协程中读取命令的标准输出和标准错误输出，并将它们输出到终端中
	go func() {
		_, err := io.Copy(cmdWriter, io.MultiReader(stdout, stderr))
		if err != nil {
			fmt.Printf("failed to copy command output: %v\n", err)
		}

		// 关闭标准输出和标准错误输出的管道
		stdout.Close()
		stderr.Close()
	}()

	// 等待命令执行结束
	if err := cmd.Wait(); err != nil {
		return "", fmt.Errorf("failed to create SSH tunnel: %v", err)
	}

	// 返回成功建立SSH隧道的信息
	return fmt.Sprintf("Successfully created SSH tunnel from local port %s to remote port %s on %s@%s.\n", localPort, remotePort, username, host), nil
}

func createSSHTunnel(username, host, port, localPort, remotePort string) error {
	var err error

	switch os := runtime.GOOS; os {
	case "darwin":
		// macOS 使用 -N 参数来禁用远程命令执行
		cmd := exec.Command("ssh", "-N", "-L", fmt.Sprintf("%s:localhost:%s", localPort, remotePort), "-p", port, fmt.Sprintf("%s@%s", username, host))
		err = cmd.Run()
	case "linux":
		// Linux 使用 -N 参数来禁用远程命令执行
		cmd := exec.Command("ssh", "-N", "-L", fmt.Sprintf("%s:localhost:%s", localPort, remotePort), "-p", port, fmt.Sprintf("%s@%s", username, host))
		err = cmd.Run()
	case "windows":
		createSSHTunnelForWin(username, host, port, localPort, remotePort)
	default:
		return fmt.Errorf("unsupported platform")
	}

	if err != nil {
		return fmt.Errorf("failed to create SSH tunnel: %v", err)
	}

	return nil
}

func holdon() {
	// 等待用户输入回车以便能看到输出结果
	fmt.Println("按回车键退出...")
	fmt.Scanln()
}

func main() {
	// 获取剪贴板内容
	clipboard, err := getClipboardContent()
	if err != nil {
		fmt.Println(err)
		return
	}

	// 使用正则表达式匹配 SSH 命令
	re := regexp.MustCompile(`^ssh\s+(\S+)@(\S+)\s+-p\s*(\d+)\s*$`)
	matches := re.FindStringSubmatch(clipboard)
	if len(matches) != 4 {
		fmt.Println("SSH命令不符合要求，请重新复制！")
		holdon()
		return
	}
	username := matches[1]
	host := matches[2]
	port := matches[3]

	// 获取远程主机的端口
	remotePort := "7860"
	fmt.Printf("远程主机的端口是多少？（默认为 %s）", remotePort)
	scanner := bufio.NewScanner(os.Stdin)
	if scanner.Scan() && len(scanner.Text()) != 0 {

		remotePort = scanner.Text()
	}

	// 获取本地映射的端口
	localPort := "7860"
	fmt.Printf("本地映射的端口是多少？（默认为 %s）", localPort)
	if scanner.Scan() && len(scanner.Text()) != 0 {
		localPort = scanner.Text()
	}

	// 创建 SSH 隧道
	createSSHTunnel(username, host, port, localPort, remotePort)
	holdon()
}
