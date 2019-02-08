import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('LoadingIndexRoute', function() {
  setupTest('route:loading/index', {
    // needs: ['service:ajax']
  });

  describe('something', function() {

    let route;
    beforeEach(function() {
      route = this.subject();
    });

    it('exists', function() {
      route.should.be.ok();
    });

  });
});
