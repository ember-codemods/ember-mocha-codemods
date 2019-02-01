import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Unit | Controller | state ruler', function() {
  setupTest();

  let controller;
  beforeEach(function() {
    controller = this.owner.lookup('controller:state-ruler');
  });

  it('exists', function() {
    controller.should.be.ok();
  });

});

