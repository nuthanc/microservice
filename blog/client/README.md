### React Project Setup
* Diagram Link: https://app.diagrams.net/#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Fmicroservices-casts%2Fmaster%2Fdiagrams%2F02%2Fdiagrams.drawio
* D 11-react:
* D 12-react:
* Rest of the details in blog client README 
* npm install axios
* npm start
* Delete everything inside src directory
* Create index.js and App.js inside src
* Import react and export 

### Building Post Submission
* Create PostCreate.js inside src
* Import PostCreate in App.js
* Add Bootstrap from getbootstrap.com
* Copy the first link and script tag and paste it in public/index.html
* The script is not required, so can be deleted
* In PostCreate, import useState hook and axios
* New state of title using useState hook and initialize to empty string
* input's value to come from title
* Add onSubmit to form element and helper function of onSubmit
* Use async-await syntax
* setTitle of empty string after successful to empty out the input
* Note: Make sure to have posts, comments and client npm started

### Handling CORS Errors
* CORS Error occurs when we are making request to another port, for e.g. from localhost:3000 to localhost:4000
* To make this go away, need to make additional configuration on ther server side which is posts
* Stop posts and comments servers
* In both posts and comments, npm i cors
* Start back both posts and comments services
* In posts index.js and comments index.js, require cors and wire it up as middleware
* Then try creating posts again in the browser and click Submit
* You can see the 201 status in the Network tab

### Fetching and Rendering Posts
* Create PostList in src dir
* Import PostList in App 
* Import useState and useEffect
* useState to store the list of posts
* useEffect to fetch a post only one time when our component is first created
* Call fetchPosts only when the component is first displayed to the screen
* Second argument to useEffect is an empty array to tell React to run this function only one time
* Object.values returns an array of posts objects

### Creating Comments
* Inside src, create CommentCreate.js
* D 9-comments:
* D 12-react:
* CommentCreate to get post id as property(Prop destructured)
* Import useState hook and axios
* In PostList.js, import CommentCreate and pass it post id
* npm start to check

### Displaying Comments
* Create CommentList.js inside src
* D 9-comments:
* Receives postId as property
* API returns a list of arrays, so default value of array in useState
* In PostList, import CommentList and render befor CommentCreate
* npm start
* But there is some problem
* In the Chrome Network tab, filter by XHR and refresh the page
* **We are making one separate request for each post's comments we have fetched**

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
* Checkout in blog's README for rest of the contents