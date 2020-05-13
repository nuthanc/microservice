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
