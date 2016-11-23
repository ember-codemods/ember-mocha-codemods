import {
  describeModel,
  it
} from 'ember-mocha';
import { beforeEach } from 'mocha';

describeModel('setting', 'Unit: Model: setting', function () {
  beforeEach(function() {
    // noop
  });

  it('has a validation type of "setting"', function () {
    let model = this.subject();

    expect(model.get('validationType')).to.equal('setting');
  });
});
