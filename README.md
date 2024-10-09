run consul docker in background
docker run  -p 8500:8500 -p 8600:8600/udp --name=consul consul:v0.6.4 agent -server -bootstrap -ui -client=0.0.0.0
consul services deregister -id={Your Service Id}

<!-- select winners -->
cd helper
 - npx ts-node get-names.ts
 - https://wheelofnames.com/

<!-- generate ts -->
protoc \
  --plugin=./node_modules/.bin/protoc-gen-ts_proto \
  --ts_proto_opt=outputServices=grpc-js \
  --ts_proto_out=generated ./proto/book.proto

npx ts-node grpc.ts
