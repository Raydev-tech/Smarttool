export const abi = [
	{
		inputs: [],
		stateMutability: "nonpayable",
		type: "constructor"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "owner",
				type: "address"
			}
		],
		name: "OwnableInvalidOwner",
		type: "error"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "account",
				type: "address"
			}
		],
		name: "OwnableUnauthorizedAccount",
		type: "error"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "uint256",
				name: "newFeePercentage",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "address",
				name: "newFeeRecipient",
				type: "address"
			}
		],
		name: "FeeUpdated",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "previousOwner",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "newOwner",
				type: "address"
			}
		],
		name: "OwnershipTransferred",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "tokenAddress",
				type: "address"
			},
			{
				indexed: false,
				internalType: "string",
				name: "name",
				type: "string"
			},
			{
				indexed: false,
				internalType: "string",
				name: "symbol",
				type: "string"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "initialSupply",
				type: "uint256"
			}
		],
		name: "TokenDeployed",
		type: "event"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "tokenA",
				type: "address"
			},
			{
				internalType: "address",
				name: "tokenB",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "amountA",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountB",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "minAmountA",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "minAmountB",
				type: "uint256"
			},
			{
				internalType: "bool",
				name: "isEthPair",
				type: "bool"
			}
		],
		name: "addLiquidity",
		outputs: [
			{
				internalType: "uint256",
				name: "amountTokenA",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountTokenB",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "liquidity",
				type: "uint256"
			}
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "tokenAddress",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "tokenAmount",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "ethAmount",
				type: "uint256"
			},
			{
				internalType: "address[]",
				name: "buyers",
				type: "address[]"
			},
			{
				internalType: "uint256[]",
				name: "buyAmounts",
				type: "uint256[]"
			}
		],
		name: "addLiquidityAndBatchBuy",
		outputs: [],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "tokenAddress",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "amountIn",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountOutMin",
				type: "uint256"
			},
			{
				internalType: "address[]",
				name: "path",
				type: "address[]"
			},
			{
				internalType: "address[]",
				name: "to",
				type: "address[]"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			}
		],
		name: "batchSwap",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "string",
				name: "name",
				type: "string"
			},
			{
				internalType: "string",
				name: "symbol",
				type: "string"
			},
			{
				internalType: "uint256",
				name: "initialSupply",
				type: "uint256"
			},
			{
				internalType: "uint8",
				name: "decimals",
				type: "uint8"
			}
		],
		name: "deployNewToken",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [],
		name: "feePercentage",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [],
		name: "feeRecipient",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [],
		name: "owner",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [],
		name: "renounceOwnership",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "tokenAddress",
				type: "address"
			},
			{
				internalType: "address[]",
				name: "senders",
				type: "address[]"
			},
			{
				internalType: "address[]",
				name: "recipients",
				type: "address[]"
			},
			{
				internalType: "uint256[]",
				name: "amounts",
				type: "uint256[]"
			}
		],
		name: "sendErc20ManyToMany",
		outputs: [],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "tokenAddress",
				type: "address"
			},
			{
				internalType: "address",
				name: "recipient",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "amount",
				type: "uint256"
			}
		],
		name: "sendErc20ManyToOne",
		outputs: [],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "tokenAddress",
				type: "address"
			},
			{
				internalType: "address[]",
				name: "recipients",
				type: "address[]"
			},
			{
				internalType: "uint256[]",
				name: "amounts",
				type: "uint256[]"
			}
		],
		name: "sendErc20OneToMany",
		outputs: [],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address[]",
				name: "senders",
				type: "address[]"
			},
			{
				internalType: "address[]",
				name: "recipients",
				type: "address[]"
			},
			{
				internalType: "uint256[]",
				name: "amounts",
				type: "uint256[]"
			}
		],
		name: "sendEthManyToMany",
		outputs: [],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "recipient",
				type: "address"
			}
		],
		name: "sendEthManyToOne",
		outputs: [],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address[]",
				name: "recipients",
				type: "address[]"
			},
			{
				internalType: "uint256[]",
				name: "amounts",
				type: "uint256[]"
			}
		],
		name: "sendEthOneToMany",
		outputs: [],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "_feePercentage",
				type: "uint256"
			},
			{
				internalType: "address",
				name: "_feeRecipient",
				type: "address"
			}
		],
		name: "setFee",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "newOwner",
				type: "address"
			}
		],
		name: "transferOwnership",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [],
		name: "uniswapV2Router",
		outputs: [
			{
				internalType: "contract IUniswapV2Router02",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		stateMutability: "payable",
		type: "receive"
	}
] as const;
