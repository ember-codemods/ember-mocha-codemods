import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('LoadingIndexRoute', function() {
  setupTest();

  describe('something', function() {

    let route;
    beforeEach(function() {
      route = this.owner.lookup('route:loading/index');
    });

    it('exists', function() {
      route.should.be.ok();
    });

  });
});
