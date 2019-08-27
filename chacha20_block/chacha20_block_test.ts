import { test, runIfMain } from "https://deno.land/std/testing/mod.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { encode } from "https://denopkg.com/chiefbiiko/std-encoding/mod.ts";
import { chaCha20Block } from "./chacha20_block.ts";

const {
  readFileSync,
  platform: { os }
} = Deno;

const DIRNAME =
  (os !== "win" ? "/" : "") +
  import.meta.url.replace(/^file:\/+|\/[^/]+$/g, "");

interface TestVector {
  key: Uint8Array;
  nonce: Uint8Array;
  counter: number;
  expected: Uint8Array;
}

function loadTestVectors(): TestVector[] {
  return JSON.parse(
    new TextDecoder().decode(
      readFileSync(`${DIRNAME}/chacha20_block_test_vectors.json`)
    )
  ).map(
    (testVector: { [key: string]: any }): TestVector => ({
      key: encode(testVector.key, "hex"),
      nonce: encode(testVector.nonce, "hex"),
      counter: testVector.counter,
      expected: encode(testVector.expected, "hex")
    })
  );
}

const testVectors: TestVector[] = loadTestVectors();

testVectors.forEach(
  ({ key, nonce, counter, expected }: TestVector, i: number): void => {
    test({
      name: `chaCha20Block [${i}]`,
      fn(): void {
        const actual: Uint8Array = new Uint8Array(64);

        chaCha20Block(key, nonce, counter, actual);

        assertEquals(actual, expected);
      }
    });
  }
);

testVectors.forEach(
  ({ key, nonce, counter, expected }: TestVector, i: number): void => {
    test({
      name: `chaCha20Block accepts external state [${i}]`,
      fn(): void {
        const actual: Uint8Array = new Uint8Array(64);
        const state: Uint32Array = new Uint32Array(16);
        let initialState: Uint32Array;

        chaCha20Block(key, nonce, counter, actual, state, initialState);

        assertEquals(actual, expected);
      }
    });
  }
);

runIfMain(import.meta, { parallel: true });
