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

$('#code').on('keyup change', function(){
  var code = $("#code").val();
  proctor.grade(code, function(results){
    renderResults(results);
  });
});

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

// Trigger handler to get basic results.
$('#code').keyup();



})(jQuery);
