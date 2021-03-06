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
	"flag"
)

type Configuration struct {
	url   string
	input string
	index string
}

func config() Configuration {
	urlPtr := flag.String("url", "http://127.0.0.1:9200", "URL of the Elasticsearch server")
	inputPtr := flag.String("input", "tpb.json", "Name of the file with TPB data in json format, generated by tpb-parse")
	indexPtr := flag.String("index", "tpb", "Elasticsearch index name")

	flag.Parse()

	return Configuration{url: *urlPtr, input: *inputPtr, index: *indexPtr}
}
