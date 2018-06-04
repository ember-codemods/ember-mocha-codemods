"use strict";

module.exports = function(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  const SETUP_TYPE_METHODS = ["setupComponentTest"];

  function isSetupTypeMethod(nodePath) {
    return SETUP_TYPE_METHODS.some(name => {
      let matcher = {
        type: "ExpressionStatement",
        expression: { callee: { name } }
      };

      return j.match(nodePath, matcher);
    });
  }

  const GLOBAL_NODE_PATH_CACHE = new Map();
  // returns startAppAssignment nodePath or false;
  function findStartAppAssignment(nodePath) {

    let startAppAssignment = GLOBAL_NODE_PATH_CACHE.has(nodePath);

    if (startAppAssignment) { return GLOBAL_NODE_PATH_CACHE.get(nodePath) }

    let assignments = j(nodePath).find(j.ExpressionStatement, { expression: { right: { callee: { name: 'startApp' } } } });

    if (assignments.length >= 1) {
      let foundAssignment = assignments.paths()[0];
      GLOBAL_NODE_PATH_CACHE.set(nodePath, foundAssignment);
      return foundAssignment;
    } else {
      return false;
    }
  }

  function findDestroyAppCall(nodePath) {
    let destroys = j(nodePath).find(j.ExpressionStatement, { expression: {callee: {  name: 'destroyApp' } } } )

    if (destroys.length >= 1) {
      let foundDestroy = destroys.paths()[0];
      j(foundDestroy).remove();
    }
  }

  function processExpressionForApplicationTest(testExpression) {
    // mark the test function as an async function
    let testExpressionCollection = j(testExpression);
    // collect all potential statements to be imported
    let specifiers = new Set();

    // First - remove andThen blocks
    removeAndThens(testExpressionCollection);

    // Second - Transform to await visit(), click, fillIn, touch, etc and adds `async` to scope
    [
      'visit',
      'find',
      'waitFor',
      'fillIn',
      'click',
      'blur',
      'focus',
      'tap',
      'triggerEvent',
      'triggerKeyEvent',
    ].forEach(type => {
      findApplicationTestHelperUsageOf(testExpressionCollection, type).forEach(p => {
        specifiers.add(type);

        let expression = p.get('expression');

        let awaitExpression = j.awaitExpression(
          j.callExpression(j.identifier(type), expression.node.arguments)
        );
        expression.replace(awaitExpression);
        p.scope.node.async = true;
      });
    });

    // Third - update call expressions that do not await
    ['currentURL', 'currentRouteName'].forEach(type => {
      testExpressionCollection
        .find(j.CallExpression, {
          callee: {
            type: 'Identifier',
            name: type,
          },
        })
        .forEach(() => specifiers.add(type));
    });
  }

  function removeAndThens(testExpressionCollection) {
    let replacements = testExpressionCollection
      .find(j.CallExpression, {
        callee: {
          name: 'andThen',
        },
      })
      .map(path => path.parent)
      .replaceWith(p => {
        let body = p.node.expression.arguments[0].body
        return body.body;
      });

    if (replacements.length > 0) {
      removeAndThens(testExpressionCollection);
    }
  }

  function findApplicationTestHelperUsageOf(collection, property) {
    return collection.find(j.ExpressionStatement, {
      expression: {
        callee: {
          type: 'Identifier',
          name: property,
        },
      },
    });
  }

  const LIFE_CYCLE_METHODS = [
    { expression: { callee: { name: "before" } } },
    { expression: { callee: { name: "beforeEach" } } },
    { expression: { callee: { name: "afterEach" } } },
    { expression: { callee: { name: "context" } } },
    { expression: { callee: { name: "after" } } }
  ];

  function isLifecycleHook(node) {
    return LIFE_CYCLE_METHODS.some(matcher => j.match(node, matcher));
  }
  const MODULE_INFO_CACHE = new Map();

  class ModuleInfo {
    constructor(p) {
      if (MODULE_INFO_CACHE.has(p)) {
        return MODULE_INFO_CACHE.get(p);
      }

      this.isEmberMochaDescribe = false;
      this.tests = [];
      this.lifecycles = [];
      this.body = p.node.expression.arguments[1].body;
      let describeBody = p.node.expression.arguments[1].body.body;

      describeBody.forEach(node => {
        let isAcceptanceTest = findStartAppAssignment(node)
        findDestroyAppCall(node);


        if (isSetupTypeMethod(node)) {
          let calleeName = node.expression.callee.name;
          let options = node.expression.arguments[1];

          if(options) {
            this.hasIntegrationFlag = options.properties.some(p => p.key.name === "integration");
          }

          if(calleeName === 'setupComponentTest') {
            if (this.hasIntegrationFlag) {
              this.setupType = "setupRenderingTest";
              this.subjectContainerKey = null;
            } else {
              this.setupType = "setupTest";
              this.subjectContainerKey = j.literal(`component:${node.expression.arguments[0].value}`);
            }
          }

          this.setupTypeMethodInvocationNode = node.expression;
          this.isEmberMochaDescribe = true;
        } else if (isAcceptanceTest) {
          this.hasIntegrationFlag = false;
          this.setupType = 'setupApplicationTest';
          this.subjectContainerKey = null;
          this.isEmberMochaDescribe = true;
          this.testVarDeclarationName = isAcceptanceTest.value.expression.left.name;

          // Add setupApplicationTest to beginning of body
          let exp = j.expressionStatement(
            j.callExpression(j.identifier('setupApplicationTest'), [])
          );
          this.body.body =  [exp, ...this.body.body];

          // remove startApp invocation
          j(isAcceptanceTest).remove();
        }

        let testPaths = j(node).find(j.ExpressionStatement, { expression: { callee: { name: 'it' } }}).paths();

        if (testPaths.length > 0) {
          testPaths.forEach(p => this.tests.push(p.value));
        }

        if (j.match(node, { expression: { callee: { name: "it" } } })) {
          this.tests.push(node.expression);
        }

        if (isLifecycleHook(node)) {
          this.lifecycles.push(node.expression);
        }
      });

      if (this.isEmberMochaDescribe === false) {
        let current = p.parentPath;

        while(current) {

          let matcher = { expression: { callee: { name: 'describe' } } };

          if (j.match(current.node, matcher)) {
            let parentMod = MODULE_INFO_CACHE.get(current);
            if (parentMod && parentMod.isEmberMochaDescribe) {
              this.isEmberMochaDescribe = true;
              this.setupType = parentMod.setupType;
              this.subjectContainerKey = this.subjectContainerKey;
            }
          }
          current = current.parentPath;
        }
      }

      MODULE_INFO_CACHE.set(p, this);
    }

    update() {
      this.updateSetupInvocation();

      this.updateTests();

      this.updateLifecycles();

      this.updateRegisterCalls();

      this.updateInjectCalls();

      this.processSubject();
    }

    updateSetupInvocation() {
      if (this.setupTypeMethodInvocationNode) {
        this.setupTypeMethodInvocationNode.arguments = [];
        this.setupTypeMethodInvocationNode.callee.name = this.setupType;
      }
    }

    _updateExpressionForTest(expression) {
      if (this.setupType === "setupRenderingTest") {
        processExpressionForRenderingTest(expression);
      } else if (this.setupType === 'setupApplicationTest') {
        processExpressionForApplicationTest(expression)
      }
    }

    updateTests() {
      this.tests.forEach(e => this._updateExpressionForTest(e));
    }

    updateLifecycles() {
      this.lifecycles.forEach(e => this._updateExpressionForTest(e));
    }

    updateRegisterCalls() {
      [...this.lifecycles, ...this.tests].forEach(updateRegisterCalls);
    }

    updateInjectCalls() {
      [...this.lifecycles, ...this.tests].forEach(updateInjectCalls);
    }

    processSubject() {
      [...this.lifecycles, ...this.tests].forEach(e => processSubject(e, this));
    }
  }

  function migrateAcceptanceTestImports() {
    let imports = root.find(j.ImportDeclaration);
    let foundStartApp = false;
    imports
      .find(j.ImportDefaultSpecifier, {
        local: {
          type: 'Identifier',
          name: 'startApp',
        },
      })
      .forEach(p => {
        foundStartApp = true;
        // add setupApplicationTest import
        ensureImportWithSpecifiers({
          source: 'ember-mocha',
          anchor: 'mocha',
          specifiers: ['setupApplicationTest'],
        });
        // ensure module import if acceptance test
        ensureImportWithSpecifiers({
          source: 'mocha',
          specifiers: ['describe'],
        });
        // remove existing moduleForAcceptance import
        j(p.parentPath.parentPath).remove();
      });

    // remove `destroyApp` import also
    if (foundStartApp) {
      imports.find(j.ImportDefaultSpecifier, {
        local: {
          type: 'Identifier',
          name: 'destroyApp'
        }
      }).forEach(p => {
        j(p.parentPath.parentPath).remove();
      })
    }
  }


  function updateRegisterCalls(e) {
    j(e)
      .find(j.MemberExpression, {
        object: { type: "ThisExpression" },
        property: { name: "register" }
      })
      .forEach(path => {
        let thisDotOwner = j.memberExpression(j.thisExpression(), j.identifier("owner"));
        path.replace(j.memberExpression(thisDotOwner, path.value.property));
      });
  }

  function updateOnCalls(node) {
    let ctx = j(node);
    let usages = ctx.find(j.CallExpression, {
      callee: {
        type: "MemberExpression",
        object: {
          type: "ThisExpression"
        },
        property: {
          name: "on"
        }
      }
    });

    usages.forEach(p => {
      let actionName = p.node.arguments[0].value;

      p.value.callee.property.name = "set";

      ctx.find(j.TemplateElement).forEach(e => {
        if (e.value.value.raw.indexOf(actionName) !== -1) {
          let currentValue = e.value.value.raw;
          let reg = new RegExp(`("|')${actionName}("|')`);

          e.value.value.raw = currentValue.replace(reg, actionName);
        }
      });
    });
  }

  function updateInjectCalls(node) {
    let ctx = j(node);
    ctx
      .find(j.CallExpression, {
        callee: {
          type: "MemberExpression",
          object: {
            object: {
              type: "ThisExpression"
            },
            property: {
              name: "inject"
            }
          }
        }
      })
      .forEach(p => {
        let injectType = p.node.callee.property.name;
        let injectedName = p.node.arguments[0].value;
        let localName = injectedName;
        if (p.node.arguments[1]) {
          let options = p.node.arguments[1];
          let as = options.properties.find(property => property.key.name === "as");
          if (as) {
            localName = as.value.value;
          }
        }
        let property = j.identifier(localName);
        // rudimentary attempt to confirm the property name is valid
        // as `this.propertyName`
        if (!localName.match(/^[a-zA-Z_][a-zA-Z0-9]+$/)) {
          // if not, use `this['property-name']`
          property = j.literal(localName);
        }
        let assignment = j.assignmentExpression(
          "=",
          j.memberExpression(j.thisExpression(), property),
          j.callExpression(
            j.memberExpression(
              j.memberExpression(j.thisExpression(), j.identifier("owner")),
              j.identifier("lookup")
            ),
            [j.literal(`${injectType}:${injectedName}`)]
          )
        );

        p.replace(assignment);
      });
  }

  function processSubject(testExpression, moduleInfo) {
    let subject = moduleInfo.subjectContainerKey;
    let thisDotSubjectUsage = j(testExpression).find(j.CallExpression, {
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'ThisExpression',
        },
        property: {
          name: 'subject',
        },
      },
    });

    if (thisDotSubjectUsage.size() === 0) {
      return;
    }

    thisDotSubjectUsage.forEach(p => {
      let options = p.node.arguments[0];
      let split = subject.value.split(':');
      let subjectType = split[0];
      let subjectName = split[1];
      let isSingletonSubject = ['model', 'component'].indexOf(subjectType) === -1;

      // if we don't have `options` and the type is a singleton type
      // use `this.owner.lookup(subject)`
      if (!options && isSingletonSubject) {
        p.replace(
          j.callExpression(
            j.memberExpression(
              j.memberExpression(j.thisExpression(), j.identifier('owner')),
              j.identifier('lookup')
            ),
            [subject]
          )
        );
      } else if (subjectType === 'model') {
        ensureImportWithSpecifiers({
          source: '@ember/runloop',
          specifiers: ['run'],
        });

        p.replace(
          j.callExpression(j.identifier('run'), [
            j.arrowFunctionExpression(
              [],
              j.callExpression(
                j.memberExpression(
                  j.callExpression(
                    j.memberExpression(
                      j.memberExpression(j.thisExpression(), j.identifier('owner')),
                      j.identifier('lookup')
                    ),
                    [j.literal('service:store')]
                  ),
                  j.identifier('createRecord')
                ),
                [j.literal(subjectName), options].filter(Boolean)
              ),
              true
            ),
          ])
        );
      } else {
        p.replace(
          j.callExpression(
            j.memberExpression(
              j.callExpression(
                j.memberExpression(
                  j.memberExpression(j.thisExpression(), j.identifier('owner')),
                  j.identifier('factoryFor')
                ),
                [subject]
              ),
              j.identifier('create')
            ),
            [options].filter(Boolean)
          )
        );
      }
    });
  }


  function findTestHelperUsageOf(collection, property) {
    return collection.find(j.ExpressionStatement, {
      expression: {
        callee: {
          object: {
            type: "ThisExpression"
          },
          property: {
            name: property
          }
        }
      }
    });
  }

  function processExpressionForRenderingTest(testExpression) {
    // mark the test function as an async function
    let testExpressionCollection = j(testExpression);
    let specifiers = new Set();

    // Transform to await render() or await clearRender()
    ["render", "clearRender"].forEach(type => {
      findTestHelperUsageOf(testExpressionCollection, type).forEach(p => {
        specifiers.add(type);

        let expression = p.get("expression");

        let awaitExpression = j.awaitExpression(
          j.callExpression(j.identifier(type), expression.node.arguments)
        );
        expression.replace(awaitExpression);
        p.scope.node.async = true;
      });
    });

    if (specifiers.size === 0) {
      specifiers.add("render");
    }
    ensureImportWithSpecifiers({
      source: "@ember/test-helpers",
      anchor: "ember-mocha",
      specifiers
    });

    // Migrate `this._element` -> `this.element`
    testExpressionCollection
      .find(j.MemberExpression, {
        object: {
          type: "ThisExpression"
        },
        property: {
          name: "_element"
        }
      })
      .forEach(p => {
        let property = p.get("property");
        property.node.name = "element";
      });
  }

  function ensureImport(source, anchor, method) {
    method = method || "insertAfter";

    let desiredImport = root.find(j.ImportDeclaration, { source: { value: source } });
    if (desiredImport.size() > 0) {
      return desiredImport;
    }

    let newImport = j.importDeclaration([], j.literal(source));
    let anchorImport = root.find(j.ImportDeclaration, { source: { value: anchor } });
    let imports = root.find(j.ImportDeclaration);
    if (anchorImport.size() > 0) {
      anchorImport.at(anchorImport.size() - 1)[method](newImport);
    } else if (imports.size() > 0) {
      // if anchor is not present, always add at the end
      imports.at(imports.size() - 1).insertAfter(newImport);
    } else {
      // if no imports are present, add as first statement
      root.get().node.program.body.unshift(newImport);
    }

    return j(newImport);
  }

  function ensureImportWithSpecifiers(options) {
    let source = options.source;
    let specifiers = options.specifiers;
    let anchor = options.anchor;
    let positionMethod = options.positionMethod;

    let importStatement = ensureImport(source, anchor, positionMethod);
    let combinedSpecifiers = new Set(specifiers);

    importStatement
      .find(j.ImportSpecifier)
      .forEach(i => combinedSpecifiers.add(i.node.imported.name))
      .remove();

    importStatement.get("specifiers").replace(
      Array.from(combinedSpecifiers)
      .sort()
      .map(s => j.importSpecifier(j.identifier(s)))
    );
  }

  function updateToNewEmberMochaImports() {
    let mapping = {
      setupComponentTest: "setupRenderingTest"
    };

    let emberMochaImports = root.find(j.ImportDeclaration, { source: { value: "ember-mocha" } });
    if (emberMochaImports.size() === 0) {
      return;
    }

    // Collect all imports from ember-mocha into local array
    let emberMochaSpecifiers = new Set();

    emberMochaImports
      .find(j.ImportSpecifier)
      .forEach(p => {
        // Map them to the new imports
        let importName = p.node.imported.name;
        let mappedName = mapping[importName] || importName;

        if (importName === "setupComponentTest") {
          root
            .find(j.ExpressionStatement, {
              expression: {
                callee: { name: "describe" }
              }
            })
            .forEach(p => {
              let mod = new ModuleInfo(p);
              if(mod.setupType) {
                emberMochaSpecifiers.add(mod.setupType);
              }
            });
        } else {
          emberMochaSpecifiers.add(mappedName);
        }
      })
    // Remove all existing import specifiers
      .remove();

    emberMochaImports
      .get("specifiers")
      .replace(Array.from(emberMochaSpecifiers).map(s => j.importSpecifier(j.identifier(s))));

    // If we have an empty import, remove the import declaration
    if (emberMochaSpecifiers.size === 0) {
      emberMochaImports.remove();
    }
  }

  function processDescribeBlock() {
    let describes = root.find(j.ExpressionStatement, {
      expression: {
        callee: { name: "describe" }
      }
    });

    if (describes.length === 0) {
      return;
    }

    describes.forEach(path => {
      let moduleInfo = new ModuleInfo(path);
      if (!moduleInfo.isEmberMochaDescribe) { return; }


      moduleInfo.update();


      updateOnCalls(path);


      if (moduleInfo.setupType === 'setupApplicationTest') {
        replaceApplicationTestVariableDeclarator(path, moduleInfo.testVarDeclarationName)
      }

      _relabelExistingRenders(path);
      _removeUnusedLifecycleHooks(path)
    })
  }

  function replaceApplicationTestVariableDeclarator(node, name) {
    j(node)
      .find(j.VariableDeclarator)
      .forEach(path => {
        if (path.node.id.name === name) {
          j(path.parent).remove();
        }
      });
  }

  function _relabelExistingRenders(path) {
    const hasExisting = j(path).find(j.VariableDeclarator, {
      id: {
        name: "render"
      }
    }).filter(p => {
      return p.parentPath.parentPath.value.kind === "let";
    });

    const curHook = j(path);
    // transforms render function expressions into async
    ["render"].forEach(type => {
      curHook.find(j.AssignmentExpression, {
        left: {
          type: "Identifier",
          name: "render"
        },
        right: {
          type: "ArrowFunctionExpression"
        }
      })
        .forEach(p => {
          // mark the right hand expression as an async function
          p.value.right.async = true;
        });
      curHook.find(j.CallExpression, {
        callee: {
          object: {
            type: "ThisExpression"
          },
          property: {
            name: type
          }
        }
      }).forEach(p => {
        let expression = p.get("expression");
        p.replace(j.callExpression(j.identifier(type), expression.node.arguments));
      });
    });

    const newAlias = "render2";
    const finder = a => a.type === "VariableDeclarator" && a.id.name === "render";
    j(path).find(j.VariableDeclaration, {
      kind: "let"
    })
    .filter(p => {
      return p.value.declarations.find(finder);
    })
      .forEach(p => {
        try {
          const { declarations } = p.value;
          const relevant = declarations.find(finder);
          relevant.id.name = newAlias;
        } catch (err) { } // eslint-disable-line no-empty
      });
    if (hasExisting.size() === 1) {
      j(path).find(j.AssignmentExpression, {
        left: {
          type: "Identifier",
          name: "render"
        },
        right: {
          type: "ArrowFunctionExpression"
        }
      }).forEach(p => {
        p.node.left.name = newAlias;
      });

      // rename renders in it blocks
      j(path).find(j.ExpressionStatement, {
        expression: {
          type: "CallExpression",
          callee: {
            name: "render"
          }
        }
      })
        .forEach(p => {
          p.node.expression.callee.name = newAlias;
          let expression = p.get("expression");
          let awaitExpression = j.awaitExpression(
            j.callExpression(j.identifier(newAlias), expression.node.arguments)
          );
          p.scope.node.async = true;
          expression.replace(awaitExpression);
        })
    }
}

  function _removeUnusedLifecycleHooks(path) {
    ['beforeEach', 'afterEach', 'before', 'after', 'context',].forEach(name => {
      j(path)
        .find(j.ExpressionStatement, {
          expression: {
            callee: {
              name
            }
          }
        })
        .forEach(node => {
          if (!node.value.expression.arguments[0].body) {
            return;
          }
          if (!node.value.expression.arguments[0].body.body.length >= 1) {
            j(node).remove()
          }
        });
    });
  }


  const printOptions = { quote: "single", wrapColumn: 100 };

  updateToNewEmberMochaImports();
  migrateAcceptanceTestImports();
  processDescribeBlock();

  return root.toSource(printOptions);
};
