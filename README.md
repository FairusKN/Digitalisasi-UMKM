# Digitalisasi UMKM

A Cashier web-based app with Admin analytic dashboard init.

## Quick Start

>Just a little note if using windows docker can be much slower than in linux

### Prerequisities

- Docker
- Docker-Compose
- Preferably using linux OS

### Step 1 : Inital Setup (After Cloning)

Copy Environment

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### Step 2: Start Docker

Assuming Docker Daemon already started.

```bash
docker-compose up --build -d
```

### Step 3: Install Dependencies and Caching
```bash
docker exec -it umkm composer install --no-dev --optimize-autoloader
docker exec -it umkm php artisan config:cache
docker exec -it umkm php artisan route:cache
```

### Step 4: Permission
```bash
docker exec -it umkm chown -R www-data:www-data storage
docker exec -it umkm chmod -R 775 storage
```

### Step 5: Dummy Data for Realistic Chart
```bash
docker exec -it umkm php artisan migrate:fresh --seed
```

Just click yes if prompt to do seeder in production.

### Step 6: Verify Setup

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

### Project Structure
```bash
backend/
├── app
│   ├── Http
│   │   ├── Controllers                            # Controller as bridge from api to logic
│   │   │   ├── AuthController.php
│   │   │   ├── Controller.php
│   │   │   ├── OrderController.php
│   │   │   ├── ProductController.php
│   │   │   ├── SummaryController.php
│   │   │   └── UserController.php
│   │   ├── Middleware                             # Middleware 
│   │   │   ├── CheckTokenExpiration.php
│   │   │   ├── RoleMiddleware.php
│   │   │   └── SuperUserMiddleware.php
│   │   └── Requests                               # POST/PUT Request validation
│   │       ├── Auth
│   │       │   └── Login.php
│   │       ├── Order
│   │       │   └── CreateOrder.php
│   │       ├── Product
│   │       │   ├── Create.php
│   │       │   └── Update.php
│   │       └── User
│   │           ├── UserCreate.php
│   │           └── UserUpdate.php
│   ├── Models                                      # Model Table
│   │   ├── OrderItem.php
│   │   ├── Order.php
│   │   ├── Product.php
│   │   └── User.php
│   ├── PaymentMethod.php                           # Enum
│   ├── ProductCategory.php                         # Enum
│   ├── Role.php                                    # Enum
│   └── Service                               #Main Logic
│       ├── OrderService.php
│       ├── ProductService.php
│       ├── SummaryService.php
│       └── UserService.php
├── config                                    #config
├── database
│   ├── factories                             #Factory
│   │   ├── OrderFactory.php
│   │   └── UserFactory.php
│   ├── migrations                            #Table Migrations
│   │   ├── 0001_01_01_000000_create_users_table.php
│   │   ├── 0001_01_01_000001_create_cache_table.php
│   │   ├── 0001_01_01_000002_create_jobs_table.php
│   │   ├── 2025_08_23_101303_create_personal_access_tokens_table.php
│   │   ├── 2025_09_30_011122_create_orders_table.php
│   │   ├── 2025_09_30_015500_create_products_table.php
│   │   ├── 2025_09_30_015501_order_items.php
│   │   ├── 2025_10_06_090907_add_customer_name_to_orders_table.php
│   │   └── 2025_10_06_093035_add_cash_fields_to_orders_table.php
│   └── seeders                                 # Seeders
│       ├── DatabaseSeeder.php
│       ├── ProductSeeder.php
│       └── UserSeeder.php
├── Dockerfile
├── lang                                         # Language
│   ├── en
│   └── id
├── resources
│   ├── seed-images                              # Product Image for Seeder
│   │   ├── beverages1.jpg
│   │   ├── beverages2.jpg
│   │   ├── beverages3.jpg
│   │   ├── food1.jpg
│   │   ├── food2.jpg
│   │   ├── food3.jpg
│   │   ├── snack1.jpeg
│   │   ├── snack2.jpg
│   │   └── snack3.jpg
├── routes
│   ├── api.php                                     # Route for API
│   ├── console.php
│   └── web.php
├── storage
│   ├── app
│   │   ├── private
│   │   └── public
│   │       └── products_image                       # Product Image
```
