package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

func loadEnv() error {
	envPath := filepath.Join("../..", ".env.local")
	return godotenv.Load(envPath)
}

func main() {
	// Load environment variables
	err := loadEnv()
	if err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	// Connect to MongoDB
	clientOptions := options.Client().ApplyURI(os.Getenv("MONGO_URI"))
	client, err := mongo.Connect(clientOptions)
	if err != nil {
		log.Fatalf("Error connecting to MongoDB: %v", err)
	}

	defer func() {
		if err := client.Disconnect(context.TODO()); err != nil {
			log.Fatalf("Error disconnecting from MongoDB: %v", err)
		}
	}()

	// Retrieve books from MongoDB
	collection := client.Database("book-service").Collection("books")
	filter := bson.M{"name": bson.M{"$ne": nil}}
	cursor, err := collection.Find(context.TODO(), filter)
	if err != nil {
		log.Fatalf("Error retrieving books: %v", err)
	}
	defer cursor.Close(context.TODO())

	// Collect book names
	var books []struct {
		Name string `bson:"name"`
	}
	if err := cursor.All(context.TODO(), &books); err != nil {
		log.Fatalf("Error parsing books: %v", err)
	}

	fmt.Println(books)

	var participants []string

	for _, book := range books {
		participants = append(participants, book.Name)
	}
	data := strings.Join(participants, "\n")

	// Write the names to a file
	err = os.WriteFile("names.txt", []byte(data), 0644)
	if err != nil {
		log.Fatalf("Error writing to file: %v", err)
	}

	fmt.Println("File written successfully")
}
