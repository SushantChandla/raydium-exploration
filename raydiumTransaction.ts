// ANCHOR_WALLET=$HOME/.config/solana/id.json ANCHOR_PROVIDER_URL=rpc  ts-node raydiumTransaction.ts
import * as anchor from "@project-serum/anchor";
import {
  program,
  readStorage,
  SOL_USDC_POOL_1_FILE,
  SOL_USDC_POOL_2_FILE,
  solUsdcPool1,
  solUsdcPool2,
  writeDataToStorage,
} from "./common";
import { PublicKey } from "@solana/web3.js";

const signaturesToAnalyze = 1000;

async function fetchLast1000TransactionsForAccountAndSaveInFile(
  filePath: string,
  account: PublicKey
) {
  const allPastSignatures: Array<anchor.web3.ConfirmedSignatureInfo> = [];
  while (allPastSignatures.length < signaturesToAnalyze) {
    const signatures =
      await program.provider.connection.getSignaturesForAddress(
        account,
        {
          limit: 1000,
        },
        "confirmed"
      );
    allPastSignatures.push(...signatures);
  }

  const transactionMetadata: object[] = readStorage(filePath);
  // const batchSize = 100;

  // for (let i = 0; i < allPastSignatures.length; i += batchSize) {
  //   const batch = allPastSignatures.slice(i, i + batchSize);
  //   const batchPromises = batch.map((signatures) =>
  const parsedTransactions =
    await program.provider.connection.getParsedTransactions(
      allPastSignatures.filter((s) => s.err == null).map((s) => s.signature),
      {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0,
        
      }
    );
  // );

  // const batchResults = await Promise.all(batchPromises);
  // const batchResultsWithFilteredNonNullData = batchResults.filter(
  //   (result) => result !== null
  // );
  const nonNullParsedTransactions = parsedTransactions.filter(
    (result) => result !== null
  );

  transactionMetadata.push(...nonNullParsedTransactions);
  writeDataToStorage(filePath, transactionMetadata);
  // }
}

void fetchLast1000TransactionsForAccountAndSaveInFile(
  SOL_USDC_POOL_1_FILE,
  solUsdcPool1
);
void fetchLast1000TransactionsForAccountAndSaveInFile(
  SOL_USDC_POOL_2_FILE,
  solUsdcPool2
);
