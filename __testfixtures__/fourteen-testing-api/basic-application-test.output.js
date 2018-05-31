import { afterEach, beforeEach, describe, it } from 'mocha';
import { setupApplicationTest } from 'ember-mocha';
import { expect } from 'chai';

describe('basic acceptance test', function() {
  setupApplicationTest();

  it('can visit /', async function() {
    await visit('/');

    expect(currentURL()).to.equal('/');
  });
});
