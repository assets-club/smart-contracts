/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type {
  TheAssetsClubOZEnumerable,
  TheAssetsClubOZEnumerableInterface,
} from "../../../contracts/TheAssetsClubOZEnumerable.sol/TheAssetsClubOZEnumerable";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "approved",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "ApprovalForAll",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [],
    name: "MAX_SUPPLY",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "getApproved",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
    ],
    name: "isApprovedForAll",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "count",
        type: "uint256",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "ownerOf",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "setApprovalForAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
    ],
    name: "tokenByIndex",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
    ],
    name: "tokenOfOwnerByIndex",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "tokenURI",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x60806040523480156200001157600080fd5b50604080518082018252600f81526e2a34329020b9b9b2ba399021b63ab160891b60208083019182528351808501909452600384526254414360e81b9084015281519192916200006491600091620000f3565b5080516200007a906001906020840190620000f3565b50505062000097620000916200009d60201b60201c565b620000a1565b620001d6565b3390565b600a80546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b828054620001019062000199565b90600052602060002090601f01602090048101928262000125576000855562000170565b82601f106200014057805160ff191683800117855562000170565b8280016001018555821562000170579182015b828111156200017057825182559160200191906001019062000153565b506200017e92915062000182565b5090565b5b808211156200017e576000815560010162000183565b600181811c90821680620001ae57607f821691505b60208210811415620001d057634e487b7160e01b600052602260045260246000fd5b50919050565b611b5d80620001e66000396000f3fe6080604052600436106101355760003560e01c80636352211e116100ab578063a0712d681161006f578063a0712d681461033d578063a22cb46514610350578063b88d4fde14610370578063c87b56dd14610390578063e985e9c5146103b0578063f2fde38b146103f957600080fd5b80636352211e146102b557806370a08231146102d5578063715018a6146102f55780638da5cb5b1461030a57806395d89b411461032857600080fd5b806323b872dd116100fd57806323b872dd1461020a5780632f745c591461022a57806332cb6b0c1461024a5780633ccfd60b1461026057806342842e0e146102755780634f6ccce71461029557600080fd5b806301ffc9a71461013a57806306fdde031461016f578063081812fc14610191578063095ea7b3146101c957806318160ddd146101eb575b600080fd5b34801561014657600080fd5b5061015a61015536600461165a565b610419565b60405190151581526020015b60405180910390f35b34801561017b57600080fd5b50610184610444565b60405161016691906116cf565b34801561019d57600080fd5b506101b16101ac3660046116e2565b6104d6565b6040516001600160a01b039091168152602001610166565b3480156101d557600080fd5b506101e96101e4366004611717565b6104fd565b005b3480156101f757600080fd5b506008545b604051908152602001610166565b34801561021657600080fd5b506101e9610225366004611741565b610618565b34801561023657600080fd5b506101fc610245366004611717565b610649565b34801561025657600080fd5b506101fc61271081565b34801561026c57600080fd5b506101e96106df565b34801561028157600080fd5b506101e9610290366004611741565b61079e565b3480156102a157600080fd5b506101fc6102b03660046116e2565b6107b9565b3480156102c157600080fd5b506101b16102d03660046116e2565b61084c565b3480156102e157600080fd5b506101fc6102f036600461177d565b6108ac565b34801561030157600080fd5b506101e9610932565b34801561031657600080fd5b50600a546001600160a01b03166101b1565b34801561033457600080fd5b50610184610946565b6101e961034b3660046116e2565b610955565b34801561035c57600080fd5b506101e961036b366004611798565b610a0f565b34801561037c57600080fd5b506101e961038b3660046117ea565b610a1e565b34801561039c57600080fd5b506101846103ab3660046116e2565b610a56565b3480156103bc57600080fd5b5061015a6103cb3660046118c6565b6001600160a01b03918216600090815260056020908152604080832093909416825291909152205460ff1690565b34801561040557600080fd5b506101e961041436600461177d565b610aef565b60006001600160e01b0319821663780e9d6360e01b148061043e575061043e82610b65565b92915050565b606060008054610453906118f9565b80601f016020809104026020016040519081016040528092919081815260200182805461047f906118f9565b80156104cc5780601f106104a1576101008083540402835291602001916104cc565b820191906000526020600020905b8154815290600101906020018083116104af57829003601f168201915b5050505050905090565b60006104e182610bb5565b506000908152600460205260409020546001600160a01b031690565b60006105088261084c565b9050806001600160a01b0316836001600160a01b0316141561057b5760405162461bcd60e51b815260206004820152602160248201527f4552433732313a20617070726f76616c20746f2063757272656e74206f776e656044820152603960f91b60648201526084015b60405180910390fd5b336001600160a01b0382161480610597575061059781336103cb565b6106095760405162461bcd60e51b815260206004820152603e60248201527f4552433732313a20617070726f76652063616c6c6572206973206e6f7420746f60448201527f6b656e206f776e6572206e6f7220617070726f76656420666f7220616c6c00006064820152608401610572565b6106138383610c14565b505050565b6106223382610c82565b61063e5760405162461bcd60e51b815260040161057290611934565b610613838383610d01565b6000610654836108ac565b82106106b65760405162461bcd60e51b815260206004820152602b60248201527f455243373231456e756d657261626c653a206f776e657220696e646578206f7560448201526a74206f6620626f756e647360a81b6064820152608401610572565b506001600160a01b03919091166000908152600660209081526040808320938352929052205490565b6106e7610ea8565b60006106fb600a546001600160a01b031690565b6001600160a01b03164760405160006040518083038185875af1925050503d8060008114610745576040519150601f19603f3d011682016040523d82523d6000602084013e61074a565b606091505b505090508061079b5760405162461bcd60e51b815260206004820152601f60248201527f546865417373657473436c75623a207769746864726177206661696c757265006044820152606401610572565b50565b61061383838360405180602001604052806000815250610a1e565b60006107c460085490565b82106108275760405162461bcd60e51b815260206004820152602c60248201527f455243373231456e756d657261626c653a20676c6f62616c20696e646578206f60448201526b7574206f6620626f756e647360a01b6064820152608401610572565b6008828154811061083a5761083a611982565b90600052602060002001549050919050565b6000818152600260205260408120546001600160a01b03168061043e5760405162461bcd60e51b8152602060048201526018602482015277115490cdcc8c4e881a5b9d985b1a59081d1bdad95b88125160421b6044820152606401610572565b60006001600160a01b0382166109165760405162461bcd60e51b815260206004820152602960248201527f4552433732313a2061646472657373207a65726f206973206e6f7420612076616044820152683634b21037bbb732b960b91b6064820152608401610572565b506001600160a01b031660009081526003602052604090205490565b61093a610ea8565b6109446000610f02565b565b606060018054610453906118f9565b600061096060085490565b90506127108261096f60085490565b61097991906119ae565b106109dd5760405162461bcd60e51b815260206004820152602e60248201527f546865417373657473436c75623a206d696e74696e6720636f756e742065786360448201526d65656473206d6178537570706c7960901b6064820152608401610572565b60005b82811015610613576109fd33836109f6816119c6565b9450610f54565b80610a07816119c6565b9150506109e0565b610a1a338383610f6e565b5050565b610a283383610c82565b610a445760405162461bcd60e51b815260040161057290611934565b610a508484848461103d565b50505050565b6060610a6182610bb5565b6000610a9d60408051808201909152601f81527f68747470733a2f2f7468656173736574732e636c75622f6170692f6e66742f00602082015290565b90506000815111610abd5760405180602001604052806000815250610ae8565b80610ac784611070565b604051602001610ad89291906119e1565b6040516020818303038152906040525b9392505050565b610af7610ea8565b6001600160a01b038116610b5c5760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201526564647265737360d01b6064820152608401610572565b61079b81610f02565b60006001600160e01b031982166380ac58cd60e01b1480610b9657506001600160e01b03198216635b5e139f60e01b145b8061043e57506301ffc9a760e01b6001600160e01b031983161461043e565b6000818152600260205260409020546001600160a01b031661079b5760405162461bcd60e51b8152602060048201526018602482015277115490cdcc8c4e881a5b9d985b1a59081d1bdad95b88125160421b6044820152606401610572565b600081815260046020526040902080546001600160a01b0319166001600160a01b0384169081179091558190610c498261084c565b6001600160a01b03167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560405160405180910390a45050565b600080610c8e8361084c565b9050806001600160a01b0316846001600160a01b03161480610cd557506001600160a01b0380821660009081526005602090815260408083209388168352929052205460ff165b80610cf95750836001600160a01b0316610cee846104d6565b6001600160a01b0316145b949350505050565b826001600160a01b0316610d148261084c565b6001600160a01b031614610d785760405162461bcd60e51b815260206004820152602560248201527f4552433732313a207472616e736665722066726f6d20696e636f72726563742060448201526437bbb732b960d91b6064820152608401610572565b6001600160a01b038216610dda5760405162461bcd60e51b8152602060048201526024808201527f4552433732313a207472616e7366657220746f20746865207a65726f206164646044820152637265737360e01b6064820152608401610572565b610de583838361116e565b610df0600082610c14565b6001600160a01b0383166000908152600360205260408120805460019290610e19908490611a10565b90915550506001600160a01b0382166000908152600360205260408120805460019290610e479084906119ae565b909155505060008181526002602052604080822080546001600160a01b0319166001600160a01b0386811691821790925591518493918716917fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef91a4505050565b600a546001600160a01b031633146109445760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e65726044820152606401610572565b600a80546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b610a1a828260405180602001604052806000815250611226565b816001600160a01b0316836001600160a01b03161415610fd05760405162461bcd60e51b815260206004820152601960248201527f4552433732313a20617070726f766520746f2063616c6c6572000000000000006044820152606401610572565b6001600160a01b03838116600081815260056020908152604080832094871680845294825291829020805460ff191686151590811790915591519182527f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31910160405180910390a3505050565b611048848484610d01565b61105484848484611259565b610a505760405162461bcd60e51b815260040161057290611a27565b6060816110945750506040805180820190915260018152600360fc1b602082015290565b8160005b81156110be57806110a8816119c6565b91506110b79050600a83611a8f565b9150611098565b60008167ffffffffffffffff8111156110d9576110d96117d4565b6040519080825280601f01601f191660200182016040528015611103576020820181803683370190505b5090505b8415610cf957611118600183611a10565b9150611125600a86611aa3565b6111309060306119ae565b60f81b81838151811061114557611145611982565b60200101906001600160f81b031916908160001a905350611167600a86611a8f565b9450611107565b6001600160a01b0383166111c9576111c481600880546000838152600960205260408120829055600182018355919091527ff3f7a9fe364faab93b216da50a3214154f22a0a2b415b23a84c8169e8b636ee30155565b6111ec565b816001600160a01b0316836001600160a01b0316146111ec576111ec8382611366565b6001600160a01b0382166112035761061381611403565b826001600160a01b0316826001600160a01b0316146106135761061382826114b2565b61123083836114f6565b61123d6000848484611259565b6106135760405162461bcd60e51b815260040161057290611a27565b60006001600160a01b0384163b1561135b57604051630a85bd0160e11b81526001600160a01b0385169063150b7a029061129d903390899088908890600401611ab7565b602060405180830381600087803b1580156112b757600080fd5b505af19250505080156112e7575060408051601f3d908101601f191682019092526112e491810190611af4565b60015b611341573d808015611315576040519150601f19603f3d011682016040523d82523d6000602084013e61131a565b606091505b5080516113395760405162461bcd60e51b815260040161057290611a27565b805181602001fd5b6001600160e01b031916630a85bd0160e11b149050610cf9565b506001949350505050565b60006001611373846108ac565b61137d9190611a10565b6000838152600760205260409020549091508082146113d0576001600160a01b03841660009081526006602090815260408083208584528252808320548484528184208190558352600790915290208190555b5060009182526007602090815260408084208490556001600160a01b039094168352600681528383209183525290812055565b60085460009061141590600190611a10565b6000838152600960205260408120546008805493945090928490811061143d5761143d611982565b90600052602060002001549050806008838154811061145e5761145e611982565b600091825260208083209091019290925582815260099091526040808220849055858252812055600880548061149657611496611b11565b6001900381819060005260206000200160009055905550505050565b60006114bd836108ac565b6001600160a01b039093166000908152600660209081526040808320868452825280832085905593825260079052919091209190915550565b6001600160a01b03821661154c5760405162461bcd60e51b815260206004820181905260248201527f4552433732313a206d696e7420746f20746865207a65726f20616464726573736044820152606401610572565b6000818152600260205260409020546001600160a01b0316156115b15760405162461bcd60e51b815260206004820152601c60248201527f4552433732313a20746f6b656e20616c7265616479206d696e746564000000006044820152606401610572565b6115bd6000838361116e565b6001600160a01b03821660009081526003602052604081208054600192906115e69084906119ae565b909155505060008181526002602052604080822080546001600160a01b0319166001600160a01b03861690811790915590518392907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef908290a45050565b6001600160e01b03198116811461079b57600080fd5b60006020828403121561166c57600080fd5b8135610ae881611644565b60005b8381101561169257818101518382015260200161167a565b83811115610a505750506000910152565b600081518084526116bb816020860160208601611677565b601f01601f19169290920160200192915050565b602081526000610ae860208301846116a3565b6000602082840312156116f457600080fd5b5035919050565b80356001600160a01b038116811461171257600080fd5b919050565b6000806040838503121561172a57600080fd5b611733836116fb565b946020939093013593505050565b60008060006060848603121561175657600080fd5b61175f846116fb565b925061176d602085016116fb565b9150604084013590509250925092565b60006020828403121561178f57600080fd5b610ae8826116fb565b600080604083850312156117ab57600080fd5b6117b4836116fb565b9150602083013580151581146117c957600080fd5b809150509250929050565b634e487b7160e01b600052604160045260246000fd5b6000806000806080858703121561180057600080fd5b611809856116fb565b9350611817602086016116fb565b925060408501359150606085013567ffffffffffffffff8082111561183b57600080fd5b818701915087601f83011261184f57600080fd5b813581811115611861576118616117d4565b604051601f8201601f19908116603f01168101908382118183101715611889576118896117d4565b816040528281528a60208487010111156118a257600080fd5b82602086016020830137600060208483010152809550505050505092959194509250565b600080604083850312156118d957600080fd5b6118e2836116fb565b91506118f0602084016116fb565b90509250929050565b600181811c9082168061190d57607f821691505b6020821081141561192e57634e487b7160e01b600052602260045260246000fd5b50919050565b6020808252602e908201527f4552433732313a2063616c6c6572206973206e6f7420746f6b656e206f776e6560408201526d1c881b9bdc88185c1c1c9bdd995960921b606082015260800190565b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052601160045260246000fd5b600082198211156119c1576119c1611998565b500190565b60006000198214156119da576119da611998565b5060010190565b600083516119f3818460208801611677565b835190830190611a07818360208801611677565b01949350505050565b600082821015611a2257611a22611998565b500390565b60208082526032908201527f4552433732313a207472616e7366657220746f206e6f6e20455243373231526560408201527131b2b4bb32b91034b6b83632b6b2b73a32b960711b606082015260800190565b634e487b7160e01b600052601260045260246000fd5b600082611a9e57611a9e611a79565b500490565b600082611ab257611ab2611a79565b500690565b6001600160a01b0385811682528416602082015260408101839052608060608201819052600090611aea908301846116a3565b9695505050505050565b600060208284031215611b0657600080fd5b8151610ae881611644565b634e487b7160e01b600052603160045260246000fdfea2646970667358221220d4e7978f5981eeeea36e81250e237eb69e3895e3cb87b31fa0c9b8fcd92de28f64736f6c63430008090033";

type TheAssetsClubOZEnumerableConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: TheAssetsClubOZEnumerableConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class TheAssetsClubOZEnumerable__factory extends ContractFactory {
  constructor(...args: TheAssetsClubOZEnumerableConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<TheAssetsClubOZEnumerable> {
    return super.deploy(overrides || {}) as Promise<TheAssetsClubOZEnumerable>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): TheAssetsClubOZEnumerable {
    return super.attach(address) as TheAssetsClubOZEnumerable;
  }
  override connect(signer: Signer): TheAssetsClubOZEnumerable__factory {
    return super.connect(signer) as TheAssetsClubOZEnumerable__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): TheAssetsClubOZEnumerableInterface {
    return new utils.Interface(_abi) as TheAssetsClubOZEnumerableInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): TheAssetsClubOZEnumerable {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as TheAssetsClubOZEnumerable;
  }
}
