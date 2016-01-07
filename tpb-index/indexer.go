package main

import (
	"bufio"
	"encoding/json"
	elastic "gopkg.in/olivere/elastic.v2"
	"io"
	"os"
	"time"
)

type TorrentEntry struct {
	Id          int
	Title       string
	Size        int
	Files       int
	Category    string
	Subcategory string
	By          string
	Hash        string
	Uploaded    time.Time
	Magnet      string
	Info        string
}

type Indexer struct {
	index  string
	es     *elastic.Client
	file   io.ReadCloser
	scaner *bufio.Scanner
}

func newIndexer(config Configuration) *Indexer {
	f, err := os.Open(config.input)
	if err != nil {
		log.Critical("Unable to read input file: %v", err)
		os.Exit(1)
	}

	e, err := elastic.NewClient(
		elastic.SetURL(config.url))
	if err != nil {
		log.Critical("Unable to connect to the Elasticsearch servers at %s: %v", config.url, err)
		os.Exit(1)
	}
	return &Indexer{
		index:  config.index,
		file:   f,
		scaner: bufio.NewScanner(f),
		es:     e,
	}
}

func (i *Indexer) Run() {
	for i.scaner.Scan() {
		var t TorrentEntry
		err := json.Unmarshal(i.scaner.Bytes(), &t)
		if err != nil {
			log.Warning("Failed to parse entry %s", i.scaner.Text())
			continue
		}
		_, err = i.es.Index().Index(i.index).Type("torrent").BodyJson(t).Do()
		if err != nil {
			log.Warning("Failed to index torrent entry %s with id %d", t.Title, t.Id)
			continue
		}
		log.Info("Indexed %s", t.Title)
	}
	i.file.Close()
}
