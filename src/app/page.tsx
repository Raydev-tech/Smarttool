export default function Home() {
  return (
    <div className="hero min-h-full w-full overflow-x-hidden">
      <div className="hero-content text-center max-w-4xl w-full px-2 md:py-20 mx-auto">
        <div className="space-y-[30px] md:space-y-[35px]">
          <h1 className="text-3xl md:text-6xl uppercase gradien font-semibold tracking-0 text-white break-words">
            Welcome to Smart Tools
          </h1>
          <p className="text-xl text-white font-medium">
            Your one-stop solution for blockchain development tools. Generate
            wallets, create tokens, and manage liquidity pools with ease.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <button className="bg-[#7925A6] btn w-full md:w-[165px] h-[46px]">
              Get Started
            </button>
            <a
              href="https://smart-tools.gitbook.io/smart-tools-docs/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn w-full md:w-[165px] h-[46px] grad p-[1px]"
            >
              <div className="justify-center rounded-[3.15px] items-center mx-auto bg-[#140E17] flex h-full w-full">
                <h2>Learn More</h2>
              </div>
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="card bg-[#140E17] backdrop-blur-sm shadow-xl">
              <div className="card-body rounded-[6.9px] border-[#343B4F]">
                <h2 className="card-title text-center justify-center tracking-[0px]">
                  Wallet Generation
                </h2>
                <p>Create and manage multiple blockchain wallets securely</p>
              </div>
            </div>
            <div className="card bg-[#140E17] backdrop-blur-sm shadow-xl">
              <div className="card-body rounded-[6.9px] border-[#343B4F]">
                <h2 className="card-title justify-center text-center tracking-[0px]">
                  Token Creation
                </h2>
                <p>Launch your own tokens with customizable parameters</p>
              </div>
            </div>
            <div className="card bg-[#140E17] backdrop-blur-sm shadow-xl">
              <div className="card-body rounded-[6.9px] border-[#343B4F]">
                <h2 className="card-title justify-center text-center tracking-[0px]">
                  Liquidity Management
                </h2>
                <p>Easily manage liquidity pools and token pairs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
