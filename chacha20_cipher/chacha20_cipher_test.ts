import { test, runIfMain } from "https://deno.land/std/testing/mod.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { encode } from "https://denopkg.com/chiefbiiko/std-encoding/mod.ts";
import { chaCha20Cipher } from "./chacha20_cipher.ts";

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
  plaintext: Uint8Array;
  ciphertext: Uint8Array;
}

function loadTestVectors(): TestVector[] {
  return JSON.parse(
    new TextDecoder().decode(
      readFileSync(`${DIRNAME}/chacha20_cipher_test_vectors.json`)
    )
  ).map(
    (testVector: { [key: string]: any }): TestVector => ({
      key: encode(testVector.key, "hex"),
      nonce: encode(testVector.nonce, "hex"),
      counter: testVector.counter,
      plaintext: encode(testVector.plaintext, "hex"),
      ciphertext: encode(testVector.ciphertext, "hex")
    })
  );
}

const testVectors: TestVector[] = loadTestVectors();

testVectors.forEach(
  (
    { key, nonce, counter, plaintext, ciphertext }: TestVector,
    i: number
  ): void => {
    test({
      name: `chaCha20 encryption [${i}]`,
      fn(): void {
        assertEquals(
          chaCha20Cipher(key, nonce, counter, plaintext),
          ciphertext
        );
      }
    });
  }
);

testVectors.forEach(
  (
    { key, nonce, counter, plaintext, ciphertext }: TestVector,
    i: number
  ): void => {
    test({
      name: `chaCha20 decryption [${i}]`,
      fn(): void {
        assertEquals(
          chaCha20Cipher(key, nonce, counter, ciphertext),
          plaintext
        );
      }
    });
  }
);

runIfMain(import.meta, { parallel: true });
