package main

import (
	"context"
	"fmt"
	"log"
	"net"
	"os"
	"path/filepath"
	"strconv"

	"github.com/fatih/color"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
	"google.golang.org/grpc"

	pb "github.com/julsbenandiel/grpc-consul-demo/author-grpc/generated/github.com/julsbenandiel/grpc-consul-demo/author-grpc"
)

type Server struct {
	pb.UnimplementedAuthorsServer
	collection *mongo.Collection
}

func loadEnv() error {
	envPath := filepath.Join("..", ".env.local")
	return godotenv.Load(envPath)
}

func NewServer(collection *mongo.Collection) *Server {
	return &Server{collection: collection}
}

func (s *Server) HealthCheck(ctx context.Context, req *pb.HealthCheckRequest) (*pb.HealthCheckResponse, error) {
	return &pb.HealthCheckResponse{
		Status: pb.HealthCheckResponse_SERVING,
	}, nil
}

func (s *Server) GetAllAuthors(ctx context.Context, req *pb.GetAllAuthorsRequest) (*pb.GetAllAuthorsResponse, error) {
	var authors []*pb.Author
	cursor, err := s.collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		var author pb.Author
		if err := cursor.Decode(&author); err != nil {
			return nil, err
		}
		authors = append(authors, &author)
	}

	return &pb.GetAllAuthorsResponse{
		Count:   int32(len(authors)),
		Authors: authors,
	}, nil
}

func main() {
	PORT := "50051"

	// Load environment variables
	err := loadEnv()
	if err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	// register service via http
	consulAddr := "http://localhost:8500"
	serviceID := "author-grpc"
	serviceName := "author-grpc"
	serviceAddr := "localhost"
	var servicePort int

	port, err := strconv.Atoi(PORT)

	if err != nil {
		log.Fatalf("Failed to convert port")
	}

	servicePort = port

	if err := RegisterService(consulAddr, serviceID, serviceName, serviceAddr, servicePort); err != nil {
		fmt.Printf("Error: %v\n", err)
	}

	// Connect to MongoDB
	clientOptions := options.Client().ApplyURI(os.Getenv("MONGO_URI"))
	client, err := mongo.Connect(clientOptions)

	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}

	fmt.Println("Author service mongo status: CONNECTED")

	collection := client.Database("author-service").Collection("authors")

	// Start the gRPC server
	listener, err := net.Listen("tcp", fmt.Sprintf(":%s", PORT))
	if err != nil {
		log.Fatalf("Failed to listen on port %s: %v", PORT, err)
	}

	grpcServer := grpc.NewServer()
	server := NewServer(collection)

	// Register the Authors service
	pb.RegisterAuthorsServer(grpcServer, server)

	msg := fmt.Sprintf(" [gRPC] Author service running on localhost:%s", PORT)
	color.New(color.BgGreen).Println(msg)

	if err := grpcServer.Serve(listener); err != nil {
		log.Fatalf("Failed to serve gRPC server: %v", err)
	}
}
