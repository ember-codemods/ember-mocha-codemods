'use strict';

const defineTest = require('jscodeshift/dist/testUtils').defineTest;

defineTest(__dirname, 'import-it-from-mocha', {}, 'import-it-from-mocha/basic');
defineTest(__dirname, 'import-it-from-mocha', {}, 'import-it-from-mocha/with-other-imports');
