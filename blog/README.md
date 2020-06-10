### Project Setup
* D 6-tech: No db this time
* D 7-steps:
* mkdir blog
* npx create-react-app client
* mkdir posts and cd into it
* npm init -y
* npm i express cors axios nodemon
* Go back to blog and mkdir comments and cd into it
* npm init -y

### Posts Service Creation
* Diagram Link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F02%2Fdiagrams.drawio
* D 5-do:
* D 8-design: What the Posts Service exactly needs to do
* Create index.js in posts
* posts object which is in-memory
* The above implementation is not good as data gets lost when the App is restarted
* But we want to keep it simple for this App
* Import randomBytes to generate new id
* Require and use bodyParser to parse any json data send to req body
* Add nodemon index.js in start scripts of package.json

### Testing the Posts Service
* To test the above, we are using Postman App
* Use request method to POST and make a request to localhost:4000/posts
* In header tab, Add Content-type as Key and application/json as Value
* Then in body tab, select raw and select json
* Send the json code below
```json
{
  "title": "First Post"
}
```
* Then test GET request to localhost:4000/posts
* In Headers, Content-Type as Key and application/json as Value

### Implementing a Comments Service
* D 9-comments: What the Comments Service exactly needs to do
* In comments dir, require same as posts index.js
* commentsByPostId is a complicated data structure
* D 10-comments: DS of commentsByPostId
* In package.json, enter start script with nodemon

### Quick Comments Test
* npm start both Posts and Comments
* Use similar requests as before in Postman

### Handling CORS Errors
* CORS Error occurs when we are making request to another port, for e.g. from localhost:3000 to localhost:4000
* To make this go away, need to make additional configuration on ther server side which is posts
* Stop posts and comments servers
* In both posts and comments, npm i cors
* Start back both posts and comments services
* In posts index.js and comments index.js, require cors and wire it up as middleware
* Then try creating posts again in the browser and click Submit
* You can see the 201 status in the Network tab

### Request Minimization Strategies
* *D 13-r:*
* Ideally, we want to make only one request and get all the posts and comments
* D 14-s: Monolithic solution
* D 15-s: Microservices
* D 16-s: Sync Communication
* D 17-s: Downsides to this approach
  * If comments goes down, then our application won't properly function

### An Async Solution
* Diagram Link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F02%2Fdiagrams.drawio
* D 18:
* D 19:
* D 20:
* D 21:
* D 22-q,23-q:
* D 24-p:
* D 24-c:

### Event Bus Overview
* Diagram Link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F02%2F02.drawio
* D 1-bus:
* D 2-bus:
* D 3-bus: Behind the scenes

### A Basic Event Bus Implementation
* mkdir event-bus in blog and cd into it
* npm init -y
* npm i express nodemon axios
* Create index.js and import express, body-parser and axios
* Create an express app
* D 3-bus:
* A series of post requests to other running services
* In package.json, use start script
* npm start on 4 services client, comments, posts, event-bus

### Emitting Events
* In posts index.js, require axios
* In posts endpoint, use axios to make a Network request
* Event object consists of Type and Data
* Add async and await as we are making a Network request
* npm start of 4 services to check
* Craete a new post and refresh the page
* D 3-bus:
* If we check the event-bus server logs, we see some errors
* We are getting 404 error as posts, comments and query service doesn't have the /events endpoint

### Emitting Comment Creation Events
* In comments index.js, require axios
* In post method of comments, make a Network request
* Make it async on the wrapping function and await on the request
* npm start of the all the services

### Receiving Events
* In posts index.js, add a new Post request handler
* Log the event type and send back a empty object response
* Repeat the same in comments index.js
* npm start and check the logs of creating Post and Comment

### Creating the Data Query Service
* D 4-qs:
* mkdir query in blog and cd into it
* npm init -y
* npm i express cors nodemon
* No axios because query service is not emitting any events
* Create index.js inside query
* Set start script in package.json
* npm start

### Parsing Incoming Events
* Simple object to store all the posts and comments
* Console log posts in events and npm start

### Using the Query Service
* D 5-data:
* In client src dir, go to PostList and change the axios request to 4002
* Console log the res.data in fetchPosts to check it out
* Check the Network requests tab 
* We see that we are still making request to comments endpoint
* Replace postId prop in CommentList to comments
* In CommentList, delete useState, useEffect and fetchData
* Flip back to the browser to check the details
* Now we are making one request in the Network tab
* We can kill comments and posts service

### Adding a Simple Feature
* D 6-filter:
* D 7-rules:
* D 8-mock:
* D 9-comment:

### Issues with Comment Filtering
* D 14-design: Current design
* D 15-one: Option 1-Moderation service
  * Posts is removed as there is no enough space
* Flow
  * Comment created and persisted in comments
  * Event emitted by comments
  * Event bus forwards only to Moderation service
  * Moderates and adds status and emits event to Event bus
  * Event bus forwards to all the services
  * Query service, then takes that data and stores it
* If Moderation service is Human for e.g, then it will take a long time
* All other services are waiting

### A Second Approach
* D 16-d:
  * Comment event from Event bus goes to both Moderation and Query Services
  * Query Service updates the data and set status as pending by default
  * D 8-mock: Show this while waiting for Moderation Service
  * Moderation Service will eventually send some Event
* D 20-q: Issue
  * D 21-u: Okay with simple logic
  * D 22-u:
  * D 23-d:
  * D 24:

### How to Handle Resources
* Previous issue solved by CommentModerated event processed by Comments service instead of Query Service
* D 18-res:
* D 17:
  * Comment Service knows the status of the comment as well
  * Comment Service CommentCreated event to Event bus which in turn will go to Moderation Service and Query Service
  * Moderation Service will process that event, moderates it and will emit an Event
  * This Event now will go to only Comments service
  * Comments service will process that event and then will emit a generic CommentUpdated Event
  * This event will go to Event bus and then to Query Service
  * The Query Service will take all the attributes instead of specific attribute

### Creating the Moderation Service
* mkdir moderation and cd into it
* npm init -y
* npm i axios express nodemon
* Cors module not required cause the frontend doesn't make a direct request to this
* Create index.js inside this
* Requires only one route
* Add start scripts in package.json

### Adding Comment Moderation
* D 17:
* In comments index.js, inside comments post handler add status of pending to both comments push and axios post
* In query index.js, in events post handler, pull status while destructuring in CommentCreated event and push status in post.comments

### Handling Moderation
* In moderation service index.js, check for the content and moderate it
* Network request to event bus
* In event-bus index.js, add axios post to moderation service as well

### Updating Comment Content
* D 19:
* In comments index.js, make changes in the events post endpoint
* We don't have to insert back the comment as it is the same object in memory
* D 20: CommentUpdated details
* Send axios request to event bus with the CommentUpdated event

### A Quick Test
* In query index.js, watch for CommentUpdated in post request of events endpoint
* npm start of all the services 
* Check the Network requests in chrome
* Create New Post
* Check the post contents after creating some random comment and orange
* Check the status of the comments

### Rendering Comments by Status
* In CommentList.js of client's src, put condition for rendering
* If statements can be refactored to switch statement
* To simulate human moderation, we can shut down moderation service
* Now create a new Comment
* If we start back the moderation service again, we have a problem
* Because the event-bus sent an event when the moderation service was down
* Our application is out of sync

### Dealing with Missing Events
* Diagram Link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F03%2F03.drawio
* D 1-missing: Time sequence diagram
  * Moderation was down during event 2 and 3
* D 2-missing: Creating a Service sometime in the future
* D 4-solution: Sync Requests: Service communicating via direct requests to other services
  * Creating endpoints on both posts and comments to handle async requests is a down-side
  * Production environment wouldn't have such bulk endpoints
* D 5-solution: Direct DB access
  * Extra code if they are of different dbs
* D 3-solutions: Event bus storing events

### Implementing Event Sync
* In event-bus index.js, create a new array called events
* Push the event to the array in post requests of events endpoint
* get request for events endpoint
* Real implementation of event-bus are even more complicated
* Then, in query index.js, extract all the if conditions in events endpoint and place them in handleEvent helper function
* Whenever our query service comes online, i.e. in app.listen, make a request to event-bus to get all the events

### Event Syncing in Action
* Require and install axios in query service
* npm start all the services
* Stop query service server
* Create new posts
* Refresh and you will see error in Network requests
* npm start query service
* After comment is seen, you can kill it again
* The benefit of this approach is that you can still enter comments even when the query service is down
* When it comes back again

### Deployment Issues
* Diagram link: https://app.diagrams.net/?mode=github#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F04%2F01.drawio
* D 6-local:
* D 7-deploy: Deploy using a VM
* D 8-scale:
  * Heavy load on Comments, so creating 2 more at 4006 and 4007
  * Thereby, changes required on Event-bus too
* D 9-scale: 2nd virtual machine
  * Event-bus requiring knowledge of how to send events to 2nd virtual machine
  * When the 2nd VM is dead, event-bus needs to know that and modify code accordingly

### Why Docker?
* D 10-docker:
* D 3-why:

### Why Kubernetes?
* D 12-k:
* D 11-k:
* D 13-k:
* D 14-ser:

### Dockerizing the Posts Service
* D 5-docker: Dockerfile
* Inside posts, create Dockerfile
* Create .dockerignore to ignore copying node_modules
* cd posts
* docker build .
* Id of the image built: 125fb3809b4a
* docker run 125fb3809b4a

### Review Some Basic Docker Commands
* D 16-com:
* docker build -t nuthanc/posts .
* docker run nuthanc/posts
* Other than default cmd by specifying -it and the default cmd at the end
* docker run -it nuthanc/posts sh
* docker exec -it <id> sh
* docker logs <id>
  * Logs of the primary process(Not overriding the default cmd)

### Dockering Other Services
* Copy the same Dockerfile and dockerignore to other services as they have the same commands
* Give docker id to build then the service
* docker build -t nuthanc/event-bus .

### Installing Kubernetes
* Docker Preferences -> Kubernetes -> Enable -> Apply & Restart

### A Kubernetes Tour
* New terminal window
* kubectl version
* Diagram link: https://app.diagrams.net/?mode=github#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F04%2F02.drawio
* D 4-k:

### Important Kubernetes Terminology
* D 5-terms:

### Notes on Config Files
* D 5-config:

### Creating a Pod
* In posts dir, rebuild the Dockerfile with tag and version number
* docker build -t nuthanc/posts:0.0.1 .
* Go back to blog dir and create infra dir
* Inside infra dir, create k8s dir and inside there posts.yaml
* cd infra/k8s
* kubectl apply -f posts.yaml
* Now renamed to oldposts.yaml.old
* kubectl get pods

### Understanding a Pod Spec
* D 7-config:
* If docker version is not mentioned, docker will default to latest
* If the spec containers image has latest or doesn't have any version, it will try to get it from **DockerHub by default**

### Common Kubectl Commands
* D 8-pods:

### A Time-Saving Alias
* alias k="kubectl"

### Introducing Deployments
* D 9-dep:
* D 10-dep: Deployment automatically takes care of upgrading
* minikube start
* eval $(minikube docker-env)
* docker build -t nuthanc/posts:0.0.1 .

### Creating a Deployment
* Create posts-depl.yaml in k8s of infra dir
* kubectl apply -f posts-depl.yaml

### Common Commands Around Deployments
* D 11-cmd:
* kubectl get deployments

### Updating Deployments
* D 11-update:
* Make some changes in posts index.js file
* Rebuild the image
* docker build -t nuthanc/posts:0.0.5 .
* Update the image tag in deployment file
* kubectl apply -f posts-depl.yaml
* kubectl logs <pod-name>
* This method is not used frequently

### Preferred Method for Updating Deployments
* D 12-update:
* Remove the version in image of posts-depl.yaml
* kubectl apply -f posts-depl.yaml
* Make an update to the code in posts index.js
* Rebuild using docker build -t nuthanc/posts .
* docker push nuthanc/posts
* kubectl rollout restart deployment posts-depl
* kubectl get pods
* kubectl logs <pod-name>

### Networking with Services
* D 13-service:
* D 15-serv: Different types
  * Important: Cluster IP and Loadbalancer
* D 16-cluster:
* D 17-lb:

### Creating a NodePort Service
* Create posts-srv.yaml in k8s infra
* D 18-ser:

### Accessing NodePort Services
* kubectl apply -f posts-srv.yaml
* kubectl get svc
  * You'll see 4000:30349
* That 30K port no is how we access inside our Browser
* D 19-add:
* minikube ip since I am using minikube else localhost if Docker for Mac is used for Kubernetes
* Go to 192.168.64.2:30349/posts

### Setting Up Cluster IP Services
* D 21-clus:

### Building a Deployment for the Event Bus
* D 20-goals:
* cd event-bus
* docker build -t nuthanc/event-bus .
* docker push nuthanc/event-bus
* Create event-bus-depl.yaml in k8s infra
* kubectl apply -f event-bus-depl.yaml

### Adding ClusterIP Services
* Add clusterip service of event-bus in the same file as deployment
* ClusterIP is default service
* targetPort of 4005 as event-bus is listening on that port
* kubectl apply -f event-bus-depl.yaml
* Similarly do the same for posts-depl.yaml
* kubectl apply -f posts-depl.yaml

### How to Communicate Between Services
* D 21-clu:
* k get svc
* http://<service-name>:<port>

### Updating Service Addresses
* In posts, update the request to event-bus-srv
* Double check the name of the svc and port from command
* Do the same in event-bus
* Comment out the other services for now
* docker build -t nuthanc/event-bus .
* docker push nuthanc/event-bus
* docker build -t nuthanc/posts .
* docker push nuthanc/posts
* kubectl rollout restart deployment posts-depl
* kubectl rollout restart deployment event-bus-depl 

### Verifying Communication
* Open Postman and send requests to posts service
* Post request to http://192.168.64.2:30349/posts
* Go to Headers: Content type: application/json
* Body->Raw: {"title":"POST"}, json selected
* Need to get status of 201
* Print logs from event-bus and posts pods
* Received Event: PostCreated

### Adding Query, Moderation and Comments
* D 23-final:
* Replace localhost with event-bus-srv in comments,moderation and query
* Build image and push to Dockerhub
```sh
docker build -t nuthanc/query .
docker push nuthanc/query
docker build -t nuthanc/moderation .
docker push nuthanc/moderation
docker build -t nuthanc/comments .
docker push nuthanc/comments
```
* Create comments-depl.yaml, moderation-depl.yaml and query-depl.yaml in k8s infra
* Apply them all at once
```sh
kubectl apply -f .
kubectl get pods
kubectl get services
```

### Testing Communication
* Update event-bus
* cd event-bus and rebuild the image and push to dockerhub
* After image is successfully pushed, rollout restart deployment
```sh
kubectl rollout restart deployment event-bus-depl
```
* Open Postman and send data like last time
* Now check logs
```sh
kubectl logs <comment-pod>
# Similarly on other pods
```

### Load Balancer Services
* Diagram link: https://app.diagrams.net/?mode=github#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F04%2F03.drawio
* D 1:
* D 2-init: Only during initial request to app, React Dev Server returning HTML,CSS and JS
  * React dev server is not making any requests to Posts, comments or other services
  * The actual requests are made from the User's browser
* D 3-app:
* D 4-option: Not good
* D 5-option:

### Load Balancers and Ingress
* D 7-term:
* D 6-lb: LB service reaches out to Cloud provider and tells it to provision a LoadBalancer
  * This loadbalancer exists outside of our cluster
  * LB: **to bring traffic into our cluster from Outside**
* D 7-lb: **Ingress Controller for routing to appropriate service**

### Installing Ingress-Nginx
* D 8-ing:
* D 9-note:
  * It's **ingress-nginx** github repo
* Go to Getting started of the above Github repo
```sh
minikube addons enable ingress
```

### Writing Ingress Config Files
* Create ingress-srv.yaml in k8s infra dir
* Annotations of ingress class of nginx is important as this is gonna help Ingress controller understand that we are gonna feed some Routing rules
* Incoming route of /posts
```sh
kubectl apply -f ingress-srv.yaml
```

### Hosts File Tweak
* D 11-host: Many different apps in many different domains in a single k8s cluster
* D 12-host: Now to trick posts.com to localhost
* In /etc/hosts file
```sh
127.0.0.1 posts.com # For docker for mac
# For minikube, get minikube ip
192.168.64.2 posts.com
```
* Now navigate to posts.com/posts in Browser

### Deploying the React App
* Change localhost:port to posts.com in React client src code
* Go to client and build an image and push to Docker hub
```sh
docker build -t nuthanc/client .
docker push nuthanc/client
```
* Create client-depl.yaml inside k8s of infra 
* Copy paste from comments-depl.yaml
```sh
kubectl apply -f client-depl.yaml
```

### Unique Route Paths
* In ingress-srv.yaml, add additional paths
* D 13-req: All request to microservices
* Ingress Controller only knows Route path, it doesn't have idea about the Request Method(Like get or post)
* So need to modify POST request to **/posts to /posts/create**
* So inside PostCreate of client and index.js of posts, change /posts to /posts/create
* The **get for /posts in posts index.js** is only for **testing purposes**
* Go to client and posts and build and push the image
* Also restart the deployments
```
docker build -t nuthanc/client .
docker push nuthanc/client

docker build -t nuthanc/posts .
docker push nuthanc/posts

kubectl rollout restart deployment client-depl
kubectl rollout restart deployment posts-depl
```
* **Anytime we make change to the code, we need to build and push the image manually and restart the deployment, but in the upcoming videos, we will have a tool to do this**