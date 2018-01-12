#!/bin/bash
set -e

cd /app

export submariner=submariner
exec "$@"
