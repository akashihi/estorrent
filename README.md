# ES torrent

A search frontend for local The Pirate Base copy. 

## Prerequisites

You need to install Elasticsearch from https://www.elastic.co and ICU plugin 
from https://github.com/elasticsearch/elasticsearch-analysis-icu

Install curl to make queries on ES.

You will also need some web server, like nginx or something.

## Prepare the data

Get tpb-parser from https://github.com/akashihi/tpb-parser, build it and run:
 * tpb-parser -json

It will output tpb.txt file in json format. Preparation of that file may take couple of days and file will be huge.

Or you can search internet for pre-made dumps.

## Create index

### Prepare Elasticsearch

You need to create custom analyzer and bind it to your type prior data indexing. Analyzer definition is in 
tpb-settings.json file and type mapping is in tpb-mapping.json.

Run
 * curl -XPUT http://localhost:9200/tpb -d @tpb-settings.json 
 * curl -XPUT http://192.168.75.5:9200/tpb/_mappings/torrent -d @tpb-mapping.json 

Orders matters.

### Build tpb-index

1. Install [go](http://golang.org/doc/install)

2. Install "elastic" go get -u gopkg.in/olivere/elastic.v2

4. Compile tpb-index

        git clone git://github.com/akashihi/estorrent.git
        cd estorrent/tpb-index
        go build .

### Index the data.

It it highly recommended to split file into smaller parts and process those parts. 

To import data from some file run:
 * tpb-index -input input.file -output http://127.0.0.1:9200

It will take several hours or may be even days, depending on your system.

## Run the frontend

### Prerequisites

You will need NodeJS from https://nodejs.org 

Install it and run npm install in repository's root. npm install will install almost all the software, needed to built the project.
The only one exception is a Grunt command, which have to be install separately with npm install -g grunt-cli

Another one thing, that you'll have to do manually is to download google closure compiler binary and put 'compiler.jar' 
from it into 'build' directory. If you do not have any java runtime, please, download it and install now.

### Build frontend

Run
 * grunt

It will make all preparations and put generated site and code to the app/assets/dist directory.

### Prepare webserver

Frontend code expects Elastisearch server to be available on the same address as the frontend, suffixed by '/es'. Sample nginx configuration for that:
        location /es {
          proxy_pass http://127.0.0.1:9200/;
        }


Do not forget to make app/assets/dist available via the web.


Congratulations, everything should be working now!

## License 

See LICENSE file.

Copyright 2016 Denis V Chapligin <me@chollya.org>
