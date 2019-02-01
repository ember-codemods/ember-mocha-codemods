import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('LoadingIndexRoute', function() {
  setupTest('route:loading/index', {
    needs: ['service:ajax', 'service:data-store', 'service:foo']
  });

  it('exists', function() {
    let route = this.subject();
    route.should.be.ok();
  });
});
