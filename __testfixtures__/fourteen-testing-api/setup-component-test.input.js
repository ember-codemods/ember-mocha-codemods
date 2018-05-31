import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('GravatarImageComponent', function() {
  setupComponentTest('gravatar-image', {
    integration: true
  });

  it('renders', function() {
    this.render(hbs`{{gravatar-image}}`);
    expect(this.$('img')).to.exist;
  });

  ['foo'].forEach(t => {
    it('renders', function() {
      this.render(hbs`{{gravatar-image}}`);
      expect(this.$('img')).to.exist;
    });
  });
});

describe('GravatarImageComponent', function() {
  setupComponentTest('gravatar-image', {
    integration: true
  });

  beforeEach(function() {
    this.render(hbs`{{gravatar-image}}`);
  });

  it('renders', function() {
    expect(this.$('img')).to.exist;
  });
});
