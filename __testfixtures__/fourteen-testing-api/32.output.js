import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';


describe('GravatarImageComponent', function() {
  setupRenderingTest();

  let foo, fred, render2;
  beforeEach(function() {
    render2 = async () => render(hbs`{{gravatar-image foo=(action 'bar')}}`);
  });

  it('renders', async function() {
    expect(this.$('img')).to.exist;
    await render2();
  });
});
