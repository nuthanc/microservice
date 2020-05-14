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
* D 8-design:
* Create index.js in posts
* posts object which is in-memory
* The above implementation is not good as data gets lost when the App is restarted
* But we want to keep it simple for this App
* Import randomBytes to generate new id
* Require and use bodyParser to parse any json data send to req body
* Add nodemon index.js in start scripts of package.json
