
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


License
------------------------------------------------------------------------------
ember-mocha-codemods is licensed under the [MIT License](LICENSE).
