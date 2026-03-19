/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { toast } from "sonner";
import {
	createPublicClient,
	createWalletClient,
	http,
	parseAbi,
	parseUnits,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";
import Image from "next/image";
import write from "../assets/write.svg";
import upload from "../assets/upload.svg";
import cancel from "../assets/cancel.svg";

interface Recipient {
	address: string;
	amount: string;
}

interface Errors {
	tokenAddress?: string;
	privateKey?: string;
	[key: string]: string | undefined;
}

type TokenType = "erc20" | "eth";

const erc20Abi = parseAbi([
	"function approve(address spender, uint256 amount) external returns (bool)",
	"function transfer(address to, uint256 amount) external returns (bool)",
	"function transferFrom(address from, address to, uint256 amount) external returns (bool)",
	"function balanceOf(address account) external view returns (uint256)",
	"function decimals() external view returns (uint8)",
]);

export default function Page() {
	const [tokenType, setTokenType] = useState<TokenType>("erc20");
	const [tokenAddress, setTokenAddress] = useState("");
	const [privateKey, setPrivateKey] = useState("");
	const [recipients, setRecipients] = useState<Recipient[]>([]);
	const [errors, setErrors] = useState<Errors>({});
	const [loading, setLoading] = useState(false);
	const [txHash, setTxHash] = useState("");
	const [sameAmountForAll, setSameAmountForAll] = useState(false);
	const [commonAmount, setCommonAmount] = useState("");

	const handleTokenAddressChange = (value: string) => {
		setTokenAddress(value);
		if (errors.tokenAddress) {
			const newErrors = { ...errors };
			delete newErrors.tokenAddress;
			setErrors(newErrors);
		}
	};

	const handlePrivateKeyChange = (value: string) => {
		setPrivateKey(value);
		if (errors.privateKey) {
			const newErrors = { ...errors };
			delete newErrors.privateKey;
			setErrors(newErrors);
		}
	};

	const handleCommonAmountChange = (value: string) => {
		setCommonAmount(value);
		if (sameAmountForAll) {
			const updatedRecipients = recipients.map((recipient) => ({
				...recipient,
				amount: value,
			}));
			setRecipients(updatedRecipients);
		}
	};

	const handleRecipientChange = (
		index: number,
		field: "address" | "amount",
		value: string
	) => {
		const newRecipients = [...recipients];
		newRecipients[index] = {
			...newRecipients[index],
			[field]: value,
		};
		setRecipients(newRecipients);

		if (errors[`${field}${index}`]) {
			const newErrors = { ...errors };
			delete newErrors[`${field}${index}`];
			setErrors(newErrors);
		}
	};

	const handleAddRecipient = () => {
		setRecipients([
			...recipients,
			{ address: "", amount: sameAmountForAll ? commonAmount : "" },
		]);
	};

	const handleRemoveRecipient = (index: number) => {
		setRecipients(recipients.filter((_, i) => i !== index));
	};

	const toggleSameAmount = () => {
		setSameAmountForAll(!sameAmountForAll);
		if (!sameAmountForAll && commonAmount) {
			const updatedRecipients = recipients.map((recipient) => ({
				...recipient,
				amount: commonAmount,
			}));
			setRecipients(updatedRecipients);
		}
	};

	const calculateTotal = () => {
		return recipients
			.reduce((total, recipient) => {
				const amount = parseFloat(recipient.amount) || 0;
				return total + amount;
			}, 0)
			.toString();
	};

	const handleSend = async () => {
		setLoading(true);
		try {
			if (!privateKey || recipients.length === 0) {
				throw new Error("Please fill in all required fields");
			}
			if (tokenType === "erc20" && !tokenAddress) {
				throw new Error(
					"Please enter token address for ERC20 transfer"
				);
			}

			const publicClient = createPublicClient({
				chain: mainnet,
				transport: http(),
			});

			const account = privateKeyToAccount(
				`0x${privateKey.replace("0x", "")}`
			);
			const walletClient = createWalletClient({
				account,
				chain: mainnet,
				transport: http(),
			});

			let successful = 0;
			let failed = 0;

			// Check balance and decimals for ERC20
			let decimals = 18; // Default for ETH
			if (tokenType === "erc20") {
				decimals = await publicClient.readContract({
					address: tokenAddress as `0x${string}`,
					abi: erc20Abi,
					functionName: "decimals",
				});

				// Calculate total amount for ERC20
				const totalAmountBigInt = recipients.reduce(
					(total, recipient) => {
						const amountInWei = parseUnits(
							recipient.amount || "0",
							decimals
						);
						return total + amountInWei;
					},
					0n
				);

				// Check ERC20 balance
				const balance = await publicClient.readContract({
					address: tokenAddress as `0x${string}`,
					abi: erc20Abi,
					functionName: "balanceOf",
					args: [account.address],
				});

				if (balance < totalAmountBigInt) {
					throw new Error("Insufficient token balance");
				}
			} else {
				// Check ETH balance
				const balance = await publicClient.getBalance({
					address: account.address,
				});

				const totalAmount = recipients.reduce((total, recipient) => {
					return (
						total + parseUnits(recipient.amount || "0", decimals)
					);
				}, 0n);

				if (balance < totalAmount) {
					throw new Error("Insufficient ETH balance");
				}
			}

			// Send tokens to each recipient
			for (const recipient of recipients) {
				try {
					const amountInWei = parseUnits(
						recipient.amount || "0",
						decimals
					);
					let hash;

					if (tokenType === "erc20") {
						hash = await walletClient.writeContract({
							address: tokenAddress as `0x${string}`,
							abi: erc20Abi,
							functionName: "transfer",
							args: [
								recipient.address as `0x${string}`,
								amountInWei,
							],
						});
					} else {
						hash = await walletClient.sendTransaction({
							to: recipient.address as `0x${string}`,
							value: amountInWei,
						});
					}

					await publicClient.waitForTransactionReceipt({ hash });
					successful++;
					toast.success(
						`Successfully sent ${recipient.amount} ${
							tokenType === "eth" ? "ETH" : "tokens"
						} to ${recipient.address}`
					);
				} catch (error: any) {
					failed++;
					toast.error(
						`Failed to send ${
							tokenType === "eth" ? "ETH" : "tokens"
						} to ${recipient.address}`
					);
					console.error(
						`Error sending to ${recipient.address}:`,
						error
					);
				}
			}

			setTxHash("Completed");
			toast.success(
				`Completed: ${successful} successful, ${failed} failed transfers`
			);
		} catch (error: any) {
			toast.error(error.message || "An error occurred");
			console.error("Send error:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="container mx-auto px-4 tracking-0 py-8 max-w-6xl">
			<h1 className="text-2xl md:text-3xl font-bold mb-2 t">
				Multisender (One to Many)
			</h1>
			<div className="flex flex-col gap-6">
				<div className=" shadow-sm p-3 md:p-6 mb-6">
					<label className="block font-medium text-white mb-3">
						* Select Token Type
					</label>
					<div className="flex gap-4">
						<button
							onClick={() => setTokenType("eth")}
							className={`flex items-center p-2 md:p-3 w-[243px] h-[80px] border-[#AEB9E1] border-[0.6px] rounded-lg transition-colors ${
								tokenType === "eth"
									? "bor border-[#343B4F] "
									: "hover:border-[#CB3CFF] bg-[#140E17]"
							}`}
						>
							<Image
								src="/ethtoken.svg"
								alt="ETH"
								width={32}
								height={32}
								className="mr-1.5 md:mr-3"
							/>
							<div className="text-left">
								<span className="font-medium text-sm md:text-base text-left text-white">
									ETH
								</span>
								<p className="text-[10px] md:text-xs  text-left text-[#AEB9E1] mt-1">
									Ethereum Native Token
								</p>
							</div>
						</button>
						<button
							onClick={() => setTokenType("erc20")}
							className={`flex items-center p-2 md:p-5 border w-[243px] h-[80px] rounded-lg transition-colors ${
								tokenType === "erc20"
									? " border-[#343B4F]"
									: "hover:border-[#CB3CFF] border-[#343B4F] border-[0.6px] bg-[#140E17]"
							}`}
						>
							<Image
								src="/globe.svg"
								alt="ERC20"
								width={32}
								height={32}
								className="mr-1.5 md:mr-3"
							/>
							<div>
								<span className="font-medium text-sm md:text-base text-white">
									ERC20 Token
								</span>
								<p className="text-[10px] md:text-xs  text-left text-[#AEB9E1] mt-1">
									Custom Token
								</p>
							</div>
						</button>
					</div>
				</div>
				<div className="md:flex w-[93%]">
					{tokenType === "erc20" && (
						<div className="md:flex flex-col gap-2">
							<div>
								<span className="text-red-500">*</span>
								<label className="font-bold text-xl ml-2 ">
									Token Address
								</label>
								<input
									type="text"
									placeholder="Token contract address"
									className={`input mb-[20px] md:mb-0  mt-[20px] md:w-[488px] bg-[#140E17] h-[57px] hover:border-[#CB3CFF] focus:border-0 focus:ring-0 ${
										errors.tokenAddress ? "input-error" : ""
									}`}
									value={tokenAddress}
									onChange={(e) =>
										handleTokenAddressChange(e.target.value)
									}
								/>
								{errors.tokenAddress && (
									<span className="text-error text-sm">
										{errors.tokenAddress}
									</span>
								)}
							</div>
						</div>
					)}

					<div className="flex flex-col gap-2">
						<div className="block">
							<div>
								<span className="text-red-500">*</span>
								<label className="font-bold text-xl ml-2  ">
									Master Wallet Private Key
								</label>
							</div>
							<input
								type="password"
								placeholder="Enter private key"
								className={`input mt-[20px] md:w-[488px] bg-[#140E17] h-[57px] hover:border-[#CB3CFF] focus:border-0 focus:ring-0 ${
									errors.privateKey ? "input-error" : ""
								}`}
								value={privateKey}
								onChange={(e) =>
									handlePrivateKeyChange(e.target.value)
								}
							/>
							{errors.privateKey && (
								<span className="text-error text-sm">
									{errors.privateKey}
								</span>
							)}
						</div>
					</div>
				</div>
				<div className="flex flex-col gap-2">
					<div className="flex flex-col gap-2">
						<div className="flex gap-[15px] md:gap-[39px] mt-[19px] mb-[40px] ">
							<button
								className="btn border-[#343B4F] border-[0.6px] bg-[#140E17] "
								onClick={() => setRecipients([])}
							>
								<div className="flex">
									<Image
										src={write}
										alt="write"
										className="mr-[6px]"
									/>
									<h2 className="my-auto text-sm font-medium ">
										Manual Input
									</h2>
								</div>
							</button>
							<button className="btn border-[#343B4F] border-[0.6px] bg-[#140E17]">
								<div className="flex">
									<Image
										src={upload}
										alt="write"
										className="mr-[6px]"
									/>
									<h2 className="my-auto text-sm font-medium ">
										Upload File
									</h2>
								</div>
							</button>
						</div>

						<div className="md:flex items-center mt[40px] gap-4 mb-2 md:mb-4">
							<div className="form-control">
								<label className="label cursor-pointer">
									<input
										type="checkbox"
										className="checkbox border-[#343B4F]"
										checked={sameAmountForAll}
										onChange={toggleSameAmount}
									/>
									<span className="label-text ml-2">
										Same amount for all
									</span>
								</label>
							</div>
							{sameAmountForAll && (
								<input
									type="text"
									placeholder="Enter amount for all"
									className="input mt-[10px] md:mt-0 bg-[#140E17] h hover:border-[#CB3CFF] focus:border-0 focus:ring-0 w-48"
									value={commonAmount}
									onChange={(e) =>
										handleCommonAmountChange(e.target.value)
									}
								/>
							)}
						</div>
					</div>

					<div className="flex flex-col space-x-[30px] gap-5">
						{recipients.map((recipient, index) => (
							<div key={index} className="flex gap-2">
								<input
									type="text"
									placeholder="Address"
									className={`textarea h-[57px] min-h-[57px] md:w-[488px] bg-[#140E17]  hover:border-[#CB3CFF] focus:border-0 focus:ring-0 ${
										errors[`address${index}`]
											? "textarea-error"
											: ""
									}`}
									value={recipient.address}
									onChange={(e) =>
										handleRecipientChange(
											index,
											"address",
											e.target.value
										)
									}
								/>
								<input
									type="text"
									placeholder="Amount"
									className={`input bg-[#140E17] h-[57px] hover:border-[#CB3CFF] focus:border-0 focus:ring-0 w-40 ${
										errors[`amount${index}`]
											? "input-error"
											: ""
									}`}
									value={recipient.amount}
									onChange={(e) =>
										handleRecipientChange(
											index,
											"amount",
											e.target.value
										)
									}
									disabled={sameAmountForAll}
								/>
								<button
									onClick={() => handleRemoveRecipient(index)}
									className="btn bg-[#140E17] btn-square"
								>
									<Image src={cancel} alt="Remove" />
								</button>
							</div>
						))}
					</div>
					<button
						onClick={handleAddRecipient}
						className="btn  bg-[#7925A6] w-[165px] h-[46px] mt-[16px] "
					>
						Add Recipient
					</button>
				</div>

				<div className="flex gap-4">
					<div className="bg-[#140E17] border-[#343B4F] border-[0.6px] py-2 md:py-4 px-4 md:px-8 rounded">
						<p className="text-xs md:text-sm font-semibold ">
							Number of Recipients
						</p>
						<p className="font-bold text-2xl md:text-3xl mt-[5px] ">
							{recipients.length}
						</p>
					</div>
					<div className="bg-[#140E17] border-[#343B4F] border-[0.6px] py-2 md:py-4 px-4 md:px-8 p-4 rounded">
						<p className="text-xs md:text-sm font-semibold ">
							Total Amount
						</p>
						<p className="font-bold text-2xl md:text-3xl mt-[5px] ">
							{calculateTotal()}{" "}
							{tokenType === "eth" ? "ETH" : "tokens"}
						</p>
					</div>
				</div>

				<div className="flex gap-4">
					<button
						onClick={handleSend}
						disabled={loading}
						className="btn  bg-[#7925A6] w-[165px] h-[46px] mt-[16px]"
					>
						{loading ? "Sending..." : "Send"}
					</button>
					<button
						onClick={() => {
							setTokenType("erc20");
							setTokenAddress("");
							setPrivateKey("");
							setRecipients([]);
							setErrors({});
							setSameAmountForAll(false);
							setCommonAmount("");
						}}
						className="btn border-[#343B4F] border-[0.6px] bg-[#140E17] w-[133px] md:w-[165px] h-[46px] mt-[16px] "
					>
						Reset
					</button>
				</div>

				{txHash && (
					<div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Transaction Hash
						</label>
						<div className="break-all text-blue-600">{txHash}</div>
					</div>
				)}
			</div>
		</div>
	);
}
