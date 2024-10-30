package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"github.com/awee-ai/aicost"
)

func main() {
	bts, err := json.MarshalIndent(aicost.Models, "", "  ")
	if err != nil {
		fmt.Printf("failed to marshal models: %s\n", err)
		os.Exit(1)
	}

	// "data/models/latest.json"
	fp := filepath.Join("..", "..", "data", "models", "latest.json")
	err = jsonToFile(fp, bts)
	if err != nil {
		fmt.Printf("failed to save models: %s\n", err)
		os.Exit(1)
	}

	os.Exit(0)
}

func jsonToFile(path string, data []byte) error {
	// create directory if it doesn't exist
	dir := filepath.Dir(path)
	err := os.MkdirAll(dir, 0755)
	if err != nil {
		return fmt.Errorf("failed to create directory: %s: %w", dir, err)
	}

	err = os.WriteFile(path, data, 0644)
	if err != nil {
		return fmt.Errorf("failed to write file: %s: %w", path, err)
	}

	return nil
}
