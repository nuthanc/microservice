# TypeScript

### TypeScript Overview
* Diagram link: https://app.diagrams.net/?mode=github#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Ftypescriptcasts%2Fmaster%2Fdiagrams%2F01%2Fdiagrams.xml
* D 00-what:
* D 1-int:
* D 2-types:
  * Nodejs and Browser doesn't have any idea about TypeScript
* D 4-run:
* D 6-playground:
  * typescriptlang.org/play
* D 7-summary:

### Environment Setup
```sh
npm install -g typescript ts-node
tsc --help
# TypeScript compiler
```
* D 8-optional: VS code

### A First App
* Diagram link: https://app.diagrams.net/?mode=github#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Ftypescriptcasts%2Fmaster%2Fdiagrams%2F02%2Fdiagrams.xml
* D 00-project:
* D 1-flow:
* D 3-json:
```sh
mkdir fetchjson
cd fetchjson
npm init -y
npm i axios
```

### Executing TypeScript Code
* Create index.ts
* Compile
```sh
tsc index.ts
# This will create index.js
node index.js

# Combining both in one command
ts-node index.ts
```

### One Quick Change
* todo has response.data
* Make deliberate mistakes
* Run ts-node index.ts
* Undefined

### Catching Errors with TypeScript
* interface Todo
* Inside an interface, properties can be ignored
* Add **as Todo** to response.data
* Error lines in vs code
* Hover over it to get suggestions
```sh
ts-node index.ts
```

### Catching More Errors
* logTodo helper function
* Mess up the order of the arguments and run ts-node
* Type annotation to function arguments
* Red wiggly line after adding annotation