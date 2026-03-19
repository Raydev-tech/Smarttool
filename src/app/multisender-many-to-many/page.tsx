/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import Image from "next/image";
import cancel from "../assets/cancel.svg";
import upload from "../assets/upload.svg";

export default function Page() {
	const [step, setStep] = useState<number>(1);
	const [selectedToken, setSelectedToken] = useState("ETH");
	const [senderAddresses, setSenderAddresses] = useState<string[]>([""]);
	const [recipientAddresses, setRecipientAddresses] = useState<string[]>([
		"",
	]);
	const [transferAmount, setTransferAmount] = useState<string>("0.0006");
	const [executionInterval, setExecutionInterval] = useState<string>("");
	const [isLoading, setIsLoading] = useState(false);
	const [transactionStatus, setTransactionStatus] = useState<{
		status: "success" | "failure" | "pending" | null;
		message?: string;
	}>({ status: null });

	const handleAddAddress = (type: "sender" | "recipient") => {
		if (type === "sender") {
			setSenderAddresses([...senderAddresses, ""]);
		} else {
			setRecipientAddresses([...recipientAddresses, ""]);
		}
	};

	const handleAddressChange = (
		type: "sender" | "recipient",
		index: number,
		value: string
	) => {
		if (type === "sender") {
			const newAddresses = [...senderAddresses];
			newAddresses[index] = value;
			setSenderAddresses(newAddresses);
		} else {
			const newAddresses = [...recipientAddresses];
			newAddresses[index] = value;
			setRecipientAddresses(newAddresses);
		}
	};

	const handleManualInput = (type: "sender" | "recipient") => {
		// Implement manual input handling
	};

	const handleFileUpload = async (type: "sender" | "recipient") => {
		const fileInput = document.createElement("input");
		fileInput.type = "file";
		fileInput.accept = ".txt,.csv";

		fileInput.addEventListener("change", async (e: Event) => {
			const target = e.target as HTMLInputElement;
			const file = target.files?.[0];

			if (!file) {
				alert("No file selected");
				return;
			}

			// Validate file type
			const validTypes = [".txt", ".csv"];
			const fileExtension = file.name
				.toLowerCase()
				.slice(file.name.lastIndexOf("."));
			if (!validTypes.includes(fileExtension)) {
				alert("Please upload a .txt or .csv file");
				return;
			}

			try {
				const text = await file.text();
				// Split by newline and/or comma, then clean the data
				const addresses = text
					.split(/[\r\n,]+/)
					.map((line) => line.trim())
					.filter(
						(line) =>
							line && line.length > 0 && line.startsWith("0x")
					);

				if (addresses.length === 0) {
					alert(
						"No valid addresses found in file. Addresses should start with 0x"
					);
					return;
				}

				if (type === "sender") {
					setSenderAddresses(addresses);
				} else {
					setRecipientAddresses(addresses);
				}

				// Show success message
				alert(`Successfully loaded ${addresses.length} addresses`);
			} catch (error) {
				console.error("Error reading file:", error);
				alert(
					"Error reading file. Please make sure it's a valid text file."
				);
			}
		});

		fileInput.click();
	};

	const handleNextStep = () => {
		setStep(step + 1);
	};

	const handleBack = () => {
		setStep(step - 1);
	};

	const handleSend = async () => {
		setIsLoading(true);
		try {
			// Implement sending logic here
			setTransactionStatus({
				status: "failure",
				message: "Insufficient funds",
			});
		} catch (error) {
			setTransactionStatus({
				status: "failure",
				message:
					error instanceof Error
						? error.message
						: "Transaction failed",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="container mx-auto px-4 py-8 max-w-6xl">
			<div className="-6 mb-8">
				<h1 className="text-2xl md:text-3xl font-bold mb-4 text-white">
					Many-to-Many Transfers
				</h1>
				<p className="text-white text-sm md:text-base leading-relaxed">
					Execute many-to-many transfers in batches, allowing flexible
					transaction combinations. Each transfer is an independent
					transaction with no relation between addresses, enhancing
					the efficiency of managing funds across multiple addresses,
					avoiding bubble chart detection, and diversifying your asset
					management strategies.
				</p>
			</div>

			<div className="flex items-center justify-center mb-12">
				{[1, 2, 3].map((stepNum) => (
					<div
						key={stepNum}
						className="flex  mt-[20px]  items-center"
					>
						<div
							className={`rounded-full h-10 w-10 flex items-center justify-center transition-all duration-300
              ${
					step === stepNum
						? "bg-[#CB3CFF] text-white shadow-lg transform scale-110"
						: stepNum < step
						? "bg-[#CB3CFF] text-white"
						: "bg-[#AEB9E1]"
				}`}
						>
							{stepNum < step ? "✓" : stepNum}
						</div>
						{stepNum < 3 && (
							<div
								className={`h-1 w-24 mx-2 transition-all duration-300
                ${stepNum < step ? "bg-[#CB3CFF]" : "bg-[#AEB9E1]"}`}
							/>
						)}
					</div>
				))}
			</div>

			{step === 1 && (
				<div className="space-y-8">
					<div className="rounded-lg shadow-sm p-2 md:p-6 mb-6">
						<label className="block text-xl font-bold text-white mb-3">
							Token Selection
						</label>
						<div className="flex items-center p-3 rounded-lg border-[#CB3CFF] border-[0.6px] bg-[#140E17] hover:border-[#cb3cff] transition-colors cursor-pointer ">
							<Image
								src="/eth.svg"
								alt="ETH"
								width={18}
								height={30}
								className="mr-3"
							/>
							<div>
								<span className="font-medium text-white">
									ETH Chain Native Token
								</span>
								<p className="text-sm text-gray-500 mt-1">
									Ethereum Mainnet
								</p>
							</div>
						</div>
					</div>

					<div className="grid md:grid-cols-2 gap-3 md:gap-8">
						<div className="bg-[#140E17] rounded-[4px] shadow-sm border border-[#343B4F] p-[15px] md:p-[40px]">
							<div className="flex justify-between items-center mb-4">
								<label className="block text-base md:text-xl font-semibold  w-[15] md:w-[165px] text-white">
									Sender Address (Private Key)
								</label>
								<div className="flex space-x-2">
									<button
										onClick={() =>
											handleManualInput("sender")
										}
										className="md:px-4 px-2 py-1 md:py-2 text-sm border-[#CB3CFF] border-[0.6px] bg-[#140E17] hover:bg-[#140E17] cursor-pointer  rounded-lg transition-colors flex items-center"
									>
										<span className="material-icons-outlined edit text-[12px] md:text-[16px] mr-1">
											edit
										</span>
										<h2 className="my-auto text-[10px] md:text-xs ">
											Manual Input
										</h2>
									</button>
									<button
										onClick={() =>
											handleFileUpload("sender")
										}
										className="md:px-4 pl-2 pr-[11px] py-1 md:py-2 text-sm border-[#CB3CFF] border-[0.6px] bg-[#140E17] hover:bg-[#140E17] cursor-pointer rounded-lg transition-colors flex items-center"
									>
										<Image
											src={upload}
											alt="Upload"
											className="mr-[0px] w-[16px] h-[16px] md:w-[26px] md:h-[26px] md:mr-2"
										/>

										<h2 className="my-auto text-[10px] md:text-xs ">
											Upload File
										</h2>
									</button>
								</div>
							</div>
							<div className="space-y-3">
								{senderAddresses.map((address, index) => (
									<div key={index} className="relative">
										<input
											type="text"
											value={address}
											onChange={(e) =>
												handleAddressChange(
													"sender",
													index,
													e.target.value
												)
											}
											className="w-full mt-[20px] bg-[#140E17] h-[57px] hover:border-[#CB3CFF] focus:border-0 focus:ring-0 p-3 rounded-[4px] border-[#343B4F] border-[0.6px] transition-all"
											placeholder="Enter sender address..."
										/>
										{index > 0 && (
											<button
												onClick={() => {
													const newAddresses = [
														...senderAddresses,
													];
													newAddresses.splice(
														index,
														1
													);
													setSenderAddresses(
														newAddresses
													);
												}}
												className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
											>
												<Image
													src={cancel}
													alt="Remove"
													className="mt-[20px] cursor-pointer"
												/>
											</button>
										)}
									</div>
								))}
								<button
									onClick={() => handleAddAddress("sender")}
									className="w-full p-2 border-2 border-dashed  mt-[20px] bg-[#140E17] h-[57px] rounded-lg text-[#FFFFFF80] hover:text-[#CB3CFF] hover:border-[#CB3CFF] transition-colors"
								>
									+ Add Another Address
								</button>
							</div>
						</div>

						<div className="bg-[#140E17] rounded-[4px] shadow-sm border border-[#343B4F] p-6">
							<div className="flex justify-between items-center mb-4">
								<label className="block text-base md:text-xl font-semibold text-white">
									Recipient Address
								</label>
								<div className="flex space-x-2">
									<button
										onClick={() =>
											handleManualInput("recipient")
										}
										className="md:px-4 px-2 py-1 md:py-2 border-[#CB3CFF] border-[0.6px] bg-[#140E17] hover:bg-[#140E17] cursor-pointer rounded-lg transition-colors flex items-center"
									>
										<span className="material-icons-outlined edit  mr-1">
											edit
										</span>
										<h2 className="my-auto text-[10px] md:text-xs ">
											Manual Input
										</h2>
									</button>
									<button
										onClick={() =>
											handleFileUpload("recipient")
										}
										className="md:px-4 pl-2 pr-[11px] py-1 md:py-2  text-sm border-[#CB3CFF] border-[0.6px] bg-[#140E17] hover:bg-[#140E17] cursor-pointer  rounded-lg transition-colors flex items-center"
									>
										<Image
											src={upload}
											alt="Upload"
											className="mr-[0px] w-[16px] h-[16px] md:w-[26px] md:h-[26px] md:mr-2"
										/>
										<h2 className="my-auto text-[10px] md:text-xs ">
											Upload File
										</h2>
									</button>
								</div>
							</div>
							<div className="space-y-3">
								{recipientAddresses.map((address, index) => (
									<div key={index} className="relative">
										<input
											type="text"
											value={address}
											onChange={(e) =>
												handleAddressChange(
													"recipient",
													index,
													e.target.value
												)
											}
											className="w-full p-3 mt-[20px] bg-[#140E17] h-[57px] hover:border-[#CB3CFF] focus:border-0 focus:ring-0  rounded-[4px] border-[#343B4F] border-[0.6px] transition-all"
											placeholder="Enter recipient address..."
										/>
										{index > 0 && (
											<button
												onClick={() => {
													const newAddresses = [
														...recipientAddresses,
													];
													newAddresses.splice(
														index,
														1
													);
													setRecipientAddresses(
														newAddresses
													);
												}}
												className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
											>
												<Image
													src={cancel}
													alt="Remove"
													className="mt-[20px] cursor-pointer"
												/>
											</button>
										)}
									</div>
								))}
								<button
									onClick={() =>
										handleAddAddress("recipient")
									}
									className="w-full p-2 border-2 border-dashed rounded-lg mt-[20px] bg-[#140E17] h-[57px] text-[#FFFFFF80] hover:text-[#CB3CFF] hover:border-[#CB3CFF]  transition-colors"
								>
									+ Add Another Address
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{step === 2 && (
				<div className=" shadow-sm p-6">
					<div className="grid md:grid-cols-2 gap-8">
						<div>
							<label className="block text-xl font-bold text-white mb-2">
								Amount Sent per Address
							</label>
							<div className="relative">
								<input
									type="text"
									value={transferAmount}
									onChange={(e) =>
										setTransferAmount(e.target.value)
									}
									className="w-full p-3 pl-12 border-[#CB3CFF] border-[0.6px] rounded-lg  bg-[#140E17] h-[57px] hover:border-[#CB3CFF] focus:border-0 focus:ring-0 transition-all"
									placeholder="Enter ETH amount..."
								/>
								<div className="absolute left-3 top-1/2 -translate-y-1/2">
									<Image
										src="/eth.svg"
										alt="ETH"
										width={18}
										height={30}
									/>
								</div>
							</div>
						</div>
						<div>
							<label className="block text-xl font-bold text-white  mb-2">
								Execution Interval (Seconds)
							</label>
							<input
								type="text"
								value={executionInterval}
								onChange={(e) =>
									setExecutionInterval(e.target.value)
								}
								className="w-full p-3 border-[#CB3CFF] border-[0.6px] rounded-lg  bg-[#140E17] h-[57px] hover:border-[#CB3CFF] focus:border-0 focus:ring-0  transition-all"
								placeholder="Enter interval in seconds..."
							/>
						</div>
					</div>
				</div>
			)}

			{step === 3 && (
				<div className="  shadow-sm p-6">
					<h3 className="text-lg font-medium text-white mb-4">
						Transaction Status
					</h3>
					{transactionStatus.status && (
						<div
							className={`p-4 rounded-lg ${
								transactionStatus.status === "success"
									? "bg-green-50 text-green-700 border border-green-200"
									: "bg-red-50 text-red-700 border border-red-200"
							}`}
						>
							<div className="flex items-center">
								{transactionStatus.status === "success" ? (
									<span className="material-icons-outlined mr-2">
										check_circle
									</span>
								) : (
									<span className="material-icons-outlined mr-2">
										error
									</span>
								)}
								{transactionStatus.message}
							</div>
						</div>
					)}
				</div>
			)}

			<div className="mt-8 flex justify-between items-center">
				{step > 1 && (
					<button
						onClick={handleBack}
						className="px-6 py-2.5 mt-[16px] border-[#CB3CFF] border-[0.6px] rounded-lg  bg-[#140E17] hover:border-[#CB3CFF] focus:border-0 focus:ring-0  transition-colors flex items-center"
					>
						<span className="material-icons-outlined mr-1">
							arrow_back
						</span>
						Back
					</button>
				)}
				{step < 3 ? (
					<button
						onClick={handleNextStep}
						className="px-6 py-2.5 text-white rounded-lg bg-[#7925A6] w-[156px] h-[46px] mt-[16px] justify-center cursor-pointer transition-colors flex items-center ml-auto"
					>
						Next Step
						<span className="material-icons-outlined ml-1">
							arrow_forward
						</span>
					</button>
				) : (
					<button
						onClick={handleSend}
						disabled={isLoading}
						className="px-6 py-2.5 text-white rounded-lg flex justify-center bg-[#7925A6] w-[150px] h-[46px] mt-[16px] cursor-pointer  transition-colors items-center ml-auto disabled:bg-blue-300 disabled:cursor-not-allowed"
					>
						{isLoading ? (
							<>
								<svg
									className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
								>
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									></circle>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									></path>
								</svg>
								Sending...
							</>
						) : (
							<>
								Send
								<span className="material-icons-outlined ml-3">
									send
								</span>
							</>
						)}
					</button>
				)}
			</div>

			<div className="mt-6 bg-[#140E17] rounded-lg p-4 flex items-start">
				<span className="material-icons-outlined text-[#CB3CFF] mr-2">
					info
				</span>
				<p className="text-sm text-[#CB3CFF]">
					Lowest network service fee, only 0.0003 ETH per address
				</p>
			</div>
		</div>
	);
}
