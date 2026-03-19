import "../globals.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import Link from "next/link";
import logo from "../assets/logo.jpg";

export default function Navbar() {
	return (
		<nav className="bg-opacity-50 backdrop-blur-lg ">
			<div className="navbar mt-[30px] container mx-auto">
				<div className="navbar-start">
					<Image
						src={logo}
						alt="Smart Tools Logo"
						width={40}
						height={40}
						className="hidden"
					/>
					<Link href="/" className="flex items-center gap-2">
						{/* <h1 className="text-xl font-bold text-white">
							Smart Tools
						</h1> */}
					</Link>
				</div>

				<div className="navbar-end md:mr-[30px]">
					<ConnectButton />
				</div>
			</div>
		</nav>
	);
}
