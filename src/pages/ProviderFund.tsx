import { ArrowDownToLine, ArrowUpFromLine, Coins, ShieldCheck } from "lucide-react"
import { useState } from "react"
import { AddressChip } from "../components/ui/AddressChip"
import { ConfirmDialog } from "../components/ui/ConfirmDialog"
import { PageHeader } from "../components/ui/PageHeader"
import { StatCard } from "../components/ui/StatCard"
import { useToast } from "../components/ui/Toast"
import { useApp } from "../lib/appContext"
import { describeError } from "../lib/contract"
import { formatGen, toWei } from "../lib/format"

const QUICK_AMOUNTS = ["0.1", "0.5", "1"]

export function ProviderFund() {
	const { wallet, sla } = useApp()
	const toast = useToast()

	const [depositValue, setDepositValue] = useState("0.1")
	const [withdrawValue, setWithdrawValue] = useState("")
	const [busy, setBusy] = useState<"deposit" | "withdraw" | null>(null)
	const [confirmWithdraw, setConfirmWithdraw] = useState(false)

	const fund = sla.stats?.total_fund ?? 0
	const compensation = sla.stats?.compensation_amount ?? 0
	const payoutsLeft = compensation > 0 ? Math.floor(fund / compensation) : 0

	const deposit = async () => {
		setBusy("deposit")
		try {
			await sla.depositFunds(toWei(depositValue))
			toast.success("Fund topped up", formatGen(toWei(depositValue)) + " added to the pool")
		} catch (caught) {
			toast.error("Deposit failed", describeError(caught))
		} finally {
			setBusy(null)
		}
	}

	const withdraw = async () => {
		setBusy("withdraw")
		try {
			await sla.withdrawFunds(toWei(withdrawValue))
			toast.success("Withdrawal finalized", formatGen(toWei(withdrawValue)) + " returned to you")
			setWithdrawValue("")
		} catch (caught) {
			toast.error("Withdrawal failed", describeError(caught))
		} finally {
			setBusy(null)
			setConfirmWithdraw(false)
		}
	}

	return (
		<div>
			<PageHeader
				title="Provider fund"
				description="Capital backing your uptime promise. Every confirmed outage is paid from this pool automatically."
				actions={sla.stats?.owner ? <AddressChip address={sla.stats.owner} label="owner" /> : null}
			/>

			<div className="grid gap-4 sm:grid-cols-3">
				<StatCard
					icon={<Coins size={17} />}
					label="Fund balance"
					value={formatGen(fund)}
					hint={payoutsLeft + " payouts of coverage left"}
					loading={sla.isLoading}
				/>
				<StatCard
					icon={<ShieldCheck size={17} />}
					label="Per-claim payout"
					value={formatGen(compensation)}
					hint="Change it in Settings"
					accent="violet"
					loading={sla.isLoading}
				/>
				<StatCard
					icon={<ArrowUpFromLine size={17} />}
					label="Paid out so far"
					value={formatGen(sla.stats?.total_paid_out ?? 0)}
					hint="Sent to claimants by consensus"
					accent="lime"
					loading={sla.isLoading}
				/>
			</div>

			<div className="mt-6 grid gap-4 lg:grid-cols-2">
				<div className="card">
					<h2 className="text-sm font-semibold text-slate-100">Deposit collateral</h2>
					<p className="hint mt-1">Anyone can top up the pool, not just the provider.</p>

					<label htmlFor="deposit" className="label mt-4">
						Amount in GEN
					</label>
					<input
						id="deposit"
						className="input"
						value={depositValue}
						onChange={(event) => setDepositValue(event.target.value)}
						placeholder="0.1"
						inputMode="decimal"
					/>
					<div className="mt-2 flex gap-2">
						{QUICK_AMOUNTS.map((amount) => (
							<button
								key={amount}
								type="button"
								className="chip transition hover:border-neon-cyan/40 hover:text-neon-cyan"
								onClick={() => setDepositValue(amount)}
							>
								{amount} GEN
							</button>
						))}
					</div>

					<button
						type="button"
						className="btn-primary mt-4 w-full"
						disabled={!wallet.address || busy !== null || wallet.isWrongNetwork}
						onClick={deposit}
					>
						<ArrowDownToLine size={15} />
						{busy === "deposit" ? "Waiting for finalization…" : "Deposit into fund"}
					</button>
				</div>

				<div className="card">
					<h2 className="text-sm font-semibold text-slate-100">Withdraw collateral</h2>
					<p className="hint mt-1">Owner only. Reduces the coverage available to your clients.</p>

					<label htmlFor="withdraw" className="label mt-4">
						Amount in GEN
					</label>
					<input
						id="withdraw"
						className="input"
						value={withdrawValue}
						onChange={(event) => setWithdrawValue(event.target.value)}
						placeholder="0.05"
						inputMode="decimal"
						disabled={!sla.isOwner}
					/>
					<p className="hint mt-2">Available: {formatGen(fund)}</p>

					<button
						type="button"
						className="btn-ghost mt-4 w-full"
						disabled={!sla.isOwner || withdrawValue.trim() === "" || busy !== null}
						onClick={() => setConfirmWithdraw(true)}
					>
						<ArrowUpFromLine size={15} />
						Withdraw
					</button>

					{!sla.isOwner ? (
						<p className="mt-3 text-xs text-slate-500">
							Connect the provider wallet to manage withdrawals.
						</p>
					) : null}
				</div>
			</div>

			<ConfirmDialog
				open={confirmWithdraw}
				danger
				busy={busy === "withdraw"}
				title="Withdraw from the insurance fund?"
				description={
					"This lowers the pool to " +
					"a level that may not cover pending outages. Clients filing a claim with an empty pool get a reverted transaction."
				}
				confirmLabel="Withdraw"
				onConfirm={withdraw}
				onCancel={() => setConfirmWithdraw(false)}
			/>
		</div>
	)
}
