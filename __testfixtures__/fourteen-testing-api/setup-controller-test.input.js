import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Unit | Controller | state ruler', function() {
  setupTest('controller:state-ruler', {
    needs: [
      'controller:application',
      'controller:login',
      'service:foo',
      'service:bar',
      'service:something'
    ]
  });

  let controller;
  beforeEach(function() {
    controller = this.subject();
  });

  it('exists', function() {
    controller.should.be.ok();
  });

});

