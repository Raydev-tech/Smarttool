/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import { z } from "zod";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { abi } from "@/lib/abis/abi";
import { toast } from "sonner";
import { useAccount, useWriteContract, useTransaction } from "wagmi";
import Image from "next/image";
import { CONTRACT_ADDRESS } from "../config";

const tokenSchema = z.object({
	tokenName: z.string().min(1, "Token name is required"),
	tokenSymbol: z
		.string()
		.min(1, "Token symbol is required")
		.max(8, "Token symbol must be 8 characters or less"),
	supply: z
		.string()
		.min(1, "Supply is required")
		.refine((val) => !isNaN(Number(val)), "Supply must be a valid number"),
	precision: z
		.string()
		.refine(
			(val) =>
				!isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 18,
			"Precision must be between 0 and 18"
		),
});

type TokenFormData = z.infer<typeof tokenSchema>;

const MULTI_FEATURE_TOKEN_ADDRESS = CONTRACT_ADDRESS as `0x${string}`; // Replace with your deployed contract address

interface DeployedToken {
	address: `0x${string}`;
	name: string;
	symbol: string;
	supply: string;
	timestamp: number;
}

export default function TokenCreation() {
	const [formData, setFormData] = useState<TokenFormData>({
		tokenName: "",
		tokenSymbol: "",
		supply: "",
		precision: "18",
	});
	const [errors, setErrors] = useState<
		Partial<Record<keyof TokenFormData, string>>
	>({});
	const [isDeploying, setIsDeploying] = useState(false);
	const [deployedTokens, setDeployedTokens] = useState<DeployedToken[]>([]);
	const { address } = useAccount();
	const { writeContract } = useWriteContract();
	const { data: receipt, isLoading: isWaitingForTransaction } =
		useTransaction({
			hash: undefined, // Will be set when we get the hash from writeContract
		});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const result = tokenSchema.safeParse(formData);

		if (!result.success) {
			const formattedErrors: Partial<
				Record<keyof TokenFormData, string>
			> = {};
			result.error.errors.forEach((error) => {
				const path = error.path[0] as keyof TokenFormData;
				formattedErrors[path] = error.message;
			});
			setErrors(formattedErrors);
			return;
		}

		setErrors({});

		try {
			setIsDeploying(true);
			if (!window.ethereum) {
				throw new Error(
					"Please install MetaMask or another web3 wallet"
				);
			}

			if (!address) {
				throw new Error("Please connect your wallet first");
			}

			const hash = await writeContract({
				address: MULTI_FEATURE_TOKEN_ADDRESS,
				abi,
				functionName: "deployNewToken",
				args: [
					formData.tokenName,
					formData.tokenSymbol,
					BigInt(formData.supply),
					parseInt(formData.precision),
				],
			});

			if (!receipt) return; // Wait for receipt from useWaitForTransaction

			// Find the TokenDeployed event
			const event = receipt.logs.find(
				(log: any) =>
					log.address.toLowerCase() ===
					MULTI_FEATURE_TOKEN_ADDRESS.toLowerCase()
			);

			if (event && event.topics[1]) {
				const tokenAddress = event.topics[1] as `0x${string}`; // The indexed tokenAddress parameter
				const newToken: DeployedToken = {
					address: tokenAddress,
					name: formData.tokenName,
					symbol: formData.tokenSymbol,
					supply: formData.supply,
					timestamp: Date.now(),
				};

				setDeployedTokens((prev) => [newToken, ...prev]);
				toast.success(`Token deployed successfully at ${tokenAddress}`);
			} else {
				toast.success("Token deployed successfully");
			}

			// Reset form
			setFormData({
				tokenName: "",
				tokenSymbol: "",
				supply: "",
				precision: "18",
			});
		} catch (error) {
			console.error(error);
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to deploy token"
			);
		} finally {
			setIsDeploying(false);
		}
	};

	const handleInputChange = (field: keyof TokenFormData, value: string) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors((prev) => ({
				...prev,
				[field]: undefined,
			}));
		}
	};

	const getEtherscanLink = (address: `0x${string}`) => {
		if (mainnet.id === 31337) {
			return `http://localhost:8545/${address}`;
		}
		return `https://abscan.org/token/${address}`;
	};

	return (
		<div className="p-4 max-w-6xl mx-auto">
			<div className="mb-8 tracking-0">
				<h1 className="text-24px] mt-[20px] md:mt-0 text-center md:text-left text-[30px] leading-[22px] font-bold">
					Create Standard Token
				</h1>
				<p className="text-white text-[13px] text-center md:text-left md:text-base mt-[30px]">
					Create ETH standard tokens quickly in one minute. Fast,
					simple, and cheap creation of ERC20 tokens with no
					programming required, clean contracts, no taxes, no
					functions. One-click issuance of your exclusive token!
				</p>
			</div>

			<div className="md:flex gap-8">
				<div className="flex-1">
					<form
						onSubmit={handleSubmit}
						className="space-y-6 text-white"
					>
						<div>
							<label className="label mb-[20px] ">
								<span className="label-text">
									Token Full Name
								</span>
								<span className="text-error">*</span>
							</label>
							<input
								type="text"
								className={`input border-[#343B4F] outline-0 outline-none bg-[#140E17] placeholder:text-[#AEB9E180] w-full md:w-[488px] h-[57px] ${
									errors.tokenName ? "input-error" : ""
								}`}
								placeholder="Please enter the token full name"
								value={formData.tokenName}
								onChange={(e) =>
									handleInputChange(
										"tokenName",
										e.target.value
									)
								}
								required
							/>
							{errors.tokenName && (
								<p className="text-error text-sm mt-1">
									{errors.tokenName}
								</p>
							)}
						</div>

						<div>
							<label className="label mb-[20px] ">
								<span className="label-text">Token Symbol</span>
								<span className="text-error">*</span>
							</label>
							<input
								type="text"
								className={`input border-[#343B4F] bg-[#140E17] placeholder:text-[#AEB9E180]  w-full md:w-[488px] h-[57px] ${
									errors.tokenSymbol ? "input-error" : ""
								}`}
								placeholder="Please enter the token symbol"
								value={formData.tokenSymbol}
								onChange={(e) =>
									handleInputChange(
										"tokenSymbol",
										e.target.value
									)
								}
								required
							/>
							{errors.tokenSymbol && (
								<p className="text-error text-sm mt-1">
									{errors.tokenSymbol}
								</p>
							)}
						</div>

						<div>
							<label className="label mb-[20px] ">
								<span className="label-text">Supply</span>
								<span className="text-error">*</span>
							</label>
							<textarea
								className={`textarea border-[#343B4F] bg-[#140E17] placeholder:text-[#AEB9E180]  w-full md:w-[488px] h-24 ${
									errors.supply ? "textarea-error" : ""
								}`}
								placeholder="Please enter the supply"
								value={formData.supply}
								onChange={(e) =>
									handleInputChange("supply", e.target.value)
								}
								required
							/>
							{errors.supply && (
								<p className="text-error text-sm mt-1">
									{errors.supply}
								</p>
							)}
						</div>

						<div>
							<label className="label mb-[20px] ">
								<span className="label-text">Precision</span>
								<span className="text-error">*</span>
							</label>
							<input
								type="number"
								className={`input border-[#343B4F] bg-[#140E17] placeholder:text-[#AEB9E180]  w-full md:w-[488px] h-[57px] ${
									errors.precision ? "input-error" : ""
								}`}
								value={formData.precision}
								onChange={(e) =>
									handleInputChange(
										"precision",
										e.target.value
									)
								}
								required
							/>
							{errors.precision && (
								<p className="text-error text-sm mt-1">
									{errors.precision}
								</p>
							)}
						</div>
						<p className="text-center text-[#AEB9E180] text-sm">
							Lowest network service fee, only 0.005 ETH
						</p>
						<button
							type="submit"
							className="btn getstarted w-[165px] h-[46px] mb-[40px] md:mb-0 mx-auto flex "
							disabled={isDeploying || isWaitingForTransaction}
						>
							{isWaitingForTransaction
								? "Waiting for confirmation..."
								: isDeploying
								? "Deploying..."
								: "Create Token"}
						</button>
					</form>
				</div>

				<div className="flex-1">
					{deployedTokens.length > 0 ? (
						<div className="bg-white rounded-lg shadow-lg p-6">
							<h2 className="text-xl font-bold mb-4">
								Your Deployed Tokens
							</h2>
							<div className="space-y-4">
								{deployedTokens.map((token) => (
									<div
										key={token.address}
										className="bg-gray-50 p-4 rounded-lg"
									>
										<div className="flex items-center justify-between mb-2">
											<h3 className="font-semibold">
												{token.name} ({token.symbol})
											</h3>
											<span className="text-sm text-gray-500">
												{new Date(
													token.timestamp
												).toLocaleString()}
											</span>
										</div>
										<div className="text-sm text-gray-600 mb-2">
											Supply: {token.supply}
										</div>
										<div className="flex items-center gap-2">
											<code className="text-xs bg-gray-100 p-1 rounded">
												{token.address}
											</code>
											<a
												href={getEtherscanLink(
													token.address
												)}
												target="_blank"
												rel="noopener noreferrer"
												className="text-blue-500 hover:text-blue-700"
											>
												View on Blockchain Explorer
											</a>
										</div>
									</div>
								))}
							</div>
						</div>
					) : (
						<Image
							src="/eth.svg"
							alt="Token Creation"
							className="hidden md:block  "
							width={350}
							height={100}
						/>
					)}
				</div>
			</div>
		</div>
	);
}
