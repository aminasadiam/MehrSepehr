package main

import (
	"log"

	"github.com/aminasadiam/Kasra/config"
	"github.com/aminasadiam/Kasra/router"
)

func main() {
	cfg := config.Load()

	err := router.Serve(cfg)
	if err != nil {
		log.Fatal(err)
	}
}
