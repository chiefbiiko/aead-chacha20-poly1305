import {
  chaCha20QuarterRound
} from "./../chacha20_quarter_round/chacha20_quarter_round.ts";

import {
  numberToFourLittleEndianBytes,
  fourLittleEndianBytesToNumber
} from "./../util/util.ts";

export function chaCha20Block(
  key: Uint8Array,
  nonce: Uint8Array,
  counter: number,
  out: Uint8Array
): void {
  if (key.length !== 32) {
    throw new TypeError("key must have 32 bytes");
  }
  if (nonce.length !== 12) {
    throw new TypeError("nonce must have 12 bytes");
  }
  if (counter < 0 || counter % 1) {
    throw new TypeError("counter must be an unsigned integer");
  }
  if (out.length !== 64) {
    throw new TypeError("out must have 64 bytes");
  }
  const state = new Uint32Array(16);
  state[0] = 0x61707865;
  state[1] = 0x3320646e;
  state[2] = 0x79622d32;
  state[3] = 0x6b206574;
  state[4] = fourLittleEndianBytesToNumber(key, 0);
  state[5] = fourLittleEndianBytesToNumber(key, 4);
  state[6] = fourLittleEndianBytesToNumber(key, 8);
  state[7] = fourLittleEndianBytesToNumber(key, 12);
  state[8] = fourLittleEndianBytesToNumber(key, 16);
  state[9] = fourLittleEndianBytesToNumber(key, 20);
  state[10] = fourLittleEndianBytesToNumber(key, 24);
  state[11] = fourLittleEndianBytesToNumber(key, 28);
  state[12] = counter & 0xffffffff;
  state[13] = fourLittleEndianBytesToNumber(nonce, 0);
  state[14] = fourLittleEndianBytesToNumber(nonce, 4);
  state[15] = fourLittleEndianBytesToNumber(nonce, 8);
  const initialState: Uint32Array = Uint32Array.from(state);
  let i: number;
  for (i = 0; i < 10; ++i) {
    chaCha20QuarterRound(state, 0, 4, 8, 12);
    chaCha20QuarterRound(state, 1, 5, 9, 13);
    chaCha20QuarterRound(state, 2, 6, 10, 14);
    chaCha20QuarterRound(state, 3, 7, 11, 15);
    chaCha20QuarterRound(state, 0, 5, 10, 15);
    chaCha20QuarterRound(state, 1, 6, 11, 12);
    chaCha20QuarterRound(state, 2, 7, 8, 13);
    chaCha20QuarterRound(state, 3, 4, 9, 14);
  }
  for (i = 0; i < 16; ++i) {
    state[i] += initialState[i];
  }
  for (i = 0; i < 16; ++i) {
    numberToFourLittleEndianBytes(out, 4 * i, state[i]);
  }
}