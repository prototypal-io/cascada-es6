function tok(source) {
  return {
    type: 'Token',
    source: source
  };
}

function number(value) {
  return {
    type: 'Number',
    value: value,
    source: value.toString(),
  };
}

function ident(name) {
  return {
    type: 'Ident',
    name: name,
    source: name
  };
}

function func(name, args) {
  return {
    type: 'Function',
    name: name,
    args: args
  };
}

function ws() {
  return tok(' ');
}

function comma() {
  return tok(',');
}

export default {
  tok,
  ws,
  comma,
  number,
  ident,
  func
};
