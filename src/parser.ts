import { Stack, State } from "./types";

const last = <T>(stack: T[]): T => stack[stack.length - 1];

export const parse = (re: string): State[] => {
  const stack: Stack = [[]];
  let i = 0;

  while (i < re.length) {
    const next = re[i];
    switch (next) {
      case '.': {
        last(stack).push({
          type: 'wildcard',
          quantifier: 'exactlyOne'
        });
        i++;
        continue;
      }

      case '?': {
        const lastElement = last(last(stack));
        if (!lastElement || lastElement.quantifier !== 'exactlyOne') {
          throw new Error('Quantifier must follow an unquantified element or group');
        }
        lastElement.quantifier = 'zeroOrOne';
        i++;
        continue;
      }

      case '*': {
        const lastElement = last(last(stack));
        if (!lastElement || lastElement.quantifier !== 'exactlyOne') {
          throw new Error('Quantifier must follow an unquantified element or group');
        }
        lastElement.quantifier = 'zeroOrMore';
        i++;
        continue;
      }

      case '+': {
        const lastElement = last(last(stack));
        if (!lastElement || lastElement.quantifier !== 'exactlyOne') {
          throw new Error('Quantifier must follow an unquantified element or group');
        }
        last(stack).push({ ...lastElement, quantifier: 'zeroOrMore' });
        i++;
        continue;
      }

      case '(': {
        stack.push([]);
        i++;
        continue;
      }

      case ')': {
        if (stack.length <= 1) {
          throw new Error(`No group to close at index ${i}`);
        }
        const states = stack.pop()!;
        last(stack).push({
          type: 'groupElement',
          states,
          quantifier: 'exactlyOne'
        });
        i++;
        continue;
      }

      case '\\': {
        if (i + 1 >= re.length) {
          throw new Error(`Bad escape character at index ${i}`);
        }
        last(stack).push({
          type: 'element',
          value: re[i + 1],
          quantifier: 'exactlyOne'
        });
        i += 2;
        continue;
      }

      default: {
        last(stack).push({
          type: 'element',
          value: next,
          quantifier: 'exactlyOne'
        });
        i++;
        continue;
      }
    }
  }

  if (stack.length !== 1) {
    throw new Error('Unmatched groups in regular expression');
  }

  return stack[0];
}
