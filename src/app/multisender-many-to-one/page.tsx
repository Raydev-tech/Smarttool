/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { privateKeyToAccount } from "viem/accounts";
import {
	createPublicClient,
	createWalletClient,
	http,
	parseEther,
	formatEther,
} from "viem";
import { mainnet } from "viem/chains";
import { toast } from "sonner";
import Image from "next/image";
import notice from "../assets/notice.svg";

// Updated Window interface
declare global {
	interface Window {
		ethereum?: any; // Using any to avoid type conflicts
	}
}

const erc20Abi = [
	"function decimals() external view returns (uint8)",
	"function transfer(address to, uint256 amount) external returns (bool)",
	"function balanceOf(address account) external view returns (uint256)",
] as const;

interface WalletInfo {
	address: `0x${string}`;
	balance: string;
	selected: boolean;
	privateKey?: string;
}

interface TokenAddress {
	address: string;
	amount: string;
}

interface Errors {
	recipientAddress?: string;
	privateKey?: string;
	[key: string]: string | undefined;
}

type CollectionType =
	| "All Quantity"
	| "Fixed Quantity"
	| "Random Quantity"
	| "Random Percentage"
	| "Keep Fixed Quantity";

export default function Page() {
	const [recipientAddress, setRecipientAddress] = useState("");
	const [selectedTokenType, setSelectedTokenType] = useState<"ETH" | "ERC20">(
		"ETH"
	);
	const [tokenAddresses, setTokenAddresses] = useState<TokenAddress[]>([]);
	const [errors, setErrors] = useState<Errors>({});
	const [loading, setLoading] = useState(false);
	const [txHash] = useState("");
	const [collectionType, setCollectionType] =
		useState<CollectionType>("All Quantity");
	const [wallets, setWallets] = useState<WalletInfo[]>([]);
	const [fixedQuantity, setFixedQuantity] = useState("");
	const [randomMin, setRandomMin] = useState("");
	const [randomMax, setRandomMax] = useState("");
	const [randomPercentage, setRandomPercentage] = useState("");
	const [keepFixedQuantity, setKeepFixedQuantity] = useState("");
	const [isAuditing, setIsAuditing] = useState(false);

	const handleRecipientAddressChange = (value: string) => {
		setRecipientAddress(value);
		if (errors.recipientAddress) {
			const newErrors = { ...errors };
			delete newErrors.recipientAddress;
			setErrors(newErrors);
		}
	};

	const handleAddToken = () => {
		setTokenAddresses([...tokenAddresses, { address: "", amount: "" }]);
	};

	const handleRemoveToken = (index: number) => {
		const newTokenAddresses = tokenAddresses.filter((_, i) => i !== index);
		setTokenAddresses(newTokenAddresses);
	};

	const handleTokenAddressChange = (
		index: number,
		field: "address" | "amount",
		value: string
	) => {
		const newTokenAddresses = [...tokenAddresses];
		newTokenAddresses[index] = {
			...newTokenAddresses[index],
			[field]: value,
		};
		setTokenAddresses(newTokenAddresses);
	};

	const calculateTotal = () => {
		return tokenAddresses
			.reduce((total, token) => {
				const amount = parseFloat(token.amount) || 0;
				return total + amount;
			}, 0)
			.toString();
	};

	const useCurrentWallet = async () => {
		try {
			if (typeof window.ethereum !== "undefined") {
				const accounts = await window.ethereum.request({
					method: "eth_requestAccounts",
				});
				if (accounts[0]) {
					setRecipientAddress(accounts[0]);
					toast.success("Connected to current wallet");
				}
			} else {
				toast.error("Please install MetaMask");
			}
		} catch (error) {
			console.error(error);
			toast.error("Failed to connect wallet");
		}
	};

	const handleFileUpload = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = event.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = async (e) => {
			const content = e.target?.result as string;
			const addresses = content
				.split(/\r?\n/)
				.map((line) => line.trim())
				.filter((line) => line.length > 0 && line.startsWith("0x"));

			const publicClient = createPublicClient({
				chain: mainnet,
				transport: http(),
			});

			const walletsWithBalance = await Promise.all(
				addresses.map(async (address) => {
					const balance = await publicClient.getBalance({
						address: address as `0x${string}`,
					});
					return {
						address: address as `0x${string}`,
						balance: formatEther(balance),
						selected: true,
					};
				})
			);

			setWallets(walletsWithBalance);
		};
		reader.readAsText(file);
	};

	const handleWalletSelection = (index: number) => {
		setWallets(
			wallets.map((wallet, i) =>
				i === index ? { ...wallet, selected: !wallet.selected } : wallet
			)
		);
	};

	const calculateCollectionAmount = (wallet: WalletInfo) => {
		const balance = parseFloat(wallet.balance);

		if (isNaN(balance) || balance <= 0) return 0;

		switch (collectionType) {
			case "All Quantity":
				// Leave small amount for gas
				return Math.max(0, balance - 0.001);

			case "Fixed Quantity": {
				const fixed = parseFloat(fixedQuantity);
				if (isNaN(fixed) || fixed <= 0) return 0;
				return Math.min(balance, fixed);
			}

			case "Random Quantity": {
				const min = parseFloat(randomMin) || 0;
				const max = parseFloat(randomMax) || 0;
				if (min >= max || min < 0) return 0;
				const random = min + Math.random() * (max - min);
				return Math.min(balance, random);
			}

			case "Random Percentage": {
				const percent = parseFloat(randomPercentage);
				if (isNaN(percent) || percent <= 0 || percent > 100) return 0;
				return (balance * percent) / 100;
			}

			case "Keep Fixed Quantity": {
				const keep = parseFloat(keepFixedQuantity);
				if (isNaN(keep) || keep < 0) return 0;
				return Math.max(0, balance - keep);
			}

			default:
				return 0;
		}
	};

	const auditBalance = async () => {
		if (!wallets.length) return;

		setIsAuditing(true);
		try {
			const publicClient = createPublicClient({
				chain: mainnet,
				transport: http(),
			});

			const updatedWallets = await Promise.all(
				wallets.map(async (wallet) => {
					const balance = await publicClient.getBalance({
						address: wallet.address as `0x${string}`,
					});
					return {
						...wallet,
						balance: formatEther(balance),
					};
				})
			);

			setWallets(updatedWallets);
			toast.success("Balances updated successfully");
		} catch (error) {
			console.error(error);
			toast.error("Failed to audit balances");
		} finally {
			setIsAuditing(false);
		}
	};

	const handlePrivateKeyInput = async (value: string) => {
		try {
			const privateKeys = value
				.split(/\r?\n/)
				.map((line) => line.trim())
				.filter((line) => line.length > 0);

			const newWallets = await Promise.all(
				privateKeys.map(async (privateKey) => {
					try {
						const account = privateKeyToAccount(
							`0x${privateKey.replace("0x", "")}`
						);
						const publicClient = createPublicClient({
							chain: mainnet,
							transport: http(),
						});
						const balance = await publicClient.getBalance({
							address: account.address,
						});

						return {
							address: account.address,
							balance: formatEther(balance),
							selected: true,
							privateKey,
						};
					} catch (error) {
						toast.error(
							`Invalid private key: ${privateKey.slice(0, 10)}...`
						);
						return null;
					}
				})
			);

			const validWallets = newWallets.filter(
				(w): w is NonNullable<typeof w> => w !== null
			);
			setWallets(validWallets);
			toast.success(
				`Successfully imported ${validWallets.length} wallets`
			);
		} catch (error) {
			console.error(error);
			toast.error("Failed to import private keys");
		}
	};

	const handleStartCollection = async () => {
		if (!recipientAddress) {
			toast.error("Please enter a collection receiving address");
			return;
		}

		if (!wallets.length) {
			toast.error("Please import wallets first");
			return;
		}

		setLoading(true);
		try {
			const selectedWallets = wallets.filter((w) => w.selected);
			const totalAmount = selectedWallets.reduce(
				(sum, wallet) => sum + calculateCollectionAmount(wallet),
				0
			);

			if (totalAmount <= 0) {
				throw new Error("No tokens available to collect");
			}

			// Create clients
			const publicClient = createPublicClient({
				chain: mainnet,
				transport: http(),
			});

			let successful = 0;
			let failed = 0;

			// Process each selected wallet
			for (const wallet of selectedWallets) {
				const collectionAmount = calculateCollectionAmount(wallet);
				if (collectionAmount <= 0) continue;

				try {
					const amount = parseEther(collectionAmount.toString());

					if (!wallet.privateKey) {
						throw new Error("No private key available for wallet");
					}

					const account = privateKeyToAccount(
						`0x${wallet.privateKey.replace("0x", "")}`
					);
					const walletClient = createWalletClient({
						account,
						chain: mainnet,
						transport: http(),
					});

					if (selectedTokenType === "ETH") {
						const hash = await walletClient.sendTransaction({
							to: recipientAddress as `0x${string}`,
							value: amount,
							account: account.address as `0x${string}`,
						});

						await publicClient.waitForTransactionReceipt({ hash });
						successful++;
						toast.success(
							`Successfully collected ETH from ${wallet.address.slice(
								0,
								6
							)}...`
						);
					} else if (tokenAddresses.length > 0) {
						const { request } = await publicClient.simulateContract(
							{
								address: tokenAddresses[0]
									.address as `0x${string}`,
								abi: erc20Abi,
								functionName: "transfer",
								args: [
									recipientAddress as `0x${string}`,
									amount,
								],
								account: wallet.address as `0x${string}`,
							}
						);

						const hash = await walletClient.writeContract(request);
						await publicClient.waitForTransactionReceipt({ hash });
						successful++;
						toast.success(
							`Successfully collected tokens from ${wallet.address.slice(
								0,
								6
							)}...`
						);
					}
				} catch (error) {
					console.error(
						`Failed to collect from ${wallet.address}:`,
						error
					);
					failed++;
					toast.error(
						`Failed to collect from ${wallet.address.slice(
							0,
							6
						)}...`
					);
					// Continue with next wallet despite error
					continue;
				}
			}

			toast.success(
				`Collection completed: ${successful} successful, ${failed} failed`
			);
			await auditBalance(); // Refresh balances after collection
		} catch (error) {
			console.error(error);
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to start collection"
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex flex-col gap-6 max-w-4xl mx-auto p-4 md:p-8">
			<div className="flex flex-col gap-4">
				<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
					<h1 className="text-2xl md:text-3xl font-bold mb-2 md:mb-0">
						Multisender (Many-to-One)
					</h1>
					<div className="px-3 py-1 bg-[#140E17] text-[#CB3CFF] rounded-md flex items-center gap-2">
						<span className="text-sm">✓</span>
						<span className="text-sm font-medium">
							Security Reminder, Must Read!
						</span>
					</div>
				</div>
				<p className="text-white">
					Easily consolidate tokens scattered across multiple accounts
					into a single main account, improving fund management
					efficiency while reducing transaction costs and time.
				</p>
			</div>

			<div className="bg- shadow-sm p-4 md:p-6 rounded-lg">
				<div className="flex flex-col gap-4">
					<div className="flex flex-wrap gap-2 border-b">
						{[
							"All Quantity",
							"Fixed Quantity",
							"Random Quantity",
							"Random Percentage",
							"Keep Fixed Quantity",
						].map((type) => (
							<button
								key={type}
								className={`px-4 py-2 text-[13px] md:text-base -mb-px ${
									collectionType === type
										? "text-[#CB3CFF] border-b-2 border-[#CB3CFF] font-medium"
										: "text-white hover:text-gray-700"
								}`}
								onClick={() =>
									setCollectionType(type as CollectionType)
								}
							>
								{type}
							</button>
						))}
					</div>

					{/* Collection Type Specific Inputs */}
					{collectionType === "Fixed Quantity" && (
						<div className="flex flex-col gap-2">
							<label className="font-bold mt-2 text-white text-lg md:text-xl">
								Fixed amount to collect from each wallet
							</label>
							<input
								type="number"
								step="0.000001"
								min="0"
								placeholder="Enter fixed amount in ETH"
								className="input bg-[#140E17] h-[48px] md:h-[57px] hover:border-[#CB3CFF] focus:border-0 focus:ring-0 w-full"
								value={fixedQuantity}
								onChange={(e) =>
									setFixedQuantity(e.target.value)
								}
							/>
						</div>
					)}

					{collectionType === "Random Quantity" && (
						<div className="flex flex-col md:flex-row gap-4">
							<div className="flex-1 mt-2">
								<label className="text-lg md:text-xl text-white">
									Minimum amount (ETH)
								</label>
								<input
									type="number"
									step="0.000001"
									min="0"
									placeholder="Min amount"
									className="input mt-2 bg-[#140E17] h-[48px] md:h-[57px] hover:border-[#CB3CFF] focus:border-0 focus:ring-0 w-full"
									value={randomMin}
									onChange={(e) =>
										setRandomMin(e.target.value)
									}
								/>
							</div>
							<div className="flex-1 mt-2">
								<label className="text-lg md:text-xl text-white">
									Maximum amount (ETH)
								</label>
								<input
									type="number"
									step="0.000001"
									min="0"
									placeholder="Max amount"
									className="input mt-2 bg-[#140E17] h-[48px] md:h-[57px] hover:border-[#CB3CFF] focus:border-0 focus:ring-0 w-full"
									value={randomMax}
									onChange={(e) =>
										setRandomMax(e.target.value)
									}
								/>
							</div>
						</div>
					)}

					{collectionType === "Random Percentage" && (
						<div className="flex flex-col gap-2">
							<label className="text-lg md:text-xl mt-2 text-white">
								Percentage to collect (0-100)
							</label>
							<input
								type="number"
								min="0"
								max="100"
								step="0.01"
								placeholder="Enter percentage"
								className="input bg-[#140E17] h-[48px] md:h-[57px] hover:border-[#CB3CFF] focus:border-0 focus:ring-0 w-full"
								value={randomPercentage}
								onChange={(e) =>
									setRandomPercentage(e.target.value)
								}
							/>
						</div>
					)}

					{collectionType === "Keep Fixed Quantity" && (
						<div className="flex flex-col gap-2">
							<label className="text-lg md:text-xl mt-2 text-white">
								Amount to keep in each wallet (ETH)
							</label>
							<input
								type="number"
								step="0.000001"
								min="0"
								placeholder="Amount to keep"
								className="input bg-[#140E17] h-[48px] md:h-[57px] hover:border-[#CB3CFF] focus:border-0 focus:ring-0 w-full"
								value={keepFixedQuantity}
								onChange={(e) =>
									setKeepFixedQuantity(e.target.value)
								}
							/>
						</div>
					)}

					<div className="flex flex-col gap-4">
						<div>
							<label className="block mb-2 font-bold mt-2 text-white text-lg md:text-xl">
								<span className="text-red-500 mr-1">*</span>
								Collection Receiving Address
							</label>
							<div className="flex flex-col md:flex-row gap-2">
								<input
									type="text"
									placeholder="Please enter the address to receive collected tokens and carefully confirm the address"
									className="input bg-[#140E17] min-h-[48px] md:min-h-[57px]  md:h-[57px] hover:border-[#CB3CFF] focus:border-0 focus:ring-0 flex-1"
									value={recipientAddress}
									onChange={(e) =>
										handleRecipientAddressChange(
											e.target.value
										)
									}
								/>
								<button
									onClick={useCurrentWallet}
									className="btn w-full md:w-[165px] h-[48px] md:h-[57px] grad p-[1px] min-w-[140px]"
								>
									<div className="justify-center rounded-[3.15px] items-center mx-auto bg-[#140E17] flex h-full w-full">
										<h2>Current Wallet</h2>
									</div>
								</button>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 my-5 gap-4">
							<div className="bg-[#140E17] border-[#343B4F] border-[0.6px] py-4 px-4 md:px-8 rounded-lg">
								<div className="text-lg md:text-xl mt-2 text-white text-center">
									Tokens to be collected balance at receiving
									address
								</div>
								<div className="mt-2 flex items-center justify-center w-fit mx-auto gap-2">
									<Image
										src="/eth.svg"
										alt="ETH"
										width={15}
										height={26}
									/>
									<span className="font-medium">0.0</span>
								</div>
							</div>
							<div className="bg-[#140E17] border-[#343B4F] border-[0.6px] py-4 px-4 md:px-8 rounded-lg">
								<div className="text-lg md:text-xl mt-2 text-white text-center">
									Number of tokens collected this time
								</div>
								<div className="mt-2 flex items-center justify-center w-fit mx-auto gap-2">
									<Image
										src="/eth.svg"
										alt="ETH"
										width={15}
										height={26}
									/>
									<span className="font-medium text-white">
										0.0
									</span>
								</div>
							</div>
							<div className="bg-[#140E17] border-[#343B4F] border-[0.6px] py-4 px-4 md:px-8 rounded-lg">
								<div className="text-lg md:text-xl mt-2 text-white text-center">
									Number of tokens after collection
								</div>
								<div className="mt-2 flex items-center justify-center w-fit mx-auto gap-2">
									<Image
										src="/eth.svg"
										alt="ETH"
										width={15}
										height={26}
									/>
									<span className="font-medium">0.0</span>
								</div>
							</div>
						</div>

						<div className="flex flex-col gap-4">
							<div className="flex items-center gap-2">
								<span className="text-red-500">*</span>
								<label className="text-lg md:text-xl">
									Please select a token or enter the token
									contract address
								</label>
							</div>
							<div className="relative">
								<button className="w-full flex items-center gap-2 bg-[#140E17] border-[#343B4F] border-[0.6px] py-4 px-4 md:px-8 rounded-lg text-left">
									<Image
										src="/eth.svg"
										alt="ETH"
										width={15}
										height={26}
									/>
									<span>ETH Chain Native Token</span>
									<span className="ml-auto">▼</span>
								</button>
							</div>
						</div>

						<div className="flex flex-col md:flex-row gap-2">
							<label className="btn bg-[#7925A6] w-full md:w-[273px] h-[46px] mt-4">
								<input
									type="file"
									accept=".txt,.csv"
									onChange={handleFileUpload}
									className="hidden"
								/>
								Import Wallets to Collect
							</label>
							<button
								className="btn border-[#CB3CFF] border-[0.6px] bg-[#140E17] w-full md:w-[165px] cursor-pointer h-[46px] mt-4"
								disabled={!wallets.length || isAuditing}
								onClick={auditBalance}
							>
								{isAuditing ? "Auditing..." : "Audit Balance"}
							</button>
						</div>

						<div className="flex flex-col gap-2">
							<label className="text-lg md:text-xl mt-2 text-white">
								Or paste private keys (one per line)
							</label>
							<textarea
								className="textarea mt-5 min-h-[57px] w-full bg-[#140E17] hover:border-[#CB3CFF] focus:border-0 focus:ring-0 h-32"
								placeholder="Private keys (one per line)"
								onChange={(e) =>
									handlePrivateKeyInput(e.target.value)
								}
							/>
						</div>

						{wallets.length > 0 ? (
							<div className="border rounded-lg overflow-x-auto">
								<table className="w-full min-w-[600px]">
									<thead className="bg-gray-50">
										<tr>
											<th className="px-4 py-2 text-left">
												Select
											</th>
											<th className="px-4 py-2 text-left">
												Wallet Address
											</th>
											<th className="px-4 py-2 text-right">
												Balance
											</th>
											<th className="px-4 py-2 text-right">
												Collection Amount
											</th>
										</tr>
									</thead>
									<tbody>
										{wallets.map((wallet, index) => (
											<tr
												key={wallet.address}
												className="border-t"
											>
												<td className="px-4 py-2">
													<input
														type="checkbox"
														checked={
															wallet.selected
														}
														onChange={() =>
															handleWalletSelection(
																index
															)
														}
														className="checkbox"
													/>
												</td>
												<td className="px-4 py-2 font-mono text-sm break-all">
													{wallet.address}
												</td>
												<td className="px-4 py-2 text-right">
													{wallet.balance} ETH
												</td>
												<td className="px-4 py-2 text-right">
													{calculateCollectionAmount(
														wallet
													).toFixed(6)}{" "}
													ETH
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						) : (
							<div className="flex justify-center items-center py-16">
								<div className="text-center">
									<div className="mx-auto mb-3 flex items-center justify-center">
										<Image
											src={notice}
											alt="Import"
											width={24}
											height={24}
										/>
									</div>
									<p className="text-gray-500">
										Please import wallets
									</p>
								</div>
							</div>
						)}

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
							<div>
								<div className="font-medium mb-2">
									Total Address Count:
								</div>
								<div>ETH Balance: —</div>
								<div>Selected Token Balance: —</div>
							</div>
							<div>
								<div className="font-medium mb-2">
									Selected Address Count:
								</div>
								<div>ETH Balance: —</div>
								<div>Selected Token Balance: —</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="text-center text-[#AEB9E180] text-sm">
				Lowest network service fee, only 0.00005 ETH per address
			</div>

			<button
				onClick={handleStartCollection}
				disabled={loading || !wallets.length}
				className="btn bg-[#7925A6] text-white mb-20 w-full py-3 text-lg"
			>
				{loading ? "Processing..." : "Start Collection"}
			</button>

			{txHash && (
				<div className="mt-4 p-4 bg-[#140E17] rounded-lg">
					<h2 className="text-xl font-bold mb-2">
						Transaction Hash:
					</h2>
					<p className="break-all">{txHash}</p>
					<button
						onClick={() => navigator.clipboard.writeText(txHash)}
						className="btn btn-ghost btn-sm mt-2"
					>
						Copy Hash
					</button>
				</div>
			)}
		</div>
	);
}
