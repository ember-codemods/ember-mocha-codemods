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
  let newMochaImport;

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
    newMochaImport = j.importDeclaration([it], j.literal('mocha'));
    emberMochaImports.insertBefore(newMochaImport);
  }

  // Remove `it` from `ember-mocha` imports
  emberMochaItImports.remove();

  // Remove remaining `import 'ember-mocha';` nodes
  emberMochaImports
    .filter(p => p.node.specifiers.length === 0)
    .forEach(p => {
      // Apply comments to next sibling
      let comments = p.node.comments;
      if (!comments || comments.length === 0) {
        return;
      }

      if (newMochaImport) {
        newMochaImport.comments = comments;
        return;
      }

      let siblings = p.parent.node.body;

      let index = siblings.indexOf(p.node);
      if (index === -1) {
        return;
      }

      let nextSibling = siblings[index + 1];
      if (nextSibling) {
        nextSibling.comments = comments;
      }
    })
    .remove();

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
