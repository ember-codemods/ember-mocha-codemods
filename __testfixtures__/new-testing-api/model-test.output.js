import {
  setupModelTest,
  it
} from 'ember-mocha';
import {beforeEach, describe} from 'mocha';

describe('Unit: Model: setting', function () {
  setupModelTest('setting');
  beforeEach(function() {
    // noop
  });

  it('has a validation type of "setting"', function () {
    let model = this.subject();

    expect(model.get('validationType')).to.equal('setting');
  });
});
