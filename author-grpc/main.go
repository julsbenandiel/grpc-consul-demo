package main

import (
	"context"
	"fmt"
	"log"

	"github.com/fatih/color"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"google.golang.org/grpc"

	pb "github.com/julsbenandiel/grpc-consul-demo/author-grpc/generated/github.com/julsbenandiel/grpc-consul-demo/author-grpc"
)

type Server struct {
	pb.UnimplementedAuthorsServer
	dbClient *mongo.Client
}

func NewServer(mongoClient *mongo.Client) *Server {
	return &Server{dbClient: mongoClient}
}

func (s *Server) HealthCheck(ctx context.Context, req *pb.HealthCheckRequest) (*pb.HealthCheckResponse, error) {
	return &pb.HealthCheckResponse{
		Status: pb.HealthCheckResponse_SERVING,
	}, nil
}

func (s *Server) GetAllAuthors(ctx context.Context, req *pb.GetAllAuthorsRequest) (*pb.GetAllAuthorsResponse, error) {
	var authors []*pb.Author

	collection := s.dbClient.Database("author-service").Collection("authors")
	cursor, err := collection.Find(ctx, bson.M{})

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
	loadEnv()

	// register service via http
	consulAddr := "http://localhost:8500"
	serviceID := "author-grpc"
	serviceName := "author-grpc"
	serviceAddr := "localhost"
	servicePort := toInt(PORT)

	if err := registerService(consulAddr, serviceID, serviceName, serviceAddr, servicePort); err != nil {
		fmt.Printf("Error: %v\n", err)
	}

	// Connect to MongoDB
	client := getMongoClient()

	// Start the server
	listener := runServer(PORT)
	grpcServer := grpc.NewServer()
	server := NewServer(client)

	// Register the Authors service
	pb.RegisterAuthorsServer(grpcServer, server)

	msg := fmt.Sprintf(" [gRPC] Author service running on localhost:%s", PORT)
	color.New(color.BgGreen).Println(msg)

	if err := grpcServer.Serve(listener); err != nil {
		log.Fatalf("Failed to serve gRPC server: %v", err)
	}
}
