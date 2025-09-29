# Digitalisasi UMKM

A Cashier web-based app with Admin analytic dashboard init.

## Quick Start

### Prerequisities

- Docker
- Docker-Compose

### Step 1 : Inital Setup (After Cloning)

**If In Linux, GL WIN Users**

```bash
chmod +x scripts/*
```

#### Check Environment

```bash
./scripts/check-environment.sh
```

#### Copy Environment

```bash
./scripts/copy-environment.sh
```

### Step 2: Start Docker

Assuming Docker Daemon already started.

```bash
docker-compose up --build -d
```

### Step 3: Verify Setup

```bash
curl localhost/api
curl localhost
```

## Some Script To Easily Do Artisan Command

### Migrate:fresh with seed

```bash
./scripts/database-migrate-fresh-seed.sh
```

