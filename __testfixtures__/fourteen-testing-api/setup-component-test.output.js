import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('GravatarImageComponent', function() {
  setupRenderingTest();

  it('renders', async function() {
    await render(hbs`{{gravatar-image}}`);
    expect(this.$('img')).to.exist;
  });
});
