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
