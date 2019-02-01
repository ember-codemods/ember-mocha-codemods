import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('LoadingIndexRoute', function() {
  setupTest();

  it('exists', function() {
    let route = this.owner.lookup('route:loading/index');
    route.should.be.ok();
  });
});
