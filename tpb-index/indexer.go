/*
   tpb-index
   Copyright (C) 2016 Denis V Chapligin <me@chollya.org>
   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.
   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.
   You should have received a copy of the GNU General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

package main

import (
	"bufio"
	"encoding/json"
	elastic "gopkg.in/olivere/elastic.v3"
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
	log.Info("Scenner closed with: %v", i.scaner.Err())
	i.file.Close()
}
