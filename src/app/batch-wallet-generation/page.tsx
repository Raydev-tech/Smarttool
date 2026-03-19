"use client";

import React, { useState } from "react";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { generateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";

interface WalletData {
	address: string;
	mnemonic: string;
	privateKey: string;
}

export default function Page() {
	const [wallets, setWallets] = useState<WalletData[]>([]);
	const [numWallets, setNumWallets] = useState<number>(1);
	const [isGenerating, setIsGenerating] = useState(false);

	const generateWallets = async () => {
		setIsGenerating(true);
		const newWallets: WalletData[] = [];

		try {
			for (let i = 0; i < numWallets; i++) {
				const privateKey = generatePrivateKey();
				const account = privateKeyToAccount(privateKey);
				const mnemonic = generateMnemonic(wordlist);

				newWallets.push({
					address: account.address,
					privateKey: privateKey,
					mnemonic: mnemonic,
				});
			}
			setWallets(newWallets);
		} finally {
			setIsGenerating(false);
		}
	};

	const copyToClipboard = async (text: string) => {
		await navigator.clipboard.writeText(text);
	};

	const downloadWalletData = () => {
		const headers = ["Wallet Number", "Address", "Mnemonic", "Private Key"];
		const csvData = wallets.map((wallet, index) => {
			return [
				`Wallet ${index + 1}`,
				wallet.address,
				wallet.mnemonic,
				wallet.privateKey,
			].join(",");
		});

		const csvContent = [headers.join(","), ...csvData].join("\n");
		const blob = new Blob([csvContent], {
			type: "text/csv;charset=utf-8;",
		});
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.setAttribute("href", url);
		link.setAttribute("download", "wallet_data.csv");
		document.body.appendChild(link);
		link.click();
		link.remove();
	};

	const resetWallets = () => {
		setWallets([]);
		setNumWallets(1);
	};

	return (
		<div className="container mx-auto px-4 tracking-0 py-8 max-w-6xl">
			<h1 className="text-2xl md:text-3xl font-bold mb-8 t">
				Batch Wallet Generation
			</h1>

			<AlertDialog.Root>
				<AlertDialog.Trigger asChild>
					<div className="bg-[#140E17] border-l-4 border-[#CB3CFF] text-[#CB3CFF] px-6 py-4 rounded-lg mb-8 shadow-sm hover:shadow-md transition-shadow duration-200">
						<div className="flex items-start">
							<div className="flex-shrink-0">
								<svg
									className="h-5 w-5 text-[#CB3CFF]"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fillRule="evenodd"
										d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
							<div className="ml-3">
								<p className="text-xs md:text-sm leading-5">
									Your wallet generation process is entirely
									conducted on your local computer, ensuring
									that your mnemonic phrases and private keys
									remain under your control at all times.
								</p>
							</div>
						</div>
					</div>
				</AlertDialog.Trigger>
			</AlertDialog.Root>

			<div className="p-3 md:p-6 shadow-lg">
				<div className="flex flex-col gap-[30px]">
					<div className="form-control">
						<label className="label md:mr-[30px] ">
							<span className="label-text text-[20px] font-bold leading-[14px] ">
								Number of Wallets
							</span>
						</label>
						<input
							type="number"
							placeholder="Enter number of wallets to generate"
							className="input md:w-[488px]  mt-[10px] md:mt-0 bg-[#140E17] h-[57px] transition-all duration-200 hover:border-[#CB3CFF] focus:border-0 focus:ring-0 "
							value={numWallets}
							onChange={(e) =>
								setNumWallets(
									Math.max(1, parseInt(e.target.value) || 1)
								)
							}
							min="1"
							max="100"
						/>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
						<button
							onClick={generateWallets}
							disabled={isGenerating}
							className="btn bg-[#7925A6] w-[165px] h-[46px] min-w-[150px] shadow-lg hover:shadow-xl transition-all duration-200"
						>
							{isGenerating ? (
								<>
									<span className="loading loading-spinner"></span>
									Generating...
								</>
							) : (
								"Generate Wallets"
							)}
						</button>
						<button
							onClick={resetWallets}
							className="btn w-[133px] md:w-[165px] h-[46px] grad p-[1px]"
						>
							<div className=" justify-center rounded-[3.15px] items-center mx-auto bg-[#140E17]  flex h-full w-full">
								<h2 className=" ">Reset</h2>
							</div>
						</button>
						{wallets.length > 0 && (
							<button
								onClick={downloadWalletData}
								className="btn btn-ghost hover:bg-[#140E17] min-w-[120px]"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-5 w-5 mr-2"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fillRule="evenodd"
										d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
										clipRule="evenodd"
									/>
								</svg>
								Export CSV
							</button>
						)}
					</div>

					{wallets.length > 0 && (
						<div className="mt-8">
							<h2 className="text-2xl font-bold mb-6">
								Generated Wallets
							</h2>
							<div className="overflow-x-auto rounded-lg shadow-lg">
								<table className="table table-zebra w-full">
									<thead className="bg-[#140E17]">
										<tr>
											<th className="py-4">#</th>
											<th>Address</th>
											<th>Mnemonic</th>
											<th>Private Key</th>
											<th>Actions</th>
										</tr>
									</thead>
									<tbody>
										{wallets.map((wallet, index) => (
											<tr
												key={index}
												className="hover:bg-base-200 transition-colors duration-150"
											>
												<td className="font-medium">
													{index + 1}
												</td>
												<td className="font-mono text-sm">
													<div className="flex items-center gap-2">
														<span className="truncate max-w-[200px]">
															{wallet.address}
														</span>
														<button
															onClick={() =>
																copyToClipboard(
																	wallet.address
																)
															}
															className="btn btn-ghost btn-xs hover:bg-[#140E17]"
														>
															<svg
																xmlns="http://www.w3.org/2000/svg"
																className="h-4 w-4"
																viewBox="0 0 20 20"
																fill="currentColor"
															>
																<path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
																<path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
															</svg>
														</button>
													</div>
												</td>
												<td className="font-mono text-sm">
													<div className="flex items-center gap-2">
														<span className="truncate max-w-[200px]">
															{wallet.mnemonic}
														</span>
														<button
															onClick={() =>
																copyToClipboard(
																	wallet.mnemonic
																)
															}
															className="btn btn-ghost btn-xs hover:bg-[#140E17]"
														>
															<svg
																xmlns="http://www.w3.org/2000/svg"
																className="h-4 w-4"
																viewBox="0 0 20 20"
																fill="currentColor"
															>
																<path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
																<path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
															</svg>
														</button>
													</div>
												</td>
												<td className="font-mono text-sm">
													<div className="flex items-center gap-2">
														<span className="truncate max-w-[200px]">
															{wallet.privateKey}
														</span>
														<button
															onClick={() =>
																copyToClipboard(
																	wallet.privateKey
																)
															}
															className="btn btn-ghost btn-xs hover:bg-base-300"
														>
															<svg
																xmlns="http://www.w3.org/2000/svg"
																className="h-4 w-4"
																viewBox="0 0 20 20"
																fill="currentColor"
															>
																<path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
																<path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
															</svg>
														</button>
													</div>
												</td>
												<td>
													<button
														onClick={() =>
															setWallets(
																wallets.filter(
																	(_, i) =>
																		i !==
																		index
																)
															)
														}
														className="btn btn-ghost btn-sm text-error hover:bg-error hover:text-white"
													>
														Remove
													</button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					)}

					<div className="mt-8 p-6 bg-[#140E17] border-[#343B4F] border-[0.6px] rounded-xl shadow-inner">
						<h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
							<svg
								width="25"
								height="25"
								viewBox="0 0 25 25"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M11.4583 17.7083H13.5416V11.4583H11.4583V17.7083ZM12.4999 9.37492C12.7951 9.37492 13.0426 9.27492 13.2426 9.07492C13.4426 8.87492 13.5423 8.6277 13.5416 8.33325C13.5409 8.03881 13.4409 7.79158 13.2416 7.59159C13.0423 7.39159 12.7951 7.29158 12.4999 7.29158C12.2048 7.29158 11.9576 7.39159 11.7583 7.59159C11.5589 7.79158 11.4589 8.03881 11.4583 8.33325C11.4576 8.6277 11.5576 8.87527 11.7583 9.07596C11.9589 9.27665 12.2062 9.37631 12.4999 9.37492ZM12.4999 22.9166C11.0589 22.9166 9.70478 22.643 8.43742 22.0958C7.17006 21.5485 6.06763 20.8065 5.13013 19.8697C4.19263 18.9329 3.45061 17.8305 2.90409 16.5624C2.35756 15.2944 2.08395 13.9402 2.08325 12.4999C2.08256 11.0596 2.35617 9.70547 2.90409 8.43742C3.452 7.16936 4.19402 6.06693 5.13013 5.13013C6.06624 4.19332 7.16867 3.45131 8.43742 2.90409C9.70617 2.35686 11.0603 2.08325 12.4999 2.08325C13.9395 2.08325 15.2937 2.35686 16.5624 2.90409C17.8312 3.45131 18.9336 4.19332 19.8697 5.13013C20.8058 6.06693 21.5482 7.16936 22.0968 8.43742C22.6454 9.70547 22.9187 11.0596 22.9166 12.4999C22.9145 13.9402 22.6409 15.2944 22.0958 16.5624C21.5506 17.8305 20.8086 18.9329 19.8697 19.8697C18.9308 20.8065 17.8284 21.5489 16.5624 22.0968C15.2964 22.6447 13.9423 22.918 12.4999 22.9166ZM12.4999 20.8333C14.8263 20.8333 16.7968 20.026 18.4114 18.4114C20.026 16.7968 20.8333 14.8263 20.8333 12.4999C20.8333 10.1735 20.026 8.20304 18.4114 6.58846C16.7968 4.97388 14.8263 4.16659 12.4999 4.16659C10.1735 4.16659 8.20304 4.97388 6.58846 6.58846C4.97388 8.20304 4.16659 10.1735 4.16659 12.4999C4.16659 14.8263 4.97388 16.7968 6.58846 18.4114C8.20304 20.026 10.1735 20.8333 12.4999 20.8333Z"
									fill="white"
								/>
							</svg>
							Important Notes:
						</h2>
						<ul className="space-y-3 list-inside text-sm">
							<li className="flex items-center gap-2">
								<svg
									width="15"
									height="15"
									viewBox="0 0 15 15"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M2.57812 8.20312L5.85938 11.4844L12.4219 4.45312"
										stroke="white"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
								Store your private keys securely and never share
								them
							</li>
							<li className="flex items-center gap-2">
								<svg
									width="15"
									height="15"
									viewBox="0 0 15 15"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M2.57812 8.20312L5.85938 11.4844L12.4219 4.45312"
										stroke="white"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
								Make sure to back up your wallet information
							</li>
							<li className="flex items-center gap-2">
								<svg
									width="15"
									height="15"
									viewBox="0 0 15 15"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M2.57812 8.20312L5.85938 11.4844L12.4219 4.45312"
										stroke="white"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
								Maximum 100 wallets can be generated at once
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}
