/* eslint-env: node */
'use strict';

const fs = require('fs');
const path = require('path');

const runInlineTest = require('jscodeshift/dist/testUtils').runInlineTest;
const NewTestingAPITransform = require('../new-testing-api');
const fixtureFolder = `${__dirname}/../__testfixtures__/new-testing-api`;

describe('new-testing-api', function() {
  fs
    .readdirSync(fixtureFolder)
    .filter(filename => /\.input\.js$/.test(filename))
    .forEach(filename => {
      let testName = filename.replace('.input.js', '');
      let inputPath = path.join(fixtureFolder, `${testName}.input.js`);
      let outputPath = path.join(fixtureFolder, `${testName}.output.js`);

      describe(testName, function() {
        it('transforms correctly', function() {
          runInlineTest(
            NewTestingAPITransform,
            {},
            { source: fs.readFileSync(inputPath, 'utf8') },
            fs.readFileSync(outputPath, 'utf8')
          );
        });

        it('is idempotent', function() {
          runInlineTest(
            NewTestingAPITransform,
            {},
            { source: fs.readFileSync(outputPath, 'utf8') },
            fs.readFileSync(outputPath, 'utf8')
          );
        });
      });
    });
});
