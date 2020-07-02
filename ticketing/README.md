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

### Scaffolding Routes
* Copy current-user to sigin, signout and signup and make the necessary changes
* Import and use them in index.ts

### Adding Validation
* D 1-ser:
* Using express-validator instead of manually validating it
```js
const { email, password } = req.body; 
```
* Docs in npmjs.com and Search for express-validator
```sh
npm install express-validator
```
* Import body from express-validator in signup.ts
* Add body as a middleware in the post request
* Annotate request and response

### Handling Validation Errors
* validationResult is used to pull the validation information from the request body added by the middleware
* Errors object to array using array method
* Now send request via Postman
* Send the request with skaffold dev running
* Make a POST request to 
```txt
ticketing.dev/api/users/signup
Headers: Application/json
Body: Raw and json selected
{
  "email": "aalkdsfjlad",
  "password": "1"
}
```
* Response obtained
```json
[
    {
        "value": "adadsklfjasd",
        "msg": "Email must be valid",
        "param": "email",
        "location": "body"
    },
    {
        "value": "1",
        "msg": "Password must be between 4 and 20 characters",
        "param": "password",
        "location": "body"
    }
]
```
* Provide the below with the above Headers
```json
{
    "email": "test@test.com",
    "password": "password"
}
# Response obtained is 
{}
```

### Surprising Complexity Around Errors
* Diagram link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F05%2F03.drawio
* D 2-err:
* D 3-serv:
* D 4-serv: Different languages and frameworks
* D 5-react:
* D 6-structure:

### Other Sources of Errors
* D 8-errors: Scenarios
  * No idea where something might go wrong in our application
  * Capture the error and send an identical looking error data structure

### Solution for Error Handling
* D 14-err:
* D 15-solve:
* Express error handling documentation
  * Sync and Async Route handler scenarios
  * Directions on writing Error handler

### Building an Error Handling Middleware
* Create middlewares folder in src dir
* Create error-handler.ts inside
* Only requirement for being error-handling middleware is having **4 arguments with the correct order**
* Very important goal: **Consistent error message**
* Wire error-handler to index.ts
* Then in signup.ts, throw an Error instead of sending the error as response(**For consistent structured error response**)
* When Error is thrown, it's automatically picked up by that error-handler middleware
* Then to test this, go to Postman and send
```json
{
    "email": "test",
    "password": "32234324235"
}

//Response
{
    "message": "Something went wrong"
}
```
* D 8-errors: Scenario 2
* Next provide valid email, but then again same Response due to throwing error after creating a user message
* We get a consistent Error response

### Communicating More Info to the Error Handler
* Replace Something went wrong with err.message in error-handler
* First argument to constructor of Error class is assigned to the message property of the Error
* Test again in Postman
```json
{
    "email": "test@test.com",
    "password": "2343242332432"
}

//Response
{
    "message": "Error connecting to database"
}
```
* D 16-err:
* D 17-err:
* If we were in js land, we could have written this in signup.ts
```js
const error = new Error('Invalid username or password');
error.reasons = errors.array()
//reasons a made-up property and errors is the validationResult
throw error;
```

### Encoding More Information In an Error
* D 17-err:
* D 19-issue:
* D 18-err:
  * When custom properties needed to be added, then it's a **sign to use Subclasses**
  * js land code can be made as a *subclass* of Error
* D 20-err: **Entire big picture**

### Subclassing for Custom Errors
* Create errors dir in src which holds different custom subclasses of Error
* ValidationError is a type like the below error
```js
[
  {msg: 'Bad email', 
   param: 'email'
  }
]
```
* Here in request-validation-error.ts constructor argument is *private* because we want to take the errors property and assign it as a property to the overall class
```js
//i.e. without private in constructor
errors: ValidationError[]
constructor( errors: ValidationError[] ) {
  this.errors = errors;
}

//Equivalent to
constructor(private errors: ValidationError[]){

}
```
* List of ValidationErrors, so the ValidationError[]
* If we are extending a built-in class
```js
Object.setPrototypeOf(this, RequestValidationError.prototype)
```
* To use this class
```js
throw new RequestValidationError(errors);
// errors is a list of errors
```
* We will use public for errors for now, later we will switch back to private
* We are hardcoding reason in database-connection-error.ts
* Do we need to extends Error in database-connection-error.ts to make it a subclass
  * Here just an example for other type of Errors
* Import both of these in signup.ts

### Determining Error Type
* In error-handler.ts, import the 2 subclasses of Error
* Open Postman and send
```json
{
    "email": "test",
    "password": "2343242332432"
}
//Response
{
    "message": ""
}
// IN the terminal
Handling this error as a RequestValidationError
```
* Next test db connection error
```json
{
    "email": "test@gmail.com",
    "password": "2343242332432"
}
//Response
{
    "message": ""
}
// IN the terminal
Handling this error as a DatabaseConnectionError
```

### Converting Errors to Responses
* D 20-err:
* D 22-co: **Common Response Structure**
  * Send back an *object* that has an errors property
  * This errors in an array of objects
* In request-validation-error.ts, Hover over ValidationError and see the different properties 
* Then back in error-handler.ts, build formattedErrors
* Go to Postman and make a quick test
```json
{
    "email": "test",
    "password": "2343242332432"
}
//Response
{
    "errors": [
        {
            "message": "Email must be valid",
            "field": "email"
        }
    ]
}
```
* Lookup Http status codes
  * 400 is for bad request(User sent bad data)
  * 500 Internal server error
```json
{
    "email": "test@gmail.com",
    "password": "2343242332432"
}
//Response
{
    "errors": [
        {
            "message": "Error connecting to database"
        }
    ]
}
```

### Moving Logic Into Errors
* D 23-err: Custom errors for every kind(Intricate knowledge on every kind of error is not feasible as the middleware's complexity increases)
  * D 22-c: To make sure they follow common structure
* D 24-re: Solution to the above problem
* Add serializeErrors method and statusCode to both the subclasses of Error
* Check with Postman whether these refactor doesn't have any mistakes
* Need to get the same response as above

### Verifying our Custom Errors
* There is nothing in our code to check whether serializeErrors is put together correctly
* D 25:
* D 26-ce:
* Two possible approaches:
  1. D 27: Option no 1
  ```ts
  interface CustomError {
    statusCode: number;
    serializeErrors(): {
      message: string;
      field?: string; //? meaning Optional
    }[];// Return type: array of objects
  }

  // Then we can do something like
  class RequestValidationError extends Error implements CustomError
  ```
  2. D 28: Option no 2
    * Abstract Class
    * Interfaces fall away in the world of JS, but Abstract classes translate to class definitions in JS

### Final Error Related Code
* Create custom-error.ts in errors dir
* Create new Abstract class in there
* abstract property to make it as compulsory property in subclass
* abstract serializeErrors is a **method signature**
* Import this abstract class in both the Subclasses of errors
```js
throw new Error('something went wrong')
// For logging behavior
```
* So CustomError constructor takes an argument and because of that RequestValidationError and DatabaseConnectionError constructors also take an argument
* The above is only for logging purposes and is not sent to the user
* Now we can delete two if statements to just one if statement(Smart Refactor)
* Make a quick test in Postman

### How to Define New Custom Errors
* Eg for route that does not exist
* Go to errors dir and create not-found-error.ts
* Just extend CustomError and **hover over the errors to implement it(This approach is brilliant)**
* Import this in index.ts and before app.use(errorHandler), add app.get
* Do a quick test in Postman
```json
// Quick test to GET ticketing.dev/api/users/signup/adsfkdasf

// Response 
{
  "errors": [
    {
        "message": "Not Found"
    }
  ]
}
```
* Also can change to app.all to handle all requests
```json
// Quick test to POST ticketing.dev/api/users/signup/adsfkdasf

// Response
{
    "errors": [
        {
            "message": "Not Found"
        }
    ]
}
```

### Uh Oh... Async Error Handling
* Adding async to app.all function breaks our App
```js
app.all('*', async () => {
  throw new NotFoundError()
})
```
* Go to Postman and check send a POST request
```json
// Quick test to POST ticketing.dev/api/users/signup/adsfkdasf

// Response
It hangs 
Sending request...
```
* async returns a Promise
* Go back to Express error handling documentation
  * Rely on next function
```js
app.all('*', async (req, res, next) => {
  next(new NotFoundError());
})
```
* The above works
* But we don't want to have next as it is very particular to express
* Go to npmjs.com and search for express-async-errors
```sh
cd auth
npm i express-async-errors
```
* Then in index.ts file import it
* Now, no need of next
* Check with Postman 
* You can add async in signup post handler as well
* Check with Postman again to 
```json
ticketing.dev/api/users/signup/ POST
{
    "email": "test.com",
    "password": "2343242332432"
}
//Response
{
    "errors": [
        {
            "message": "Email must be valid",
            "field": "email"
        }
    ]
}
```

### Creating Databases in Kubernetes
* Diagram link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F05%2F01.drawio
* D 11-design: 
  * 1 Database per service
* Diagram link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F05%2F04.drawio
* D 1-auth:
```sh
cd auth
npm i mongoose
```
* Create auth-mongo-depl.yaml in infra k8s dir
  * image of mongo is coming from Dockerhub
  * ports name is just for logging purposes
    * If we print out our service at our terminal, it's gonna a name for the port
  * Default port for mongo on 27017

### Connecting to MongoDB
* D 2-sto: Loss of data
* Mongoose and mongo related code in index.ts
* Hover over mongoose error
```sh
cd auth
npm install @types/mongoose
```
* Connect to mongo using async-await syntax
* Usually if we want to connect to mongo instance available at localhost
```js
mongoose.connect('mongodb://localhost:27017')
```
* But now we need to connect to the auth-mongo-srv
* After the port is the *name* of the db, in this case(auth)
* If we failed to connect, it will throw an error
* We are wrapping async await within start, because only the latest version of node can have await at the top-level(outside a function)

### Understanding the Signup Flow
* D 3-auth:

### Getting Typescript and Mongoose to Cooperate
* D 4-mongo:
* D 5-m: Issue#1
* D 6-ts:
* D 7-ts: Issue#2

### Creating the User Model
* Create models dir in auth src dir
* Create user.ts in models
* Typescript interface has lower case string
```ts
interface asdf {
  bg: string;
}
```
* In userSchema the type is String constructor(which is JS builtin)
```ts
new User({
  email: 'test@test.com',
  pwd: 3232432,
});
```
* Typescript doesn't care even if we gave the above
