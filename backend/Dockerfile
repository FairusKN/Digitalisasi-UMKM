FROM php:8.2-fpm

RUN apt-get update && apt-get install -y \
    git unzip libpq-dev libzip-dev libonig-dev libpng-dev libjpeg-dev libfreetype6-dev \
    procps curl zip && \
    docker-php-ext-install pdo pdo_pgsql mbstring bcmath zip exif pcntl && \
    docker-php-ext-configure gd --with-freetype --with-jpeg && \
    docker-php-ext-install gd && \
    rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/backend

RUN mkdir -p /var/www/backend/storage /var/www/backend/bootstrap/cache && \
    chown -R www-data:www-data /var/www/backend/storage /var/www/backend/bootstrap/cache && \
    chmod -R 775 /var/www/backend/storage /var/www/backend/bootstrap/cache

EXPOSE 9000

ARG UID=1000
ARG GID=1000

RUN usermod -u ${UID} www-data && groupmod -g ${GID} www-data

CMD ["php-fpm"]
RUN chown -R www-data:www-data /var/www
