'use strict';
(function($){

var proctor = new Proctor(),
    resultsPanel =  Handlebars.compile( $('#resultsPanel').html());

proctor.must([
  "VariableDeclaration",
  "ExpressionStatement",
  "FunctionDeclaration",
  "ExpressionStatement"
]);

proctor.mustNot([
  "WhileStatement"
]);

proctor.structure([
  {
    type: "FunctionDeclaration",
    contains: [
      "ExpressionStatement",
      "VariableDeclaration",
    ]
  },
  {
    type: "FunctionDeclaration",
    contains: [
      "ExpressionStatement",
      "VariableDeclaration",
      "VariableDeclaration",
    ]
  },
  {
    type: "ForStatement",
    contains: [
      "ExpressionStatement",
      "VariableDeclaration",
    ]
  },
  {
    type: "WhileStatement",
    contains: [
      "SwitchStatement"

    ]
  },
]);


var editor = ace.edit("editor");
    editor.setTheme("ace/theme/chrome");
    editor.getSession().setMode("ace/mode/javascript");

editor.getSession().on('change', function(e) {
  processCode();
});

processCode(); // Run once, to initialise the viewport.


function processCode() {
  var code = editor.getValue();
  proctor.grade(code, function(results){
    renderResults(results);
  });
}

function renderResults(results) {
  var must, mustNot, structure;
  if (results.must) {
    must = resultsPanel({
      'heading': 'Required functionality',
      'results': results.must
    });
  }
  if (results.mustNot) {
    mustNot = resultsPanel({
      'heading': 'Must not use these elements',
      'results': results.mustNot
    });
  }
  if (results.structure) {
    structure = resultsPanel({
      'heading': 'Required structure',
      'results': results.structure
    });
  }

  $('#results').html(must + mustNot + structure);
};




})(jQuery);
