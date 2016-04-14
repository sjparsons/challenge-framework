'use strict';
(function($){

var proctor = new Proctor(),
    resultsTemplate =  $('#resultsTemplate').html();


Mustache.parse(resultsTemplate);

proctor.must([
  "VariableDeclaration",
  "ExpressionStatement",
  "FunctionDeclaration",
  "ExpressionStatement"
]);

proctor.mustNot([
  "WhileStatement"
]);

$('#code').on('keyup change', function(){
  var code = $("#code").val();
  proctor.grade(code, function(results){
    renderResults(results);
  });
});

function renderResults(results) {
  var rendered = Mustache.render(resultsTemplate, results);
  $('#results').html(rendered);
};

// Trigger handler to get basic results.
$('#code').keyup();



})(jQuery);
