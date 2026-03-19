/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { privateKeyToAccount } from "viem/accounts";
import { createPublicClient, http, formatEther, type Address } from "viem";
import { mainnet } from "viem/chains";

interface WalletEntry {
	id: number;
	privateKey: string;
	walletAddress: string | Address;
	balance: string;
	buyAmount: string;
}

export default function LiquidityAndSwapPage() {
	const [walletEntries, setWalletEntries] = useState<WalletEntry[]>([
		{
			id: 1,
			privateKey: "",
			walletAddress: "-",
			balance: "-",
			buyAmount: "",
		},
	]);
	const [isImportModalOpen, setIsImportModalOpen] = useState(false);
	const [importText, setImportText] = useState("");

	const client = createPublicClient({
		chain: mainnet,
		transport: http(),
	});

	const addWalletEntry = () => {
		const newId = walletEntries.length + 1;
		setWalletEntries([
			...walletEntries,
			{
				id: newId,
				privateKey: "",
				walletAddress: "-",
				balance: "-",
				buyAmount: "",
			},
		]);
	};

	const removeWalletEntry = (id: number) => {
		if (walletEntries.length > 1) {
			setWalletEntries(walletEntries.filter((entry) => entry.id !== id));
		}
	};

	const handleBatchImport = () => {
		const privateKeys = importText
			.split("\n")
			.map((line) => line.trim())
			.filter((line) => line.length > 0)
			.map((key) =>
				key.startsWith("0x") ? key : `0x${key}`
			) as `0x${string}`[];

		const newEntries = privateKeys.map((privateKey, index) => {
			try {
				const account = privateKeyToAccount(privateKey);
				return {
					id: index + 1,
					privateKey,
					walletAddress: account.address,
					balance: "-",
					buyAmount: "",
				};
			} catch {
				// Error case handled by returning invalid state
				return {
					id: index + 1,
					privateKey,
					walletAddress: "Invalid private key",
					balance: "-",
					buyAmount: "",
				};
			}
		});

		setWalletEntries(newEntries);
		setIsImportModalOpen(false);
		setImportText("");
	};

	const handlePrivateKeyChange = (id: number, privateKey: string) => {
		const formattedKey = (
			privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`
		) as `0x${string}`;

		setWalletEntries((entries) =>
			entries.map((entry) => {
				if (entry.id === id) {
					try {
						const account = privateKeyToAccount(formattedKey);
						return {
							...entry,
							privateKey,
							walletAddress: account.address,
						};
					} catch {
						// Error case handled by returning invalid state
						return {
							...entry,
							privateKey,
							walletAddress: "Invalid private key",
						};
					}
				}
				return entry;
			})
		);
	};

	const handleBuyAmountChange = (id: number, amount: string) => {
		setWalletEntries((entries) =>
			entries.map((entry) => {
				if (entry.id === id) {
					return {
						...entry,
						buyAmount: amount,
					};
				}
				return entry;
			})
		);
	};

	const handleMaxClick = (id: number) => {
		setWalletEntries((entries) =>
			entries.map((entry) => {
				if (entry.id === id && entry.balance !== "-") {
					return {
						...entry,
						buyAmount: entry.balance,
					};
				}
				return entry;
			})
		);
	};

	const fetchBalances = async () => {
		const updatedEntries = await Promise.all(
			walletEntries.map(async (entry) => {
				if (
					entry.walletAddress !== "-" &&
					entry.walletAddress !== "Invalid private key" &&
					typeof entry.walletAddress !== "string"
				) {
					try {
						const balance = await client.getBalance({
							address: entry.walletAddress,
						});
						return {
							...entry,
							balance: formatEther(balance),
						};
					} catch (error) {
						console.error("Error fetching balance:", error);
						return entry;
					}
				}
				return entry;
			})
		);

		setWalletEntries(updatedEntries);
	};

	useEffect(() => {
		const hasValidAddress = walletEntries.some(
			(entry) =>
				entry.walletAddress !== "-" &&
				entry.walletAddress !== "Invalid private key"
		);
		if (hasValidAddress) {
			void fetchBalances();
		}
	}, [walletEntries, fetchBalances]);

	return (
		<div className="w-full max-w-7xl mx-auto p-4 md:p-8 space-y-8 min-h-screen">
			<div className="bg- p-3 md:p-8 shadow-lg bor rounded-lg">
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-[50px] gap-4">
					<h1 className="text-2xl md:text-3xl font-bold text-white">
						Buy Parameters Settings
					</h1>
					<Dialog.Root
						open={isImportModalOpen}
						onOpenChange={setIsImportModalOpen}
					>
						<Dialog.Trigger asChild>
							<button className="text-white hover:text-[#CB3CFF] flex items-center gap-2 font-medium transition-colors duration-200">
								<span>Batch Import Private Keys</span>
							</button>
						</Dialog.Trigger>
						<Dialog.Portal>
							<Dialog.Overlay className="fixed inset-0 bg-black/50" />
							<Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#140E17] rounded-lg p-6 w-[95vw] max-w-lg max-h-[85vh] overflow-y-auto">
								<Dialog.Title className="text-xl font-bold mb-4">
									Import Private Keys
								</Dialog.Title>
								<div className="space-y-4">
									<p className="text-sm text-white">
										Enter one private key per line. Keys can
										be with or without &apos;0x&apos;
										prefix.
									</p>
									<textarea
										value={importText}
										onChange={(e) =>
											setImportText(e.target.value)
										}
										className="w-full h-48 p-3 border-[#CB3CFF] border-[0.6px] rounded-lg  bg-[#140E17] focus:border-0 focus:ring-0  hover:border-[#cb3cff]"
										placeholder="Enter private keys here..."
									/>
									<div className="flex justify-end gap-3">
										<button
											onClick={() =>
												setIsImportModalOpen(false)
											}
											className="px-4 py-2 text-white hover:text-white transition-colors duration-200"
										>
											Cancel
										</button>
										<button
											onClick={handleBatchImport}
											className="px-4 py-2  bg-[#7925A6]  text-white rounded-lg hover:bg-[#cb3cfa] transition-colors duration-200"
										>
											Import
										</button>
									</div>
								</div>
							</Dialog.Content>
						</Dialog.Portal>
					</Dialog.Root>
				</div>

				<div className="space-y-6">
					<div className="hidden md:grid grid-cols-5 gap-4 text-sm font-semibold text-white border-b-[0.5px] border-gray-100 pb-4">
						<div>#</div>
						<div>Private Key</div>
						<div>Wallet Address</div>
						<div>Balance</div>
						<div>Buy Amount</div>
					</div>
					{/* Responsive table for mobile */}
					<div className="md:hidden flex flex-col gap-4">
						{walletEntries.map((entry) => (
							<div
								key={entry.id}
								className="bg-[#140E17] rounded-lg p-4 flex flex-col gap-2 shadow-sm border border-[#343B4F]"
							>
								<div className="flex justify-between items-center">
									<span className="text-white font-semibold">
										#{entry.id}
									</span>
									{walletEntries.length > 1 && (
										<button
											onClick={() =>
												removeWalletEntry(entry.id)
											}
											className="text-gray-400 hover:text-red-600 transition-colors duration-200 p-1 rounded-full hover:bg-red-50"
										>
											−
										</button>
									)}
									{entry.id === walletEntries.length && (
										<button
											onClick={addWalletEntry}
											className="text-gray-400 hover:text-[#cb3cff] transition-colors duration-200 p-1 rounded-full hover:bg-indigo-50"
										>
											+
										</button>
									)}
								</div>
								<div>
									<div className="text-xs text-gray-400 mb-1">
										Private Key
									</div>
									<input
										type="text"
										value={entry.privateKey}
										onChange={(e) =>
											handlePrivateKeyChange(
												entry.id,
												e.target.value
											)
										}
										placeholder="Please enter the private key"
										className="p-2 bg-[#140E17] rounded-[4px] shadow-sm border border-[#343B4F] w-full focus:border-0 focus:ring-0  hover:border-[#cb3cff] transition-all duration-200"
									/>
								</div>
								<div>
									<div className="text-xs text-gray-400 mb-1">
										Wallet Address
									</div>
									<div className="text-white font-medium break-all">
										{entry.walletAddress}
									</div>
								</div>
								<div>
									<div className="text-xs text-gray-400 mb-1">
										Balance
									</div>
									<div className="text-white font-medium">
										{entry.balance}
									</div>
								</div>
								<div>
									<div className="text-xs text-gray-400 mb-1">
										Buy Amount
									</div>
									<div className="flex gap-2 items-center">
										<input
											type="text"
											value={entry.buyAmount}
											onChange={(e) =>
												handleBuyAmountChange(
													entry.id,
													e.target.value
												)
											}
											placeholder="Please enter the purchase amount"
											className="p-2 border bg-[#140E17] border-[#343B4F] rounded-lg w-full focus:border-0 focus:ring-0  hover:border-[#cb3cff] transition-all duration-200"
										/>
										<button
											onClick={() =>
												handleMaxClick(entry.id)
											}
											className="text-[#cb3cff] hover:text-[#7F25FB] font-medium transition-colors duration-200"
										>
											MAX
										</button>
									</div>
								</div>
							</div>
						))}
						{/* Add button for mobile */}
						{walletEntries.length === 1 && (
							<button
								onClick={addWalletEntry}
								className="mt-2 text-gray-400 hover:text-[#cb3cff] transition-colors duration-200 p-1 rounded-full hover:bg-indigo-50 w-8 h-8 flex items-center justify-center mx-auto"
							>
								+
							</button>
						)}
					</div>
					{/* Desktop grid */}
					<div className="hidden md:block">
						{walletEntries.map((entry) => (
							<div
								key={entry.id}
								className="grid grid-cols-5 gap-4 items-center group"
							>
								<div className="text-white">{entry.id}</div>
								<input
									type="text"
									value={entry.privateKey}
									onChange={(e) =>
										handlePrivateKeyChange(
											entry.id,
											e.target.value
										)
									}
									placeholder="Please enter the private key"
									className="p-3 bg-[#140E17] rounded-[4px] shadow-sm border border-[#343B4F] w-full focus:border-0 focus:ring-0  hover:border-[#cb3cff] transition-all duration-200"
								/>
								<div className="text-white font-medium break-all">
									{entry.walletAddress}
								</div>
								<div className="text-white font-medium">
									{entry.balance}
								</div>
								<div className="flex gap-2 items-center">
									<input
										type="text"
										value={entry.buyAmount}
										onChange={(e) =>
											handleBuyAmountChange(
												entry.id,
												e.target.value
											)
										}
										placeholder="Please enter the purchase amount"
										className="p-3 border bg-[#140E17] border-[#343B4F] rounded-lg w-full focus:border-0 focus:ring-0  hover:border-[#cb3cff] transition-all duration-200"
									/>
									<button
										onClick={() => handleMaxClick(entry.id)}
										className="text-[#cb3cff] hover:text-[#7F25FB] font-medium transition-colors duration-200"
									>
										MAX
									</button>
									{walletEntries.length > 1 && (
										<button
											onClick={() =>
												removeWalletEntry(entry.id)
											}
											className="text-gray-400 hover:text-red-600 transition-colors duration-200 p-1 rounded-full hover:bg-red-50"
										>
											−
										</button>
									)}
									{entry.id === walletEntries.length && (
										<button
											onClick={addWalletEntry}
											className="text-gray-400 hover:text-[#cb3cff] transition-colors duration-200 p-1 rounded-full hover:bg-indigo-50"
										>
											+
										</button>
									)}
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="mt-6 space-y-3">
					<div className="flex flex-col md:flex-row items-start md:items-center gap-3 text-emerald-700 bg-[#140E17] p-4 rounded-lg border-[0.6px] border-[#343B4F]">
						<span className="text-xl">⚠️</span>
						<p className="text-sm font-medium">
							Ensure the buy wallet has sufficient purchase amount
							when creating liquidity and buying to avoid purchase
							failure.
						</p>
						<button className="md:ml-auto text-emerald-600 hover:text-emerald-800 transition-colors duration-200">
							×
						</button>
					</div>
					<div className="flex flex-col md:flex-row items-start md:items-center gap-3 text-emerald-700 bg-[#140E17] p-4 rounded-lg border-[0.6px] border-[#343B4F]">
						<span className="text-xl">⚠️</span>
						<p className="text-sm font-medium">
							This feature supports bundling the purchase of up to
							47 addresses simultaneously. All service fees will
							be covered by the wallet that creates the liquidity.
							Please ensure your wallet has sufficient balance to
							avoid any disruptions in the transaction process.
						</p>
						<button className="md:ml-auto text-emerald-600 hover:text-emerald-800 transition-colors duration-200">
							×
						</button>
					</div>
				</div>

				<div className="mt-8">
					<button className="w-full bg-[#7925A6] text-white py-4 rounded-lg hover:bg-[#CB3CFF] font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
						Create Liquidity and Buy
					</button>
					<p className="text-center text-sm text-gray-500 mt-3">
						Lowest network service fee, 0.01 ETH service fee per buy
						address
					</p>
				</div>

				{/* Create Liquidity Section */}
				<div className="mt-12 space-y-8 border-t border-gray-100 pt-8">
					<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
						<h2 className="text-xl md:text-2xl font-bold text-white">
							Create Liquidity and Buy
						</h2>
						<div className="flex items-center text-emerald-600 gap-2 font-medium">
							<span>Security Reminder, Must Read!</span>
						</div>
					</div>

					<p className="text-white text-base md:text-lg leading-relaxed">
						Simultaneously create a liquidity pool and buy tokens,
						ensuring a 100% earliest purchase. This effectively
						simplifies the trading process and accelerates market
						participation, allowing you to stay ahead and seize
						opportunities to gain potential profits earlier.
					</p>

					<div className="space-y-6">
						<h3 className="text-lg md:text-xl font-semibold text-white">
							Import Create Liquidity Wallet
						</h3>
						<div className="hidden md:grid grid-cols-3 gap-4 text-sm font-medium text-white mb-2">
							<div>Private Key</div>
							<div>Wallet Address</div>
							<div className="flex items-center gap-2">
								ETH Balance
								<span className="text-emerald-500 text-lg">
									•
								</span>
							</div>
						</div>
						{/* Mobile version */}
						<div className="md:hidden flex flex-col gap-4">
							<div className="bg-[#140E17] rounded-lg p-4 flex flex-col gap-2 shadow-sm border border-[#343B4F]">
								<div>
									<div className="text-xs text-gray-400 mb-1">
										Private Key
									</div>
									<input
										type="text"
										placeholder="Please enter the private key"
										className="p-2 bg-[#140E17] hover:border-[#CB3CFF] border-[#343B4F] border-[0.6px] rounded-lg w-full focus:border-0 focus:ring-0 transition-all duration-200"
									/>
								</div>
								<div>
									<div className="text-xs text-gray-400 mb-1">
										Wallet Address
									</div>
									<div className="text-white font-medium p-2 bg-[#140E17] rounded-lg border border-[#343B4F]">
										-
									</div>
								</div>
								<div>
									<div className="text-xs text-gray-400 mb-1">
										ETH Balance
									</div>
									<div className="text-white font-medium p-2 bg-[#140E17] rounded-lg border border-[#343B4F]">
										-
									</div>
								</div>
							</div>
						</div>
						{/* Desktop version */}
						<div className="hidden md:grid grid-cols-3 gap-4">
							<input
								type="text"
								placeholder="Please enter the private key"
								className="p-3 bg-[#140E17] hover:border-[#CB3CFF] border-[#343B4F] border-[0.6px] rounded-lg w-full focus:border-0 focus:ring-0 transition-all duration-200"
							/>
							<div className="text-white font-medium p-3">-</div>
							<div className="text-white font-medium p-3">-</div>
						</div>
					</div>

					<div className="space-y-6">
						<h3 className="text-lg md:text-xl font-semibold text-white">
							DEX Selection
						</h3>
						<div className="flex flex-col sm:flex-row gap-4">
							<button className="bg-[#7925A6] text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-all duration-200 hover:bg-indigo-700 shadow-md hover:shadow-lg w-full sm:w-auto">
								<span>UniSwap V2</span>
							</button>
							<button className="border bg-[#140E17] hover:border-[#CB3CFF] px-6 py-3 rounded-lg flex items-center gap-2 text-white font-medium hover:text-[#CB3CFF] transition-all duration-200 w-full sm:w-auto">
								<span>GraFun</span>
							</button>
						</div>
					</div>

					<div className="space-y-6">
						<h3 className="text-lg md:text-xl font-semibold text-white">
							Liquidity Creation Settings
						</h3>
						<div className="space-y-6">
							{["Token A", "Token B"].map((token) => (
								<div key={token}>
									<div className="flex flex-col md:flex-row justify-between mb-2 gap-2">
										<span className="font-medium text-white">
											{token}
										</span>
										<span className="text-white">
											Balance: 0.0
										</span>
									</div>
									<div className="flex flex-col md:flex-row gap-4">
										<input
											type="text"
											placeholder="Please select or enter the token contract address"
											className="p-3 border bg-[#140E17] border-gray-200 rounded-lg flex-grow focus:border-0 focus:ring-0 hover:border-[#cb3cff] transition-all duration-200 w-full md:w-auto"
										/>
										<div className="flex-1">
											<input
												type="text"
												placeholder="Please enter the amount of tokens to create liquidity"
												className="p-3 border bg-[#140E17] border-gray-200 rounded-lg w-full focus:border-0 focus:ring-0 hover:border-[#cb3cff] transition-all duration-200"
											/>
										</div>
										<div className="flex gap-2">
											<button className="text-[#cb3cff] font-medium px-3 py-2 rounded-lg hover:bg-indigo-50 transition-all duration-200">
												50%
											</button>
											<button className="text-[#cb3cff] font-medium px-3 py-2 rounded-lg hover:bg-indigo-50 transition-all duration-200">
												100%
											</button>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
