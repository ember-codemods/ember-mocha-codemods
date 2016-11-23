'use strict';

const defineTest = require('jscodeshift/dist/testUtils').defineTest;

defineTest(__dirname, 'new-testing-api', {}, 'new-testing-api/component-test');
defineTest(__dirname, 'new-testing-api', {}, 'new-testing-api/model-test');
defineTest(__dirname, 'new-testing-api', {}, 'new-testing-api/route-test');
defineTest(__dirname, 'new-testing-api', {}, 'new-testing-api/test-helper');

defineTest(__dirname, 'new-testing-api', {}, 'new-testing-api/irrelevant-file');
