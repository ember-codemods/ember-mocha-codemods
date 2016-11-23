/**
 * imported from https://github.com/tomdale/ember-modules-codemod
 */
export default function beautifyImports(source) {
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
