# TypeScript

### TypeScript Overview
* Github link: https://github.com/nuthanc/typescriptcasts
- Diagram link: https://app.diagrams.net/?mode=github#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Ftypescriptcasts%2Fmaster%2Fdiagrams%2F01%2Fdiagrams.xml
- D 00-what:
- D 1-int:
- D 2-types:
  - Nodejs and Browser doesn't have any idea about TypeScript
- D 4-run:
- D 6-playground:
  - typescriptlang.org/play
- D 7-summary:

### First App
* fetchjson

### Syntax and Design pattern
* Diagram link: https://app.diagrams.net/?mode=github#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Ftypescriptcasts%2Fmaster%2Fdiagrams%2F07%2Fdiagrams.xml
* D 4-plain, 5-def, 9-string, 7-string, 11-ex, 06-two, 10-why
* mkdir features

### Second App
* Features

### Type Annotations and Inference
* Diagram link: https://app.diagrams.net/?mode=github#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FStephenGrider%2Ftypescriptcasts%2Fmaster%2Fdiagrams%2F08%2Fdiagrams.xml
* D 1-flow, 2-def, 3-compare
```ts
// Annotations: We telling typescript
const apples: number = 5; // Annotations can be removed as it is automatically added by Inference
let colors: string[] = ['red', 'green']

// Object literal
let point: { x: number; y: number} = {
  x: 10,
  y: 20
}

// Function 
// till void is the annotation where void is the return type
const logNumber: (i: number) => void = (i: number) => {
  console.log(i);
}
```
* Understanding Inferences
* D 5-inference: Declaration and Initialization on the same line, annotations not required
* D 6-inf
```ts
const json = '{"x": 10, "y": 20}';
const coordinates = JSON.parse(json); //coordinates is any when hovered
console.log(coordintaes); // {x: 10, y: 20}
```
* D 9-json, 8-any
```ts
const json = '{"x": 10, "y": 20}';
const coordinates: { x: number, y: number} = JSON.parse(json); //coordinates is any when hovered
console.log(coordintaes); // {x: 10, y: 20}
```
* D 11-func
```ts
const add = (a: number, b: number): number => {
  return a+b;
}
```

### Inference around Functions
* Github link: https://github.com/nuthanc/typescriptcasts
* features directory annotations functions.ts
* D 9-functions,copy-of-9
* **We add annotations for return type** also even though inference can be used because when we forget to return something, inference will make it void


### Annotations to Anonymous Functions
* functions.ts

### Void and Never
* functions.ts