import { Route, Routes } from "react-router-dom"
import { AppShell } from "./components/layout/AppShell"
import { AppProvider } from "./lib/appContext"
import { About } from "./pages/About"
import { ClaimDetail } from "./pages/ClaimDetail"
import { Claims } from "./pages/Claims"
import { NotFound } from "./pages/NotFound"
import { Overview } from "./pages/Overview"
import { Policies } from "./pages/Policies"
import { ProviderFund } from "./pages/ProviderFund"
import { ProviderServices } from "./pages/ProviderServices"
import { ProviderSettings } from "./pages/ProviderSettings"
import { ReportOutage } from "./pages/ReportOutage"

export default function App() {
	return (
		<AppProvider>
			<Routes>
				<Route element={<AppShell />}>
					<Route path="/" element={<Overview />} />
					<Route path="/report" element={<ReportOutage />} />
					<Route path="/policies" element={<Policies />} />
					<Route path="/claims" element={<Claims />} />
					<Route path="/claims/:id" element={<ClaimDetail />} />
					<Route path="/provider" element={<ProviderFund />} />
					<Route path="/provider/services" element={<ProviderServices />} />
					<Route path="/provider/settings" element={<ProviderSettings />} />
					<Route path="/about" element={<About />} />
					<Route path="*" element={<NotFound />} />
				</Route>
			</Routes>
		</AppProvider>
	)
}
