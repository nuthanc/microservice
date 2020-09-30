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

### Type Checking User Properties
* A **little trick** while creating new User
* Any time we want to create a new User, we will call buildUser
```ts
const buildUser = (attrs: UserAttrs) => {
  return new User(attrs);
};

buildUser({
  email: 'test@test.com',
  password: '33'
})

export { User, buildUser };

```
* We are creating this function for Typescript to get involved
* But we need to import 2 different things(User and buildUser)

### Adding Static properties to a Model
* Add a new method to the User model
```ts
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};
// this is how we add a custom function built into a model
//But when we try to use User.build() we still get this error
Property 'build' does not exist on type 'Model<Document>'
```
* TypeScript still doesn't understand it
* To fix it we create UserModel interface

### Defining Extra Document Properties
* D 7-ts: Issue#2
* To address Issue#2, create another interface called UserDoc
* Test using the below
```ts
const user = User.build({
  email: 'test@test.com',
  password: 'asdfad'
})
```

### What's that Angle Bracket For?
* Angular brackets are for generic syntax
* You can think them as functions or types
* When we call model with parenthesis
* UserDoc and UserModel can be seen as arguments to model
* They are **types** being provided to the function
* Command click on model to understand better
* UserModel is the return type of model

### User Creation
* D 3-auth:
* In signup.ts, import UserModel
* Status of 201, record was created
* Open up Postman and test
```json
ticketing.dev/api/users/signup
Headers: Application/json
Body: Raw and json selected
{
  "email": "aalkdsfjlad",
  "password": "1"
}

// Response
{
    "_id": "5efeff84d8ef4e00248d0c3f",
    "email": "test@test.com",
    "password": "2343242332432",
    "__v": 0
}

// Send the same request once again
// Now the response is
{}
```

### Proper Error Handling
* Throw proper error for existing user
* BadRequestError for anything that goes wrong in our Request handler due to the input the User gave us
* The above is different from RequestValidationError
* RequestValidationError is for handling output from **express-validator**
* Create bad-request-error.ts in errors dir
* General rule of thumb for new errors is:
  * Import custom-error and typescript will give the details of what to do
* this.message in super of BadRequestError is not possible becasue typescript jumps in and saves a reference to message on our instance
* Go to Postman and do a quick test
```json
{
    "email": "test@test.com",
    "password": "2343242332432"
}
// Send the above twice
// Response after sending twice
{
    "errors": [
        {
            "message": "Email in use"
        }
    ]
}
```

### Reminder on Password Hashing
* Diagram link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F05%2F04.drawio
* D 8: Bad approach of Password storing
* D 9: Password Hashing
* D 10-signin:

### Adding Password Hashing
* Place Password Hashing logic in User model file, in other words in models user.ts
* But we will place majority of the Hashing in a separate class which is in a separte file
* We are doing this to make our user model file a little bit cleaner
* Create services dir(Better name can also be given) in src dir
* Create password.ts inside that
* Create **static methods** in Password class
  * Methods that can be accessed without creating an instance of the class
```js
Password.toHash('akldsajf')
// instead of 
(new Password).toHash('aldskfj')
```
* crypto and util are built-in libraries
* scrypt is the Hashing function we are going to use
* scrypt is callback based implementation, so we are importing promisify to turn into a Promise based implementation which is compatible for async-await 
* *Generate salt* which is part of the Hashing process
  * Salt is random data that is used as an additional input to a one-way function that hashes data
* When using scrypt, we get a buffer,i.e. an array with raw data
* If we mouse over buf(which is little bit greyed out), it's type is set as unknown
```ts
const buf = await scryptAsync(password, salt, 64)
// Add as Buffer(interface)
const buf = (await scryptAsync(password, salt, 64)) as Buffer;
```

### Comparing Hashed Password
* D 10-signin:

### Mongoose Pre-Save Hooks
* pre('save') is a middleware function implemented in mongoose
* Mongoose doesn't have great support out of the box for async await syntax, so it has done argument to deal with asynchronous code
* After the await call, at the very end we need to call done
* Also note, we are using **function** and not arrow function
  * This is because:
  * Whenever we put together a middleware function, we get access to the document being saved(which is the User we are trying to persist to the Database) as **this** inside of this function
  * If an arrow function was used, then the value of **this** in the function would be overidden and would be the context of this entire file as opposed to the User document
* Check for modified password, the reason being
  * We might be retrieving User out of the db and trying to save them back in the db(Situation: Email change functionality: Fetching the user, changing the email and save them back into the db)
  * Even we are creating the password for the very first time, it is considered as modified
* Go to Postman and test
```json
{
    "email": "git@test.com",
    "password": "dasfdas238283"
}

// Response of Hashed password
{
    "_id": "5f04a9c505927700259e6c6a",
    "email": "git@test.com",
    "password": "48b7a2e9429fb44976fe8ca316f5f5dacac60a52445ca939777ff7bf64716980a2937199cb8e901f9087643be21a47d0cb14f154e1038a66ae8c21bd021ca362.af6235e2575526af",
    "__v": 0
}
```
* D 3-auth:

### Fundamental Authentication Strategies
* D 3-auth:
* Handling User authentication is a challenging problem
* D 11-auth:
* D 12-pay: Along with ticket, json web token, cookie or something else to show that they are authenticated
* D 14-two: Fundamental Option#1
  * Sync request: Direct request from one service to another, one that doesn't use an Event bus
  * If auth service goes down, we are gonna be in a world of hurt
* D 15-1.5: Fundamental Option#1.1
  * Downside same as in above option, i.e. when auth service goes down
* D 13-one: Fundamental Option#2

### Huge Issues with Authentication Strategies
* D 15-t: Step 1
* D 13-one: Step 2
* D 16-admin: Let's imagine Userabc is not the nicest person(Malicious user who got fired)
* D 17-result:
  * UserABC still has the jwt, cookie or whatever
  * We can't reach into their computer and say you need to delete this right away
  * Order service says you are authenticated and good to go
  * Decoupled from auth service

### So Which Option?
* D 19-fo:
* D 20-dir:

### Solving Issues with Option #2
* Not implemented but only explanation
* Because it requires extra work
* D 21-m: Timer for cookie, JWT
* D 22-s:
* D 23-c: As quickly as possible solution
  * short lived cache or data store as we do not need to persist for a long time

### Reminder on Cookies vs JWT's
* D 13-one:
* Diagram link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F05%2F05.drawio
* D 1-jwt: Cookies
  * Stored by browser and automatically sent to server while making follow-up requests
* D 2-jwt: JWT
  * Arbitrary information: Payload
  * We can extract the original object anytime using a decoding algorithm
  * D 3-jwt: Where the JWT is placed
* D 4-jwtcookie: Differences
  * Cookies any kind of data like Tracking info, visit counter
  * JWT need to managed manually unless we are storing JWT inside a cookie

### Microservices Auth Requirements
* D 5-ms: Requirement #1
  * Store info in auth mechanism to know more about the User,i.e. whether they have billing info, email etc
* D 8-auth: Requirement #2
  * Admin User creating free Coupons
  * Need more info like their role(Auth info)
* D 6-exp: Requirement #3
  * Tamper-resistant way to expire or invalidate itself
* D 7-gr: Requirement #4
  * Understood by many different languages
* D 9-summ: **Requirement summary**
* D 10-sum: Steering to JWT
  * Cookie expiration handled by browser
  * But a User can very easily copy the Cookie info and just ignore the expiration date and continue using the cookie
* D 3-jwt:
  * Can be sent in Request **Headers Authorization**
  * Can be sent in Request **Body token**
  * Can be sent in Request **Headers Cookie**
  * ![normal](pics/jwt.png)

### Issues with JWT's and Server Side Rendering
* **Normal flow**: Loading process for Normal React application
* ![normal](pics/normal_flow.png)
* D 12-auth: Where we care about authentication
* D 13-ssr: Server side rendered application
  * Initial request to some backend server(client)
  * The backend server is gonna build the HTML for our entire app and send it back
  * So no follow-up requests required
* Server side rendering
  * For SEO: Search engine optimization
  * Page load speed if a user has an older device or a mobile device
* D 14-auth:
  * Very first request, JWT needs to be communicated
* D 15-first: **But this really presents a big issue**
  * When you type google.com into your address bar in the Browser, Google has no ability to run js code on your computer(browser) before sending you an HTML file
  * When you enter after typing google.com, first thing you get back is the HTML file and inside that we can have some js code or a reference to a script tag to load up some code 
  * And in that point of time, Google can start to reach around and try to find the tokens stored on your device
* D 13-jwt: Only this is possible during Server side rendering
  * Corner case is **Service workers**

### Cookies and Encryption
* Diagram Link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F05%2F06.drawio
* D 1-signup: **Signup flow**
* Go to npmjs.com and search for cookie-session
* D 2-sess:

### Adding Session Support
```sh
cd auth
npm i cookie-session @types/cookie-session
```
* Inside auth src index.ts, import cookie-session and wire it up
* Disable encryption with signed as false
* Cookies will only be used if User visits our application over HTTPS
* Traffic proxied to our Application through ingress nginx, so need to set trust proxy as true
  * To make sure that express is behind a proxy of ingress-nginx

### Note on Cookie-Session
* Bug in cookie-session
```sh
npm uninstall @types/cookie-session
npm install --save-exact @types/cookie-session@2.0.39
```

### Generating a JWT
* D 1-signup:
* Check the examples in the documentation of cookie-session
```js
req.session.views = (req.session.views || 0) + 1
```
* We do a req.session
* req.session is an object created by cookie-session middleware
* Any information we store inside will be serialized and stored inside the cookie
* npmjs.com and search for jsonwebtoken
* payload is the info we want to store inside the jwt
* verify method to check if user messed our jwt
```sh
cd auth
npm i jsonwebtoken @types/jsonwebtoken
```
* IN signup.ts, import jwt
* Right after we save the User to the database, there we want to generate the jwt
* First argument to sign is the payload
* Second argument is a private key, for now 'asdf', but later we are gonna change it
```ts
req.session.jwt = userJwt;

// but typescript shows an error. To get around this
req.session = {
  jwt: userJwt
}
// This is because the type definition file that has been handed off to Typescript doesn't want us to assume that there is an object on req.session
```
* The cookie-session then will serialize it and sends it back to the User's browser
* Let's do a quick test in Postman
```json
// change the email address to unique
{
    "email": "alan@test.com",
    "password": "dasfdas238283"
}
// After sending it, go to Cookies tab
Nothing
// It is because we didn't specify the HTTPS protocol
Make request to
https://ticketing.dev/api/users/signup/
// Ingress-nginx serves an invalid temporary certificate
// Disable SSL certificate verification
// Now check in cookies tab
express:sess
eyJqd3QiOiJleUpoYkdjaU9pSklVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcFpDSTZJalZtTURjelkyTTFabVF5TVdSak1EQXhZVFpsTldZM01pSXNJbVZ0WVdsc0lqb2lkSFZ5YVc1blFIUmxjM1F1WTI5dElpd2lhV0YwSWpveE5UazBNekE1T0RJNWZRLkQ1ZEFtSkFKdTFTTjR5c21jSjM2dHVXOFA4OVBRZ1MtYWNFdU1iaWJ6N1UifQ%3D%3D
ticketing.dev
/
Session
true
true
```
* So after this, anytime we make a follow-up request to anything at ticketing.dev, this cookie will be included and we are going to get our JWT

### JWT Signing keys
* Take the cookie value generated during last time
* Go to base64decode.org
```json
{"jwt":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmMDczY2M1ZmQyMWRjMDAxYTZlNWY3MiIsImVtYWlsIjoidHVyaW5nQHRlc3QuY29tIiwiaWF0IjoxNTk0MzA5ODI5fQ.D5dAmJAJu1SN4ysmcJ36tuW8P89PQgS-acEuMbibz7U"}
```
* Take that jwt and go to jwt.io
* Place the jwt in encoded and place the signin key in Verify signature
* You see that the Signature is verified
* If you make any changes to the jwt, we see Invalid Signature
* We can see the payload even without the Signing key
* D 3-key:
* D 4-key:

### Securely Storing Secrets with Kubernetes
* D 4-key: We need to securely share the Signing key 
* D 5-sec:
* D 6-sec:
  * Key-value pair
  * Load to containers of different pods as env variables

### Creating and Accessing Secrets
* D 7-secret: 
* Different kinds of secrets
  * One of them might be info related to accessing a repository of docker images
  * Generic: all purpose kind of secret info
* After generic is the name of the secret
* This is an example of imperative command where we run a command to create objects(directly creating objects)
* In other cases, we used declarative approach where we wrote the config file and applied the config file
* The reason we are doing imperative is we don't want a config file listing out the value of the secret
  * Workaround to this can also be done where we write a config file and pass it from our local env variables
* The one **downside** to it is every time we create or spin up a new cluster, need to remember all the different secrets over time
* For now, what the author does is store it in very secure location
* Google "where to store kubernetes secrets"
* Secret in gist.github
* kubectl get secrets
* Later in auth-depl.yaml, place env section
* You get CreateContainerConfigError if the secret is not found

### Accessing Env Variables in a Pod
* In auth singup.ts, add process.env.JWT_KEY
* You see a red wiggly line
* That's because Typescript is complaining
* Add check in start function of index.ts
* But Typescript is still complaining since it wants it defined right before using it
* So add an *!* right after JWT_KEY
* Go to Postman and sign up with unique email address
```json
{
    "email": "turingalan@test.com",
    "password": "dasfdas238283"
}
// Response seen along with cookie
{
    "_id": "5f087aeb81a10b009daafc84",
    "email": "turingalan@test.com",
    "password": "e2f09eacd262639e74164a1117d791f750da3b291713b22f72d34c7a6547d2e6fdfb6b1f64fa0e701d8de1c7e8548bdc7d8e07e7c51adc5506219657299b58af.55e7ea2ba8ee1f8c",
    "__v": 0
}
```

### Common Response Properties
* We see additional non-required Response properties(like password and __v(tied to mongoose))
* D 8-db:
  * _id in mongo, id in mysql and postgres

### Formatting JSON Properties
```js
const person = { name: 'alex' }
JSON.stringify(person)
// "{"name":"alex"}"
const person2 = { name: 'alex', toJSON() { return 1;} } 
JSON.stringify(person2)
// "1"
```
* In user.ts of models, add second parameter to userSchema
* toJSON in mongoose, it is implemented as object
* Can option click on toJSON to see other attributes
* Remove password property using delete
* Now check back by sending in Postman with unique email
```json
{
    "email": "tune@test.com",
    "password": "dasfdas238283"
}
// Response
{
    "_id": "5f088064cf19fe010a857250",
    "email": "tune@test.com",
    "__v": 0
}
```
* That __v is a version_key which can be seen in Option clicking toJSON
* Also remap id property
```json
{
    "email": "temp@test.com",
    "password": "dasfdas238283"
}
// Response
{
    "email": "temp@test.com",
    "id": "5f088146ebe774017b32ce1b"
}
```

### The Signin Flow
* D 10-signin:
* In signin.ts, add validation to incoming request
* Array to organize different validation functions
```json
POST request to
https://ticketing.dev/api/users/signin/

{
    "email": "dsafdas",
    "password": "dasfdas238283"
}
// Response
{
    "errors": [
        {
            "message": "Email must be valid",
            "field": "email"
        }
    ]
}

{
    "email": "dsafdas@gmail.com",
    "password": ""
}
// Response
{
    "errors": [
        {
            "message": "You must supply a password",
            "field": "password"
        }
    ]
}
```

### Common Request Validation Middleware
* Since there is duplicate code between signin.ts and signup.ts, we write a common validation middleware
* Create validate-request.ts in middlewares folder
* Import this in signup and signin.ts
* Make a test on Postman again after making an invalid request

### Sign In Logic
* D 10-signin:
* Provide as little information as possible if invalid credentials during signin(Due to malicious user)
* Comparing the passwords is asynchronous
* Copy paste Generate JWT from signup.ts
* Sending back 200 status as we are not reading a new Record

### Quick Sign In Test
* Test in Postman
```json
POST request to
https://ticketing.dev/api/users/signup/
{
    "email": "test@test.com",
    "password": "password"
}
// Response
{
    "email": "test@test.com",
    "id": "5f0ac63a4093700033bda1aa"
}

POST request to 
https://ticketing.dev/api/users/signin/
{
    "email": "test@test.com",
    "password": "password"
}
// Response as well as Cookie
{
    "email": "test@test.com",
    "id": "5f0ac63a4093700033bda1aa"
}
// Test invalid cases as well like Empty passwords and Invalid password and an Email that doesn't exist
```

### Current User Handler
* Now fill up current-user.ts
* D 11:
  * If user is logged in, there will be a cookie present
* React application needs to know if user is signed in
* React cannot directly look into the cookie if there is a valid JWT(We have set up our cookies like that, so that they cannot be accessed by JS running inside our browser)
* So React needs to make a request to something in our App to know whether the User is currently logged in
* That's the Goal of our current-user Route handler

### Returning the Current User
* Red wiggly line aroudn req.session
  * CookieSessionInterfaces.CookieSessionObject | null | undefined
  ```js
  if (!req.session.jwt){
  ```
* The only time req.session will be null or undefined will be when we enter this Router handler(/api/users/currentuser) without first executing cookie session middleware given below
```js
app.use(
  cookieSession({
    signed: false,
    secure: true
  })
)
```
* So need to add additional check
```ts
if (!req.session || !req.session.jwt)
// can be replaced by
i (!req.session?.jwt)
```
* verify will throw an Error if jwt is messed around
* Go to Postman and make a quick test
```json
POST to https://ticketing.dev/api/users/signin/
{
    "email": "test@test.com",
    "password": "password"
}
// Response with cookie set
{
    "email": "test@test.com",
    "id": "5f0ac63a4093700033bda1aa"
}
// Then in new tab
GET to https://ticketing.dev/api/users/currentuser
With headers:
  Content-Type: application/json
Postman automatically sends Cookie when making request to the same domain
See Cookies on the right side: Of ticketing.dev
// Response
{
    "currentUser": {
        "id": "5f0ac63a4093700033bda1aa",
        "email": "test@test.com",
        "iat": 1594543655
    }
}
// After deleting the cookie and sending again
// Response
{
    "currentUser": null
}
```

### Signing Out
* Content in signout.ts
* Signing out process involves sending back a Header which tells the Browser to empty out the Cookie, which will remove the jwt
* To empty and destroy the cookie, we'll set req.session to null
* Go back to Postman and make a quick test
```json
First make sign in request
POST request to https://ticketing.dev/api/users/signin/
{
    "email": "test@test.com",
    "password": "password"
}
// Make GET request to https://ticketing.dev/api/users/currentuser to confirm
// Make another tab and make POST request to 
Make POST request to https://ticketing.dev/api/users/signout with Content-Type to application/json
// Response
{}
// Make GET https://ticketing.dev/api/users/currentuser
```

### Creating a Current User Middleware
* D 12-mw:
* Create current-user.ts in middleware

### Augmenting Type Definitions
* Making changes to existing Type definition
* Go to Postman and make a quick test
* Signin and check for currentUser

### Requiring Auth for Route Access
* D 12-mw: 2nd middleware
* Create require-auth.ts in middleware
* 401 status for forbidden
* Create not-authorized-error.ts Custom Error in errors
* Go to Postman and test it out to GET currentuser
* Signout and test again to currentuser routes
```json
// Response
{
    "errors": [
        {
            "message": "Not Authorized"
        }
    ]
}
```

### Scope of Testing
* Diagram link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F05%2F07.drawio
* D 8-scope:
  * Unit Test: Test a single piece of code in isolation
* D 4-bound:

### Testing Goals
* D 5-strat: Testing each service individually
  * Basic Request Handling(E.g for auth, but can be applied to other services as well)
  * If we make a request to Auth service to signup, we should get a Response with Cookie that has a JWT in it or assert some data to Mongodb
* D 6-t: Tests around Models
  * Unit Test Approach
* D 7-three: Event emitting + receiving
* D 8-note: **Not running tests in container but directly on the machine(Local environment)**

### Testing Architecture
* D 5-strat: Goal #1
* D 9-process:
  * Testrunner: Jest
  * In memory copy of Mongo(Running in memory)
    * Do not have to install Mongo directly on the machine
* Go to npmjs.com and Search for supertest
* D 11-process:
* D 12-test: Require index.ts to test file to get access to the App variable(app is requiring express)
  * Difficult now as we have some hard-coded startup logic inside index.ts
  * If multiple services listen on the same port, we are gonna have some problem
  * But supertest assigns ephemeral port 
* D 13-split: Refactor for the above problem

### Index to App Refactor
* Create app.ts inside auth src dir
* Cut everything above start function(except mongoose,cause you see a red wiggly line in index.ts when you cut everthing till start) and paste it to app.ts
* Export app(Named export, cannot export app by itself) from app.ts and import it in index.ts

### A Few Dependencies
```sh
cd auth
npm install --save-dev @types/jest @types/supertest jest ts-jest supertest mongodb-memory-server
```
* In memory mongo because we can test multiple databases at the same time
* Tests for different services concurrently on the same machine
* This will run much quickly
* We don't want this big mongodb-memory-server to be downloaded every time we build our Docker image
* That's why we install them as development dependencies(--save-dev)
* We are not gonna run tests in the image at any point in time
* Update this info in the Dockerfile(--only-prod)

### Test Environment Setup
* Add test scripts in package.json of auth
  * watchAll: Run all different tests inside our project whenever any file changes
  * no-cache: Attempt to use Typescript with Jest
    * Without this, jest doesn't always recognize changes with Typescript files
* Add another configuration for jest itself
  * ts-set for Typescript support
  * setupFilesAfterEnv: Tell jest to run setup files inside our project after it initially starts everything up
    * Try to run the file in the current working directory
* Create test folder and in there setup.ts
* New instance of MongoMemoryServer
  * Startup a copy of mongodb in memory
  * Allows up to run multiple different test suites at the same time across different projects without trying to reach out to the same copy of mongo
  * Also gives Direct access
* beforeAll is a hook function
  * Runs before all of the tests get executed
* beforeEach is another hook function
  * Runs before each of the tests get executed
  * Delete mongo collections Before each test starts
* afterAll hook function after all tests are run

### Our First Test
* Test around signup Route handler
* So, create a folder inside routes dir called __test__ and in that create signup.test.ts
* The above is the convention
* supertest allows to fake a request to express app
* *it* for test statement
* We see async without await, because we will add it sometime in the future(Eventually when we make multiple requests in a single test)
```sh
cd auth
npm run test
```
* We are getting an Error while trying to create JWT due to JWT_KEY environment
* Previously, there was a check in index.ts but now it is split to index.ts and app.ts
* Environment variable in deployment config file
* Need to define env variable in test environment
* We will do it in a simple, direct way(not the best) by doing it in beforeAll of setup.ts
* Now check whether it passes

### An Important Note
* Sometimes jest or ts-test doesn't detect changes made to the file
* Rerun npm run test

### Testing Invalid Input
* Try to sign up with invalid email or password
* We could write assertions with appropriate error message, but we will just keep it really quick and simple based on status code of 400
* Changes in signup.test.ts
* npm run test takes a lot of time initially because we are setting up in-memory mongodb
* But after that, tests run quickly
* Press Enter to rerun
* Instead of return we could use await

### Requiring Unique Emails
* Send same request again but with 400 status code

### Changing Node Env During Tests
* Session object(req.session which contains jwt) is turned into a string by cookie-session
* Cookie-session will send it back to User's browser inside the Response
* Cookie-session middleware will set a Header on the Response
  * Header name: Set-Cookie
* sets a cookie after successful signup test case fails
  * supertest not making https connection as secure is made true in app.ts cookie-session
  * We could make secure to be false in test env
  * process.env.NODE_ENV != 'test'
* Now we are gonna see that the test passes

### Tests Around Sign In Functionality
* Create signin.test.ts
* Can copy paste some of the tests from signup.test.ts
  * But some small changes like password not required of some particular length

### Testing Sign Out
* Create signout.test.ts
* Need to console log response to see what happens to the Set-Cookie Header
```sh
console.log
      [
        'express:sess=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly'
      ]
```
* Can do 2 approaches here
  * 1 toEqual of the above string
  ```ts
  expect(response.get('Set-Cookie')[0]).toEqual(
    'express:sess=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly'
  );
  ```
  * 2 just toBeDefined

### Issues with Cookies During Testing
* Test for current-user
* After signing up and get of currentuser
* When console.log(response.body)
```js
{ currentUser: null }
```
* Postman and Browser have functionality to automatically send up cookies
* supertest by default doesn't manage cookies for us automatically
  * Cookie doesn't get included in the followup request

### Easy Auth Solution
* Capture the response of signup in authResponse
* Then set the Headers using set method
* Now the log is
```js
{
  currentUser: {
    id: '5f172c490e3d0e6e1287ec08',
    email: 'test@test.com',
    iat: 1595354185
  }
}
```

### Auth Helper Function
* Write a global function in setup.ts of test dir
* Also need to declare for this
* Promise is gonna resolve itself with a value of type array of strings
```ts
Promise<string[]>;
```

### Testing Non-Authed Requests
* Tests around User model and events written later

### Starting the React App
* Diagram Link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F05%2F08.drawio
* D 1-note:
* D 1-client: Overview

### Reminder on Server Side Rendering
* D 4-trad:
  * In development setting
  * Atleast 2 or 3 requests to show some content to the User
* D 2-ssr: Server side rendering
  * NextJS sends out the fully rendered HTML all in one single request

### Basics of Next JS
* Create client dir inside ticketing
```sh
mkdir client
cd client
npm init -y
npm install react react-dom next
mkdir pages
```
* Pages dir with particular file names used for Routing instead of react-router 
* index.js in pages is the root route of our application
* If we go to localhost:3000/banana, we will see contents of banana.js
* **File names map up to Route names**
* Add dev script in package.json
* npm run dev in client dir

### Building a Next Image
* D 5-ts:
* Create Dockerfile and .dockerignore
* Try building it locally once
```sh
cd client
minikube start
eval $(minikube docker-env)
docker build -t nuthanc/client .
```

### Running Next in Kubernetes
```sh
docker push nuthanc/client 
```
* Create client-depl.yaml in infra k8s
* Also file syncing in skaffold.yaml
* Also new entry in ingress-srv.yaml
* path of client-srv is a catchall, so it should be at the very bottom, since paths parses in order
* Test this in browser by visiting ticketing.dev and /banana

### Note on File Change Detection
* NextJS is a little bit finicky with File change detection
* A little fix
  * Create next.config.js in client
  * Automatically loaded by nextJS
* Next doesn't automatically restart itself whenever we add some change in next.config.js unlike React files
* k get pods
* Manually kill the client pod
* k delete pod client-depl-5c754bbb8d-d52hm

### Adding Global CSS
* Bootstrap is a Global CSS file
* Global CSS files have to wired up to NextJS in a very particular fashion
* Create _app.js in pages
* Return Component and spread over pageProps
* Navigation in Next:
  * Whenever we try to navigate, Next is gonna import Components in the files mentioned in pages dir
  * Next is gonna wrap that up in its own custom default Component and that is referred to app
  * When we define _app, we define our own custom app component
  * Whenever we try to visit banana route inside the Browser, NextJS is gonna import that Component and is gonna pass it to _app.js as Component prop 
  * pageProps are gonna be the set of Components intending to pass to either Banana or Index(in this e.g)
* Why do we want to define _app.js
  * If we want to include global css into our project
  * This is the only place it can be imported
* More on Global css: Google search next.js css-global.md
```sh
cd client
npm install bootstrap
```

### Adding a Sign Up Form
* Create auth folder in pages dir and create signup.js
  * By doing that, it will define the route for /auth/signup.js
* Test this in browser

### Handling Email and Password Inputs
* In signup.js eventHandlers

### Successful Account Signup
* D 7-signup: Route to /api/users/signup
  * Many things in between:
    * Ingress-nginx
    * Service
    * Finally the pod where the app is running
```sh
cd client
npm i axios
```
* Also you can Cookies in Network XHR request signup and Cookies or Header set-cookie

### Handling Validation Errors
* To deal with invalid email and password, since Exception is sent, we need try catch block
```js
try {
  const response = await axios.post('/api/users/signup', {
    email,
    password,
  });
  console.log(response.data);
} catch (err) {
  console.log(err.response.data);
}
```
* Try checking this on UI
* **Conditionally display logic**
```js
{errors.length > 0 && (
  <div className="alert alert-danger">
    <h4>Ooops....</h4>
    <ul className="my=0">
      {errors.map((err) => (
        <li key={err.message}>{err.message}</li>
      ))}
    </ul>
  </div>
)}
```

### The useRequest Hook
* D 8-hook: Custom Hook of useRequest
* Create hooks dir inside client directory
* Create useRequest.js
* Can return usual way of Hooks
```js
return [doRequest, errors] 
```
* But it makes sense to return as an object
* axios dynamic method
```js
axios[method](url, body)
// instead of 
axios.get or axios.post
```
* Import useRequest in signup.js

### Using the useRequest Hook
* No need of error length checking in signup as it is null by default 
* Test it on Chrome
* There is a bug where the error message is still seen even after successful request
* We can clear this easily in useRequest by setErrors(null)

### An onSuccess Callback
* Import Router from next for Programmatic Routing in NextJS
```js
// Routing regardless of anything
const onSubmit = async (event) => {
    event.preventDefault();
    Router.push('/');
    doRequest();
  };
```
* Need to Route if there is no Error
* One way of doing this is rethrowing the error in catch statement of useRequest and doing the below
```js
await doRequest();
Router.push('/');
// Can wrap the above in try catch
```
* But a better way of doing this is using onSuccess callback in useRequest
```js
if (onSuccess) {
  onSuccess(response.data);
}
// Argument of response.data not strictly required
// But added for any future use
```

### Overview on Server Side Rendering
* D 3-ssr: Signed in or not
  * Request to /api/users/currentuser
* D 10-ssr:
* getInitialProps implementation in index.js of pages
* This will get called automatically while it is trying to render our App on the server
* getInitialProps is specific to NextJS and is our opportunity to fetch some data the Component needs during the Server side rendering process
* We cannot do any Data loading inside of Components themselves
* All our Components are executed or rendered one single time
* Test the index code in the Browser
* Go to Landing page and refresh the Page

##### minikube start and skaffold dev to see the Server side error
* async request in getInitialprops not working
* Check the reason for getting Server Error
  * Due to domain not being added properly since in containers