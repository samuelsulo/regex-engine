import { Regex } from "../src";

const regex = new Regex('a(b)+.c'); 

console.log(regex.test('abbbbbc'));
console.log(regex.test('ac'));
console.log(regex.test('abcc'));