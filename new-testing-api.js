"use strict";

module.exports = function(file, api, options) {
  const j = api.jscodeshift;

  const mapping = {
    'describeModule': 'setupTest',
    'describeComponent': 'setupComponentTest',
    'describeModel': 'setupModelTest',
  };

  const printOptions = options.printOptions || {quote: 'single'};
  const root = j(file.source);

  // Find `ember-mocha` imports
  let emberMochaImports = root.find(j.ImportDeclaration, { source: { value: 'ember-mocha' } });
  if (emberMochaImports.size() === 0) {
    return file.source;
  }

  // Replace old with new test helpers imports
  let adjustedImports = emberMochaImports.find(j.ImportSpecifier)
    .filter(p => Object.keys(mapping).includes(p.node.imported.name))
    .replaceWith(p => j.importSpecifier(j.identifier(mapping[p.node.imported.name])));

  if (adjustedImports.size() === 0) {
    return file.source;
  }

  let describe = j.importSpecifier(j.identifier('describe'));

  // Find existing `mocha` imports
  let mochaImports = root.find(j.ImportDeclaration, { source: { value: 'mocha' } });
  if (mochaImports.size() > 0) {
    // Find `describe` in existing `mocha` imports
    let mochaItImports = mochaImports.find(j.ImportSpecifier, { imported: { name: 'describe' } });
    if (mochaItImports.size() === 0) {
      // Add `describe` to existing `mocha` imports
      mochaImports.forEach(p => p.node.specifiers.push(describe))
    }
  } else {
    // Add new `import {describe} from 'mocha'` node
    emberMochaImports.insertBefore(j.importDeclaration([describe], j.literal('mocha')));
  }

  // Replace old helper calls with `describe()` with new helper call inside
  root.find(j.CallExpression)
    .filter(p => Object.keys(mapping).includes(p.node.callee.name))
    .replaceWith(p => {
      let args = p.node.arguments;

      if (args.length < 3) {
        return p.node;
      }

      let moduleName = args[0];
      let description = args[1];
      let options = args[2];
      let func = (args.length === 3) ? args[2] : args[3];
      let helperName = mapping[p.node.callee.name];
      let helperParams = (args.length === 3) ? [moduleName] : [moduleName, options];

      func.body.body.unshift(
        j.expressionStatement(
          j.callExpression(j.identifier(helperName), helperParams)));

      return j.callExpression(j.identifier('describe'), [description, func])
    });

  return beautifyImports(root.toSource(printOptions));
}

/**
 * imported from https://github.com/tomdale/ember-modules-codemod
 */
function beautifyImports(source) {
  return source.replace(/\bimport.+from/g, (importStatement) => {
    let openCurly = importStatement.indexOf('{');

    // leave default only imports alone
    if (openCurly === -1) { return importStatement; }

    if (importStatement.length > 50) {
      // if the segment is > 50 chars make it multi-line
      let result = importStatement.slice(0, openCurly + 1);
      let named = importStatement
        .slice(openCurly + 1, -6).split(',')
        .map(name => `\n  ${name.trim()}`);

      return result + named.join(',') + '\n} from';
    } else {
      // if the segment is < 50 chars just make sure it has proper spacing
      return importStatement
        .replace(/,\s*/g, ', ') // ensure there is a space after commas
        .replace(/\{\s*/, '{ ')
        .replace(/\s*\}/, ' }');
    }
  });
}
