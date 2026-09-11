import { useCallback, useEffect, useState } from "react"
import { CHAIN_ID_HEX, metamaskChainParams } from "../config/genlayer"

export type WalletState = {
	address: string | null
	chainId: string | null
	isConnecting: boolean
	isInstalled: boolean
	isWrongNetwork: boolean
	error: string | null
	connect: () => Promise<void>
	switchNetwork: () => Promise<void>
	disconnect: () => void
}

const STORAGE_KEY = "sla-guard:wallet-connected"

export function useWallet(): WalletState {
	const [address, setAddress] = useState<string | null>(null)
	const [chainId, setChainId] = useState<string | null>(null)
	const [isConnecting, setIsConnecting] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const isInstalled = typeof window !== "undefined" && Boolean(window.ethereum)

	const readChain = useCallback(async () => {
		if (!window.ethereum) return
		try {
			const id = (await window.ethereum.request({ method: "eth_chainId" })) as string
			setChainId(id)
		} catch {
			setChainId(null)
		}
	}, [])

	const connect = useCallback(async () => {
		if (!window.ethereum) {
			setError("MetaMask is not installed")
			return
		}
		setIsConnecting(true)
		setError(null)
		try {
			const accounts = (await window.ethereum.request({
				method: "eth_requestAccounts",
			})) as string[]
			if (accounts && accounts.length > 0) {
				setAddress(accounts[0])
				window.localStorage.setItem(STORAGE_KEY, "1")
				await readChain()
			}
		} catch (caught) {
			const message = (caught as { message?: string })?.message ?? "Failed to connect"
			setError(/user rejected/i.test(message) ? "Connection rejected in MetaMask" : message)
		} finally {
			setIsConnecting(false)
		}
	}, [readChain])

	const switchNetwork = useCallback(async () => {
		if (!window.ethereum) return
		setError(null)
		try {
			await window.ethereum.request({
				method: "wallet_switchEthereumChain",
				params: [{ chainId: CHAIN_ID_HEX }],
			})
		} catch (caught) {
			const code = (caught as { code?: number })?.code
			if (code === 4902 || code === -32603) {
				try {
					await window.ethereum.request({
						method: "wallet_addEthereumChain",
						params: [metamaskChainParams],
					})
				} catch (addError) {
					setError((addError as { message?: string })?.message ?? "Failed to add the network")
				}
			} else {
				setError((caught as { message?: string })?.message ?? "Failed to switch the network")
			}
		}
		await readChain()
	}, [readChain])

	const disconnect = useCallback(() => {
		setAddress(null)
		window.localStorage.removeItem(STORAGE_KEY)
	}, [])

	// Silent reconnect plus wallet event subscriptions.
	useEffect(() => {
		if (!window.ethereum) return
		let cancelled = false

		const restore = async () => {
			if (window.localStorage.getItem(STORAGE_KEY) !== "1") return
			try {
				const accounts = (await window.ethereum!.request({ method: "eth_accounts" })) as string[]
				if (!cancelled && accounts && accounts.length > 0) {
					setAddress(accounts[0])
					await readChain()
				}
			} catch {
				/* ignore */
			}
		}
		restore()

		const onAccounts = (...args: unknown[]) => {
			const accounts = (args[0] as string[]) ?? []
			setAddress(accounts.length > 0 ? accounts[0] : null)
			if (accounts.length === 0) window.localStorage.removeItem(STORAGE_KEY)
		}
		const onChain = (...args: unknown[]) => setChainId((args[0] as string) ?? null)

		window.ethereum.on?.("accountsChanged", onAccounts)
		window.ethereum.on?.("chainChanged", onChain)

		return () => {
			cancelled = true
			window.ethereum?.removeListener?.("accountsChanged", onAccounts)
			window.ethereum?.removeListener?.("chainChanged", onChain)
		}
	}, [readChain])

	const isWrongNetwork = Boolean(
		address && chainId && chainId.toLowerCase() !== CHAIN_ID_HEX.toLowerCase(),
	)

	return {
		address,
		chainId,
		isConnecting,
		isInstalled,
		isWrongNetwork,
		error,
		connect,
		switchNetwork,
		disconnect,
	}
}
