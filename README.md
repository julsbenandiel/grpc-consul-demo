run consul docker in background
docker run  -p 8500:8500 -p 8600:8600/udp --name=consul consul:v0.6.4 agent -server -bootstrap -ui -client=0.0.0.0