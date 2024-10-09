package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
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

func RegisterService(consulAddr, serviceID, serviceName, serviceAddr string, servicePort int) error {
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
