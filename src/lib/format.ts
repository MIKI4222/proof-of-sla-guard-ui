export const WEI = 10n ** 18n

/** Parses a human GEN amount ("0.25") into wei. Throws on invalid input. */
export function toWei(amount: string): bigint {
	const trimmed = amount.trim()
	if (trimmed === "") throw new Error("Amount is empty")
	if (!/^\d*(\.\d*)?$/.test(trimmed)) throw new Error("Amount must be a number")
	const [whole, fraction = ""] = trimmed.split(".")
	const padded = (fraction + "0".repeat(18)).slice(0, 18)
	const result = BigInt(whole === "" ? "0" : whole) * WEI + BigInt(padded === "" ? "0" : padded)
	if (result <= 0n) throw new Error("Amount must be greater than zero")
	return result
}

/** Formats wei into a compact GEN string. */
export function fromWei(value: bigint | number | string, decimals = 4): string {
	let raw: bigint
	try {
		raw = typeof value === "bigint" ? value : BigInt(String(value ?? 0))
	} catch {
		return "0"
	}
	const negative = raw < 0n
	if (negative) raw = -raw
	const whole = raw / WEI
	const fraction = (raw % WEI).toString().padStart(18, "0").slice(0, decimals).replace(/0+$/, "")
	const text = fraction === "" ? whole.toString() : whole.toString() + "." + fraction
	return negative ? "-" + text : text
}

export function formatGen(value: bigint | number | string, decimals = 4): string {
	return fromWei(value, decimals) + " GEN"
}

export function shortAddr(address?: string, size = 4): string {
	if (!address) return "—"
	if (address.length <= size * 2 + 2) return address
	return address.slice(0, size + 2) + "…" + address.slice(-size)
}

export function shortUrl(url: string, max = 44): string {
	const clean = url.replace(/^https?:\/\//, "")
	return clean.length > max ? clean.slice(0, max - 1) + "…" : clean
}

export function hostOf(url: string): string {
	try {
		return new URL(url).host
	} catch {
		return url
	}
}

export function isValidHttpUrl(value: string): boolean {
	const trimmed = value.trim()
	if (!/^https?:\/\//i.test(trimmed)) return false
	try {
		new URL(trimmed)
		return true
	} catch {
		return false
	}
}

export function sameAddress(a?: string, b?: string): boolean {
	if (!a || !b) return false
	return a.trim().toLowerCase() === b.trim().toLowerCase()
}

export function statusCodeTone(code: number): "good" | "warn" | "bad" | "muted" {
	if (code === 0) return "muted"
	if (code >= 500) return "bad"
	if (code >= 400) return "warn"
	if (code >= 200 && code < 300) return "good"
	return "muted"
}
