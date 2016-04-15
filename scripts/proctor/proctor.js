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

  if (config && typeof config === Object) {
    this.must(config.must);
    this.mustNot(config.mustNot);
    this.structure(config.structure);
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
  if (requirements && Array.isArray(requirements)) {
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
  this._evaluateSimple('must');
  this._evaluateSimple('mustNot');
  this._evaluateStructure();
}


/**
 * Internal method to evaluate the tree against the simple must/not requirements.
 * @param reqSet - requirement set: one of 'must' or 'mustNot'
 */
Proctor.prototype._evaluateSimple = function( reqSet ) {
  var requirements = this._findNodeTypes(this._tree['body'], this['_'+reqSet]),
      req,
      pass,
      results = [];

  for(var i=0; i < requirements.length; i++) {
    req = requirements[i];
    pass = reqSet === 'mustNot' ? !req['found'] : req['found'];
    results.push({
      'type': req['type'],
      'pass': pass,
      'message': this._messageSimple(reqSet, req['type'], pass)
    });
  }
  this._results[reqSet] = results;
}


/**
 * Internal method to evaluate the tree against structure requirements.
 */
Proctor.prototype._evaluateStructure = function() {
  var list = this._tree['body'],
      listLength = list.length,
      results = [],
      requirement,
      requirementMet,
      subReqs,
      subReqsMet,
      message;

  // Loop through requirements
  for(var i=0; i < this._structure.length; i++ ) {
    requirement = this._structure[i];
    requirementMet = false;

    // Look through each element in tree on first level
    for(var j=0; j < listLength; j++) {

      // If we find a match with requirement, then descend into the body
      // and test for whether the sub requirements are met.
      if(list[j]['type'] === requirement['type']) {

        if (list[j]['body'] && list[j]['body']['body']) {

          subReqs = this._findNodeTypes(list[j]['body']['body'],
                                        requirement['contains']);
          subReqsMet = subReqs.reduce(function(prev, current){
            return prev && current.found;
          }, true);

          if (subReqsMet) {
            requirementMet = true;
          }
        }
      }
    }

    message = this._messageStructure(requirement['type'],
                           requirement['contains'],
                           requirementMet);
    results.push({
      'pass': requirementMet,
      'message': message
    });
  }

  this._results['structure'] = results;
}


/**
 * Searches for node types listed in nodesSearch in the nodeList provided
 * Returns an array with an object for each nodeType given item in nodesSearch
 * listing whether the nodeType was found.
 */
Proctor.prototype._findNodeTypes = function(nodeList, nodesSearch) {
  var listLength = nodeList.length,
      reqs = nodesSearch.map(function(req){
        return {type: req, found: false};
      }),
      numReqs = reqs.length;

  for( var i=0; i < listLength; i++) {
    for(var j=0; j < numReqs; j++ ) {
      if(nodeList[i]['type'] === reqs[j]['type'] && !reqs[j]['found']) {
        reqs[j]['found'] = true;
        break;
      }
    }
  }
  return reqs;
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
  }
  return message;
}


/**
 * Generates a message about structure requirements to be used in results.
 * @param nodeTypeParent - one of the supported structural nodes
 * @param nodeTypeChildren - array of children nodes that should be present
 * @param pass - whether the code passed the requirement
 */
Proctor.prototype._messageStructure = function(nodeTypeParent, nodeTypeChildren, pass ) {
  var that = this,
      nodeNameParent = nodeTypeParent.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase(),
      nodeNameChildren = nodeTypeChildren.map(function(type){
        var name = type.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
        return that.aAn(name) + ' ' + name;
      }),
      message;

  if (pass) {
    message = "The " + nodeNameParent + " contains " +
      this.proseList(nodeNameChildren);
  } else {
    message = "The " + nodeNameParent + " must contain " +
      this.proseList(nodeNameChildren);
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


Proctor.prototype.proseList = function(list) {
  var proseList = list.reduce(function(prev, current, index, array){
      if (index === 0) { // first item
        return current;
      }
      if (index === (array.length-1)) { // last item
        return prev + ' and ' + current;
      } else {
        return prev + ', ' + current;
      }
  },'');
  return proseList;
}
