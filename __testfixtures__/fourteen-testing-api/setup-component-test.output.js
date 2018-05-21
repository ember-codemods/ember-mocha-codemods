import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('GravatarImageComponent', function() {
  setupRenderingTest();

  it('renders', async function() {
    await render(hbs`{{gravatar-image}}`);
    expect(this.$('img')).to.exist;
  });

  ['foo'].forEach(t => {
    it('renders', async function() {
      await render(hbs`{{gravatar-image}}`);
      expect(this.$('img')).to.exist;
    });
  });
});

describe('GravatarImageComponent', function() {
  setupRenderingTest();

  beforeEach(async function() {
    await render(hbs`{{gravatar-image}}`);
  });

  it('renders', function() {
    expect(this.$('img')).to.exist;
  });
});
