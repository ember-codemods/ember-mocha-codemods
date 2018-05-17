import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';


describe('GravatarImageComponent', function() {
  setupRenderingTest();

  beforeEach(async function() {
    await render(hbs`{{gravatar-image}}`);
    this.owner.register('service:metrics', Service.extend({ trackEvent }));
  });

  it('renders', function() {
    this.owner.register('service:metrics', Service.extend({ trackEvent }));
    expect(this.$('img')).to.exist;
  });
});
