export default function(file, api, options) {
  const j = api.jscodeshift;

  const printOptions = options.printOptions || {quote: 'single'};
  const root = j(file.source);

  // Find `ember-mocha` imports
  let emberMochaImports = root.find(j.ImportDeclaration, { source: { value: 'ember-mocha' } });
  if (emberMochaImports.length === 0) {
    return file.source;
  }

  // Find `it` in `ember-mocha` imports
  let emberMochaItImports = emberMochaImports.find(j.ImportSpecifier, { imported: { name: 'it' } });
  if (emberMochaItImports.length === 0) {
    return file.source;
  }

  let it = j.importSpecifier(j.identifier('it'));

  // Find existing `mocha` imports
  let mochaImports = root.find(j.ImportDeclaration, { source: { value: 'mocha' } });
  if (mochaImports.length > 0) {
    // Find `it` in existing `mocha` imports
    let mochaItImports = mochaImports.find(j.ImportSpecifier, { imported: { name: 'it' } });
    if (mochaItImports.length === 0) {
      // Add `it` to existing `mocha` imports
      mochaImports.forEach(p => p.node.specifiers.push(it))
    }
  } else {
    // Add new `import {it} from 'mocha'` node
    emberMochaImports.insertBefore(j.importDeclaration([it], j.literal('mocha')));
  }

  // Remove `it` from `ember-mocha` imports
  emberMochaItImports.remove();

  // Remove remaining `import 'ember-mocha';` nodes
  emberMochaImports.filter(p => p.node.specifiers.length === 0).remove();

  return root.toSource(printOptions)
}
