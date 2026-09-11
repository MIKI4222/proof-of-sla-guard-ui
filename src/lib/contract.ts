// Single integration point with genlayer-js.
// Every call to the Intelligent Contract goes through this module, so if the
// SDK signature changes only this file needs to be touched.

import { createClient } from "genlayer-js"
import { CONTRACT_ADDRESS, RPC_ENDPOINT, bradburyChain } from "../config/genlayer"

type CallArgs = Array<string | number | boolean>

/* eslint-disable @typescript-eslint/no-explicit-any */
let cachedReadClient: any = null

function readClient(): any {
	if (!cachedReadClient) {
		cachedReadClient = createClient({
			chain: bradburyChain as any,
			endpoint: RPC_ENDPOINT,
		} as any)
	}
	return cachedReadClient
}

function writeClient(account: string): any {
	return createClient({
		chain: bradburyChain as any,
		endpoint: RPC_ENDPOINT,
		account: account as any,
	} as any)
}

/** Human readable message out of an SDK / wallet error. */
export function describeError(error: unknown): string {
	if (!error) return "Unknown error"
	const anyError = error as any
	const raw =
		anyError?.shortMessage ??
		anyError?.details ??
		anyError?.message ??
		(typeof error === "string" ? error : JSON.stringify(error))
	const text = String(raw)
	if (/user rejected|denied transaction/i.test(text)) return "Transaction rejected in the wallet"
	if (/leader timeout/i.test(text))
		return "Leader timeout: validators ran out of time on this endpoint. Send the claim again."
	if (/insufficient/i.test(text)) return "Insufficient balance for this transaction"
	if (/contract code not found|could not load contract schema/i.test(text))
		return "Contract not found at the configured address. Check VITE_CONTRACT_ADDRESS."
	return text.length > 240 ? text.slice(0, 237) + "…" : text
}

export async function readMethod<T = unknown>(
	functionName: string,
	args: CallArgs = [],
): Promise<T> {
	const result = await readClient().readContract({
		address: CONTRACT_ADDRESS,
		functionName,
		args,
	})
	return result as T
}

export async function writeMethod(options: {
	account: string
	functionName: string
	args?: CallArgs
	value?: bigint
}): Promise<string> {
	const hash = await writeClient(options.account).writeContract({
		address: CONTRACT_ADDRESS,
		functionName: options.functionName,
		args: options.args ?? [],
		value: options.value ?? 0n,
	})
	return String(hash)
}

/** Waits until the transaction is FINALIZED (not just ACCEPTED). */
export async function waitForFinalized(hash: string): Promise<any> {
	return readClient().waitForTransactionReceipt({
		hash,
		status: "FINALIZED",
		retries: 200,
		interval: 3000,
	})
}

/** Reads the return value produced by a finalized write transaction. */
export function receiptReturnValue(receipt: any): unknown {
	return (
		receipt?.result ??
		receipt?.returnValue ??
		receipt?.data?.result ??
		receipt?.consensus_data?.leader_receipt?.result ??
		null
	)
}
