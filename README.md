# Microservices with Node JS and React

### What is a Microservice
* Diagram link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F01%2F02.drawio
* D 1,2,3: Monolith
* D 4: Microservice
* D 3-ms: All the code required to make *one feature* work properly

### Data in Microservices
* D 13-db:
* D 14-db:
* D 16-why:
* D 15-db: Separate db for each service
* D 16-db: Not to access data
* D 17-why:
* D 18-why: **DB-per-service**
  * D 19-c:
  * D 18-te:
  * D 19-st:
  * D 20-st:

### Big Problems with Data
* D 14-db:
* D 4-c:
* D 5-c: *App*
* D 8-fe, 9-m, 10-new: Monolithic Approach
* D 11-ms, 12-new: Microservices Approach
  * How Service D will access data as in microservices we don't touch other services db

### Sync Communication between Services
* Diagram Link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F01%2F03.drawio
* D 1-data:
* D 3-data:
* D 4-sync:
* D 2-data: Sync comm
  * Request coming to service D, which in turn make direct requests to Services A,C and B instead of their db
* D 5-down, 6-web: Downsides of Sync Comm

### Event-Based Communication
* Asynchronous communication introduces *Event Bus* which is accessible from all the different services
* D 12-event:
  * Each service can emit events(notifications or objects) to or receive events from the Event Bus
  * Single point of failure but we make it very resilient
* D 13-events:
  * Service D emits an event to the Event Bus
  * Event Bus sends it to Service A
  * Service A emits another event to Event Bus responding to the received event
  * Event Bus to Service D
* D 5-down: Same downsides with Sync along with additional Downsides
  * Replace Request with Events

### A Crazy Way of Storing Data
* D 8-async:
* D 1-data:
* D 9-async:
* D 10-refine: 
* D 11-db: Table containing only required Fields or Columns
  * Question is how to create the db and stick in the relevant info
* D 12-reqs: Hard to get info to the db as the info is not directly communicated to Service D
* D 12-async:
  * Request to Create a Product to Service B
  * Service B updates its DB along with simultaneously emitting an event to Event Bus or Broker
  * Event Bus sends that to interested services, service D in our case
  * Service D will record that event in its db
  * Similarly the same process with Service A and Service C, which gets communicated to interested services via the Event Bus

### Pros and Cons of Async Communication
* D 13-async:
  * D 10-refine: Not 100% duplication due to this Requirement Refinement
  * D 14-pricing: Price is not a cause for concern

### App Overview
* Diagram Link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F02%2Fdiagrams.drawio
* D 2-dis:
* D 1-mock:
* D 3-design: **One service for one resource**
  * 2 resources: Posts and Comments
* D 5-do: Comments tied to Posts

### Project Setup
* D 6-tech: No db this time
* D 7-steps:
* mkdir blog
* Rest of README in blog dir

### React Project Setup
* Diagram Link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F02%2Fdiagrams.drawio
* D 11-react:
* D 12-react:
* Rest of the details in blog client README 

## Lessons from App#1
### Big Ticket Items
* Diagram link: https://app.diagrams.net/?mode=github#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F05%2F01.drawio
* D 1-take: Lessons from App#1
* D 2-pain: Painful Things
* D 3-note:
* D 3-solutions: **Solutions**

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

## Leveraging a Cloud Environment for Development
### Note on Remote Development
* Diagram link: https://app.diagrams.net/?mode=github#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F05%2F02.drawio
* D 1, 6-note

### Remote Dev with Skaffold
* D 2-local:
* D 3-remote, 4-sk
* D 5-sk: Unsynced file rebuild the image(E.g: package.json)

### Google Cloud Initial Setup
* cloud.google.com/free
* Click on Go to Console
* Create New Project

### Kubernetes Cluster Creation
* Go to Kubernetes Engine from the Sidebar
* Select Clusters and Create Cluster
  * Change the Name according to your requirements
  * Select the zone which is closer to you
  * At least 1.15 k8s master version Static version
* Go to Node pools on the Sidebar
  * Size: no. of nodes
  * Nodes
    * Machine type: g1-small
* Create on the bottom left hand side

### Kubectl Contexts
* D 9-context: Context are connection settings like auth credentials, users, ip addresses etc
* Install Google Cloud SDK: cloud.google.com/sdk/docs/quickstarts
* Do every installations execpet Initialize the SDK

### Initialzing the GCloud SDK
```sh
gcloud
# The above for checking 
gcloud auth login
gcloud init
# Select the account
# Select the project, if you don't find your project Go to console in browser and check the id for your project
# Yes for Compute region and select the region you selected for the k8s cluster
```

### Installing the GCloud Context
* D 10-options:
  * Cluster name is whatever was entered in k8s clusters in Console
```sh
# ex for with Docker
gcloud container clusters get-credentials ticketing-dev
# Check for additional entry in Context of Docker for Mac Kubernetes Option
```

### Updating the Skaffold Config
* D 7-process:
* Go to Google Cloud Console and select Cloud Build and click on Enable
* Check on skaffold.yaml in the root dir of microservice for the Google cloud changes
* Changes in build key(googleCloudBuild)
