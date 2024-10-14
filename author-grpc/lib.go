package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type ConsulService struct {
	ID                string            `json:"ID"`
	Name              string            `json:"Name"`
	Tags              []string          `json:"Tags"`
	Address           string            `json:"Address"`
	Port              int               `json:"Port"`
	Meta              map[string]string `json:"Meta"`
	EnableTagOverride bool              `json:"EnableTagOverride"`
	Check             *ServiceCheck     `json:"Check,omitempty"`
}

type ServiceCheck struct {
	HTTP     string `json:"HTTP"`
	Interval string `json:"Interval"`
	Timeout  string `json:"Timeout"`
}

func loadEnv() {
	envPath := filepath.Join("..", ".env.local")
	err := godotenv.Load(envPath)

	if err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}
}

func toInt(s string) int {
	n, err := strconv.Atoi(s)
	if err != nil {
		log.Fatalf("Cannot convert %v to string", s)
	}
	return n
}

func getMongoClient() *mongo.Client {
	clientOptions := options.Client().ApplyURI(os.Getenv("MONGO_URI"))
	client, err := mongo.Connect(clientOptions)

	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}

	fmt.Println("Author service mongo status: CONNECTED")
	return client
}

func runServer(port string) net.Listener {
	listener, err := net.Listen("tcp", fmt.Sprintf(":%s", port))
	if err != nil {
		log.Fatalf("Failed to start server")
	}

	return listener
}

func registerService(consulAddr, serviceID, serviceName, serviceAddr string, servicePort int) error {
	service := ConsulService{
		ID:      serviceID,
		Name:    serviceName,
		Tags:    []string{"primary", "v1"},
		Address: serviceAddr,
		Port:    servicePort,
		Meta: map[string]string{
			"version": "1.0",
		},
		EnableTagOverride: false,
		Check: &ServiceCheck{
			HTTP:     fmt.Sprintf("http://%s:%d/health", serviceAddr, servicePort),
			Interval: "10s",
			Timeout:  "1s",
		},
	}

	// Convert the service struct to JSON
	serviceData, err := json.Marshal(service)
	if err != nil {
		return fmt.Errorf("failed to marshal service definition: %v", err)
	}

	// Send a PUT request to Consul
	url := fmt.Sprintf("%s/v1/agent/service/register", consulAddr)
	req, err := http.NewRequest("PUT", url, bytes.NewBuffer(serviceData))
	if err != nil {
		return fmt.Errorf("failed to create HTTP request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to register service with Consul: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("failed to register service, status code: %d", resp.StatusCode)
	}

	fmt.Println("Service registered successfully")
	return nil
}
