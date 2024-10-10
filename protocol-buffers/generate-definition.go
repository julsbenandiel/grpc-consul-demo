package main

import (
	"bufio"
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

func main() {

	// Step 1: Ask the user for the language
	fmt.Println("Select the language:")
	fmt.Println("[1] TypeScript")
	fmt.Println("[2] Python")
	fmt.Println("[3] Go")

	// Read user input for language selection
	reader := bufio.NewReader(os.Stdin)
	langChoice, _ := reader.ReadString('\n')
	langChoice = strings.TrimSpace(langChoice)

	// Only support TypeScript for now
	if langChoice != "1" {
		fmt.Println("Currently only TypeScript is supported.")
		return
	}

	// Step 2: List .proto files in the folder
	protoPath := "./protos"
	files, err := getProtoFiles(protoPath)
	if err != nil {
		fmt.Printf("Error reading proto files: %v\n", err)
		return
	}

	if len(files) == 0 {
		fmt.Println("No .proto files found.")
		return
	}

	fmt.Println("Select a proto file:")
	for i, file := range files {
		fmt.Printf("[%d] %s\n", i+1, file)
	}

	// Read user input for proto file selection
	protoChoice, _ := reader.ReadString('\n')
	protoChoice = strings.TrimSpace(protoChoice)
	protoIndex := toInt(protoChoice) - 1
	if protoIndex < 0 || protoIndex >= len(files) {
		fmt.Println("Invalid selection.")
		return
	}

	// Step 3: Run protoc command if TypeScript is selected
	selectedProto := files[protoIndex]
	runProtocCommand(selectedProto, protoPath)
}

// Helper function to get .proto files from a directory
func getProtoFiles(dir string) ([]string, error) {
	var protoFiles []string
	err := filepath.Walk(dir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() && strings.HasSuffix(info.Name(), ".proto") {
			protoFiles = append(protoFiles, info.Name())
		}
		return nil
	})
	return protoFiles, err
}

// Helper function to run the protoc command
func runProtocCommand(protoFile, protoPath string) {
	newpath := filepath.Join("../../", "generated")
	if err := os.MkdirAll(newpath, os.ModePerm); err != nil {
		log.Fatal("Cannot create folder:", err)
	}

	fmt.Printf("Generating TypeScript code for %s...\n", protoFile)

	cmd := exec.Command("protoc",
		"--plugin=./node_modules/.bin/protoc-gen-ts_proto",
		"--ts_proto_opt=outputServices=grpc-js",
		"--proto_path", protoPath,
		"--ts_proto_out=./generated", filepath.Join(protoPath, protoFile))

	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	err := cmd.Run()
	if err != nil {
		fmt.Printf("Error running protoc: %v\n", err)
		return
	}

	fmt.Println("Code generated successfully!")
}

// Helper function to convert string to int
func toInt(s string) int {
	var i int
	fmt.Sscanf(s, "%d", &i)
	return i
}
