
// ANCHOR_WALLET=$HOME/.config/solana/id.json ANCHOR_PROVIDER_URL=rpc  ts-node printPool.ts > pools.json

import { program } from "./common";

const printPools = async () => {
  const pools = await program.account.poolState.all();
  console.log(JSON.stringify(pools, null, 2));
};
void printPools();
