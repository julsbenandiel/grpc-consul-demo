# cd backend && yarn dev
# cd author-service && yarn dev

npx concurrently \
  "cd ./book-grpc && yarn && yarn dev" \
  "cd ./backend && yarn && yarn dev" \
  "cd ./protocol-buffers && yarn" \
  "cd ./helper && yarn" &

cd ./author-grpc && go run *.go