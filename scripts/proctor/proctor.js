/**
 * Proctor provides an API for setting expectations about code and testing
 * code against those expectations.
 *
 * There are three types of expectations:
 * 1) Whitelist requirements - i.e. types of statements that must be present
 *    in the code. These requirements are specified as an array
 * 2) Blacklist requirements - i.e. types of statements that MUST not be
 *    present in the code.
 * 3) Rough program structure
 */

'use strict';

function Proctor(config) {
  this._must = [];
  this._mustNot = [];
  this._structure = [];
  this._tree = {};
  this._results = {};
  this._recursionDepth = Proctor.DEFAULT_RECURSION_DEPTH;

  if (config && typeof config === Object) {
    this.must(config.must);
    this.mustNot(config.mustNot);
    this.structure(config.structure);

    if (config.recursionDepth) {
      this._recursionDepth = config.recursionDepth;
    }
  }
}

/**
 * Set must requirements. You should give an array of AST node
 * types that you expect must be in the code.
 */
Proctor.prototype.must = function(requirements) {
  if (requirements && Array.isArray(requirements)) {
    this._must = requirements;
  }
  return this._must;
}

/**
 * Set must not requirements. You should give an array of AST node
 * types that you expect must not be in the code.
 */
Proctor.prototype.mustNot = function(requirements) {
  if (requirements && Array.isArray(requirements)) {
    this._mustNot = requirements;
  }
  return this._mustNot;
}

/**
 * Set structure requirements. You should give an array of objects
 * each specifying a `type` and a `contains`. e.g.
 *
 *       {
 *         type: "FunctionDeclaration",
 *         contains: [
 *           "ExpressionStatement",
 *           {
 *             type: "FunctionDeclaration",
 *             contains: []
 *           }
 *         ]
 *       }
 */
Proctor.prototype.structure = function(requirements) {
  if (requirements && typeof(requirements) === 'array') {
    this._structure = requirements;
  }
  return this._structure;
}

/**
 * Grade the given code against requirements and call the callback once
 * grading is complete. The callback will be called with an argument containing
 * the results.
 * @param code - string of JS code to grade
 * @param callback - fn to call when finished grading
 */
Proctor.prototype.grade = function(code, callback) {
  var t = this;
  setTimeout(function(){
    t._parse(code);
    t._evaluate();
    if ( callback && typeof callback === 'function') {
        callback(t.getResults());
    }
  }, 0);
}

/**
 * Return the most recent set of results. If specified, returns only
 * results of a given type, otherwise all results.
 *
 * @param type - (optional) one of 'must', 'mustNot', 'structure'
 */
Proctor.prototype.getResults = function(type) {
  if (type && this._results[type]) {
    return this._results[type];
  } else {
    return this._results;
  }
}

/**
 * Internal method to parse the code into a tree.
 */
Proctor.prototype._parse = function(code) {
  try {
      this._tree = esprima.parse(code);
  } catch(e) {
      console.log('INVALID CODE');
  }
  return this._tree;
}

/**
 * Internal method to evaluate the tree against the requirements.
 */
Proctor.prototype._evaluate = function() {
  this._evaluateSimple();
  this._evaluateStructure();
}

/**
 * Internal method to evaluate the tree against the simple must/not requirements.
 */
Proctor.prototype._evaluateSimple = function(recursionDepth) {
  var requirementsMust = [],
      requirementsMustNot = [],
      resultsMust = [],
      resultsMustNot = [],
      recursionDepth = this._recursionDepth;

  // Populate local copies of requirements
  this._must.map(function(req){
    requirementsMust.push(req);
  });
  this._mustNot.map(function(req){
    requirementsMustNot.push(req);
  });

  /**
   * Recurse through tree looking for required nodes.
   */
  function evalRecursive( list, level ) {
    if (level > recursionDepth) return;
    if (!list) return;

    var listLength = list.length,
        foundMustIndex, foundMustNotIndex;

    for (var i=0; i < listLength; i++) {
      foundMustIndex = requirementsMust.indexOf(list[i]['type']);
      if (foundMustIndex !== -1) {
        requirementsMust[foundMustIndex] = null;
      }
      foundMustNotIndex = requirementsMustNot.indexOf(list[i]['type']);
      if (foundMustNotIndex !== -1) {
        requirementsMustNot[foundMustNotIndex] = null;
      }
      evalRecursive(list[i]['body'], level + 1);
    }
  }
  evalRecursive(this._tree['body'], 1);

  // At this point ...
  // - requirementsMust (array) has a null for all requirements that passed and
  //   a string for those that failed.
  // - requirementsMustNot (array) has a null for all requirements that failed
  //   and a string for those that passed.

  var reqType, reqPass;

  for(var i=0; i < this._must.length; i++) {
    reqType = this._must[i];
    reqPass = requirementsMust[i] === null;

    resultsMust.push({
      'type': reqType,
      'pass': reqPass,
      'message': this._messageSimple('must', reqType, reqPass)
    });
  }

  for(var j=0; j < this._mustNot.length; j++) {
    reqType = this._mustNot[j];
    reqPass = requirementsMustNot[j] !== null;

    resultsMustNot.push({
      'type': reqType,
      'pass': reqPass,
      'message': this._messageSimple('mustNot', reqType, reqPass)
    });
  }

  this._results['must'] = resultsMust;
  this._results['mustNot'] = resultsMustNot;
}



/**
 * Internal method to evaluate the tree against structure requirements.
 */
Proctor.prototype._evaluateStructure = function() {

}



/**
 * Generates a message about must/must not requirements to be used in results.
 * @param requirementType - one of 'must', 'mustNot', 'structure'
 * @param nodeType - one of the supported nodes
 * @param pass - whether the code passed the requirement
 */
Proctor.prototype._messageSimple = function(requirementType, nodeType, pass ) {
  var nodeName = nodeType.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase(),
      aNodeName = this.aAn(nodeName) + ' ' + nodeName,
      message;

  if (requirementType === 'must') {
    if (pass) {
      message = 'Used '+ aNodeName;
    } else {
      message = 'You must use '+ aNodeName;
    }
  } else if (requirementType === 'mustNot') {
    if (pass) {
      message = 'You did not use '+ aNodeName;
    } else {
      message = 'You must not use '+ aNodeName;
    }
  } else if (requirementType === 'structure') {

  }
  return message;
}

/**
 * Generates a message about structure requirements to be used in results.
 * @param nodeTypeParent - one of the supported structural nodes
 * @param nodeTypeParent - one of the supported nodes
 * @param pass - whether the code passed the requirement
 */
Proctor.prototype._messageStructure = function(nodeTypeParent, nodeTypeChild, pass ) {
  var nodeNameParent = nodeTypeParent.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase(),
      nodeNameChild = nodeTypeChild.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase(),
      aNodeNameChild = this.aAn(nodeNameChild) + ' ' + nodeNameChild,
      message;

  if (pass) {
    message = "The " + nodeNameParent + " contains " + aNodeNameChild;
  } else {
    message = "The " + nodeNameParent + " must contain " + aNodeNameChild;
  }
  return message;
}

Proctor.prototype.aAn = function( str) {
  var an = ['a', 'e', 'i', 'o', 'u'];
  if (an.indexOf(str.charAt(0)) !== -1) {
    return 'an';
  } else {
    return 'a';
  }
}

/*
 * Types of nodes in the tree that we look for.
 */
Proctor._nodes = {
  'Identifier': {},
  'Literal': {},
  // Statements
  'ExpressionStatement': {},
  'BlockStatement': {},
  'EmptyStatement': {},
  'DebuggerStatement': {},
  'WithStatement': { },
  'ReturnStatement': {},
  'LabeledStatement': {},
  'BreakStatement': {},
  'ContinueStatement': {},
  'IfStatement': {},
  'SwitchStatement': {},
  'SwitchCase': {},
  'ThrowStatement': {},
  'TryStatement': { structure: true, parameter: 'block' },
  'CatchClause': {},
  'WhileStatement': { structure: true, parameter: 'body' },
  'DoWhileStatement': { structure: true, parameter: 'body' },
  'ForStatement': { structure: true, parameter: 'body' },
  'ForInStatement': { structure: true, parameter: 'body' },
  // Declarations
  'FunctionDeclaration': { structure: true, parameter: 'body' },
  'VariableDeclaration': {},
  // Expressions
  'ThisExpression': {},
  'ArrayExpression': {},
  'ObjectExpression': {},
  'Property': {},
  'FunctionExpression': {},
  'UnaryExpression': {},
  'UpdateExpression': {},
  'BinaryExpression': {},
  'AssignmentExpression': {},
  'LogicalExpression': {},
  'MemberExpression': {},
  'ConditionalExpression': {},
  'CallExpression': {},
  'NewExpression': {},
  'SequenceExpression': {}
};

Proctor.DEFAULT_RECURSION_DEPTH = 3;
