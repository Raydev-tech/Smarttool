/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useEffect } from "react";
import { abi } from "@/lib/abis/abi";
import { parseEther, parseUnits } from "viem";
import { useAccount, useWriteContract, useTransaction } from "wagmi";
import { CONTRACT_ADDRESS } from "../config";

export default function CreateLiquidity() {
	const { address: userAddress } = useAccount();
	const [tokenA, setTokenA] = useState("");
	const [tokenB, setTokenB] = useState("");
	const [amountA, setAmountA] = useState("");
	const [amountB, setAmountB] = useState("");
	const [loading, setLoading] = useState(false);
	const [txHash, setTxHash] = useState("");
	const [poolAddress, setPoolAddress] = useState("");
	const [poolBalance, setPoolBalance] = useState("");
	const [errors, setErrors] = useState({
		tokenA: "",
		tokenB: "",
		amountA: "",
		amountB: "",
	});

	const {
		writeContract,
		isPending: isWritePending,
		data,
		error: writeError,
	} = useWriteContract();

	const [transactionHash, setTransactionHash] = useState<
		`0x${string}` | undefined
	>(undefined);

	const {
		data: txData,
		isLoading: isConfirming,
		isSuccess: txSuccess,
		error: confirmError,
	} = useTransaction({
		hash: transactionHash,
	});

	const handleTokenAChange = (value: string) => {
		setTokenA(value);
		validateInput("tokenA", value);
	};

	const handleTokenBChange = (value: string) => {
		setTokenB(value);
		validateInput("tokenB", value);
	};

	const handleAmountAChange = (value: string) => {
		setAmountA(value);
		validateInput("amountA", value);
	};

	const handleAmountBChange = (value: string) => {
		setAmountB(value);
		validateInput("amountB", value);
	};

	const validateInput = (field: string, value: string) => {
		const newErrors = { ...errors };

		switch (field) {
			case "tokenA":
			case "tokenB":
				if (!value) {
					newErrors[field] = "Token address is required";
				} else if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
					newErrors[field] = "Invalid token address";
				} else {
					newErrors[field] = "";
				}
				break;
			case "amountA":
			case "amountB":
				if (!value) {
					newErrors[field] = "Amount is required";
				} else if (isNaN(Number(value)) || Number(value) <= 0) {
					newErrors[field] = "Amount must be a positive number";
				} else {
					newErrors[field] = "";
				}
				break;
		}

		setErrors(newErrors);
	};

	const handleCreateLiquidity = async () => {
		// Validate all inputs first
		validateInput("tokenA", tokenA);
		validateInput("tokenB", tokenB);
		validateInput("amountA", amountA);
		validateInput("amountB", amountB);

		// Check if there are any errors
		if (Object.values(errors).some((error) => error !== "")) {
			return;
		}

		if (!userAddress) {
			console.error("No wallet connected");
			return;
		}

		try {
			const hash = await writeContract({
				address: CONTRACT_ADDRESS,
				abi: abi,
				functionName: "addLiquidity",
				args: [
					tokenA as `0x${string}`, // tokenA address
					tokenB as `0x${string}`, // tokenB address
					parseUnits(amountA, 18), // amountA - assuming 18 decimals
					parseUnits(amountB, 18), // amountB - assuming 18 decimals
					parseUnits(amountA, 18), // minAmountA - using same amount for now
					parseUnits(amountB, 18), // minAmountB - using same amount for now
					false, // isEthPair - set to false for token-token pair
				],
				value: 0n, // Set to 0 since we're not dealing with ETH
			});

			if (data) {
				setTransactionHash(data);
				setTxHash(data);
			}
		} catch (error) {
			console.error("Error creating liquidity:", error);
		}
	};

	const handleReset = () => {
		setTokenA("");
		setTokenB("");
		setAmountA("");
		setAmountB("");
		setTxHash("");
		setPoolAddress("");
		setPoolBalance("");
		setErrors({
			tokenA: "",
			tokenB: "",
			amountA: "",
			amountB: "",
		});
	};

	return (
		<div className="min-h-screen bg-gradient-radial from-green-900/20 via-black to-black">
			<div className="container px-3 py-3 md:px-8 md:py-8 ">
				<div className="t mb-8">
					<h1 className="text-2xl md:text-4xl font-bold mb-2  text-white">
						Create Liquidity Pool
					</h1>
					<p className="text-white">
						Add liquidity to create a new trading pair or contribute
						to an existing pool
					</p>
				</div>

				<div className=" bg- shadow-xl  border-w0">
					<div className="">
						<div className="grid grid-cols-1  gap-6">
							{/* Token A Section */}
							<div className="">
								<div className="">
									<div className="w-full md:gap-[25px] md:flex">
										<div className="w-full mr4">
											<label className="label  text-xl mb-4 text-white">
												Token A
											</label>
											<textarea
												placeholder="Enter token A address (0x...)"
												className={`textarea h-[57px] min-h-[57px] md:w-full w-[320px] ] bg-[#140E17]  hover:border-[#CB3CFF] focus:border-0 focus:ring-0 font-mono text-sm ${
													errors.tokenA
														? "textarea-error"
														: ""
												}`}
												value={tokenA}
												onChange={(e) =>
													handleTokenAChange(
														e.target.value
													)
												}
											/>
											{errors.tokenA && (
												<label className="label">
													<span className="label-text-alt text-red-400">
														{errors.tokenA}
													</span>
												</label>
											)}
										</div>
										<div>
											<label className="label">
												<span className="label-text mt-[12px] md:mt-0 text-xl mb-4 text-white">
													Amount
												</span>
											</label>
											<input
												type="text"
												placeholder="Enter amount"
												className={`input bg-[#140E17] h-[57px] hover:border-[#CB3CFF] focus:border-0 focus:ring-0 ${
													errors.amountA
														? "input-error"
														: ""
												}`}
												value={amountA}
												onChange={(e) =>
													handleAmountAChange(
														e.target.value
													)
												}
											/>
											{errors.amountA && (
												<label className="label">
													<span className="label-text-alt text-red-400">
														{errors.amountA}
													</span>
												</label>
											)}
										</div>
									</div>
								</div>
							</div>

							{/* Token B Section */}
							<div className="c">
								<div className="">
									<div className="w-full md:gap-[25px] md:flex">
										<div className="w-full mr4">
											<label className="label">
												<span className="label-text text-xl mb-4 text-white">
													Token B
												</span>
											</label>
											<textarea
												placeholder="Enter token B address (0x...)"
												className={`textarea  h-[57px] min-h-[57px] md:w-full w-[320px] ] bg-[#140E17]  hover:border-[#CB3CFF] focus:border-0 focus:ring-0 font-mono ${
													errors.tokenB
														? "textarea-error"
														: ""
												}`}
												value={tokenB}
												onChange={(e) =>
													handleTokenBChange(
														e.target.value
													)
												}
											/>
											{errors.tokenB && (
												<label className="label">
													<span className="label-text-alt text-red-400">
														{errors.tokenB}
													</span>
												</label>
											)}
										</div>
										<div>
											<label className="label">
												<span className="label-text mt-[12px] md:mt-0 text-xl mb-4 text-white">
													Amount
												</span>
											</label>
											<input
												type="text"
												placeholder="Enter amount"
												className={`input  bg-[#140E17] h-[57px] hover:border-[#CB3CFF] focus:border-0 focus:ring-0${
													errors.amountB
														? "input-error"
														: ""
												}`}
												value={amountB}
												onChange={(e) =>
													handleAmountBChange(
														e.target.value
													)
												}
											/>
											{errors.amountB && (
												<label className="label">
													<span className="label-text-alt text-red-400">
														{errors.amountB}
													</span>
												</label>
											)}
										</div>
									</div>
								</div>
							</div>
						</div>

						<div className="flex md:flex-col sm:flex-rw gap-4 justify-center mt-6">
							<button
								onClick={handleCreateLiquidity}
								disabled={isWritePending || isConfirming}
								className="btn getstarted w-[178px] md:w-[188px] h-[46px] mt-[16px] "
							>
								{isWritePending || isConfirming ? (
									<>
										<span className="loading loading-spinner"></span>
										{isWritePending
											? "Waiting for approval..."
											: "Creating..."}
									</>
								) : (
									"Create Liquidity Pool"
								)}
							</button>
							<button
								onClick={handleReset}
								className="btn border-[#CB3CFF] border-[0.6px] bg-[#140E17] w-[133px] md:w-[165px] h-[46px] mt-[16px] "
							>
								Reset Form
							</button>
						</div>
					</div>
				</div>

				{(txHash || poolAddress || poolBalance) && (
					<div className="mt-8">
						<div className="">
							<div className="card-body">
								<h2 className="text-2xl mb-6 text-white">
									Transaction Details
								</h2>

								{txHash && (
									<div className="bg-[#0A1330] rounded-lg p-6 mb-6 border-[0.6px] border-[#343B4F]">
										<div className="flex justify-between items-start mb-2">
											<h3 className="text-lg font-semibold">
												Transaction Hash
											</h3>
											<button
												onClick={() =>
													navigator.clipboard.writeText(
														txHash
													)
												}
												className="btn btn-ghost btn-sm"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													className="h-5 w-5"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
													/>
												</svg>
												Copy
											</button>
										</div>
										<p className="font-mono text-sm break-all bg-base-300 p-3 rounded">
											{txHash}
										</p>
									</div>
								)}

								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className=" border-[0.6px] border-[#343B4F] bg-[#0A1330] rounded-lg p-6">
										<div className="">
											<h3 className="text-sm font-semibold text-white">
												Pool Address
											</h3>
											<p className="font-mono text-sm break-all">
												{poolAddress || "Not available"}
											</p>
										</div>
									</div>
									<div className=" border-[0.6px] border-[#343B4F] bg-[#0A1330] rounded-lg p-6">
										<div className="">
											<h3 className="text-sm font-semibold text-white">
												Pool Balance
											</h3>
											<p className="text-2xl font-bold">
												{poolBalance || "0"}
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
