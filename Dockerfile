FROM golang:1.24-alpine

WORKDIR /mehrsepehr/backend

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -v -o bin/mehrsepehr cmd/main.go

EXPOSE 3000

CMD [ "bin/mehrsepehr" ]