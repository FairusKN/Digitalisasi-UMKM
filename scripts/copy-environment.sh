#!/bin/sh

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Copy .env.example to .env in root project
if [ -f ".env.example" ]; then
  cp .env.example .env
  echo -e "${GREEN}Copied .env.example to .env in root.${NC}"
else
  echo -e "${RED}.env.example not found in root.${NC}"
fi

# Copy .env.example to backend/.env
if [ -f "backend/.env.example" ]; then
  cp backend/.env.example backend/.env
  echo -e "${GREEN}Copied backend/.env.example to backend/.env.${NC}"
elif [ -f ".env.example" ]; then
  cp .env.example backend/.env
  echo -e "${YELLOW}Copied root .env.example to backend/.env.${NC}"
else
  echo -e "${RED}.env.example not found for backend.${NC}"
fi
