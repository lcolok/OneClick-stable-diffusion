#!/bin/bash

cd ../dockerfile
docker build --target conda -t conda:jupyter -f Dockerfile.conda .