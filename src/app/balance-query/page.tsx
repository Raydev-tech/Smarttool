"use client";

import { useState } from "react";
import {
	createPublicClient,
	http,
	parseAbi,
	getAddress,
	isAddress,
} from "viem";
import { mainnet } from "viem/chains";
import { z } from "zod";
import { toast } from "sonner";
import Image from "next/image";
import write from "../assets/write.svg";
import upload from "../assets/upload.svg";

// Zod schemas
const addressSchema = z.string().refine((val) => isAddress(val), {
	message: "Invalid Ethereum address",
});

const addressArraySchema = z.array(addressSchema).min(1, {
	message: "At least one address is required",
});

const tokenAddressSchema = z.union([z.string().length(0), addressSchema]);

const queryResultSchema = z.object({
	address: addressSchema,
	ethBalance: z.bigint(),
	tokenBalance: z.bigint().optional(),
});

type QueryResult = z.infer<typeof queryResultSchema>;

export default function BalanceQuery() {
	const [addresses, setAddresses] = useState<string[]>([""]);
	const [results, setResults] = useState<QueryResult[]>([]);
	const [tokenAddress, setTokenAddress] = useState("");
	const [loading, setLoading] = useState(false);

	const client = createPublicClient({
		chain: mainnet,
		transport: http(),
	});

	const validateAddress = (address: string, index: number) => {
		try {
			if (address.trim() === "") return;
			addressSchema.parse(address);
		} catch (error) {
			if (error instanceof z.ZodError) {
				toast.error(
					`Invalid address at line ${index + 1}: ${
						error.errors[0].message
					}`
				);
			}
		}
	};

	const validateTokenAddress = (address: string) => {
		try {
			tokenAddressSchema.parse(address);
		} catch (error) {
			if (error instanceof z.ZodError) {
				toast.error(
					`Invalid token address: ${error.errors[0].message}`
				);
			}
		}
	};

	const handleAddressChange = (value: string, index: number) => {
		const newAddresses = [...addresses];
		newAddresses[index] = value;
		setAddresses(newAddresses);
		validateAddress(value, index);
	};

	const handleTokenAddressChange = (value: string) => {
		setTokenAddress(value);
		validateTokenAddress(value);
	};

	const handleAddAddress = () => {
		setAddresses([...addresses, ""]);
	};

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			const content = e.target?.result as string;
			// Split by newline and filter out empty lines
			const uploadedAddresses = content
				.split(/\r?\n/)
				.map((addr) => addr.trim())
				.filter((addr) => addr !== "");

			setAddresses(uploadedAddresses);
			toast.success(`Loaded ${uploadedAddresses.length} addresses`);
		};

		reader.onerror = () => {
			toast.error("Error reading file");
		};

		reader.readAsText(file);
	};

	const handleQuery = async () => {
		setLoading(true);

		try {
			const validAddresses = addresses.filter(
				(addr) => addr.trim() !== ""
			);

			// Validate addresses array
			addressArraySchema.parse(validAddresses);

			// Validate token address if provided
			if (tokenAddress) {
				tokenAddressSchema.parse(tokenAddress);
			}

			const balancePromises = validAddresses.map(async (address) => {
				try {
					const formattedAddress = getAddress(address);
					const ethBalance = await client.getBalance({
						address: formattedAddress,
					});

					let tokenBalance;
					if (tokenAddress) {
						const formattedTokenAddress = getAddress(tokenAddress);
						const erc20Abi = parseAbi([
							"function balanceOf(address) view returns (uint256)",
						]);

						tokenBalance = await client.readContract({
							address: formattedTokenAddress,
							abi: erc20Abi,
							functionName: "balanceOf",
							args: [formattedAddress],
						});
					}

					const result = {
						address,
						ethBalance,
						tokenBalance,
					};

					return queryResultSchema.parse(result);
				} catch (error) {
					toast.error(
						`Error fetching balance for address ${address}`
					);
					throw error;
				}
			});

			const results = await Promise.all(balancePromises);
			setResults(results);
			toast.success("Successfully fetched balances");
		} catch (error) {
			if (error instanceof z.ZodError) {
				error.errors.forEach((err) => {
					const message =
						err.path[0] === "address"
							? `Invalid address at line ${
									Number(err.path[1]) + 1
							  }: ${err.message}`
							: err.message;
					toast.error(message);
				});
			} else {
				toast.error("Error fetching balances");
			}
			console.error("Error fetching balances:", error);
		} finally {
			setLoading(false);
		}
	};

	const calculateTotalEthBalance = () => {
		return results.reduce((acc, curr) => acc + curr.ethBalance, 0n);
	};

	const calculateTotalTokenBalance = () => {
		return results.reduce(
			(acc, curr) => acc + (curr.tokenBalance || 0n),
			0n
		);
	};

	const formatBalance = (balance: bigint) => {
		return (Number(balance) / 1e18).toFixed(4);
	};

	return (
		<div className="flex flex-col gap-6 p-6">
			<h1 className="text-3xl font-bold">Batch Query Balance</h1>
			<p className="text-white">
				Absolutely free, efficient, and convenient one-stop tool that
				supports querying and exporting multiple wallet balances
				simultaneously. Enhance your operational efficiency for managing
				large-scale assets for individuals and teams.
			</p>

			<div className="flex flex-col gap-4">
				<div className="flex flex-col gap-2">
					<label className="flex text-xl mb-3 items-center gap-1">
						Token Selection <span className="text-red-500">*</span>
					</label>
					<div className="flex items-center gap-2 p-3 border-[0.6px] border-[#CB3CFF] rounded-lg bg-[#140E17]">
						<Image
							src="/eth.svg"
							alt="ETH"
							className="w-6 h-6"
							width={24}
							height={24}
						/>
						<span className="font-medium">ETH (Default)</span>
					</div>
					<div className="flex flex-col gap-1 mt-4">
						<label className="text-sm text-white">
							Optional: Query Additional Token Balance
						</label>
						<input
							type="text"
							placeholder="Enter ERC20 token contract address (optional)"
							className="input mt-[15px] bg-[#140E17] h-[57px] hover:border-[#CB3CFF] focus:border-0 focus:ring-0 w-full"
							value={tokenAddress}
							onChange={(e) =>
								handleTokenAddressChange(e.target.value)
							}
						/>
					</div>
				</div>

				<div className="flex flex-col gap-2">
					<label>Address list (one per line)</label>
					<div className="flex mt-[10px] mb-[30px] gap-2">
						<button
							className="btn  border-[#7925A6] border-[0.6px] bg-[#140E17] "
							onClick={() => setAddresses([""])}
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
						<label className="btn border-[#7925A6] border-[0.6px] bg-[#140E17]">
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
							<input
								type="file"
								className="hidden"
								accept=".txt,.csv"
								onChange={handleFileUpload}
							/>
						</label>
					</div>
					<div className="flex flex-col gap-2">
						{addresses.map((address, index) => (
							<div key={index} className="flex flex-col gap-1">
								<textarea
									rows={1}
									placeholder="0xD2F...100"
									className="textarea  h-[57px] min-h-[57px] w-full bg-[#140E17]  hover:border-[#CB3CFF] focus:border-0 focus:ring-0w-full"
									value={address}
									onChange={(e) =>
										handleAddressChange(
											e.target.value,
											index
										)
									}
								/>
							</div>
						))}
					</div>
					<button
						onClick={handleAddAddress}
						className="btn  bg-[#7925A6] w-[165px] h-[46px] mt-[16px]"
					>
						Add Address
					</button>
				</div>

				<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
					<div className="bg-[#140E17] border-[#343B4F] border-[0.6px] py-4 px-8 rounded">
						<p className="text-sm font-semibold ">
							Number of addresses
						</p>
						<p className="font-bold text-2xl md:text-3xl mt-[5px]">
							{
								addresses.filter((addr) => addr.trim() !== "")
									.length
							}
						</p>
					</div>
					<div className="bg-[#140E17] border-[#343B4F] border-[0.6px] py-4 px-8  p-4 rounded">
						<p className="text-sm font-semibold ">ETH Balance</p>
						<p className="font-bold text-2xl md:text-3xl mt-[5px]">
							{formatBalance(calculateTotalEthBalance())} ETH
						</p>
					</div>
					<div className="bg-[#140E17] border-[#343B4F] border-[0.6px] py-4 px-8  rounded">
						<p className="text-sm font-semibold ">Token Balance</p>
						<p className="font-bold text-2xl md:text-3xl mt-[5px]">
							{formatBalance(calculateTotalTokenBalance())}
						</p>
					</div>
				</div>

				<div className="flex mb-[30px] md:mb-0 gap-4">
					<button
						onClick={handleQuery}
						disabled={loading}
						className="btn   bg-[#7925A6] w-[165px] h-[46px] mt-[16px]"
					>
						{loading ? "Querying..." : "Query"}
					</button>
					<button className="btn border-[#7925A6] border-[0.6px] bg-[#140E17] w-[165px] h-[46px] mt-[16px]">
						Export
					</button>
				</div>

				{results.length > 0 && (
					<div className="mt-4">
						<h2 className="text-xl font-bold mb-2">
							Query results:
						</h2>
						<div className="overflow-x-auto">
							<table className="table table-zebra">
								<thead>
									<tr>
										<th>#</th>
										<th>Wallet Address</th>
										<th>ETH Balance</th>
										<th>Token Balance</th>
									</tr>
								</thead>
								<tbody>
									{results.map((result, index) => (
										<tr key={index}>
											<td>{index + 1}</td>
											<td>{result.address}</td>
											<td>
												{formatBalance(
													result.ethBalance
												)}{" "}
												ETH
											</td>
											<td>
												{result.tokenBalance
													? formatBalance(
															result.tokenBalance
													  )
													: "-"}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
