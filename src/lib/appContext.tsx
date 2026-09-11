import { createContext, useContext, type ReactNode } from "react"
import { useSlaGuard, type SlaGuardState } from "../hooks/useSlaGuard"
import { useWallet, type WalletState } from "../hooks/useWallet"

type AppValue = {
	wallet: WalletState
	sla: SlaGuardState
}

const AppContext = createContext<AppValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
	const wallet = useWallet()
	const sla = useSlaGuard(wallet.address)

	return <AppContext.Provider value={{ wallet, sla }}>{children}</AppContext.Provider>
}

export function useApp(): AppValue {
	const context = useContext(AppContext)
	if (!context) throw new Error("useApp must be used inside AppProvider")
	return context
}
