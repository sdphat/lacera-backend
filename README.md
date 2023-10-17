## Overview
This is the backend repository of Lacera chat app project. The frontend repository can be found at https://github.com/sdphat/lacera-frontend. \
Complete app is deployed at https://lacera.onrender.com

## Features
Lacera is a chat app built on socket technology with the following features:
- One to one messaging
- Group messaging
- Support message formats such as: text, emoji, file
- Send/Accept friend requests, unfriend
- Message encryption using AES algorithm

## Installation
First, you need to create a .env file with the following structure:
```
REFRESH_TOKEN_SECRET=<refresh-token-secret>
REFRESH_TOKEN_EXPIRE_DURATION=<refresh-token-expire-duration>
ACCESS_TOKEN_SECRET=<access-token-secret>
ACCESS_TOKEN_EXPIRE_DURATION=<access-token-duration>
PASSWORD_SALT_ROUNDS=<bcrypt-salt-rounds>
DB_CONNECTION_STRING=<postgres-connection-string>
PORT=<server-port>
SELF_URL=<server-url>
ENCRYPTION_KEY=<aes-encryption-key>
```
You can get started by running development server
```bash
npm run dev
```
If you want to initiate placeholder data for development, you can use the command
```bash
npm run seed
```

In case you want to deploy the project, you will need to build the project first
```bash
npm run start
```
