import {
	Activity,
	BookOpen,
	LayoutDashboard,
	ScrollText,
	ShieldCheck,
	Settings,
	Siren,
	Wallet,
	type LucideIcon,
} from "lucide-react"

export type NavItem = {
	to: string
	label: string
	icon: LucideIcon
	description: string
	end?: boolean
}

export type NavGroup = {
	title: string
	items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
	{
		title: "Insurance",
		items: [
			{
				to: "/",
				label: "Overview",
				icon: LayoutDashboard,
				description: "Live state of the insurance pool",
				end: true,
			},
			{
				to: "/report",
				label: "Report Outage",
				icon: Siren,
				description: "File a claim and watch validators decide",
			},
			{
				to: "/policies",
				label: "Policies",
				icon: ShieldCheck,
				description: "Coverage that makes an address claimable",
			},
			{
				to: "/claims",
				label: "Claims",
				icon: ScrollText,
				description: "Every on-chain verdict with filters",
			},
		],
	},
	{
		title: "Provider",
		items: [
			{
				to: "/provider",
				label: "Fund",
				icon: Wallet,
				description: "Deposit and withdraw insurance capital",
				end: true,
			},
			{
				to: "/provider/services",
				label: "Monitoring",
				icon: Activity,
				description: "Endpoints covered by this policy",
			},
			{
				to: "/provider/settings",
				label: "Settings",
				icon: Settings,
				description: "Compensation size and circuit breaker",
			},
		],
	},
	{
		title: "Docs",
		items: [
			{
				to: "/about",
				label: "How it works",
				icon: BookOpen,
				description: "Architecture, tests and deployment",
			},
		],
	},
]

export const ROUTE_LABELS: Record<string, string> = {
	"": "Overview",
	report: "Report Outage",
	claims: "Claims",
	policies: "Policies",
	provider: "Provider",
	services: "Insured services",
	settings: "Settings",
	about: "How it works",
}
