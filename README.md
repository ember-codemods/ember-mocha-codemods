
ember-mocha-codemods
==============================================================================

[![Build Status](https://travis-ci.org/Turbo87/ember-mocha-codemods.svg?branch=master)](https://travis-ci.org/Turbo87/ember-mocha-codemods)

codemod scripts for [`ember-mocha`](https://github.com/emberjs/ember-mocha/)


Installation
------------------------------------------------------------------------------

`ember-mocha-codemods` itself doesn't need to be installed, but you need to
install [`jscodeshift`](https://github.com/facebook/jscodeshift) to run the
codemod script:

```
npm install -g jscodeshift
```


Usage
------------------------------------------------------------------------------

You can clone/download this repository or just run the codemods from URL like
shown in the following examples:

### new-testing-api

Changes your code to use the [new testing API](https://github.com/emberjs/ember-mocha/pull/84)
introduced in `ember-mocha@0.9.0`.

```
jscodeshift -t https://raw.githubusercontent.com/Turbo87/ember-mocha-codemods/master/new-testing-api.js PATH
```

Before:

```js
import { expect } from 'chai';
import { it } from 'mocha';
import { describeModule } from 'ember-mocha';

describeModule(
  'route:subscribers',
  'Unit: Route: subscribers',
  {
    needs: ['service:notifications']
  },
  function() {
    it('exists', function() {
      let route = this.subject();
      expect(route).to.be.ok;
    });
  }
);
```

After:

```js
import { expect } from 'chai';
import { it, describe } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit: Route: subscribers', function() {
  setupTest('route:subscribers', {
    needs: ['service:notifications']
  });

  it('exists', function() {
    let route = this.subject();
    expect(route).to.be.ok;
  });
});
```

### import-it-from-mocha

Changes your code to import `it()` from `mocha` directly instead of
`ember-mocha`.

```
jscodeshift -t https://raw.githubusercontent.com/Turbo87/ember-mocha-codemods/master/import-it-from-mocha.js PATH
```

Before:

```js
import { it } from 'ember-mocha';
```

After:

```js
import { it } from 'mocha';
```

### Testing API beginning in 0.14

Changes your code to be compliant with the migration guide found [here](https://github.com/emberjs/ember-mocha/blob/master/docs/migration.md).

The API beginning in 0.14 introduces many shared helpers and setup across the various types of Ember.js tests.  Formerly these types were called: `acceptance` for application wide concerns, `integration` for component tests (both rendering and user interaction), and finally `unit` tests for testing individual units at the lowest level.  In the newest API these have been reframed as `application` tests (formerly `acceptance`), `rendering` tests (formerly `integration`), and `unit` tests are largely unchanged.

The majority of these changes are to unify test setup and helper usage.  A detailed list of the new helper APIs can be found [here](https://github.com/emberjs/ember-test-helpers/blob/master/API.md).

This codemod will follow the migration guide to help you move your test suite from the style defined in 0.9 to the style defined in 0.14.

It is important to review these changes, since there are many different configurations which this codemod attempts to reconcile with the new style you'll still need to review files after running this and make the necessary adjustments.  If you notice something that you feel the codemod should handle and doesn't please leave an issue with clearly defined inputs and outputs and an explanation of why you think it should handle this and we'll discuss resolutions.

To begin this code mod:

```
jscodeshift -t https://raw.githubusercontent.com/Turbo87/ember-mocha-codemods/master/fourteen-testing-api.js PATH
```

This will do much of what you want, but notably does not handle many of the new helpers from `@ember/test-helpers` this is because there is another codemod that should also be run which can be found [here](https://github.com/simonihmig/ember-test-helpers-codemod).

```
cd my-ember-app-or-addon
npx ember-test-helpers-codemod integration tests/integration
npx ember-test-helpers-codemod acceptance tests/acceptance
npx ember-test-helpers-codemod native-dom tests
```

## Codeshift Options
`--wrapCreateModelWithRunLoop=true`

This option will wrap `createRecord` calls with a runLoop. This was needed in older versions of Ember to avoid this error: "You have turned on testing mode, which disabled the run-loop's autorun."
```
let model = this.subject({a:'a'}); //before
let model = Ember.run(() => this.owner.lookup('service:store').createRecord('rental', {a:'a'})); //after
``` 

License
------------------------------------------------------------------------------
ember-mocha-codemods is licensed under the [MIT License](LICENSE).
