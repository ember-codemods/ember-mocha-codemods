/* eslint-env: node */
'use strict';

const fs = require('fs');
const path = require('path');

const runInlineTest = require('jscodeshift/dist/testUtils').runInlineTest;
const FourteenTestingAPITransform = require('../fourteen-testing-api');
const fixtureFolder = `${__dirname}/../__testfixtures__/fourteen-testing-api`;

describe('fourteen-testing-api', function() {
  fs
    .readdirSync(fixtureFolder)
    .filter(filename => /\.input\.js$/.test(filename))
    .forEach(filename => {
      // filename format - the-test-name.option1=foo.option2=bar.input.js

      let testNameWithOptions = filename.replace('.input.js', ''), // the-test-name.option1=foo.option2=bar
          codeshiftOptions = testNameWithOptions.split('.').slice(1).reduce((p,c) => {p[c.split('=')[0]] = c.split('=')[1]; return p;}, {}), // {option1:foo, option2:bar}
          testName = testNameWithOptions.split('.')[0], // the-test-name
          inputPath = path.join(fixtureFolder, filename),
          outputPath = path.join(fixtureFolder, `${testName}.output.js`);

      describe(testName, function() {
        it('transforms correctly', function() {
          runInlineTest(
            FourteenTestingAPITransform,
            codeshiftOptions,
            { source: fs.readFileSync(inputPath, 'utf8') },
            fs.readFileSync(outputPath, 'utf8')
          );
        });

        it('is idempotent', function() {
          runInlineTest(
            FourteenTestingAPITransform,
            codeshiftOptions,
            { source: fs.readFileSync(outputPath, 'utf8') },
            fs.readFileSync(outputPath, 'utf8')
          );
        });
      });
    });
});
