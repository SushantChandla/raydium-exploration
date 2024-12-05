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

  const swapEvents: {
    event: string;
    blockTime: number | null | undefined;
    exactOutput: boolean;
    inputMint: string;
    outputMint: string;
  }[] = [];
  for (const transaction of transactions) {
    if (!transaction.meta) continue;
    if (transaction.meta.err != null) continue;
    if (!transaction.meta.logMessages) continue;
    const logs = transaction.meta.logMessages;

    // Program CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C invoke []
    const indexesWithProgramMessage = [];
    for (const [index, log] of logs.entries()) {
      if (
        log.startsWith(
          "Program CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C invoke"
        )
      ) {
        indexesWithProgramMessage.push(index);
      }
    }

    for (const index of indexesWithProgramMessage) {
      if (
        logs[index + 1].startsWith("Program log: Instruction: SwapBaseOutput")
      ) {
        swapEvents.push({
          event: logs[index + 2],
          blockTime: transaction.blockTime,
          exactOutput: true,
          inputMint: 
          outputMint: 
        });
      } else if (
        logs[index + 1].startsWith("Program log: Instruction: SwapBaseInput")
      ) {
        swapEvents.push(logs[index + 2]);
      }
    }
  }
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
