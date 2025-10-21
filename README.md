# Digitalisasi UMKM

A Cashier web-based app with Admin analytic dashboard init.

## Quick Start

> Just a little note if using windows docker can be much slower than in linux

### Prerequisities

- Docker
- Docker-Compose
- Preferably using linux OS

### Step 1 : Inital Setup (After Cloning)

Copy Environment

**Linux**

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

**Windows (Powershell)**

```bash
Copy-Item .env.example .env
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

**Windows (CMD)**

```bash
copy .env.example .env
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

### Step 2: Start Docker

Assuming Docker Daemon already started.

```bash
docker-compose up --build -d
```

### Step 3: Install Dependencies and Caching

**Linux**

```bash
docker exec -it umkm composer install --no-dev --optimize-autoloader
docker exec -it umkm php artisan config:cache
docker exec -it umkm php artisan route:cache
```

**Windows (PWSH/CMD)**

```bash
docker exec -it umkm bash -c "composer install --no-dev --optimize-autoloader && php artisan config:cache && php artisan route:cache"
```

### Step 4: Permission

```bash
docker exec -it umkm chown -R www-data:www-data storage/
docker exec -it umkm chmod -R 775 storage/
```

### Step 5: Dummy Data for Realistic Chart

```bash
docker exec -it umkm php artisan migrate:fresh --seed
```

Just click yes if prompt to do seeder in production.

### Step 6: Another Permission

```bash
docker exec -it umkm chown -R www-data:www-data storage/
docker exec -it umkm chmod -R 775 storage/
```

### Step 7: Verify Setup

```bash
curl localhost/api
```

if return `{"success" : true}`, then laravel is working.

Route for website:

- `localhost/` : For Welcome Page
- `localhost/login` : For Login, depend on user's role login, you can get different pages. You can use these credentials that already created from seeders:

1. username: `irustestlmao` , password: `superuser`
2. username : `manager01`, password : `password` `// Username Manager from seeder can be manager01 - manager09`
3. username : `cashier01`, password : `password` `// Username Cashier from seeder can be cashier01 - cashier09`
