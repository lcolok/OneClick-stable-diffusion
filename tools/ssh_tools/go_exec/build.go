package main

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
)

func compile(goFile string) error {
	// 定义需要编译的操作系统和架构列表
	osList := []string{"linux", "windows", "darwin"}
	archList := []string{"amd64", "386"}

	// 创建 bin 目录
	if err := os.MkdirAll("bin", 0755); err != nil {
		return fmt.Errorf("Failed to create bin directory: %v\n", err)
	}

	// 遍历操作系统和架构列表，编译对应的可执行程序
	for _, osName := range osList {
		for _, arch := range archList {
			output := filepath.Join("bin", fmt.Sprintf("%s_%s_%s", goFile[:len(goFile)-3], osName, arch))

			// 设置编译参数
			cmd := exec.Command("go", "build", "-o", output, goFile)
			cmd.Env = append(os.Environ(), fmt.Sprintf("GOOS=%s", osName), fmt.Sprintf("GOARCH=%s", arch))

			// 执行编译命令
			fmt.Printf("Compiling %s/%s...\n", osName, arch)
			err := cmd.Run()
			if err != nil {
				return fmt.Errorf("Failed to compile %s/%s: %v\n", osName, arch, err)
			}
		}
	}

	return nil
}

func main() {
	if err := compile("ssh-keygen.go"); err != nil {
		fmt.Println(err)
	}

	if err := compile("ssh-tunnel.go"); err != nil {
		fmt.Println(err)
	}

	fmt.Println("Done!")
}
