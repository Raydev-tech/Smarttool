/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React from "react";
import "@rainbow-me/rainbowkit/styles.css";
import {
	getDefaultConfig,
	RainbowKitProvider,
	Theme,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { abstract, polygon, optimism, arbitrum, base } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const myCustomTheme: Theme = {
	blurs: {
		modalOverlay: "...",
	},
	colors: {
		accentColor: "#7925A6",
		accentColorForeground: "white",
		actionButtonBorder: "...",
		actionButtonBorderMobile: "...",
		actionButtonSecondaryBackground: "white",
		closeButton: "...",
		closeButtonBackground: "...",
		connectButtonBackground: "#7925A6",
		generalBorder: "#7925A6",
		connectButtonText: "white",
		modalBackground: "black",
		connectButtonBackgroundError: "...",
		connectButtonInnerBackground: "...",
		connectButtonTextError: "...",
		connectionIndicator: "...",
		downloadBottomCardBackground: "...",
		downloadTopCardBackground: "...",
		error: "...",
		generalBorderDim: "...",
		menuItemBackground: "...",
		modalBackdrop: "...",
		modalBorder: "...",
		modalText: "white",
		modalTextDim: "white",
		modalTextSecondary: "white",
		profileAction: "...",
		profileActionHover: "...",
		profileForeground: "...",
		selectedOptionBorder: "...",
		standby: "...",
	},
	radii: {
		actionButton: "9999px",
		connectButton: "5.7px",
		menuButton: "5.7px",
		modal: "24px",
		modalMobile: "28px",
	},
	fonts: {
		body: "",
		// size: "16px",
	},
	shadows: {
		connectButton: "...",
		dialog: "...",
		profileDetailsAction: "...",
		selectedOption: "...",
		selectedWallet: "...",
		walletLogo: "...",
	},
};

const config = getDefaultConfig({
	appName: "My RainbowKit App",
	projectId: "YOUR_PROJECT_ID",
	chains: [abstract],
	ssr: true, // If your dApp uses server side rendering (SSR)
});
const queryClient = new QueryClient();
export default function GlobalProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<WagmiProvider config={config}>
			<QueryClientProvider client={queryClient}>
				<RainbowKitProvider theme={myCustomTheme}>
					{children}{" "}
				</RainbowKitProvider>
			</QueryClientProvider>
		</WagmiProvider>
	);
}
