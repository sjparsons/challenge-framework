# Challenge Framework

The challenge framework provides a graphical interface for users to see
progress towards a set of requirements for code as they write it. I [decided
to use Esprima](ESPRIMA-ACORN.md) to parse the JavaScript code into a syntax
tree that could be used to determine progress.

A key component to achieving this is a 'class' Proctor which provides simple
methods for setting the three different requirements that need to be set:
must-have requirements, must-not-have requirements, and structural requirements.
I named it Proctor since it oversees the receiving and grading of code against
a given set of requirements.

Here's an example to configure a proctor instance with some basic requirements.

```
var proctor = new Proctor();

proctor.must([
  "VariableDeclaration",
  "ExpressionStatement",
  "FunctionDeclaration",
  "ExpressionStatement"
]);

proctor.mustNot([
  "SwitchStatement"
]);

proctor.structure([
  {
    type: "FunctionDeclaration",
    contains: [
      "ExpressionStatement",
      "VariableDeclaration",
    ]
  },
]);
```

The keys that we pass in each of `must()`, `mustNot()` and `structure()` are
the node types defined in the [ESTree spec](https://github.com/estree/estree/blob/master/spec.md)
which Esprima implements. Note that you can pass in duplicate node types to `must()`
and and proctor will ensure that there are the given number of that node type.

Once you have configured proctor, you can grade code easily against these
requirements:

```
// Assume that code is a string with raw JavaScript in it
proctor.grade(code, function(results){
  // Do something with the results
});
```

The callback provides the results once the grading is complete, but you can
also request the results directly:

```
// Assume that code is a string with raw JavaScript in it
proctor.getResults();
```

The results include a pass/fail status on each requirement given to proctor and
a corresponding message. Here's an example of the results that proctor returns.

```
{
  must: [
    {
      "type": "VariableDeclaration",
      "pass": true,
      "message": "Used a variable declaration."
    },
    {
      "type": "ExpressionStatement",
      "pass": true,
      "message": "Used an expression statement."
    },
    {
      "type": "FunctionDeclaration",
      "pass": false,
      "message": "You must use a function declaration."
    },
    {
      "type": "ExpressionStatement",
      "pass": false,
      "message": "You must use a second expression statement."
    }
  ],
  mustNot: [
    {
      "type": "WhileStatement",
      "pass": false,
      "message": "You must not use a while statement."
    },
    {
      "type": "SwitchStatement",
      "pass": true,
      "message": "You did not use a switch statement."
    }
  ],
  structure: [
    {
      "type": "VariableDeclaration",
      "pass": true,
      "message": "You used a variable declaration"
    },
    {
      "type": "ExpressionStatement",
      "pass": false,
      "message": "You must use an an expression statement"
    },
    {
      "type": "ExpressionStatement",
      "pass": false,
      "message": "You must use an an expression statement"
    }
  ]
}
```


## Usage of the framework

You can install dependencies and serve the site with the following commands.

    npm install
    npm run serve

You can then visit [http://127.0.0.1:8080](http://127.0.0.1:8080) in your
browser.


## Outstanding issues

* Currently the must and must-not requirements are only parsed at the first
  level - i.e. we do not traverse each sub block to look for matches. Providing
  this functionality would involve extending `Proctor.prototype._findNodeTypes()`.
* Structure requirements are looked for at the top level also, and we only
  look one level down for matches to the sub requirements.
* `app.js` should ideally not have the config, but instead should load it
  from another location.
* I earlier included qunit to support unit tests for proctor, but didn't get the time to write any unit tests.
