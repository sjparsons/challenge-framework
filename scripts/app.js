'use strict';
(function($){

var proctor = new Proctor();

proctor.must([
  "VariableDeclaration",
  "ExpressionStatement",
  "FunctionDeclaration",
  "ExpressionStatement"
]);

$('#code').on('keyup change', function(){
  var code = $("#code").val();
  proctor.grade(code, function(results){
    console.log('grading results', results);
  });
});

})(jQuery);
