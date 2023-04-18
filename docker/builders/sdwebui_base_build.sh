#!/bin/bash

cd ../dockerfile
docker build -t sdwebui_base:rtx4090 -f Dockerfile.sdwebui_base ../