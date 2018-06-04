import { expect } from 'chai';
import {
  beforeEach,
  context,
  describe,
  it,
} from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | my-component', function () {
  setupRenderingTest();

  context('when in some situation or another', function () {
    beforeEach(async function() {
      await render(hbs`{{my-component}}`);
    });

    it('should do the thing', function () {
      expect(true).to.be.true;
    });
  });
});