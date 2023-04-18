#!/bin/bash

cd ../dockerfile
docker build --target py -t py:3.10.6-torch2.0.0 -f Dockerfile.py .