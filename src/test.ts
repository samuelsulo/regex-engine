import { BacktrackStack, BacktrackState, State } from "./types";

export const test = (states: State[], str: string): [boolean, number] => {
  const queue = states.slice();
  let i = 0;
  const backtrackStack: BacktrackStack = [];
  let currentState = queue.shift();

  const backtrack = () => {
    queue.unshift(currentState!);
    let couldBacktrack = false;

    while (backtrackStack.length) {
      const { isBacktrackable, state, consumptions } = backtrackStack.pop()!;

      if (isBacktrackable) {
        if (consumptions.length === 0) {
          queue.unshift(state);
          continue;
        }
        const consumption = consumptions.pop()!;
        i -= consumption;
        backtrackStack.push({ isBacktrackable, state, consumptions });
        couldBacktrack = true;
        break;
      }

      queue.unshift(state);
      consumptions.forEach(n => { i -= n; });
    }

    if (couldBacktrack) {
      currentState = queue.shift();
    }
    return couldBacktrack;
  }

  while (currentState) {
    switch (currentState.quantifier) {
      case 'exactlyOne': {
        const [isMatch, consumed] = stateMatchesStringAtIndex(currentState, str, i);

        if (!isMatch) {
          const indexBeforeBacktracking = i;
          const couldBacktrack = backtrack();
          if (!couldBacktrack) {
            return [false, indexBeforeBacktracking];
          }
          continue;
        }

        backtrackStack.push({
          isBacktrackable: false,
          state: currentState,
          consumptions: [consumed]
        });
        i += consumed;
        currentState = queue.shift();
        continue;
      }

      case 'zeroOrOne': {
        if (i >= str.length) {
          backtrackStack.push({
            isBacktrackable: false,
            state: currentState,
            consumptions: [0]
          });
          currentState = queue.shift();
          continue;
        }

        const [isMatch, consumed] = stateMatchesStringAtIndex(currentState, str, i);
        i += consumed;
        backtrackStack.push({
          isBacktrackable: isMatch && consumed > 0,
          state: currentState,
          consumptions: [consumed]
        });
        currentState = queue.shift();
        continue;
      }

      case 'zeroOrMore': {
        const backtrackState: BacktrackState = {
          isBacktrackable: true,
          state: currentState,
          consumptions: []
        }
        while (true) {
          if (i >= str.length) {
            if (backtrackState.consumptions.length === 0) {
              backtrackState.isBacktrackable = false;
              backtrackState.consumptions.push(0);
            }
            backtrackStack.push(backtrackState);
            currentState = queue.shift();
            break;
          }

          const [isMatch, consumed] = stateMatchesStringAtIndex(currentState, str, i);
          if (!isMatch || consumed === 0) {
            if (backtrackState.consumptions.length === 0) {
              backtrackState.isBacktrackable = false;
              backtrackState.consumptions.push(0);
            }
            backtrackStack.push(backtrackState);
            currentState = queue.shift();
            break;
          }

          backtrackState.consumptions.push(consumed);
          i += consumed;
        }
        continue;
      }

      default: {
        throw new Error('Unsupported operation');
      }
    }
  }

  return [true, i];
}

const stateMatchesStringAtIndex = (  
  state: State, 
  str: string, 
  i: number
): [boolean, number] => {
  if (i >= str.length) {
    return [false, 0];
  }

  if (state.type === 'wildcard') {
    return [true, 1];
  }

  if (state.type === 'element') {
    const match = state.value === str[i];
    return [match, match ? 1 : 0];
  }

  return test(state.states, str.slice(i));
}