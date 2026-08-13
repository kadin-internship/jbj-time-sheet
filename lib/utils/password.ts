import { randomInt } from "node:crypto";

const WORDS = [
  "amber", "birch", "cedar", "delta", "ember", "flint", "grove", "haven",
  "ivory", "jade", "kiln", "lumen", "maple", "nova", "opal", "pine",
  "quartz", "river", "slate", "tide", "unity", "vale", "willow", "yarrow",
];

export function generateTempPassword(): string {
  const word = WORDS[randomInt(WORDS.length)];
  const number = randomInt(1000, 9999);
  return `${word[0].toUpperCase()}${word.slice(1)}${number}!`;
}
