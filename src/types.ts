export type BaseState = { 
  type: string; 
  quantifier: string; 
};

export type Element = BaseState & {
  type: 'element';
  value: string;
};

export type GroupElement = BaseState & {
  type: 'groupElement';
  states: State[];
};

export type Wildcard = BaseState & {
  type: 'wildcard';
};

export type State =
  | Element
  | GroupElement
  | Wildcard;

export type Stack = State[][];

export type BacktrackState = {
  isBacktrackable: boolean;
  state: State;
  consumptions: number[];
}

export type BacktrackStack = BacktrackState[];