/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			colors: {
				ink: {
					900: "#05070d",
					800: "#0a0e18",
					700: "#101725",
					600: "#18202f",
					500: "#232d40",
				},
				neon: {
					cyan: "#22d3ee",
					violet: "#8b5cf6",
					lime: "#a3e635",
					amber: "#fbbf24",
					rose: "#fb7185",
				},
			},
			fontFamily: {
				sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
				mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
			},
			boxShadow: {
				glow: "0 0 0 1px rgba(34,211,238,0.18), 0 18px 50px -24px rgba(34,211,238,0.45)",
				soft: "0 18px 40px -28px rgba(0,0,0,0.9)",
			},
			keyframes: {
				pulseline: {
					"0%, 100%": { opacity: "0.35" },
					"50%": { opacity: "1" },
				},
				floaty: {
					"0%, 100%": { transform: "translateY(0px)" },
					"50%": { transform: "translateY(-6px)" },
				},
				shimmer: {
					"100%": { transform: "translateX(100%)" },
				},
				slidein: {
					"0%": { opacity: "0", transform: "translateY(8px)" },
					"100%": { opacity: "1", transform: "translateY(0)" },
				},
			},
			animation: {
				pulseline: "pulseline 2.2s ease-in-out infinite",
				floaty: "floaty 6s ease-in-out infinite",
				shimmer: "shimmer 1.6s infinite",
				slidein: "slidein 0.25s ease-out",
			},
		},
	},
	plugins: [],
}
