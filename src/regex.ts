import { parse } from "./parser";
import { test } from "./test";
import { State } from "./types";

export class Regex {
  private regex: string;
  private states: State[];

  constructor(regex: string) {
    this.regex = regex;
    this.states = parse(this.regex);
  }

  test(str: string): [boolean, number] {
    return test(this.states, str);
  }
}