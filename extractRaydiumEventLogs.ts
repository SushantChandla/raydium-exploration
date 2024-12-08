import * as anchor from "@project-serum/anchor";
import {
  readStorage,
  SOL_USDC_POOL_1_FILE,
  SOL_USDC_POOL_2_FILE,
  writeDataToStorage,
} from "./common";

// anchor.web3.ParsedTransactionWithMeta
const getRaydiumSwapEventsFromTransaction = (
  filePath: string,
  outputFilePrefix: string
) => {
  const transactions: anchor.web3.ParsedTransactionWitxhMeta[] = readStorage(
    filePath
  ) as unknown[] as anchor.web3.ParsedTransactionWithMeta[];

  writeDataToStorage(`${outputFilePrefix}-events.json`, swapEvents);
};

void getRaydiumSwapEventsFromTransaction(
  SOL_USDC_POOL_1_FILE,
  "SOL_USDC_POOL_1"
);
void getRaydiumSwapEventsFromTransaction(
  SOL_USDC_POOL_2_FILE,
  "SOL_USDC_POOL_2"
);
