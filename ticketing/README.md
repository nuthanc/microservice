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
* Without express-async-errors, you get UnhandledPromiseRejectionWarning Error
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
  * To prevent loss of data after pod restart, we need to use Persistent volume claims
  * https://www.freecodecamp.org/news/the-kubernetes-handbook/#persistent-volumes-and-persistent-volume-claims
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
* You can think them as functions of types
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
* D 03-jwt: Only this is possible during Server side rendering(i.e. Sending info via only cookie and not through Request body or Header's authorization)
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
* Note that ret is the JSON'ed object, and it's not an instance of the mongoose model
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
* Documentation about it method(https://jasmine.github.io/api/3.6/global.html#it)
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

### Fetching Data During SSR
* Fetch data in index.js of pages
* Why are we not making use of useRequest hook
* Because it is a hook and are used inside React components, whereas getInitialProps is not a Component but a plain function
```js
const LandingPage = ({ currentUser }) => {
  console.log(currentUser);
  return <h1>Landing Page</h1>;
};

LandingPage.getInitialProps = async () => {
  const response = await axios.get('/api/users/currentuser');

  return response.data;
};
```
* The above code is correct but we get the below error
```txt
Server Error
Error: connect ECONNREFUSED 127.0.0.1:80

This error happened while generating the page. Any console logs will be displayed in the terminal window.
```
* But if we do only this and check the Response on Chrome Network tab, everything works properly
```js
const LandingPage = ({ currentUser }) => {
  console.log(currentUser);
  axios.get('/api/users/currentuser');
  return <h1>Landing Page</h1>;
};
// Response in Chrome Network
currentUser: {id: "5f20130c0b30a60023490932", email: "adsf@sdalfj.com", iat: 1595937548}
```

### Why the Error?
* Diagram Link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F05%2F08.drawio
* In the previous code snippet of LandingPage, it is executed on the Browser (also executed on the Server)
* D 11-ssr:
  * When axios request is in LandingPage and getInitialProps is commented
  * First request, ingress-nginx sends to NextJS
  * Browser automatically adds the domain along with the Route
* D 12-ssr: When it fails
  * Node networking on the client side
  * Node networking similar to browser and adds the domain
  * Since NextJS is inside a container, the request went there inside the container on port 80
  * But there is nothing running on port 80 inside the container

### Two Possible Solutions
* D 13-domain:
* D 15-opt:
  * Option no 2: Not good as NextJS will need to know the exact service name for every thing it needs to reach out to
  * Also which route for which service
  * Option no 1: Which domain is the challenge
* D 15-cookie: Including Cookie is a challenge

### Cross Namespace Service Communication
* D 15-opt: What should be the domain
* D 16-ns:
  * But in my environment ingress-service is in Default namespace(That is ingress)
  * Ingress service is now in kube-system namespace
  * So it can be accessed directly
* D 17-cross:
* D 18-ext:

### When is GetInitialProps Called?
* D 13-domain:
* D 19-ref:
* Although we can technically can make requests inside the Component, we don't get the opportunity for the request to get resolved during the Server Side Rendering Process
  * Don't get the opportunity to update state, make use of any lifecycle methods
* getInitialProps will also be executed on the Browser under very particular circumstances given below
* Scenarios where getInitialProps is called
  * Hard reset and Reload: Server
  * Redirect from another page: Client
* D 20-inc:
* To test this out, changes in index.js of pages
* Hard refresh on Landing Page
  * Log seen in server
* Select Address bar and hit Enter
  * Log seen in server
* Navigating from one page to another while in the app
  * Scenario: Signup
  * Not a full reload of the Page
  * ticketing.dev/auth/signup
  * Log seen in client(Browser)

### On the Server or the Browser
* window is an object that exists only inside the Browser

### Specifying the Host
```js
const response = await axios.get('/api/users/currentuser');
return response.data;
// to
const { data } = await axios.get('/api/users/currentuser');
```
* In order to execute getInitialProps on the Browser, we have to navigate to this page(Signup process)
* We see the data on the Browser console
* If we are on the server, we need to make request to
  * http://SERVICE.NAMESPACE.svc.cluster.local
  * But, in my case, ingress-service(k get svc -n kube-system) is in Kube-system namespace
* **Solution from Comments**
  * kubectl expose deployment ingress-nginx-controller --target-port=80 --type=ClusterIP -n kube-system
  * Then access in http://ingress-nginx-controller.kube-system.svc.cluster.local/api/users/currentuser
* Need to add Host of ticketing.dev when we are on the Server
* D 15-cookie:
  * Browser makes request to Client's NEXT JS
  * Next then makes it own request to Ingress-nginx, but cookie is not included
* We see an output of null on the server side console

### Passing Through The Cookies
* Whenever getInitialProps gets called on the server, the 1st argument is an object that has a couple of properties inside it
* console log req.headers to check all the headers

### A Reusable API client
* D 21-api:
* Create api folder and build-client.js within it in client
* Axios create the baseURL so that this file can be imported in index.js
* Do a quick test on the Browser by refresh and check the console logs
* Next do a soft signup by first moving to auth/signup and check the logs
* To improve readability, we can define client ahead of time

### Content on the Landing Page
* Ternary expression in Landing Page to test sign in
* To test sign out, Clear cookies in Application tab in Chrome

### The Sign In Form
* Diagram Link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F05%2F08.drawio
* D 1-client:
* The signup form can be reused to show sigin, but since this is not a course on React, we will be copying sigup to signin
* Change Sign Up to Sign In
* Make sure to not have any cookies in the Chrome Console Application tab
* To test this, go to /auth/signup, signup with an account
* Clear the Cookie in the Application tab
* Go to /auth/signin and test it

### A Reusable Header
* If we want something for every single page, we can use _app.js and wrap Component with another Component or html 
  * Component is the page we are trying to show
```js
return (
  <h1>Header</h1>
  <Component {...pageProps} />
  );
```
* D 6-app:
* Header is React in nature, since it changes based on whether User is signed in or not
* D 8-fetch: getInitialProps need to moved from index.js to _app.js since Header also needs to find out currentUser
* D 9-reminder: getInitialProps in the future required in more than 1 place, it is slightly difficult in Nextjs

### Moving GetInitialProps
* Use AppCompenent instead of App

### Issues with Custom App GetInitialProps
* D 10-ctx: Arguments to Page vs Custom App
* Console log appContext keys to check all the properties there
```js
// Output of appContext
console.log(Object.keys(appContext));
[ 'AppTree', 'Component', 'router', 'ctx' ]
```
* After fetching data in _app, console log it
* Another thing to try is add console log in Landing Page's getInitialProps
* We do not see a console log of LandingPage
* When we tie getInitialProps to App Component, getInitialProps in pages do not get automatically invoked anymore

### Handling Multiple GetInitialProps
* console log appContext in getInitialProps
* You see a property called Component
```js
Component: [Function: LandingPage] {
[client-depl-7c5595c875-kqkdq client]     getInitialProps: [AsyncFunction (anonymous)]
[client-depl-7c5595c875-kqkdq client]   }
```
* getInitialProps of other pages is invoked from _app based on condition

### Passing Props Through
* pageProps obtained from getInitialProps needs to be passed down to the page Component which we want to display
* return the pageProps and the currentUser
```js
currentUser: data.currentUser
// 
...data
```

### Building the Header
* Create components directory in client
* Create header.js in that
* D 9-r:
* Use Link tag in place of anchor tag in Nextjs

### Conditionally Showing Links
* Use currentUser as filtering criteria and filter and map

### Signing Out
* We need to make sure that the request to signout always comes from the Browser and not from the server
  * So we need to make the request from a Component and not from getInitialProps
* useEffect to call doRequest, as soon as the component is rendered
  * Empty array for only one time

### Shared Logic: Between Services
* Diagram Link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F05%2F09.drawio
* D 1-auth: What about event-related stuff for auth service?
* D 2-service: Next service
  * Tickets service
* D 3-auth, 4-auth:
* D 5-err:
* D 6-shared:

### Options for Code Sharing
* D 7-shared: Option #1-Direct copy paste
  * Down side: Very hard to document those changes
* D 8-gs: Option #2-Git submodule
  * Valid option but little bit of pain associated with git submodule commands
* D 9-npm: Option #3-NPM package
  * Little bit of pain

### NPM Organizations
* D 9-npm:
* D 10-reg: Publishing a package with npm Options
  * We will do Public Organization as Private we need to pay
* Go to npmjs.com and Sign Up
* Click on Add Organization
* https://www.npmjs.com/settings/rztickets/members

### Publishing NPM Modules
```sh
mkdir common
cd common
npm init -y
```
* name in the package.json should be @Organization/package-name
```sh
# Inside common
git init
git add .
git commit -m "initial commit"
npm publish --access public
# --access public is necessary, else it will think it is private inside our organization
# Error, because we are not logged in
npm login
```

### Project Setup
* D 10-npm: 
```sh
npm install typescript -g
cd common
tsc --init
npm install typescript del-cli --save-dev
mkdir src
code src/index.ts
```
* We want to convert ts to js file
* To do this, in package.json build in scripts section
* Then in tsconfig.json, make the required changes
  * Uncomment declaration to have a type definition file
  * Uncomment outDir to have the converted code in ./build
```sh
npm run build
```
* After build we get index.js as well as type definition file
* Any time we make a change, we need to delete the build directory and build it again
* So we add clean in scripts of package.json
* Run npm run build to check

### An Easy Publish Command
* The **main** key in package.json indicates what file we import when we import the overall package
* We need to make sure that we import the index.js inside the build dir
* Also **types** key for the types file 
* And **files** key for what files to be included in the published versoin of our package
* Make some change in the index.ts(like exporting color)
```sh
git add .
git commit -m "additional config"
# The below command to automatically update the version in the package.json file
npm version patch
npm run build
npm publish
```
* Read **Semantic Versioning** for how to version your packages
* To make our lives easier, instead of running what is in that sh snippet every time, we'll write a little script for that in package.json under pub key
* Make another change in index.ts and test npm run pub

### Relocating Shared Code
* errors and middlewares of auth are the reusable folders required
* Drap them to src of common from auth
* For example, if auth wanted to use BadRequestError
```js
import { BadRequestError } from '@rzticketing/common/errors/bad-request-error'

// But we would want it like the below
import { BadRequestError } from '@rzticketing/common'
```
* Option #1 would work without changing anything
  * But the downside is they need to know the directory structure of the class or function to be used
* But for Option #2, we need to set this up in index.ts
```js
export * from './errors/bad-request-error';
// Import everything and immediately re-export it
```
* We will get errors if we try to build
* Anyway, try buildigin it with tsc in common
* This is because we don't have the modules installed in auth package.json
* So we need to install via npm
```sh
npm i express express-validator cookie-session jsonwebtoken @types/express @types/cookie-session @types/jsonwebtoken
```
* tsc again
* npm run pub

### Updating Import Statements
* Correct Import statements in auth
```sh
cd auth
npm i @rztickets/common
```
* Start skaffold back up to see if it's working

### Updating the Common Module
* Make the changes in index.ts of common or any other folder
* npm run pub in common
* Inside auth, npm update @rztickets/common
* How to check if the container is running the correct version
```sh
kubectl get pods
kubectl exec -it auth-depl-789b7f647b-2ttbk sh
cd node_modules/@rztickets/common
cat package.json
```

### Ticketing Service Overview
* Diagram Link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F05%2F10.drawio
* D 1-tik, 2-tik, 3-steps, 4-steps:

### Project Setup
* Create tickets folder
* Copy files from auth
* npm install in tickets
```sh
cd tickets
npm install
docker build -t nuthanc/tickets .
docker push nuthanc/tickets 
```

### Running the Ticket Service
* Create tickets-depl.yaml in infra k8s
* Update skaffold.yaml for file syncing
* Copy and change auth-mongo-depl to tickets-mongo=depl
* Skaffold dev and check whether everything is fine

### Mongo Connection URI
* We are connected to wrong instance of mongo in tickets index.ts
* To prevent such errors in the future, it's better to have a environment variable in depl file
* Weirdness around Environment variable issue when env is commented in the tickets-depl.yaml

### Quick Auth Update
* Update MONGO_URI in auth-depl and index.ts of auth

### Test-First Approach
* The approach goes like this:
  * Write tests first
  * Make it fail
  * Implement in code
  * Make it pass
* D 1-tik: 
* Reading this article: https://zellwk.com/blog/endpoint-testing/
* Create new.test.ts
```sh
cd tickets
npm run test
```

### Creating the Router
* Create new.ts containing the post route to tickets
```sh
cd tickets
npm run test
```

### Adding Auth Protection
* Done by importing requireAuth in new.ts

### Faking Authentication During Tests
* All tests should be self-contained(Shouldn't make requests to other services)
* skaffold dev and Sign Up while having Network tab open
* We see 2 requests to currentuser(that is a bug)
* Check out the Header to see the cookie
* Copy everything after express:sess=
```txt
eyJqd3QiOiJleUpoYkdjaU9pSklVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcFpDSTZJalZtWWpjMU1XUmtOelUyTmpsbE1EQXlNMlJoTUdSbU5TSXNJbVZ0WVdsc0lqb2lkR1Z6ZEVCMFpYTjBMbU52YlNJc0ltbGhkQ0k2TVRZd05UZzBPVFUyTlgwLjlCeGZIWGI4aDNEbWVoQXhOakFxdGJEaUpIdkpnZU0yNVZVcVgxS2ZGNXMifQ==
```
* Go to base64decode.org
```txt
{"jwt":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmYjc1MWRkNzU2NjllMDAyM2RhMGRmNSIsImVtYWlsIjoidGVzdEB0ZXN0LmNvbSIsImlhdCI6MTYwNTg0OTU2NX0.9BxfHXb8h3DmehAxNjAqtbDiJHvJgeM25VUqX1KfF5s"}
```
* Code in setup.ts of tickets

### Building a Session
* ! for typescript to not to sweat
* After making the changes in setup.ts, run tests after entering tickets folder

### Testing Request Validation
* Code in new.test.ts
* In first test, provide invalid value and later don't provide value at all

### Validating Title and Price
* Import body from express-validator to validate incoming request body

### Reminder on Mongoose with TypeScript
* Diagram link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F05%2F10.drawio
* D 6-t: TypeScripts Attribute, Doc and Model
* TicketDoc in models is for adding any additional properties in the future

### Defining the Ticket Model
* Create ticket.ts for the model

### Creation via Route Handler
* Import Ticket model in new.test.ts
* After getting all the tickets using find, we expect it to be 0, because before each test, cleanup is done
* Save data in new.ts when request comes to /api/tickets
* We get a red wiggly line in currentUser.id
  * But we are throwing an error if currentUser is not defined in requireAuth middleware
  * So, add an exclamation

### Testing Show Routes
* D 1-tik:
* Create show.test.ts
* For returns the ticket if the ticket is found test, 2 methods
  * Access ticket model directly using Ticket.build and save
  * Make request to build the ticket on the fly
* Option #2 is liked by the author because it simultaes us using the API directly

### Unexpected Failure
* Create show.ts
* Whenever we leave off the statusCode, the default is 200

### What's that Error?
* error-handler.ts is handling all our Errors
* There you see status of 400 if it is not an instance of CustomError
* So, in show.test.ts, console.log the response to check
  * Remember to remove the expect, else you won't see the console log
```js
{ errors: [ { message: 'Something went wrong' } ] }
```
* If we add a console log in common module's error-handler.ts, we have to rebuild the common module again, set a new version, publish to npm and install the updated version of the common module in the tickets service
* So hack for this is to go to tickets node_modules @rztickets/common/build/middlewares/error-handler.js
  * After checking the console log, don't forget to remove that
```js
CastError: Cast to ObjectId failed for value "asdflkjafds" at path "_id" for model "Ticket"

Argument passed in must be a single String of 12 bytes or a string of 24 hex characters
```

### Better Error Logging
* In common->src->middlewares->error-handler.ts, add console.error(err)
```sh
cd common
npm run pub
cd tickets
npm update @rztickets/common
```
* Now run npm run test to check the error message
* To generate a valid id, get it from mongoose

### Complete Index Route Implementation
* Diagram link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F05%2F10.drawio
* D 1-tik: /api/tickets to Retrieve all tickets
* Create index.ts

### Ticket Updating
* Create update.test.ts

### Handling Updates
* Create update.ts

### Permission Checking
* For different user, need to update setup.ts of tickets
  * Use new mongoose.Types.ObjectId().toHexString()

### Final Update Changes
* The updated version is already in ticket after save

### Manual Testing
* Update ingress-srv
  * Very important to put tickets route before client because that is a catch all
* Use Postman or req.http in VS code and do some tests
```sh
minikube start
eval $(minikube docker-env)
skaffold dev
```
```json
POST to https://ticketing.dev/api/users/signup
{
  "email": "test@test.com",
  "password": "password"
}

POST to https://ticketing.dev/api/users/signin
{
  "email": "test@test.com",
  "password": "password"
}

To check we are authenticated
GET to https://ticketing.dev/api/users/currentuser

POST https://ticketing.dev/api/tickets
content-type: application/json

{
  "title": "concert",
  "price": 10
}

GET https://ticketing.dev/api/tickets/5fd8442eaa73f90019dc8832

GET https://ticketing.dev/api/tickets/

PUT https://ticketing.dev/api/tickets/5fd8442eaa73f90019dc8832
content-type: application/json

{
  "title": "new_title",
  "price": 500
}
```

### What Now?
* Diagram link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F05%2F11.drawio
* D 15-path: What next to do
* Diagram link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F05%2F01.drawio
* D 11-design: NATS Streaming server

### Three Important Items
* Diagram link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F05%2F11.drawio
* D 3-env:
  * Docs at docs.nats.io
  * NATS Streaming Server is built on top of NATS
  * Take a look at NATS STREAMING CONCEPTS
* Take a look at NATS Docker image in hub.docker.com
  * Search for nats
  * Go to nats-streaming
  * Check the Commandline Options

### Creating a NATS Streaming Deployment
* Create nats-depl.yaml in infra k8s
* Command line options given in args array of Deployment yaml file
* Check Commandline Options in https://hub.docker.com/_/nats-streaming?tab=description&page=1&ordering=last_updated
* See nats pod in kubectl get pods

### Big Notes On NATS Streaming
* Diagram link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F05%2F11.drawio
* D 6-http:
* Our Custom Event bus:
  * Our Tickets service sends an update Ticket Updated Event via Axios requests to Custom Event Bus
  * Custom Event Bus sends via Axios requests to Orders Service
  * Orders Service listens for incoming events
* D 7-http:
  * We don't use Express or Axios to share events
  * Navigate to npmjs.com
  * https://www.npmjs.com/package/node-nats-streaming
* D 4-chan:
* D 5-chan:
  * Channels and subscription
* D 5-store:
  * Storage in memory in Event Bus so that services which were down can get the events or for a new service added along the way
* D 6-file, 7-db:

### Building a NATS Test Project
* D 11-goal:
```sh
mkdir nats-test
cd nats-test
npm init -y
npm i node-nats-streaming ts-node-dev typescript @types/node
tsc --init
```
* Create listener.ts and publisher.ts
* In publisher.ts, we create a client called stan to connect to nats streaming server

### Port-Forwarding with Kubectl
* If we run npm run publish, we get the below error
```sh
NatsError: Could not connect to server: Error: connect ECONNREFUSED 127.0.0.1:4222
```
* This is because nats-streaming server is running within a pod
* To access, we have couple different options
* D 17-proxy: Option #1 to Connect
* D 18-two: Option #2 to Connect
* D 19-thr: Option #3 to Connect
  * Easiest among the three
  * No need for config file
```sh
kubectl get pods
NAME                                  READY   STATUS    RESTARTS   AGE
auth-depl-5c9b45f788-wzdfj            1/1     Running   0          3m41s
auth-mongo-depl-74846d7f98-wdtfw      1/1     Running   0          3m40s
client-depl-767c5875c-9xw9w           1/1     Running   0          3m40s
nats-depl-78687484bd-gkcjz            1/1     Running   0          3m40s
tickets-depl-66c46c75bd-m9cq2         1/1     Running   0          3m40s
tickets-mongo-depl-6678475dc4-dvwm8   1/1     Running   0          3m40s
```
```sh
kubectl port-forward nats-depl-78687484bd-gkcjz 4222:4222
```
* And in another terminal window
```sh
cd nats-test
npm run publish
```

### Publishing Events
* Diagram link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F05%2F11.drawio
* D 20-listen: 
  * **Subject** is the name of the channel that we want to publish information to
  * **Channel** is something that we listen to
  * **Subscription** is listening to the channel and receiving data
* We can share only Strings over NATS
* So we need to convert our object to json

### Listening For Data
* Implement listener.ts
```sh
cd nats-test
npm run listen
```
* console.clear() to remove unwanted logs
* Type rs in the console to restart publish and listen

### Accessing Event Data
* NatsError: Could not connect to server: Error: connect ECONNREFUSED 127.0.0.1:4222
  * Don't forget to port-forward
* Type Annotate msg 
* Now you can inspect the properties by option clicking Message
  * getSequence
  * getData
```txt
Received event #7, with data: {"id":"123","title":"concert","price":20}
```

### Client ID generation
* D 21:
* D 22-scale:
* Run second listener by running npm run listen
* But we get an Error message
```sh
[ERROR] 11:44:26 Error: Unhandled error. ('stan: clientID already registered')
```
* D 23-lclient:
```ts
const stan = nats.connect('ticketing', '123', {
  url: 'http://localhost:4222'
});
```
* In nats.connect, the 2nd argument is the client id
* Error message due to same client id
* Now if we run npm run listen in 2 terminals, there is no error

### Queue Groups
* Diagram link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F05%2F11.drawio
* If there are 2 copies of a service, then assume posting a comment
  * It will be added to db 2 times because of the 2 copies
* D 23-q:
* If we want to send it to one of the copies, it can be done via Queue Groups
  * A Queue Group is associated with a Channel
  * Send it to only one of the members of the Queue Group
* This can be done easily in subsribe's 2nd parameter
  * Now we see the event only in one of the 2 listeners

### Manual Ack Mode
* Other options to subscribe in listener.ts
* It is the 3rd argument to subscribe
* D 25:
  * Default behavior of **event being lost** when there is some error
  * To change this, we provide setManualAckMode(true)
    * This changes the behavior of node-nats-streaming library
    * node-nats-streaming library doesn't automatically acknowledge the event to the nats-streaming library
    * If no ack is received by the nats-streaming library after a certain amount of time(30s), it is going to send the event to the same service or another member of the Queue group
    * So until ack is received nats-streaming library will keep sending the events
  * To ack, we have to add msg.ack()

### Client Health Checks
* In nats-depl, we exposed 2 ports, 4222 and 8222, one for client and the other for monitoring
* Just like previous 4222 port-forwarding, we need to do that to 8222 as well
```sh
kubectl port-forward nats-depl-86567c57df-89mtg 8222:8222
```
* Then in browser, navigate to localhost:8222/streaming
  * Click on channels
  * Then enter http://localhost:8222/streaming/channelsz?subs=1
  * Now restart one of the listeners and refresh the page
  * Now, we see 3 subscriptions in that page
  * After waiting a certain amount of time, the 
  nats streaming servers removes the old subscription
  * The NATS streaming server is holding on to the event thinking that the old listener will come back
  * That's why it appears that we are losing some messages
  * This is not desirable
* hb stands for heartbeat in the nats-depl file
  * heartbeat is a kind of a request that nats streaming server sends to clients every so many seconds
  * This is a Health check
  * hbi is how often nats streaming server is going to make a heartbeat request to each of its clients
  * hbt is how long each client has to respond
  * hbf is number of times the client can fail before nats streaming server is going to assume that the client is dead

### Graceful Client Shutdown
* Add close event listener in listener.ts
* Look for interrupt and terminate signals(Ctrl C or restart)
* stan.close is for reaching out to Node Nats streaming server and telling it to not send any more messages

### Core Concurrency Issues(Very Important)
* Concurrency
  * Events getting handled out of order
* Diagram link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F05%2F11.drawio
* D 26: Banking application
* Also we have a condition that amount should not be less than 0
* Publisher has events
  * account: deposit $70
  * account: deposit $70
  * account: withdraw $100
* IN ideal case scenario,
  * Publisher publishes events one by one
  * Since both the Account Srv are members of QueueGroup, only 1 of them receives the Event and update the Total amount of money for a customer in Hard drive file
* D 27: Listener can fail to process the event
* What can go wrong?
  * The file might be already locked(Some other program might have this file open)
  * Faulty logic like a weekly deposit limit, so in that scenario we might reject that event
  * So, when it fails to be processed, with our current setup, we don't acknowledge the event
  * So nats-streaming-server waits for 30s and sends it off to another listener
  * But while we are waiting for those 30s, another event gets published and it gets processed in the listener(Consider deposit 40 successful) and a couple of seconds later even withdraw event of 100 get published. But now if we try to withdraw 100$ out of 40$, we get a business error
  * So if any event fails to be processed, we will end up in a catastrophic situation
* D 28: One listener might run more quickly than the other
  * If one service has a backlog of events, because this container might be overloaded or who knows what
  * As we are waiting for the events to be processed(deposit of 100 and 40 in one listener), account: withdraw event might be published and might get sent to the other listener which is very fast
  * Again we end up in the negatives
* D 29: NATS might think a client is still alive when it is dead
  * NATS waits 30s for the ack, but the service is dead
  * So, within that timespan withdraw event might be sent, and we end up with Business error
* D 30: We might receive the same event twice
  * 1st deposit of 70 on tuesday
  * 2nd deposit of 40 on wednesday
  * withdrawal of 100 on thursday
  * But consider the hard drive is very laggy
  * Consider it takes 29.99 seconds to open the file
  * NATS takes the same event and sends it to other service
  * But by this time, processing is done(110-100=10) and is written to the file
  * But since the same event is processed by another listener, we end up with Business error

### Common Questions
* Diagram link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F05%2F12.drawio
* D 1-sync: Concurrency occurs in Synchronous communication as well as in Monolith architecture
* D 2-sync:
  * Monolith instance A and B are busy, while C processes quickly due to low traffic
  * Once again, we end up with Business error
  * But in microservices based architecture, the concurrency issue is more prominent because of latency of NATS-streaming server, retries etc
* D 3-solution: This won't work
  * One copy of Accounts Srv instead of 2
  * Same issue as before when 70$ event fails to get processed
  * But now we have processing **bottleneck**
* D 4-solution: This won't work either

### More Possible Concurrency Solutions
* D 6-state: Share state between services of last event processed
  * Account Srv B processes event no. 2 only if event 1's sequence is recorded in the Shared Processed Sequence
  * But this has a significant impact on the performance
  * Consider if there are 2 Users A and B and 1st event if for A and the 2nd event is for B
  * Now if the processing of event A is delayed due to some issue, B still needs to wait, even though it is unrelated to A
* D 7-state: Taking the learnings from the previous process
  * We consider sequence numbers w.r.t users(Added by NATS Streaming server, not known by Publisher)
  * In this way, one User doesn't affect another user
  * But with NATS-streaming server, we need to come up with a separate channel for each resource(in this case, Users)
    * Also a lot of processing overhead
* D 8-state: 
  * Store the list of events at the publisher
    * Publisher has some kind of db
  * NATS Streaming server sends(Hopefully) a sequence number to the Publisher for the event just dispatched by the Publisher
  * Then the event will go on to our services and be processed
  * The Last ID processed is updated by the Account service in the db
  * The next time Publisher sends an event for a particular user, it will attach the Last Seq. No
  * When the Account service is processing, it will look at the db, whether the Last ID processed and Last Sequence No in the event are equal. If it's that, then it will process and update the db
  * But the problem is we can't reach out to NATS Streaming Server and get the Sequence number of the event

### Solving Concurrency Issues
* Diagram link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F05%2F12.drawio
* D 12-conc: Redesign
* D 14-query: Earlier Blog App design
* D 15-simp: Simplified the above
* D 9-refra: Generic terms from the above
* D 11-ref: 
* D 10-terms: Terms for D 11-ref
* D 10-ref:
* D 11-emit: 
* D 12-conc:
  * If number: 1 transaction gets delayed for some reason and if number: 2 is getting processed, then we check whether number - 1 is there as Last Txn number in the db
  * Here 2-1 is 1, which is not there in db
  * So, we will not process that event until 1 is processed

### Concurrency Control with the Tickets App
* D 13-req:
* D 9-refr:
* Orders Service will be having some logic to process the event only if the version in the Event is 1 less than that in the db

### Event Delivery
* Stop one of the listeners
* D 20-re:
  * Events saved in NATS Streaming when it is emitted by Publisher
* We can get events delivered in the past
  * But this is somewhat different in queue-groups, so we will disable that for now
* Another option to the list of options to redeliver
* Command click on SubscriptionOptions to see the interface 
* Use setDeliverAllAvailable
  * But this is not super feasible as if there are millions of events and every time a new listener is added
  * We get all the events from the start

### Durable Subscriptions
* D 21:
  * Identifier to a subscription
  * setDurableName()
* So with Durable Subscription, we have events processed against the Durable Subscription in NATS
* setDeliverAllAvailable is a necessity as it gonna be called for the very first time only when used with Durable Subscription
* So, when we restart the Listener or bring another Subscription online, then setDeliverAllAvailable will be ignored on restart
* But when we test this on our listener, we get all the events redelivered
  * So there is a little bit of gotcha
  * When we restart we are closing conection to NATS and reconnecting, NATS thinks that the client disconnected and won't be connecting in the future
  * So it will clear the Durable sub history
  * To solve this, we need to add queue-group
* So, setDeliverAllAvailable, setDurableName and queue-group are very tightly coupled options
* Now start the 2nd listener
  * It shouldn't see the events

### Reusable NATS listeners
* Diagram link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F05%2F13.drawio
* D 1-setup: Use publisher.ts and listener.ts as boilerplates
* D 2-listener: Listener class as Abstract 
  * abstract class are not meant to be used directly
* D 3-listener: Subclass

### The Listener Abstract Class
* D 2-Listener:
* In listener class,
  * protected property: access also from the subclass

### Extending the Listener
* D 2-Listener:
* Create TicketCreatedListener class
* Check Notes in Udemy henceforth

### Quick Refactor
* D 4-list:
* Create events folder and in there base-listener.ts and ticket-created-listener.ts

### Leveraging Typescript for Listener Validation
* Diagram link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F05%2F01.drawio
* D 3-solutions:
* D 5-sub:
* D 6-share:
* D 7-mis:
* What we want to achieve is to somehow get the properties of data in listener.ts
* Also, it would be good if the data is tied to the subject(i.e, if ticket:created is the subject, then data should have so and so properties of type so and so)
* In order to achieve this in TypeScript, we need to write some complicate code

### Subjects Enum
* Create a separate file to export an enum of Subjects
* An enum is used to define named constants
* This way we don't have to hard-code in listeners

### Custom Event Interface
* Diagram link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F05%2F13.drawio
* D 6-share:
* Create ticket-created-event.ts which contains the interface containing the coupling details of the subject and the data
* Just like this, we create separate interfaces for other events

### Enforcing Listener Subjects
* Make Listener a Generic Type class to tie subject and data 

### Quick Note
* Tyepescript does have a keyword of readonly
* It prevents a property of a class from being changed

### Enforcing Data Types
* Enforcing using the TicketCreatedEvent['data']

### Where Does this Get Used?
* D 10-common: Subjects, Base Listener and interface describing the data for the subject in common module

### Custom Publisher
* Goal is TypeScript to check our code
* Create base-publisher.ts and ticket-created-publisher.ts

### Using the Custom Publisher
* Using it in publisher.ts

### Awaiting Event Publication
* publish is an async operation
* To do this, we need to return a Promise from base-publisher.ts

### Common Events Definitions Summary
* D 14-test:
* D 11-common:
* D 12-ts: Downside all servers are written with Typescript
* D 13-ts: Alternatives to TS

### Updating the Common Module
* Create events in common folder
* Add userId to ticket created and updated events as there is userId in tickets model file
* Don't forget to export in index.ts so that it can be easily imported in other files
```sh
cd common
npm i node-nats-streaming
npm run pub

cd tickets
npm update @rztickets/common
```

### Restarting NATS
* Flush out non-valid events
```sh
kubectl delete pod nats-depl-58c5f75f5c-pngb2
```

### Publishing Ticket Creation
* Create events folder

### More on Publishing
* Right after ticket save call, publish the event
* Pulling title and price from title should be done because it might be different values due to pre and post save hook operations done while saving to db
* Do we need to await before sending the status?

### NATS Client Singleton
* Diagram link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F05%2F14.drawio
* D 1-client: NATS client in index.ts?
* Little bit of issue
* Connection for nats is very different from mongoose
* For mongoose, 
  * When we connect with mongoose, it internally keeps a record of all the connections that exist
  * We can now open any file inside our project and import mongoose
  * mongoose then provides tada, here is an instance of mongoose already connected to some server
  * i.e, no need to assign mongoose.connect to anything
* Take a look at publisher.ts of nats-test
  * There is no internal connection(internal tracking)
  * nats immediately returns a client
* D 1-client: createTicketRouter(Route Handler) is being imported in app.ts which in turn is getting imported in index.ts 
  * Cyclical dependency, we can do this but we need to avoid this
* D 2-client: We will make it like mongoose

### Remember Mongoose?
* Take a look at mongoose.connect in index.ts
* D 4-mongoose: Behind the scenes, mongoose
  * same object shared between index.ts and route handler
* D 3-single: Export the instance instead of the entire Class
  * Then we will be able to use the same instance
* Create nats-wrapper.ts

### Singleton Implementation
* _client not within constructor because it is too early to create a NATS client and assign to it
  * Till we call connect, we don't want to assign anything to it, so ?
* clusterId, clientId and url. Check nats-test for this
* While importing in index.ts natsWrapper is in lowercase because that is an instance
* clusterId is coming from nats-depl file args, cid which is clusterId
* Check whether you get "Connected to NATS in the terminal"

### Accessing the NATS Client
* getter method for client so that it is not accessed when it is not defined
* client is not called as natsWrapper.client() as it is a getter, it is defined as a property on the instance

### Graceful Shutdown
* Rather than having close code in nats-wrapper.ts(Some hidden away class), we will do it in a central location like index.ts
* How to test this
* Restart skaffold
* Simulate nats going down(Delete nats pod)
* We see tickets pod restarting as the primary process of the container was exited
  * process.exit() code in index.ts of tickets

### Successful Listen!
```sh
kubectl get pods
kubectl port-forward nats-depl-59f4775d75-49fzf 4222:4222
cd nats-test
npm run listen
```
* Create a ticket in Postman or in my case req.http file
* First we need to make sure we are signed in by GET to https://ticketing.dev/api/users/currentuser
  * If you are not signed in then make to POST request to https://ticketing.dev/api/users/signin with the email and password in body(valid credentials) or signup
* Create ticket by POST request to https://ticketing.dev/api/tickets with title and price
```sh
Listener connected to NATS
Message received: ticket:created / payments-service
Event data! {
  id: '600124976f8a3c0018f67d6e',
  title: 'NEW CONCERT',
  price: 500,
  userId: '5fd843a29fc5e30023bd790b'
}
```
* Yay, we are able to publish and listen successfully

### Ticket Update Publishing
* Similar to TicketCreatedPublisher
* Now to test this, use req.http PUT request with the last video's ticet id
* Made a mistake, no await on TicketUpdatedPublisher
```sh
{
  "title": "NEW CONCERT",
  "price": 10,
  "userId": "5fd843a29fc5e30023bd790b",
  "__v": 0,
  "id": "600124976f8a3c0018f67d6e"
}
```
* Update was successful
* Need to see the below in skaffold output
```sh
Event published to subject ticket:updated
```

### Failed Event Publishing
* Diagram link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F05%2F14.drawio
* D 11-async: Behind the scenes in Ticket Create Handler
* D 12-err: Error in the above scenario
* D 13-update: Behind the scenes in Ticket Update Handler
* User doesn't need to know about the Events
* Adding await to Publisher adds a tiny bit of latency
* D 4-note: What would happen if emitting event fails(Impact on the App)
* D 5-nats: Continued from above
  * Users account balance never gets updated
* Question about Data Integrity
  * Failed event causes Data Integrity issue(Accounts not updated due to the event failing)

### Handling Publish Failures
* D 5-nats:
* D 6-tx: Straight approach to the above problem
  * Save the event to our db
* D 7-proc: Separate process outside our Route handler
  * Any issue with db, we don't save that transaction and the event and there is no data integrity issue
  * If NATS is down or connection to nats is down due to some crazy reason, we can still save the transaction to the db, save the event and then later when NATS comes up, the separate process will pull the event and publish it to NATS
  * Another scenario, D 7-fail: Fail to save the event
    * Due to db constraint or something like that
  * If failing of either transaction or event fails, then we have to undo(like rollback the transaction or vice-versa)
* D 8-tx:
  * Database feature called Transaction.
  * If any of the changes fail, do not make any of the changes
  * So we wrap up both transaction and event in a DB Transaction
* Not goint to implement in this Application

### Fixing a Few Tests
```sh
cd tickets
npm run test
```
* D 14-tests: Normal env while running our app
* D 15-client: Test env
* D 16-mock: Jest redirect to Fake initialized NATS Client

### Redirecting Imports
* D 17-mock: Mocking(Faking) Imports with Jest
  * Create __mocks__ and in there nats-wrapper.ts
  * jest.mock of the file which we want to fake
* Close npm run test and run it again
  * We made the change only in new.test.ts
  * So to only run that file, type p and then put in new
  * Now we get a different error message, which indicates that our fake file is being used

### Providing a Mock Implementation
* D 17-mock: Mocking(Faking) Imports with Jest
* D 18-mocks: 
  * New Ticket Route Handler doesn't care about _client and connect function
* Take a look at how TicketCreatedPublisher uses nats client and implement same functionality in mocks file
  * TicketCreatedPublisher doesn't do anything
  * So need to take a look at base-publisher.ts in common/src/events
  * Real client calls the callback function to indicate publish is complete
* D 19-mocks: 
* D 20-pub: 
  * We want to make sure our callback function gets executed right away so that our Promise will get resolved
* Now we see that all of our new test is passing

### Test-Suite Wide Mocks
* Copy jest.mock to all the other test files which need nats client
* Instead of doing the above, we can use only in setup.ts
* All of my tests pass

### Ensuring Mock Invocations
* Provide a mock function which allows to have expectations around it
* Here in new.test.ts, even though we import the real nats-wrapper, jest will use the mock
* Also clearAllMocks since we are using the same mock function in other tests too

### NATS Env Variables
* Add env in ticket depl
* After all these changes, check whether ticket srv is getting connected to NATS in skaffold logs

### The Orders Service
* Diagram link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F05%2F01.drawio
* D 5-browser:
  * Keeping track of who is gonna purchase the ticket and lock the ticket
* Diagram link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F06%2F01.drawio
* D 1-order: Order creation/editing
* D 3-replicate:
* D 4-concurrency:

### Scaffolding the Orders Service
* D 5-orders: Steps
```sh
cd orders
npm install
eval $(minikube docker-env)
docker build -t nuthanc/orders .
docker push nuthanc/orders 
```

### A Touch More Setup
* Create orders-depl.yaml and orders-mongo-depl.yaml
* Update skaffold.yaml
* Restart skaffold

### Ingress Routing Rules
* Change in ingress-srv.yaml right before client

### Scaffolding a Few Route Handlers
* D 4-routes:
* Update every route handler
* In the end, need to see Connected to NATS, MongoDb and listening on port 3000 in orders

### Subtle Service Coupling
* custom check for mongo id is subtle service coupling

### Associating Orders and Tickets
* Diagram link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F06%2F01.drawio
* D 6-assoc:
* D 7-assoc: Option #1-Embedding
  * D 8-query: Downside(Querying all the orders to check it has the same ticketId)
  * D 9-fix: Ticket service emits events, which will be received by the orders service
    * But the ticket doesn't get immediately assigned to an order
* D 10-ref: Option #2-Mongoose Ref/Population feature

### Order Model Setup
* 3 interface so that TypeScript validates
* 1 interface for the document, the other one for what the saved document should have and the final one for the build

### The Need for an Enum
* D 11-enum, 12-paym, 13-status:
* D 14-status: We can come up with any status
* D 15-status: To avoid that, use common enum across libraries

### Creating an Order Status Enum
* D 15-status:
```sh
cd common
npm run pub

cd orders
npm update @rztickets/common
```

### More on Mongoose Refs
* D 10-ref:
* Scenarios in Udemy Notes 334

### Defining the Ticket Model
* Create ticket.ts in models
* You might be thinking of putting ticket's model to common shared library
* This definitely must not be done
  * Because we are only getting a subset of properties of ticket that the order needs

### Order Creation Logic
* Steps as comments

### Finding Reserved Tickets
* Reserved if it is associated with an Order and Order status should not be not cancelled
* findOne where the ticket is what we just found

### Convenience Document Methods
* We will be adding this in ticket model
* statics for Ticket Model
* methods for Ticket Document
* methods needs to be **a keyword function**
  * cannot use arrow function
    * mess around value of 'this' inside the function

### Order Expiration Times
* new Date and setSeconds by getSeconds + Exp
* Then save the order to the db

### Test Suite Setup
```sh
cd orders
npm run test
```

### Asserting Tickets Exist
* Not focusing on auth and request body in orders service 
  * Refer to tickets if you want to have them
* Just to check move BadRequestError above NotFoundError and check the test result

### Asserting Reserved Tickets
* Implement returns an error if the ticket is already reserved

### Testing the Success Case
* Writing tests is mandatory in case of Orders cause we can't send requests through Postman
* This is because it is dependant upon ticket creation

### Fetching a User's Orders
* Diagram link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F06%2F01.drawio
* D 4-routes:

### A Slightly Complicated Test
* Extracting id from Orders user model's cookie is difficult
  * So we make request through express app
* Destructuring and renaming
  * const { body: orderOne }

### Fetching Individual Orders
* Code in show.ts

### Does Fetching Work?
* show.test.ts

### Cancelling an Order
* It's not actually Delete request but put or patch

### Can we Cancel?
* delete.test.ts

### Orders Service Events
* Note on Udemy

### Creating the Events
* Update in subjects.ts
* Create order-created-event.ts and order-cancelled-event.ts
* The data in OrderCreatedEvent needs to be whatever **other services require from it(not all by default)**
  * status is the only property that other services don't require
  * But we will include it anyway since we don't know whether a new service in the future might require it
* expiresAt will be gonna be a string instead of Date because we want to convert it to JSON
* Sharing the minimum amount of information when an Event happens
  * But this is not future-proof
  * In the future, add the property and republish the library
* Export the above files in index.ts
```sh
cd common
npm run pub

cd order
npm update @rztickets/common
```

### Implementing the Publishers
* Create events directory and publishers within it

### Publishing the Order Creation
* If we don't take care of expiresAt date conversion, default behavior is to convert to location specific time and not UTC
  * So we will do it ourselves

### Publishing Order Cancellation
* Publish in delete.ts

### Testing Event Publishing
* todos in new.test.ts and delete.test.ts

### Time for Listeners!
* Diagram link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F07%2F02.drawio
* D 8-repl:
* D ticket:created:
* D ticket:updated:

### Reminder on Listeners
* Check base-listener.ts in common

### Blueprint for Listeners
* ticket-created-listener implementation in orders

### A Few More Reminders
* Diagram link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F08%2F03.drawio
* D 1-listener:
  * One of the members of the Queue Group

### Simple onMessage Implementation
* Diagram link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F07%2F02.drawio
* D ticket:created:
  * Pull off some information of the ticket
* Ack the message when everything is good to go

### ID Adjustment
* Diagram link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F08%2F03.drawio
* D 3-id:
  * Mongodb random id
  * Adjust the ticket model's build(But this is not gonna solve the issue)
  * Diagram link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F08%2F01.drawio
  * D 4-id:

### Ticket Updated Listener Implementation
* Add ticket-updated-listener.ts

### Initializing the Listeners
* In orders index.ts

### A Quick Manual Test
* Fixed order model issue by pinning mongoose to 5.10.19 in orders package.json
* Use req.http
* Ensure you are signed in by making request to /api/users/currentuser
```json
{
  "currentUser": {
    "id": "5fd843a29fc5e30023bd790b",
    "email": "test@test.com",
    "iat": 1608008650
  }
}
```
* make POST request to api/tickets
```json
{
  "title": "movie",
  "price": 999,
  "userId": "5fd843a29fc5e30023bd790b",
  "__v": 0,
  "id": "6002744fd98a24001810753e"
}
```
* More importantly in skaffold log
```sh
[tickets-depl-b759cdf87-t8cxl tickets] Event published to subject ticket:created
[orders-depl-7776bf84cc-9fqtd orders] Message received: ticket:created / orders-service
```
* Next make a PUT request to api/tickets/:ticketId
```json
{
  "title": "movie",
  "price": 10,
  "userId": "5fd843a29fc5e30023bd790b",
  "__v": 0,
  "id": "6002744fd98a24001810753e"
}
```
```sh
[tickets-depl-b759cdf87-t8cxl tickets] Event published to subject ticket:updated
[orders-depl-7776bf84cc-9fqtd orders] Message received: ticket:updated / orders-service
```

### Clear Concurrency Issues
* **Important** check test script and the video in Udemy 365
* Diagram link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F08%2F03.drawio
* D 4-conc: What the script does
  * It is not truely in parallel because of how NodeJS works
* D 5-conc: 
  * 4 copies of Orders as well as Tickets service

### Reminder on Versioning Records
* D 6-conc:

### Optimistic Concurrency Control
* D 7-v: Normal Record Updates of Mongoose and mongoDB
* D 8-v: Record Updates with Optimistic Concurrency Control
  * Strategy with other dbs as well
  * Setting in mongoose
  * Find the record with **ID and version**
  * Inserting records, not really concurrency here but in Updating records

### Mongoose Update-If-Current
* D 6-v:
* Module in npmjs.com: mongoose-update-if-current
* If you see the earlier JSON response, you see __v: 0
* __v renamed as version
```sh
cd tickets
npm i mongoose-update-if-current
```

### Implementing OCC with Mongoose
* In ticket.ts models of tickets service, add
```ts
ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);
```
* Also, add in TicketDoc interface

### Testing OCC
* In ticket.test.ts of ticket model
```sh
cd tickets
npm run test
```
```sh
VersionError: No matching document found for id "600280ac08e1f65731d3faf3" version 0 modifiedPaths "price"

await secondInstance!.save();
```
* This should work, but due to jest typescript issues not working as expected
```ts
expect(async () => {
    await secondInstance!.save();
  }).toThrow();
```

### One More Test
* increments the version number on multiple saves

### Who Updates Version?
* Diagram link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F08%2F03.drawio
* D 8-v:
* D 10-v: Example of blog post app
  * Only Comments Service should update the version, not Moderation Service also
  * Because if Moderation Service updates the version, it is updated only in Comments Service and not in Query Service

### Including Versions in Events
* Add version in events of common module
```sh
cd common
npm run pub

cd orders
npm update @rztickets/common

cd tickets
npm update @rztickets/common
```

### Updating Tickets Event Definitions
* Add version in new.ts and update.ts of tickets
* Restart tests in tickets

### Applying a Version Query
```sh
cd orders
npm i mongoose-update-if-current
```
* Update ticket model file in orders service
* In ticket-updated-listener, adjust the Query
* Use Postman, in my case req.http
* First check if you are authenticated with request to /api/users/currentuser
```json
{
  "currentUser": {
    "id": "5fd843a29fc5e30023bd790b",
    "email": "test@test.com",
    "iat": 1608008650
  }
}
```
* Then POST to /api/tickets
```sh
{
  "title": "Zoro",
  "price": 30,
  "userId": "5fd843a29fc5e30023bd790b",
  "version": 0,
  "id": "60029252cba1360018999688"
}
```
```sh
[tickets-depl-5f67cb9ff7-h72vm tickets] Event published to subject ticket:created
[orders-depl-667d8d9856-x9jk8 orders] Message received: ticket:created / orders-service
```
* Then PUT to /api/tickets/60029252cba1360018999688
```json
{
  "title": "One Piece",
  "price": 30,
  "userId": "5fd843a29fc5e30023bd790b",
  "version": 1,
  "id": "60029252cba1360018999688"
}
```
```sh
[tickets-depl-5f67cb9ff7-h72vm tickets] Event published to subject ticket:updated
[orders-depl-667d8d9856-x9jk8 orders] Message received: ticket:updated / orders-service
```

### Did it Work?
* Check Notes in Udemy video

### Abstracted Query Method
* Moving query from ticket-updated-listener to ticket model of order service
* Then test it out by updating a ticket using PUT request
```json
{
  "title": "One Piece",
  "price": 40,
  "userId": "5fd843a29fc5e30023bd790b",
  "version": 2,
  "id": "60029252cba1360018999688"
}
```
```sh
[tickets-depl-5f67cb9ff7-h72vm tickets] Event published to subject ticket:updated
[orders-depl-667d8d9856-x9jk8 orders] Message received: ticket:updated / orders-service
```

### [Optional] Versioning without Update-If-Current
* Diagram link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F08%2F03.drawio
* Cannot use the same versioning semantics if they are using a different Store
* D 15-outside:
* D 15-update: Behavior to replace
* See Udemy notes

### Testing Listeners
* In listeners __test__

### A Complete Listener Test
* npm run test in orders

### Testing the Ack Call
* acks the message

### Testing the Ticket Updated Listener
* ticket-updated-listener.test.ts

### Success Case Testing
* Update in ticket-updated-listener.test.ts

### Out-Of-Order Events
* D 6-conc:

### The Next Few Videos
* Diagram link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F08%2F04.drawio
* D 1-flow:

### Fixing a Few Tests
* Adding id

### Listeners in the Ticket Service
* Diagram link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F07%2F02.drawio
* ticket:created:
* ticket:updated:
* order:created:
* order:cancelled:

### Building the Listener
* order:created:

### Strategies for Locking a Ticket
* Diagram link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F08%2F04.drawio
* D 5-id:
* D 6-id:
* D 7-tix:

### Reserving a Ticket
* Add orderId to ticket model
* orderId optional by ?

### Setup for Test Reservation
* Tests for listeners

### Test Implementation
```sh
cd tickets
npm run test
```
* Make it fail by commenting onMessage and uncomment again

### Missing Update Event
* D 8-confirm:
* D 9-conf:
* D 10-update:
* D 11-event:
* D 12-event:
  * Orders service has ticket with version 0
  * OrderCreated and OrderCancelled made changes only to tickets service version and not to order service ticket
* We have to emit an event for ticket created with order:created and order:cancelled event listener

### Private vs Protected Properties
* D 13-updated:
* D 14-updated:

### Publishing While Listening
* Changing private client to protected in base-listener and base-publisher
```sh
cd common
npm run pub

cd tickets
npm update @rztickets/common

cd orders
npm update @rztickets/common
```
* Add await to TicketUpdatedPublisher so that it never goes to ack if publish fails

### Mock Function Arguments
* npm run test in tickets

### Order Cancelled Listener
* Diagram link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F07%2F02.drawio
* order:cancelled:

### A Lightning-Quick Test
* Add test

### Don't forget to Listen!
* Listeners in index.ts of tickets

### Rejecting Edits of Reserved Tickets
* Add BadRequestError in update.ts

### The Expiration Service
* Diagram link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F09%2F01.drawio
* D 1-expiration:
* D 2-pub:

### Expiration Options
* D 3-ev:
* D 4-timeout: Timer lost when service restarts
* D 5-delay: Relies on NATS delivery but business logic is mixed with this delay
* D 6-sched: Not supported by NATS
* D 7-delay: Bull JS
* Redis fantastic for jobs(things scheduled for some point in time)

### Initial Setup
* Copy some files from tickets(or orders)
```sh
cd expiration
npm install bull @types/bull
npm install
```

### A Touch of Kubernetes Setup
```sh
cd expiration
docker build -t nuthanc/expiration .
docker push nuthanc/expiration
```
* Create expiration-redis-depl.yaml
* Create expiration-depl.yaml
  * No service required as it won't be contacted by any other service directly
  * It's through nats-streaming-server

### File Sync Setup
* In skaffold.yaml

### Listener Creation
* Diagram link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F09%2F01.drawio
* D 7-delay:

### What's Bull All About?
* D 8-bull: What bull is traditionally is used for
  * Bull -> Job -> Redis -> Worker Server -> Message -> Redis
* D 9-bull:
  * Queue-main abstraction in bull
* D 10-queue: Our case
  * Worker and Web Server is our Expiration Service

### Creating a Queue
* D 10-queue:
  * Job equivalent to Event
* For typescript to give out the properties, we define Payload interface

### Queueing a Job On Event Arrival
* Add orderId to expirationQueue

### Testing Job Processing
* Use Postman or req.http
* Ensure you are signed in
* POST to /api/tickets
```json
{
  "title": "Dil Dhadkane",
  "price": 30,
  "userId": "5fd843a29fc5e30023bd790b",
  "version": 0,
  "id": "600310f88dab780018985931"
}
```
* POST to /api/orders
```json
{
  "status": "created",
  "userId": "5fd843a29fc5e30023bd790b",
  "expiresAt": "2021-01-16T16:31:30.047Z",
  "ticket": {
    "title": "Dil Dhadkane",
    "price": 30,
    "version": 0,
    "id": "600310f88dab780018985931"
  },
  "version": 0,
  "id": "6003115eae86e60018be7b1e"
}
```
```sh
[expiration-depl-675f94cf9-9mwr7 expiration] Message received: order:created / expiration-service
[expiration-depl-675f94cf9-9mwr7 expiration] I want to publish an expiration:complete event for orderId 6003115eae86e60018be7b1e
```

### Delaying Job Processing
* Create new ticket and order
* See in skaffold output

### Defining the Expiration Completion Event
* Create expiration-complete-event.ts in common module 
```sh
cd common
npm run pub

cd expiration
npm update @rztickets/common
```

### Publishing an Event on Job Processing
* D 10-queue:
* To test this quickly, go to order-created-listener in expiration
  * Comment delay
  * Test using req.http Ticket and Order creation
```sh
[expiration-depl-5f6d5d6586-qrktq expiration] Message received: order:created / expiration-service
[orders-depl-5d776b76fd-ljdv7 orders] Event published to subject order:created
[tickets-depl-9767f78d-89g46 tickets] Event published to subject ticket:updated
[expiration-depl-5f6d5d6586-qrktq expiration] Waiting this many milliseconds to process the job: 59982
[orders-depl-5d776b76fd-ljdv7 orders] Message received: ticket:updated / orders-service
[expiration-depl-5f6d5d6586-qrktq expiration] Event published to subject expiration:complete
```

### Handling an Expiration Event
* Diagram link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F07%2F02.drawio
* D expiration:
* D order:
```sh
cd orders
npm update @rztickets/common
```

### Emitting the Order Cancelled Event
* D order:cancelled:

### Testing the Expiration Complete Listener
* In orders listeners

### A Touch More Testing
* cd orders
* npm run test

### Listening for Expiration
* Add in orders
* Test in Postman or req.http
* Create Ticket and Order
```sh
[tickets-depl-7fc54fd778-5qjqk tickets] Event published to subject ticket:created
[orders-depl-78c984bcbb-jc5pz orders] Message received: ticket:created / orders-service
[orders-depl-78c984bcbb-jc5pz orders] Message received: ticket:created / orders-service
[tickets-depl-7fc54fd778-5qjqk tickets] Event published to subject ticket:created
[expiration-depl-79b78bbff4-szk2b expiration] Message received: order:created / expiration-service
[orders-depl-78c984bcbb-jc5pz orders] Event published to subject order:created
[tickets-depl-7fc54fd778-5qjqk tickets] Message received: order:created / tickets-service
[expiration-depl-79b78bbff4-szk2b expiration] Waiting this many milliseconds to process the job: 59967
[tickets-depl-7fc54fd778-5qjqk tickets] Event published to subject ticket:updated
[orders-depl-78c984bcbb-jc5pz orders] Message received: ticket:updated / orders-service
[orders-depl-78c984bcbb-jc5pz orders] Message received: expiration:complete / orders-service
[expiration-depl-79b78bbff4-szk2b expiration] Event published to subject expiration:complete
[orders-depl-78c984bcbb-jc5pz orders] Event published to subject order:cancelled
[tickets-depl-7fc54fd778-5qjqk tickets] Message received: order:cancelled / tickets-service
[orders-depl-78c984bcbb-jc5pz orders] Message received: ticket:updated / orders-service
[tickets-depl-7fc54fd778-5qjqk tickets] Event published to subject ticket:updated
```

### Don't Cancel Completed Orders!
* Don't Cancel order that has been paid for

### The Payments Service
* Diagram link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F07%2F02.drawio
* D order:created:
* D order:cancelled:
* D charge:created:

### Initial Setup
* Duplicate initial things from tickets service
```sh
cd payments
npm install
docker build -t nuthanc/payments .
docker push nuthanc/payments
```
* Add in skaffold.yaml
* Add depl file

### Replicated Fields
* Diagram link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F10%2F01.drawio
* D 1-payments: Events
* D 4-props:

### Another Order Model!
* In payments

### Update-If-Current
```sh
cd payments
npm i mongoose-update-if-current
```

### Replicating Orders
* Add order-created-listener

### Testing Order Creation
* cd payments
* npm run test

### Marking an Order as Cancelled
* We don't need version strictly here in order-cancelled-listener, but we will include it anyway
  * Needed when we need to update an Order in the future
* We can move this findOne to models if we want

### Cancelled Testing
* Add test for Cancelling

### Starting the Listeners(My implementation till here: Had mongo errors)
* IN index.ts
* Create ticket and order to test in skaffold logs
* Error with mongo

### Payments Flow with Stripe
* Diagram link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F10%2F01.drawio
* D 5-stripe:
* D 6-cc:

### Implementing the Create Charge Handler
* D 6-cc:
* D 3-charge:

### Validating Order Payment
* new.ts payments

### Testing Order Validation Before
* new.test.ts

### Testing Same-User Validation
* global signin() change and cancelled order change
* Thought instead of the above id change, could use userOne and userTwo in orders index.test.ts

### Stripe Setup
* D 7-api:
```sh
cd payments
npm install stripe
```
* stripe.com, Create a new Account
  * Verify your email
  * Get test API keys or Developer API keys

### Creating a Stripe Secret
* Secret Key is what we need inside our Project
```sh
kubectl create secret generic stripe-secret --from-literal STRIPE_KEY=<sk from browser>
kubectl get secrets
```
* Add this in payments depl

### Creating a Charge with Stripe
* Create stripe.ts
* stripe.com/docs/api
  * Charges: Create a charge

### Manual Testing of Payments
* Test Data in stripe
* Create a ticket, order and payment in Postman or req.http 
  * orderId and token from order for payments
    * Special token is tok_visa
* Stripe dashboard to verify

### Automated Payment Testing
* Test running in local machine outside of kubernetes cluster
  * So no access to that secret
* So, mock for stripe

### Mocked Stripe Client
* Downside is that are we are not reaching stripe api itself

### A More Realistic Test Setup
* Downside is takes a little more time
* Challenging
  * Because Need Details about the change in the Test file instead of the Route Handler
  * Test Itself reach over to Stripe API

### Realistic Test Implementation
* charges.list from Stripe API

### Tying an Order and Charge Together
* D 8-payment:
* payment model
* Don't need a version number because Payment is never gonna change
  * But it's generally best practise to have version

### Testing Payment Creation
* null and undefined are 2 different things
  * Hover over payment to see its return type and write the expectation accordingly

### Publishing a Payment Created Event
* D 1-payments:
* PaymentCreated in common module
* npm run pub in common
* Then npm update in payments, orders and tickets

### More on Publishing
* Publish in new.ts

### Marking an Order as Complete
* Add listener in Order service
* Optional publish that the order was updated after it was marked as Completed

### A Few More Pages
* client index.js Landing Page
* Diagram link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F11%2F01.drawio
* D 1-mocks: **App Overview**
* D 2-routes: Routes, Pages required and Goal
  * First 3 done
  * Handling id's in NextJS is a little bit difficult
    * Wildcard in []

### Reminder on Data Fetching with Next
* D 3-arch:
* D 4-getProps: Entire flow in NextJS
* Little issue
  * ticketing.dev
  * Click on Logo on top left and check Network tab
  * 2 requests to fetch currentUser

### Two Quick Fixes
* Remove unwanted in index.js of client
* Pass currentUser in _app.js
* Also no need to buildClient again in the components
  * Pass the already built client to the Components in _app

### Scaffolding a Form
* new.js form

### Sanitizing Price Input
* state for keeping track of title and price
* blur: click in and out
* Backend for validation

### Ticket Creation
* getInitialProps: to show the component on the screen(Render for the first time)
* use-request hook

### Listing All Tickets
* Initial rendering of all tickets in getInitialProps
  * return of tickets from getInitialProps passed as tickets props in LandingPage

### Linking to WildCard Routes
* D 2-routes:
* Manually test via ticketing.dev/tickets/asdkfjlajdfs
* Both href and as
  * **as** is the real route

### Creating an Order
* context contains the id

### Programmatic Navigation to Wildcard Routes
* D 1-mocks:
* Router.push: Programmatic Navigation
  * 1st argument is path to file
  * 2nd argument is actual url

### The Expiration Timer
* Whenever we return a function from useEffect, that function will be invoked when we are gonna navigate away from the Component or rerendered(dependency in the array for rerendered)

### Displaying the Expiration
* Condition after useEffect

### Showing a Stripe Payment Form
* react-stripe-checkout library in npmjs.com

### Configuring Stripe
* Need to use stripeKey as env variable in next

### Test Credit Card Numbers
* stripe.com/docs/testing

### Paying for an Order
* For doRequest to merge token along with previous body, change in useRequest.js
* In ticketId.js, event gets passed automatically as first argument
  * So change it to onClick={() => doRequest()}

### Filtering Reserved Tickets
* In tickets index.ts routes, find only tickets where orderId is undefined

### Header Links
* header.js in client

### Rendering a List of Orders
* Create new orders page and also update orderId.js

### Development Workflow
* Diagram link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2Fnuthanc%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F12%2Fdiagrams.drawio
* D 6-teams:
* D 6-branch: **Overall**

### Git Repository Approaches
* D 4-mono: Mono Repo Approach
  * Single Git Repository
* D 5-multi: Lot of work
```sh
#.gitignore
node_modules
.DS_Store
```
* Add repository for ticketing
  * In my case, I have for all of microservices course(like typescript, blog)

### Creating a Github Action
* D 7-gh:
* https://docs.github.com/en/actions/reference/events-that-trigger-workflows
* Simple workflow or Anything else with content deleted
* Rename to tests.yml
```yml
name: tests

on:
  pull_request

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: cd auth && npm install && npm run test:ci
```
* I made cd to ticketing/auth
* uses: takes all the code from our project
* Start commit for the workflow tests.yml
* https://github.com/nuthanc/microservice/tree/master/.github/workflows

### Adding a CI Test Script
* npm run test:ci
  * To make sure test exits
  * Need to add code in package.json

### Running Tests on PR Creation
* Add simple console.log in auth index.ts
* Create a new branch
```sh
git checkout -b dev
```
* Go to Github and check Pull requests
* We can do either Compare & pull request or New pull request
* We will go with New pull request as we don't see Compare & pull request sometimes
* compare:dev to base:master
* Create pull request
* We will see Github Action executed 
```txt
Some checks haven't completed yet

Some time later
All checks have passed
This branch has no conflicts with the base branch
```
* Then we can click on Merge pull request

### Output of Failing Tests
* Deliberately fail a test in current-user.test.ts
* Push from dev branch
* We see tests failing
* Then update in dev and push again 

### Running Tests in Parallel
* We can add more runs in our tests.yml
  * But that will make the tests run in series
* For each individual service, we can create a different Github Action
  * This will make them run in parallel
* Rename tests to tests-auth.yml and make other 3 files
* Also make changes in the package.json

### Verifying a Test Run
* Make a change in dev branch and push it
* Need to check in Pull requests
* If you see the latest commit, you'll see all 4 workflows running in parallel

### Selective Test Execution
* Changes in workflow files
* Make changes in dev only auth and see in Github Pull Requests

### Deployment Options
* D 11-cc:
* D 10-do: digitalocean.com
  * Coupon codes
* Check Udemy notes

### Creating a Hosted Cluster
* Create Cluster

### Reminder on Kubernetes Context
* D 13-kubectl:
* Install Management tools
  * doctl
* API -> Generate New Token
* doctl auth init
  * paste the token

### Reminder on Swapping Contexts
* D 12-list:

### The Deployment Plan
* D 9-depl: If anything changes in the master branch after the merge, do this

### Building an Image in an Action
* Code in workflows of github
* Even merge to master counts as a push to master branch
* build is job-id(can be anything)
* Create Secrets in Github and add Username and Password

### Testing the Image Build
* Check Actions after Merge

### Restarting the Deployment
* D 14-cont:
* More updates in deploy-auth.yml
* Changes in skaffold.yaml

### Applying Kubernetes Manifests
* Deployment files are called Manifests
* Problem in ingress-srv
  * Domain name of ticketing.dev

### Prod vs Dev Manifest Files
* Create k8s-dev and k8s-prod
* Update k8s-prod ingress-srv after purchasing domain name

### Manual Secret Creation
* STRIPE_KEY and JWT_KEY 
* Switch kubectl context to DO context
* Create secret for the above 
```sh
kubectl create secret generic jwt-secret --from-literal=JWT_KEY=jkladsfj
```

### Don't Forget Ingress-Nginx!
* Google search for ingress-nginx (kubernetes.github.io>ingress-nginx)
  * Deployment -> Digital Ocean

### Testing Automated Deployment
* Dev push->Pull request->Merge

### Additional Deploy Files
* Copy deploy-auth.yml to other services and make the appropriate change

### A Successful Deploy
* One small change in all the services
* Push from dev branch -> Pull -> Merge

### Buying a Domain Name
* Digital Ocean -> Networking -> Load Balancers
* Load balancer automatically created by Ingress-nginx inside our cluster
* Diagram link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2Fnuthanc%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F12%2Fdiagrams.drawio
* D 15-domain:
  * Buy domain name and point to Load balancer ip
* namecheap.com
  * The longer the name, the cheaper it is(ex: ticketing-app-prod)

### Configuring the Domain Name
* Nameservers -> Custome DNS
  * ns1.digitalocean.com
  * ns2.digitalocean.com
  * ns3.digitalocean.com
* Then add domain name in digital ocean dashboard -> Networking
* A record
* Check Udemy notes

### One Small Fix
* Check Notes in Udemy

### One More Small Fix
* Check Notes in Udemy

### Next Steps
* cert-manager.io for https requests
* Check Udemy Notes
