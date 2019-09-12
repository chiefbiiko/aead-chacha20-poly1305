import { chacha20 } from "./chacha20/chacha20.ts";
import { poly1305KeyGen } from "./poly1305_key_gen/poly1305_key_gen.ts";
import { poly1305 } from "./poly1305/poly1305.ts";
import { constantTimeEqual } from "./constant_time_equal/constant_time_equal.ts";
import { chacha20Poly1305Construct } from "./chacha20_poly1305_construct/chacha20_poly1305_construct.ts";
import { hchacha20 } from "./hchacha20/hchacha20.ts";

export const KEY_BYTES: number = 32;
export const NONCE_BYTES: number = 24;
export const PLAINTEXT_BYTES_MAX: bigint = 274877906880n;
export const CIPHERTEXT_BYTES_MAX: bigint = 274877906896n;
export const AAD_BYTES_MAX: bigint = 18446744073709551615n;
export const TAG_BYTES: number = 16;

// TODO
export function Xchacha20Poly1305Seal(
  key: Uint8Array,
  nonce: Uint8Array,
  plaintext: Uint8Array,
  aad: Uint8Array
): { ciphertext: Uint8Array; tag: Uint8Array; aad: Uint8Array } {
  if (key.byteLength !== KEY_BYTES) {
    return null;
  }

  if (nonce.byteLength !== NONCE_BYTES) {
    return null;
  }

  if (plaintext.byteLength > PLAINTEXT_BYTES_MAX) {
    return null;
  }

  if (aad.byteLength > AAD_BYTES_MAX) {
    return null;
  }

  throw Error("unimplemented");

  const subKey: Uint8Array = new Uint8Array(32);

  hchacha20(subKey, key, nonce.subarray(0, 16));

  const shortNonce: Uint8Array = new Uint8Array(12);

  shortNonce.set(nonce.subarray(16, 24));

  const otk: Uint8Array = poly1305KeyGen(subKey, shortNonce);

  const ciphertext: Uint8Array = new Uint8Array(plaintext.byteLength);

  chacha20(ciphertext, subKey, shortNonce, 1, plaintext);

  const pac: Uint8Array = chacha20Poly1305Construct(ciphertext, aad);

  const tag: Uint8Array = poly1305(otk, pac);

  subKey.fill(0x00, 0, subKey.byteLength);
  otk.fill(0x00, 0, otk.byteLength);

  console.error("$$$$$$$$$$$$$$$$$$$$$$$$", { ciphertext, tag, aad })

  return { ciphertext, tag, aad };
}

export function Xchacha20Poly1305Open(
  key: Uint8Array,
  nonce: Uint8Array,
  ciphertext: Uint8Array,
  aad: Uint8Array,
  receivedTag: Uint8Array
): Uint8Array {
  if (key.byteLength !== KEY_BYTES) {
    // throw new TypeError(`key must have ${KEY_BYTES} bytes`);
    return null;
  }

  if (nonce.byteLength !== NONCE_BYTES) {
    // throw new TypeError(`nonce must have ${NONCE_BYTES} bytes`);
    return null;
  }

  if (ciphertext.byteLength > CIPHERTEXT_BYTES_MAX) {
    // throw new TypeError(
    //   `plaintext must not have more than ${PLAINTEXT_BYTES_MAX} bytes`
    // );
    return null;
  }

  if (aad.byteLength > AAD_BYTES_MAX) {
    // throw new TypeError(`aad must not have more than ${AAD_BYTES_MAX} bytes`);
    return null;
  }

  if (receivedTag.byteLength !== TAG_BYTES) {
    // throw new TypeError(`receivedTag must have ${TAG_BYTES} bytes`);
    return null;
  }

  // const otk: Uint8Array = poly1305KeyGen(key, nonce);
  // const pac: Uint8Array = chacha20Poly1305Construct(ciphertext, aad);
  // const tag: Uint8Array = poly1305(otk, pac);
  //
  // otk.fill(0x00, 0, otk.byteLength);
  //
  // if (!constantTimeEqual(receivedTag, tag)) {
  //   return null;
  // }
  //
  // const plaintext: Uint8Array = new Uint8Array(ciphertext.byteLength);
  //
  // chacha20(plaintext, key, nonce, 1, ciphertext)

  // return plaintext;
}
