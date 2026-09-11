import { Activity, ExternalLink, Plus, RotateCcw, ShieldAlert, Trash2 } from "lucide-react"
import { useState } from "react"
import { Badge } from "../components/ui/Badge"
import { ConfirmDialog } from "../components/ui/ConfirmDialog"
import { EmptyState } from "../components/ui/EmptyState"
import { PageHeader } from "../components/ui/PageHeader"
import { Skeleton } from "../components/ui/Skeleton"
import { useToast } from "../components/ui/Toast"
import { useApp } from "../lib/appContext"
import { describeError } from "../lib/contract"
import { hostOf, isValidHttpUrl } from "../lib/format"

export function ProviderServices() {
	const { sla } = useApp()
	const toast = useToast()

	const [url, setUrl] = useState("")
	const [busy, setBusy] = useState(false)
	const [pendingRemoval, setPendingRemoval] = useState<string | null>(null)

	const add = async () => {
		setBusy(true)
		try {
			await sla.addService(url)
			toast.success("Endpoint insured", hostOf(url) + " can now be claimed by covered clients")
			setUrl("")
		} catch (caught) {
			toast.error("Could not add the endpoint", describeError(caught))
		} finally {
			setBusy(false)
		}
	}

	const remove = async () => {
		if (!pendingRemoval) return
		setBusy(true)
		try {
			await sla.removeService(pendingRemoval)
			toast.success("Endpoint deactivated", hostOf(pendingRemoval) + " is no longer insured")
		} catch (caught) {
			toast.error("Could not remove the endpoint", describeError(caught))
		} finally {
			setBusy(false)
			setPendingRemoval(null)
		}
	}

	const resolve = async (target: string) => {
		setBusy(true)
		try {
			await sla.resolveIncident(target)
			toast.success("Incident closed", "A new incident id is open for " + hostOf(target))
		} catch (caught) {
			toast.error("Could not close the incident", describeError(caught))
		} finally {
			setBusy(false)
		}
	}

	return (
		<div>
			<PageHeader
				title="Insured services"
				description="Claims are only accepted for endpoints on this list. Each service carries its own incident, which can be compensated once until it is closed."
			/>

			<div className="card">
				<label htmlFor="service-url" className="label">
					Insure an endpoint
				</label>
				<div className="flex flex-col gap-2 sm:flex-row">
					<input
						id="service-url"
						className="input"
						placeholder="https://rpc.example.com/health"
						value={url}
						onChange={(event) => setUrl(event.target.value)}
						disabled={!sla.isOwner || busy}
					/>
					<button
						type="button"
						className="btn-primary shrink-0"
						disabled={!sla.isOwner || busy || !isValidHttpUrl(url)}
						onClick={add}
					>
						<Plus size={15} />
						{busy ? "Working…" : "Insure"}
					</button>
				</div>
				<p className="hint mt-2">
					{sla.isOwner
						? "Owner only action. Any URL outside this list is rejected before validators are involved."
						: "Connect the provider wallet to edit this list."}
				</p>
			</div>

			<div className="card mt-4 p-0">
				{sla.isLoading ? (
					<div className="space-y-2 p-4">
						{[0, 1, 2].map((row) => (
							<Skeleton key={row} className="h-11 w-full" />
						))}
					</div>
				) : sla.services.length === 0 ? (
					<EmptyState
						icon={<Activity size={20} />}
						title="No endpoints insured yet"
						description="Add the URLs your SLA covers. Clients can only claim what is listed here."
					/>
				) : (
					<ul className="divide-y divide-white/5">
						{sla.services.map((service) => {
							const locked = service.incident_state === "compensated"
							return (
								<li key={service.id} className="flex flex-wrap items-center gap-3 px-4 py-3.5">
									<span
										className={
											"flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border " +
											(service.active
												? "border-neon-lime/20 bg-neon-lime/10 text-neon-lime"
												: "border-white/10 bg-white/5 text-slate-500")
										}
									>
										<Activity size={15} />
									</span>
									<div className="min-w-0 flex-1">
										<p className="truncate text-sm text-slate-100">{hostOf(service.url)}</p>
										<p className="mono truncate text-slate-500">{service.url}</p>
									</div>
									<div className="flex flex-wrap items-center gap-2">
										<Badge tone="muted">incident {service.current_incident}</Badge>
										{locked ? (
											<Badge tone="warn">compensated</Badge>
										) : (
											<Badge tone={service.active ? "good" : "muted"}>
												{service.active ? "claimable" : "inactive"}
											</Badge>
										)}
										<a
											href={service.url}
											target="_blank"
											rel="noreferrer"
											title="Open endpoint"
											className="rounded-md p-2 text-slate-500 transition hover:bg-white/10 hover:text-neon-cyan"
										>
											<ExternalLink size={14} />
										</a>
										{sla.isOwner && locked ? (
											<button
												type="button"
												onClick={() => resolve(service.url)}
												disabled={busy}
												className="btn-ghost btn-sm"
												title="Close the compensated incident"
											>
												<RotateCcw size={13} />
												Close incident
											</button>
										) : null}
										{sla.isOwner && service.active ? (
											<button
												type="button"
												onClick={() => setPendingRemoval(service.url)}
												title="Deactivate endpoint"
												aria-label="Deactivate endpoint"
												className="rounded-md p-2 text-slate-500 transition hover:bg-white/10 hover:text-neon-rose"
											>
												<Trash2 size={14} />
											</button>
										) : null}
									</div>
								</li>
							)
						})}
					</ul>
				)}
			</div>

			<div className="card mt-4 border-neon-amber/20">
				<div className="flex items-start gap-3">
					<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-neon-amber/20 bg-neon-amber/10 text-neon-amber">
						<ShieldAlert size={16} />
					</span>
					<div>
						<p className="text-sm font-medium text-slate-100">Incident lifecycle</p>
						<p className="hint mt-1">
							The first approved claim marks the current incident as compensated, and every later claim
							for it reverts. The incident reopens automatically once the incident window elapses, or
							immediately when you close it here.
						</p>
					</div>
				</div>
			</div>

			<ConfirmDialog
				open={pendingRemoval !== null}
				danger
				busy={busy}
				title="Stop insuring this endpoint?"
				description={pendingRemoval ?? undefined}
				confirmLabel="Deactivate"
				onConfirm={remove}
				onCancel={() => setPendingRemoval(null)}
			/>
		</div>
	)
}
