import { program, readStorage, writeDataToStorage } from "./common";
import { IDL, RaydiumCpSwap } from "./raydiumCpSwap";
import * as anchor from "@project-serum/anchor";
import { BN } from "@project-serum/anchor";
import Big from "big.js";

type Data = {
  call_block_slot: bigint;
  call_block_date: Date;
  call_block_time: string; // Using string for "timestamp with time zone"
  call_block_hash: string;
  call_tx_index: number;
  call_inner_instruction_index: number;
  call_outer_instruction_index: number;
  call_inner_executing_account: string;
  call_outer_executing_account: string;
  call_executing_account: string;
  call_is_inner: boolean;
  call_program_name: string;
  call_instruction_name: string;
  call_version: string;
  call_data: Uint8Array; // varbinary maps to Uint8Array
  call_account_arguments: string[];
  call_inner_instructions: Array<{
    data: string;
    executing_account: string;
    account_arguments: string[];
  }>;
  call_tx_id: string;
  call_tx_signer: string;
  call_log_messages: string[];
  account_ammConfig: string;
  account_authority: string;
  account_inputTokenAccount: string;
  account_inputTokenMint: string;
  account_inputTokenProgram: string;
  account_inputVault: string;
  account_observationState: string;
  account_outputTokenAccount: string;
  account_outputTokenMint: string;
  account_outputTokenProgram: string;
  account_outputVault: string;
  account_payer: string;
  account_poolState: string;
  amountIn: bigint; // uint256 maps to bigint
  minimumAmountOut: bigint; // uint256 maps to bigint
};

const data: {
  instructionCalledAtTime: Date;
  solVaultBefore: string;
  usdcVaultBefore: string;
  solAmountChange: string;
  usdAmountChange: string;
  solUnused: number;
  usdUnused: number;
}[] = [];

const dataFunction = () => {
  console.log("hello");
  const transactions: Data[] = readStorage(
    "jsons/formattedRadiumPool1.json",
  ) as unknown[] as Data[];

  const transactionsContaningMultipleSwapsWithPool = 0;
  for (let i = 0; i < transactions.length; i++) {
    for (let j = i + 1; j < transactions.length; j++) {
      if (transactions[i].call_tx_id == transactions[j].call_tx_id) {
        transactionsContaningMultipleSwapsWithPool + 1;
      }
    }
  }

  const swapEvents: {
    transactionId: string;
    swapBaseOutput: boolean;
    eventLog: string;
  }[] = [];
  for (const transaction of transactions) {
    const logs = transaction.call_log_messages;
    // Program CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C invoke []
    const indexesWithProgramMessage = [];
    for (const [index, log] of logs.entries()) {
      if (
        log.startsWith(
          "Program CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C invoke",
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
          transactionId: transaction.call_tx_id,
          eventLog: logs[index + 2],
          swapBaseOutput: false,
        });
      } else if (
        logs[index + 1].startsWith("Program log: Instruction: SwapBaseInput")
      ) {
        swapEvents.push({
          transactionId: transaction.call_tx_id,
          eventLog: logs[index + 2],
          swapBaseOutput: true,
        });
      }
    }
  }
  console.log(swapEvents.length);
  console.log(transactionsContaningMultipleSwapsWithPool, transactions.length);

  for (const transaction of transactions) {
    const event = swapEvents.find(
      (transaction1) => transaction1.transactionId === transaction.call_tx_id,
    );
    if (!event) {
      console.log("Event is not swap event");
      continue;
    }

    const eventData = program.coder.events.decode(
      event.eventLog.split("Program data: ")[1],
    );

    if (!eventData || eventData.name !== "SwapEvent") {
      console.log(
        "Event data is null",
        event.eventLog.split("Program data: ")[1],
        event,
        eventData,
      );
      continue;
    }
    console.log(eventData);

    if (
      eventData.data.poolId.toString() !==
      "7JuwJuNU88gurFnyWeiyGKbFmExMWcmRZntn9imEzdny"
    ) {
      console.log("POOL_ID_INVALID", eventData.data.poolId.toString());
      continue;
    }

    let solVaultBefore;
    let solAmountChange;
    if (
      transaction.account_inputVault ===
      "So11111111111111111111111111111111111111112"
    ) {
      solVaultBefore = eventData.data.inputVaultBefore.toNumber();
      solAmountChange = eventData.data.inputAmount.toNumber();
    } else {
      solVaultBefore = eventData.data.outputVaultBefore.toNumber();
      solAmountChange = eventData.data.outputAmount.toNumber() * -1;
    }

    let usdcVaultBefore;
    let usdAmountChange;
    if (
      transaction.account_inputVault ===
      "So11111111111111111111111111111111111111112"
    ) {
      usdcVaultBefore = eventData.data.outputVaultBefore.toNumber();
      usdAmountChange = eventData.data.outputAmount.toNumber() * -1;
    } else {
      usdcVaultBefore = eventData.data.inputVaultBefore.toNumber();
      usdAmountChange = eventData.data.inputAmount.toNumber();
    }

    const solUnused = Math.min(
      ((solVaultBefore - solAmountChange) / solVaultBefore) * 100,
      100,
    );
    const usdUnused = Math.min(
      ((usdcVaultBefore - usdAmountChange) / usdcVaultBefore) * 100,
      100,
    );

    if (usdAmountChange >= usdcVaultBefore) {
      console.log("WHAT???");
      continue;
    }

    data.push({
      instructionCalledAtTime: new Date(transaction.call_block_time),
      solVaultBefore: solVaultBefore,
      usdcVaultBefore: usdcVaultBefore,
      solAmountChange,
      usdAmountChange,
      solUnused,
      usdUnused,
    });
  }

  data.sort(
    (a, b) =>
      a.instructionCalledAtTime.getTime() - b.instructionCalledAtTime.getTime(),
  );

  writeDataToStorage(
    "/Users/sushantchandla/Documents/raydium-exploration/result4.json",
    data,
  );
  console.log(data);
};

void dataFunction();
