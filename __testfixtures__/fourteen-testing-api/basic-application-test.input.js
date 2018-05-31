import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import startApp from 'app/tests/helpers/start-app';
import destroyApp from 'app/tests/helpers/destroy-app';

describe('basic acceptance test', function() {
  let application;


  beforeEach(function() {
    application = startApp();
  });

  afterEach(function() {
    destroyApp(application);
  });

  it('can visit /', function() {
    visit('/');

    andThen(() => {
      expect(currentURL()).to.equal('/');
    });
  });
});
