/**
 * The maximum allowed value for an entry revision. Setting an entry revision to this value prevents it from being updated further.
 */
export declare const MAX_REVISION: bigint;
/**
 * Checks if the provided bigint can fit in a 64-bit unsigned integer.
 *
 * @param int - The provided integer.
 * @throws - Will throw if the int does not fit in 64 bits.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt/asUintN | MDN Demo}
 */
export declare function assertUint64(int: bigint): void;
//# sourceMappingURL=number.d.ts.map