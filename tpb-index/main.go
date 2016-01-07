package main

const (
	tpbUrl = "https://thepiratebay.cr"
)

func main() {
	InitLog()
	log.Info("Starting tpb indexer...")

	configuration := config()

	newIndexer(configuration).Run()
}
