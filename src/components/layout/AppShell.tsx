import { useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { NetworkBanner } from "../ui/NetworkBanner"
import { Breadcrumbs } from "./Breadcrumbs"
import { Sidebar } from "./Sidebar"
import { Topbar } from "./Topbar"

export function AppShell() {
	const [mobileOpen, setMobileOpen] = useState(false)
	const { pathname } = useLocation()

	return (
		<div className="flex min-h-screen">
			<Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
			<div className="flex min-w-0 flex-1 flex-col">
				<Topbar onOpenMenu={() => setMobileOpen(true)} />
				<main key={pathname} className="mx-auto w-full max-w-6xl flex-1 animate-slidein px-4 py-6 lg:px-8 lg:py-8">
					<Breadcrumbs />
					<NetworkBanner />
					<Outlet />
				</main>
				<footer className="border-t border-white/5 px-4 py-5 text-xs text-slate-600 lg:px-8">
					Proof of SLA Guard &middot; built for the GenLayer Agent Tank Hackathon &middot; validators
					arbitrate every claim on-chain
				</footer>
			</div>
		</div>
	)
}
