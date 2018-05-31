import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';


describe('GravatarImageComponent', function() {
  setupTest();


  it('renders', function() {
    const subject = this.owner.factoryFor('component:gravatar-image').create({
      quantity: 1,
      maxQuantity: 10
    });

    expect(subject.get('isMaxQuantity')).to.be.not.ok;
  });
});
