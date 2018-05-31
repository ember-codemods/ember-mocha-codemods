import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';


describe('GravatarImageComponent', function() {
  setupComponentTest('gravatar-image', {
    unit: true,
    needs: []
  });


  it('renders', function() {
    const subject = this.subject({
      quantity: 1,
      maxQuantity: 10
    });

    expect(subject.get('isMaxQuantity')).to.be.not.ok;
  });
});

