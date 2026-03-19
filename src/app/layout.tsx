import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import GlobalProvider from "./providers/GlobalProvider";
import Drawer from "./components/Drawer";
import { Toaster } from "sonner";
import Navbar from "./components/Navbar";

const mont = Montserrat({
	weight: ["400"],
	style: ["normal"],
	subsets: ["latin"],
	display: "swap",
});

export const metadata: Metadata = {
	title: "Smart Toolss",
	description:
		"Advanced DeFi tools for token management, liquidity, and transfers",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" data-theme="dark">
			<head>
				<link
					href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined"
					rel="stylesheet"
				/>
			</head>
			<body className={`${mont.className}`}>
				<GlobalProvider>
					<Drawer>
						<Navbar />
						<link rel="icon" href="/logoo.svg" sizes="any" />
						{children}
					</Drawer>
					<Toaster richColors position="top-right" />
				</GlobalProvider>
			</body>
		</html>
	);
}
