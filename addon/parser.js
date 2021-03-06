import css from './parse-css';
import * as parserHelpers from './parser-helpers';

export class Parser {
  constructor(options = {}) {
    this.customFunctions = {};

    for (let name in options.customFunctions) {
      this.registerFunction(name, options.customFunctions[name]);
    }
  }

  registerFunction(name, callback) {
    this.customFunctions[name] = callback;
  }

  acceptStylesheet(node) {
    return {
      type: 'StyleSheet',
      rules: this.acceptRules(node.value)
    };
  }

  acceptRules(nodes) {
    return nodes.map(this.acceptRule.bind(this));
  }

  acceptRule(node) {
    switch (node.type) {
      case 'QUALIFIED-RULE': return this.acceptStyleRule(node);
      case 'AT-RULE':        return this.acceptAtRule(node);
      default: throw new Error("Unknown rule type: " + node.type);
    }
  }

  acceptStyleRule(node) {
    return {
      type: 'StyleRule',
      selectors: [ this.acceptSelector(node.prelude) ],
      body: this.acceptDeclarations(node.value.value, this.acceptStyleDeclaration.bind(this))
    };
  }

  acceptSelector(tokens) {
    return tokens.map(function (token) {
      return token.toSource();
    }).join('').trimRight();
  }

  acceptDeclarations(tokens, acceptor) {
    var nodes = css.consumeAListOfDeclarations(
      new css.TokenStream(tokens)
    );

    return nodes.map(function (node) {
      return acceptor(node);
    });
  }

  acceptStyleDeclaration(node) {
    switch (node.type) {
      case 'DECLARATION': return this.acceptStylePropertyDeclaration(node);
      case 'AT-RULE':     return this.acceptAtRule(node);
      default: throw new Error("Unknown style declaration type: " + node.type);
    }
  }

  acceptStylePropertyDeclaration(node) {
    return {
      type: 'StylePropertyDeclaration',
      important: node.important,
      name: node.name,
      values: this.acceptComponentValues(node.value)
    };
  }

  acceptComponentValues(parts) {
    return parserHelpers.trimWhitespaceTokens(parts).map(this.acceptComponentValue.bind(this));
  }

  acceptComponentValue(node) {
    switch (node.tokenType) {
      case 'WHITESPACE': return this.acceptToken(node);
      case 'DELIM':      return this.acceptToken(node);
      case ',':          return this.acceptToken(node);
      case 'IDENT':      return this.acceptIdent(node);
      case 'HASH':       return this.acceptHash(node);
      case 'STRING':     return this.acceptString(node);
      case 'NUMBER':     return this.acceptNumber(node);
      case 'DIMENSION':  return this.acceptDimension(node);
      case 'PERCENTAGE': return this.acceptPercentage(node);
    }

    switch (node.type) {
      // case 'integer':    return acceptInteger(node);
      case 'FUNCTION':   return this.acceptFunction(node);
    }

    throw new Error("Unknown component value: <" + node.tokenType + ", " + node.type + ">");
  }

  acceptToken(node) {
    return {
      type: "Token",
      source: node.toSource()
    };
  }

  acceptIdent(node) {
    return {
      type: "Ident",
      name: node.value,
      source: node.toSource()
    };
  }

  acceptHash(node) {
    return {
      type: "Hash",
      value: node.value,
      source: node.toSource()
    };
  }

  acceptString(node) {
    return {
      type: "String",
      value: node.value,
      source: node.toSource()
    };
  }

  acceptNumber(node) {
    return {
      type: "Number",
      value: node.value,
      source: node.toSource()
    };
  }

  acceptDimension(node) {
    return {
      type: "Dimension",
      value: node.value,
      unit: node.unit,
      source: node.toSource()
    };
  }

  acceptPercentage(node) {
    return {
      type: "Percentage",
      value: node.value,
      source: node.toSource()
    };
  }

  acceptFunction(node) {
    if (this.customFunctions[node.name]) {
      return {
        type: "Function",
        name: node.name,
        args: this.acceptCommaSeparatedComponentValues(node.value)
      };
    } else {
      return {
        type: "Function",
        name: node.name,
        args: this.acceptComponentValues(node.value)
      };
    }
  }

  acceptCommaSeparatedComponentValues(parts) {
    let cleanParts = parserHelpers.removeCommaAndRespectiveWhitespaceTokens(parts);
    return cleanParts.map(this.acceptComponentValue.bind(this));
  }

  printValue(parts) {
    return parts.map(function (part) {
      if (part.tokenType) {
        return part.toSource();
      } else if (part.type === 'FUNCTION') {
        return part.name + '(' + this.printValue(part.value) + ')';
      } else {
        throw new Error("Unsupported value part: " + JSON.stringify(part.toJSON()));
      }
    }).join('');
  }

  acceptMixinStyleDeclaration(node) {
    switch (node.type) {
      case 'DECLARATION': return this.acceptStylePropertyDeclaration(node);
      default: throw new Error("Unknown style declaration type: " + node.type);
    }
  }

  acceptAtRule(node) {
    return {
      type: 'AtRule',
      name: node.name,
      prelude: node.prelude,
      value: node.value
    };
  }
}
