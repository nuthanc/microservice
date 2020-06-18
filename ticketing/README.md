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

### Auth K8s Setup
* Create Dockerfile and .dockerignore in auth
```sh
docker build -t nuthanc/auth .
```
* Create infra folder and k8s subfolder in ticketing
* Create auth-depl.yaml

### Adding Skaffold
* Create skaffold.yaml in root dir
* Dest of . is corresponding path in the container
```sh
skaffold dev
```
* Change index.ts and observe the change in the console log

### Note on Code Reloading
* If server didn't restart after change in index.ts, do the following
* Open package.json in auth dir
* Find the start script and add the below
```json
"start": "ts-node-dev --poll src/index.ts"
```

### Ingress-Nginx Setup
* D 12-auth:
* Add get request handler in index.ts of auth
* In order to access auth pod, need to setup ingress or nodePort
* No need to reinstall ingress-nginx, use from **blog's** app
```sh
minikube addons enable ingress
```
* Create ingress-srv.yaml in infra k8s dir
* Observe the changes in skaffold log

### Hosts File and Security Warning
* In /etc/hosts make the changes for the domain as done previously in **blog**
```sh
<minikube-ip> ticketing.dev
```
* In browser, go to ticketing.dev/api/users/currentuser
* Ingress-nginx uses self-signed certificate so giving Your connection is not private
* Type Diagram 14-unsafe:

### Skaffold dev error
* Solved by changing the apiVersion in ingress-srv.yaml

### Creating Route Handlers
* Diagram link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F05%2F03.drawio
* D 1-ser:
* Create routes inside auth src dir corresponding to the above diagram
* Use expressRouter in the routes
* Import and use that router in index.ts