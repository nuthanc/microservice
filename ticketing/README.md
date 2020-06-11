### App Overview
* stubhub.com
* D 6-tick: Ticketing App
* D 5-browser: Mockups

### Resource Types
* D 7-resources:
* Order object is the intent to purchase the ticket(When clicked on Purchase button)

### Service Types
* D 8-services:
* D 9-note: **Not necessary to have a separate service for each type of Resource**
  * Ticket and Order can be one service
  * Payment and Expiraton can be one service
  * It really depends on the Applications how tightly or loosely coupled they are

### Events and Architecture Design
* D 10-events:
* D 11-design:
  * common is a npm module which acts as Shared library
  * Event bus: NATS Streaming Server

### Auth Service Setup
* D 12-auth:
* mkdir ticketing and cd into it
* mkdir auth and cd into it
```sh
npm init -y
npm install typescript ts-node-dev express @types/express
tsc --init
mkdir src && cd src
touch index.ts
```
* Add start script in package.json
* npm start inside auth