# Submariner

## Prerequisites

 - Node 8 or higher

## Installation

```bash
npm install
```

## Startup

```bash
npm start
```

## Usage

This example converts a statically served srt by the submariner server itself into the WebVtt format. Simply replace the 'http://localhost:8080/static/blade_runner.srt' with another you find in the wild. If no source is provided the server will deduce the format from the extension. Target and url params are mandatory.

```bash
curl -XGET 'http://localhost:8080/subs/convert?source=srt&target=vtt&url=http://localhost:8080/static/blade_runner.srt'
```

The same functionality but through a POST call:

```bash
curl -XPOST -H 'Content-Type: application/json' 'http://localhost:8080/subs/convert' -d '{"source":"srt","target":"vtt","url":"http://localhost:8080/static/blade_runner.srt"}'
```

## Environment variables

You can define env vars to alter

```bash

```

## IMPORTANT

The output will always be utf-8 even if the source is encoded differently.
