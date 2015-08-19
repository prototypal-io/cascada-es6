import { Parser } from './parser';
import css from './parse-css';
import types from './types';

export function parse(source, options) {
  let parser = new Parser(options);

  return parser.acceptStylesheet(
    css.parseAStylesheet(source)
  );
}

export default types;
