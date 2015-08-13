export function removeCommaAndRespectiveWhitespaceTokens(tokens) {
  let sanitizedTokens = [];
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].tokenType === ',') {
      if (sanitizedTokens[i-1].tokenType === 'WHITESPACE') {
        sanitizedTokens.pop();
      }

      if (tokens[i+1].tokenType === 'WHITESPACE') {
        i++;
      }
    } else {
      sanitizedTokens.push(tokens[i]);
    }
  }

  return sanitizedTokens;
}

export function trimWhitespaceTokens(tokens) {
  var startIndex = 0;
  var endIndex = tokens.length;

  while (tokens[startIndex].tokenType === 'WHITESPACE') { startIndex++; }
  while (tokens[endIndex-1].tokenType === 'WHITESPACE') { endIndex--; }

  return tokens.slice(startIndex, endIndex);
}
