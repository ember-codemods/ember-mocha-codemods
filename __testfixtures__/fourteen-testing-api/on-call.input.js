import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';


describe('GravatarImageComponent', function() {
  setupComponentTest('gravatar-image', {
    integration: true
  });

  this.on('bar', function() {});

  this.on('foo', function() {});

  beforeEach(function() {
    this.render(hbs`{{gravatar-image foo=(action 'bar')}}`);
  });

  it('renders', function() {
    expect(this.$('img')).to.exist;
    this.render(hbs`{{gravatar-image foo=(action 'foo')}}`);
  });
});
