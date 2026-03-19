"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
	Coins,
	Wallet,
	ArrowRightLeft,
	SendToBack,
	Scale,
	Droplets,
	SwitchCamera,
	Repeat,
	ArrowLeftRight,
	ChevronDown,
	ChevronRight,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import logoo from "../assets/logoo.svg";
import tg from "../assets/tg.svg";
import website from "../assets/website.svg";
import x from "../assets/x.svg";
import discord from "../assets/discord.svg";

const sidebarItems = [
	{
		id: "tokens",
		label: "Token Management",
		icon: Coins,
		items: [
			{
				id: 1,
				label: "Token Creation",
				href: "/token-creation",
				icon: Coins,
			},
			{
				id: 2,
				label: "Batch Query Balance",
				href: "/balance-query",
				icon: Scale,
			},
		],
	},
	{
		id: "wallets",
		label: "Wallet Tools",
		icon: Wallet,
		items: [
			{
				id: 3,
				label: "Batch Wallet Generation",
				href: "/batch-wallet-generation",
				icon: Wallet,
			},
		],
	},
	{
		id: "transfers",
		label: "Transfer Tools",
		icon: ArrowRightLeft,
		items: [
			{
				id: 4,
				label: "One to Many",
				href: "/multisender-one-to-many",
				icon: ArrowRightLeft,
			},
			{
				id: 5,
				label: "Many to One",
				href: "/multisender-many-to-one",
				icon: SendToBack,
			},
			{
				id: 6,
				label: "Many to Many",
				href: "/multisender-many-to-many",
				icon: SwitchCamera,
			},
		],
	},
	{
		id: "liquidity",
		label: "Liquidity & Swaps",
		icon: Droplets,
		items: [
			{
				id: 7,
				label: "Create Liquidity",
				href: "/create-liquidity",
				icon: Droplets,
			},
			{
				id: 8,
				label: "Liquidity & Swap",
				href: "/liquidity-and-swap",
				icon: Repeat,
			},
			{
				id: 9,
				label: "Batch Swap",
				href: "/batch-swap",
				icon: ArrowLeftRight,
			},
		],
	},
];

export default function Drawer({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const [openSections, setOpenSections] = useState<string[]>(["tokens"]);

	const toggleSection = (sectionId: string) => {
		setOpenSections((prev) =>
			prev.includes(sectionId)
				? prev.filter((id) => id !== sectionId)
				: [...prev, sectionId]
		);
	};

	return (
		<div className="drawer lg:drawer-open">
			<input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
			<div className="drawer-content flex flex-col">
				<div className="lg:hidden fixed top-4 left-4 z-50">
					<label
						htmlFor="my-drawer-2"
						className="btn btn-square btn-ghost bg-black/30 backdrop-blur-lg border border-white/10"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							className="inline-block w-6 h-6 stroke-current"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M4 6h16M4 12h16M4 18h16"
							></path>
						</svg>
					</label>
				</div>
				{children}
			</div>
			<div className="drawer-side">
				<label
					htmlFor="my-drawer-2"
					aria-label="close sidebar"
					className="drawer-overlay"
				></label>
				<div className="bg-[#030104] backdrop-blur-xl min-h-full w-80 drawshadow">
					<div className="p-[40px] border-b border-white/10 flex items-center gap-3">
						<Link href="/">
							<div className="flex items-center gap-2">
								<Image
									src={logoo}
									alt="Smart Tools Logo"
									width={70}
									height={50}
									className=""
								/>
								<h1 className="text-xl cursor-pointer font-semibold tracking-[0%] text-white">
									<span className="text-[#7925A6]">
										Smart
									</span>{" "}
									Tools
								</h1>
							</div>
						</Link>
					</div>
					<div className="p-4">
						{sidebarItems.map((section) => (
							<div key={section.id} className="mb-4">
								<button
									onClick={() => toggleSection(section.id)}
									className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white/80 hover:text-white"
								>
									<div className="flex items-center gap-3">
										<section.icon
											size={20}
											className="text-[#7925A6]"
										/>
										<span className="font-medium">
											{section.label}
										</span>
									</div>
									{openSections.includes(section.id) ? (
										<ChevronDown size={20} />
									) : (
										<ChevronRight size={20} />
									)}
								</button>
								{openSections.includes(section.id) && (
									<div className="mt-2 ml-3 space-y-1">
										{section.items.map((item) => {
											const isActive =
												pathname === item.href;
											return (
												<a
													key={item.id}
													href={item.href}
													className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
														isActive
															? "bg-[#7925A6] text-[white]"
															: "text-white/60 hover:bg-white/5 hover:text-white"
													}`}
												>
													<item.icon size={18} />
													<span>{item.label}</span>
												</a>
											);
										})}
									</div>
								)}
							</div>
						))}
						<div className="flex gap-[20px] ml-[20px] mt-8">
							<Link href="https://x.com/useSmartTools?t=Gaa11DaCwGRHfiH9YWsjQw&s=09">
								<Image
									src={x}
									alt="Smart Tools Twitter"
									className="cursor-pointer hover:scale-110 transition-transform duration-200"
								/>
							</Link>
							<Link href="">
								<Image
									src={tg}
									alt="Smart Tools Twitter"
									className="cursor-pointer h-[26px] hover:scale-110 transition-transform duration-200"
								/>
							</Link>
							<Link href="">
								<Image
									src={website}
									alt="Smart Tools website"
									className="w-[26px] h-[26px] cursor-pointer hover:scale-110 transition-transform duration-200"
								/>
							</Link>
							<Link href="https://discord.gg/UXB34fFEvJ">
								<Image
									src={discord}
									alt="Smart Tools Twitter"
									className="cursor-pointer w-[40px] h-[41px] -mt-[7px] hover:scale-110 transition-transform duration-200"
								/>
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
