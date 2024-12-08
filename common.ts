import { IDL, RaydiumCpSwap } from "./raydiumCpSwap";

import * as anchor from "@project-serum/anchor";
import { BorshCoder, EventParser, Program } from "@project-serum/anchor";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { PublicKey } from "@solana/web3.js";

import { readFileSync, writeFileSync } from "fs";
export const wallet = NodeWallet.local();
export const provider = anchor.AnchorProvider.env();

const RAYDIUM_CP_SWAP_KEY = "CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C";
export const program = new Program<RaydiumCpSwap>(
  IDL,
  RAYDIUM_CP_SWAP_KEY,
  provider,
);

//
// sol usd pool:
//  - Hx6EoXCzvYzcdtTvEm2QsXUFVe9pJzhH9FuMxmLw589D //  very less recent transactions ignored for exploration
// - 7JuwJuNU88gurFnyWeiyGKbFmExMWcmRZntn9imEzdny // this one has high volumne, so we will use this one
// - FdyhqDuVfQLe5P9QBySvAEf1wSHFDfvS7zpZo8ZT8PVM // this one has the 2nd highest volume
// - 6ZUSFy467HZ3TYj3HHGr8gExNkAE3SzRNVmHTBE7QJcm // very less recent transactions ignored for exploration
//

export const solUsdcPool1 = new PublicKey(
  "7JuwJuNU88gurFnyWeiyGKbFmExMWcmRZntn9imEzdny",
);

export const solUsdcPool2 = new PublicKey(
  "FdyhqDuVfQLe5P9QBySvAEf1wSHFDfvS7zpZo8ZT8PVM",
);

export const SOL_USDC_POOL_1_FILE = "./sol_usdc_pool1.json";
export const SOL_USDC_POOL_2_FILE = "./sol_usdc_pool2.json";

export const readStorage = (filePath: string) => {
  const transactionFile = readFileSync(filePath);
  if (transactionFile.toString() != "") {
    return JSON.parse(transactionFile.toString()) as object[];
  }
  return JSON.parse("[]") as object[];
};

export const writeDataToStorage = (filePath: string, data: object) => {
  writeFileSync(filePath, JSON.stringify(data, null, 2));
};

export const eventParser = new EventParser(
  program.programId,
  new BorshCoder(program.idl),
);

export type SwapEvent = anchor.IdlEvents<RaydiumCpSwap>["SwapEvent"];
