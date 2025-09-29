#!/bin/sh

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

if ! command -v docker >/dev/null 2>&1; then
    echo -e "${RED}Docker not installed!${NC}"
    exit 1
else
   echo -e "${GREEN}Docker installed, good to go.${NC}"
fi

if ! command -v docker-compose >/dev/null 2>&1; then
    echo -e "${RED}Docker Compose not installed!${NC}"
    exit 1
else
   echo -e "${GREEN}Docker Compose installed, good to go.${NC}"
fi
