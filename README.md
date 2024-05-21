# How to run

## Environment variables

Create a `.env` file in the root of the project with the following content:
```apacheconf
MYSQL_HOST=mariadb
MYSQL_ROOT_PASSWORD=myrootpassword
MYSQL_DATABASE=venel
MYSQL_USER=myuser
MYSQL_PASSWORD=mypassword
SESSION_SECRET=mysecret
```

## Windows

```bash
docker-compose build --no-cache; docker-compose up -d
```

## Linux

### With sudo

```bash
sudo docker-compose build --no-cache && sudo docker-compose up -d
```

### Without sudo

```bash
docker-compose build --no-cache && docker-compose up -d
```

# API Docs

Access [http://localhost:3000/api-docs/](http://localhost:3000/api-docs/) after running the application.