all: test build run

build:
	@go build -o ./bin/app ./cmd/main.go

run:
	@./bin/app

test:
	@go test -v ./...