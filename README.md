# How to run

This guide assumes you have Docker and Docker Compose installed and running on your machine.

## Environment variables

Create a `.env` file in the root of the project with the following content:
```apacheconf
MYSQL_HOST=mariadb
MYSQL_ROOT_PASSWORD=myrootpassword
MYSQL_DATABASE=venel
MYSQL_USER=myuser
MYSQL_PASSWORD=mypassword
SESSION_SECRET=mysecret
ALLOW_FREE_REGISTRATION=true
UI_DEPLOYMENT_URL=http://localhost:3001
WEBSOCKET_URL=ws://127.0.0.1:8912
FILE_FOLDER=path/to/files/folder (will be created if it doesn't exist)
MAX_PAYLOAD_SIZE_MB=10
FILE_PASSWORD=password
```

## Windows

```bash
docker-compose build --no-cache; docker-compose up -d
```

## Linux

```bash
docker-compose build --no-cache && docker-compose up -d
```

# API Docs

Access [http://localhost:3000/api-docs/](http://localhost:3000/api-docs/) after running the application.

# Encryption

This feature is work in progress.

- [x] Symmetric encryption for attachments

- [ ] Symmetric encryption for messages

- [ ] Asymmetric encryption for attachments

- [ ] Asymmetric encryption for messages