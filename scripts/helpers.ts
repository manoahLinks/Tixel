import * as P from 'micro-packed';
import { createAddress, addressToString, AddressVersion, StacksWireType } from '@stacks/transactions';
import { hex } from '@scure/base';
import { type Hex, pad, toHex, toBytes } from "viem";

export const remoteRecipientCoder = P.wrap<string>({
  encodeStream(w, value: string) {
    // createAddress
    const address = createAddress(value);
    P.bytes(11).encodeStream(w, new Uint8Array(11).fill(0));
    P.U8.encodeStream(w, address.version);
    P.bytes(20).encodeStream(w, hex.decode(address.hash160));
  },
  decodeStream(r) {
    // left pad
    P.bytes(11).decodeStream(r);
    // 1 version byte
    const version = P.U8.decodeStream(r);
    // 20 hash bytes
    const hash = P.bytes(20).decodeStream(r);
    return addressToString({
      hash160: hex.encode(hash),
      version: version as AddressVersion,
      type: StacksWireType.Address,
    });
  },
});

export function bytes32FromBytes(bytes: Uint8Array): Hex {
  return toHex(pad(bytes, { size: 32 }));
}

/** This is the value you use for remote recipient **/
const remoteRecipient = bytes32FromBytes(remoteRecipientCoder.encode("ST1F1M4YP67NV360FBYR28V7C599AC46F8C4635SH"))
console.log("remoteRecipient:", remoteRecipient);