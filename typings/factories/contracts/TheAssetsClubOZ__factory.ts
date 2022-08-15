/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Signer,
  utils,
  Contract,
  ContractFactory,
  BigNumberish,
  Overrides,
} from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type {
  TheAssetsClubOZ,
  TheAssetsClubOZInterface,
} from "../../contracts/TheAssetsClubOZ";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_maxSupply",
        type: "uint256",
      },
    ],
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
    inputs: [],
    name: "maxSupply",
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
  "0x60a06040523480156200001157600080fd5b5060405162001da638038062001da68339810160408190526200003491620001c0565b604080518082018252600f81526e2a34329020b9b9b2ba399021b63ab160891b60208083019182528351808501909452600384526254414360e81b9084015281518493916200008791600091906200011a565b5080516200009d9060019060208401906200011a565b505050620000ba620000b4620000c460201b60201c565b620000c8565b6080525062000217565b3390565b600a80546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b8280546200012890620001da565b90600052602060002090601f0160209004810192826200014c576000855562000197565b82601f106200016757805160ff191683800117855562000197565b8280016001018555821562000197579182015b82811115620001975782518255916020019190600101906200017a565b50620001a5929150620001a9565b5090565b5b80821115620001a55760008155600101620001aa565b600060208284031215620001d357600080fd5b5051919050565b600181811c90821680620001ef57607f821691505b602082108114156200021157634e487b7160e01b600052602260045260246000fd5b50919050565b608051611b6c6200023a600039600081816103ac01526109750152611b6c6000f3fe6080604052600436106101355760003560e01c806370a08231116100ab578063a22cb4651161006f578063a22cb4651461033a578063b88d4fde1461035a578063c87b56dd1461037a578063d5abeb011461039a578063e985e9c5146103ce578063f2fde38b1461041757600080fd5b806370a08231146102bf578063715018a6146102df5780638da5cb5b146102f457806395d89b4114610312578063a0712d681461032757600080fd5b806323b872dd116100fd57806323b872dd1461020a5780632f745c591461022a5780633ccfd60b1461024a57806342842e0e1461025f5780634f6ccce71461027f5780636352211e1461029f57600080fd5b806301ffc9a71461013a57806306fdde031461016f578063081812fc14610191578063095ea7b3146101c957806318160ddd146101eb575b600080fd5b34801561014657600080fd5b5061015a610155366004611669565b610437565b60405190151581526020015b60405180910390f35b34801561017b57600080fd5b50610184610462565b60405161016691906116de565b34801561019d57600080fd5b506101b16101ac3660046116f1565b6104f4565b6040516001600160a01b039091168152602001610166565b3480156101d557600080fd5b506101e96101e4366004611726565b61051b565b005b3480156101f757600080fd5b506008545b604051908152602001610166565b34801561021657600080fd5b506101e9610225366004611750565b610636565b34801561023657600080fd5b506101fc610245366004611726565b610667565b34801561025657600080fd5b506101e96106fd565b34801561026b57600080fd5b506101e961027a366004611750565b6107bc565b34801561028b57600080fd5b506101fc61029a3660046116f1565b6107d7565b3480156102ab57600080fd5b506101b16102ba3660046116f1565b61086a565b3480156102cb57600080fd5b506101fc6102da36600461178c565b6108ca565b3480156102eb57600080fd5b506101e9610950565b34801561030057600080fd5b50600a546001600160a01b03166101b1565b34801561031e57600080fd5b50610184610964565b6101e96103353660046116f1565b610973565b34801561034657600080fd5b506101e96103553660046117a7565b610a47565b34801561036657600080fd5b506101e96103753660046117f9565b610a52565b34801561038657600080fd5b506101846103953660046116f1565b610a8a565b3480156103a657600080fd5b506101fc7f000000000000000000000000000000000000000000000000000000000000000081565b3480156103da57600080fd5b5061015a6103e93660046118d5565b6001600160a01b03918216600090815260056020908152604080832093909416825291909152205460ff1690565b34801561042357600080fd5b506101e961043236600461178c565b610afe565b60006001600160e01b0319821663780e9d6360e01b148061045c575061045c82610b74565b92915050565b60606000805461047190611908565b80601f016020809104026020016040519081016040528092919081815260200182805461049d90611908565b80156104ea5780601f106104bf576101008083540402835291602001916104ea565b820191906000526020600020905b8154815290600101906020018083116104cd57829003601f168201915b5050505050905090565b60006104ff82610bc4565b506000908152600460205260409020546001600160a01b031690565b60006105268261086a565b9050806001600160a01b0316836001600160a01b031614156105995760405162461bcd60e51b815260206004820152602160248201527f4552433732313a20617070726f76616c20746f2063757272656e74206f776e656044820152603960f91b60648201526084015b60405180910390fd5b336001600160a01b03821614806105b557506105b581336103e9565b6106275760405162461bcd60e51b815260206004820152603e60248201527f4552433732313a20617070726f76652063616c6c6572206973206e6f7420746f60448201527f6b656e206f776e6572206e6f7220617070726f76656420666f7220616c6c00006064820152608401610590565b6106318383610c23565b505050565b6106403382610c91565b61065c5760405162461bcd60e51b815260040161059090611943565b610631838383610d10565b6000610672836108ca565b82106106d45760405162461bcd60e51b815260206004820152602b60248201527f455243373231456e756d657261626c653a206f776e657220696e646578206f7560448201526a74206f6620626f756e647360a81b6064820152608401610590565b506001600160a01b03919091166000908152600660209081526040808320938352929052205490565b610705610eb7565b6000610719600a546001600160a01b031690565b6001600160a01b03164760405160006040518083038185875af1925050503d8060008114610763576040519150601f19603f3d011682016040523d82523d6000602084013e610768565b606091505b50509050806107b95760405162461bcd60e51b815260206004820152601f60248201527f546865417373657473436c75623a207769746864726177206661696c757265006044820152606401610590565b50565b61063183838360405180602001604052806000815250610a52565b60006107e260085490565b82106108455760405162461bcd60e51b815260206004820152602c60248201527f455243373231456e756d657261626c653a20676c6f62616c20696e646578206f60448201526b7574206f6620626f756e647360a01b6064820152608401610590565b6008828154811061085857610858611991565b90600052602060002001549050919050565b6000818152600260205260408120546001600160a01b03168061045c5760405162461bcd60e51b8152602060048201526018602482015277115490cdcc8c4e881a5b9d985b1a59081d1bdad95b88125160421b6044820152606401610590565b60006001600160a01b0382166109345760405162461bcd60e51b815260206004820152602960248201527f4552433732313a2061646472657373207a65726f206973206e6f7420612076616044820152683634b21037bbb732b960b91b6064820152608401610590565b506001600160a01b031660009081526003602052604090205490565b610958610eb7565b6109626000610f11565b565b60606001805461047190611908565b7f00000000000000000000000000000000000000000000000000000000000000008161099e60085490565b6109a891906119bd565b10610a0c5760405162461bcd60e51b815260206004820152602e60248201527f546865417373657473436c75623a206d696e74696e6720636f756e742065786360448201526d65656473206d6178537570706c7960901b6064820152608401610590565b60005b81811015610a4357610a2333600b54610f63565b610a31600b80546001019055565b80610a3b816119d5565b915050610a0f565b5050565b610a43338383610f7d565b610a5c3383610c91565b610a785760405162461bcd60e51b815260040161059090611943565b610a848484848461104c565b50505050565b6060610a9582610bc4565b6000610aac60408051602081019091526000815290565b90506000815111610acc5760405180602001604052806000815250610af7565b80610ad68461107f565b604051602001610ae79291906119f0565b6040516020818303038152906040525b9392505050565b610b06610eb7565b6001600160a01b038116610b6b5760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201526564647265737360d01b6064820152608401610590565b6107b981610f11565b60006001600160e01b031982166380ac58cd60e01b1480610ba557506001600160e01b03198216635b5e139f60e01b145b8061045c57506301ffc9a760e01b6001600160e01b031983161461045c565b6000818152600260205260409020546001600160a01b03166107b95760405162461bcd60e51b8152602060048201526018602482015277115490cdcc8c4e881a5b9d985b1a59081d1bdad95b88125160421b6044820152606401610590565b600081815260046020526040902080546001600160a01b0319166001600160a01b0384169081179091558190610c588261086a565b6001600160a01b03167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560405160405180910390a45050565b600080610c9d8361086a565b9050806001600160a01b0316846001600160a01b03161480610ce457506001600160a01b0380821660009081526005602090815260408083209388168352929052205460ff165b80610d085750836001600160a01b0316610cfd846104f4565b6001600160a01b0316145b949350505050565b826001600160a01b0316610d238261086a565b6001600160a01b031614610d875760405162461bcd60e51b815260206004820152602560248201527f4552433732313a207472616e736665722066726f6d20696e636f72726563742060448201526437bbb732b960d91b6064820152608401610590565b6001600160a01b038216610de95760405162461bcd60e51b8152602060048201526024808201527f4552433732313a207472616e7366657220746f20746865207a65726f206164646044820152637265737360e01b6064820152608401610590565b610df483838361117d565b610dff600082610c23565b6001600160a01b0383166000908152600360205260408120805460019290610e28908490611a1f565b90915550506001600160a01b0382166000908152600360205260408120805460019290610e569084906119bd565b909155505060008181526002602052604080822080546001600160a01b0319166001600160a01b0386811691821790925591518493918716917fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef91a4505050565b600a546001600160a01b031633146109625760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e65726044820152606401610590565b600a80546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b610a43828260405180602001604052806000815250611235565b816001600160a01b0316836001600160a01b03161415610fdf5760405162461bcd60e51b815260206004820152601960248201527f4552433732313a20617070726f766520746f2063616c6c6572000000000000006044820152606401610590565b6001600160a01b03838116600081815260056020908152604080832094871680845294825291829020805460ff191686151590811790915591519182527f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31910160405180910390a3505050565b611057848484610d10565b61106384848484611268565b610a845760405162461bcd60e51b815260040161059090611a36565b6060816110a35750506040805180820190915260018152600360fc1b602082015290565b8160005b81156110cd57806110b7816119d5565b91506110c69050600a83611a9e565b91506110a7565b60008167ffffffffffffffff8111156110e8576110e86117e3565b6040519080825280601f01601f191660200182016040528015611112576020820181803683370190505b5090505b8415610d0857611127600183611a1f565b9150611134600a86611ab2565b61113f9060306119bd565b60f81b81838151811061115457611154611991565b60200101906001600160f81b031916908160001a905350611176600a86611a9e565b9450611116565b6001600160a01b0383166111d8576111d381600880546000838152600960205260408120829055600182018355919091527ff3f7a9fe364faab93b216da50a3214154f22a0a2b415b23a84c8169e8b636ee30155565b6111fb565b816001600160a01b0316836001600160a01b0316146111fb576111fb8382611375565b6001600160a01b0382166112125761063181611412565b826001600160a01b0316826001600160a01b0316146106315761063182826114c1565b61123f8383611505565b61124c6000848484611268565b6106315760405162461bcd60e51b815260040161059090611a36565b60006001600160a01b0384163b1561136a57604051630a85bd0160e11b81526001600160a01b0385169063150b7a02906112ac903390899088908890600401611ac6565b602060405180830381600087803b1580156112c657600080fd5b505af19250505080156112f6575060408051601f3d908101601f191682019092526112f391810190611b03565b60015b611350573d808015611324576040519150601f19603f3d011682016040523d82523d6000602084013e611329565b606091505b5080516113485760405162461bcd60e51b815260040161059090611a36565b805181602001fd5b6001600160e01b031916630a85bd0160e11b149050610d08565b506001949350505050565b60006001611382846108ca565b61138c9190611a1f565b6000838152600760205260409020549091508082146113df576001600160a01b03841660009081526006602090815260408083208584528252808320548484528184208190558352600790915290208190555b5060009182526007602090815260408084208490556001600160a01b039094168352600681528383209183525290812055565b60085460009061142490600190611a1f565b6000838152600960205260408120546008805493945090928490811061144c5761144c611991565b90600052602060002001549050806008838154811061146d5761146d611991565b60009182526020808320909101929092558281526009909152604080822084905585825281205560088054806114a5576114a5611b20565b6001900381819060005260206000200160009055905550505050565b60006114cc836108ca565b6001600160a01b039093166000908152600660209081526040808320868452825280832085905593825260079052919091209190915550565b6001600160a01b03821661155b5760405162461bcd60e51b815260206004820181905260248201527f4552433732313a206d696e7420746f20746865207a65726f20616464726573736044820152606401610590565b6000818152600260205260409020546001600160a01b0316156115c05760405162461bcd60e51b815260206004820152601c60248201527f4552433732313a20746f6b656e20616c7265616479206d696e746564000000006044820152606401610590565b6115cc6000838361117d565b6001600160a01b03821660009081526003602052604081208054600192906115f59084906119bd565b909155505060008181526002602052604080822080546001600160a01b0319166001600160a01b03861690811790915590518392907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef908290a45050565b6001600160e01b0319811681146107b957600080fd5b60006020828403121561167b57600080fd5b8135610af781611653565b60005b838110156116a1578181015183820152602001611689565b83811115610a845750506000910152565b600081518084526116ca816020860160208601611686565b601f01601f19169290920160200192915050565b602081526000610af760208301846116b2565b60006020828403121561170357600080fd5b5035919050565b80356001600160a01b038116811461172157600080fd5b919050565b6000806040838503121561173957600080fd5b6117428361170a565b946020939093013593505050565b60008060006060848603121561176557600080fd5b61176e8461170a565b925061177c6020850161170a565b9150604084013590509250925092565b60006020828403121561179e57600080fd5b610af78261170a565b600080604083850312156117ba57600080fd5b6117c38361170a565b9150602083013580151581146117d857600080fd5b809150509250929050565b634e487b7160e01b600052604160045260246000fd5b6000806000806080858703121561180f57600080fd5b6118188561170a565b93506118266020860161170a565b925060408501359150606085013567ffffffffffffffff8082111561184a57600080fd5b818701915087601f83011261185e57600080fd5b813581811115611870576118706117e3565b604051601f8201601f19908116603f01168101908382118183101715611898576118986117e3565b816040528281528a60208487010111156118b157600080fd5b82602086016020830137600060208483010152809550505050505092959194509250565b600080604083850312156118e857600080fd5b6118f18361170a565b91506118ff6020840161170a565b90509250929050565b600181811c9082168061191c57607f821691505b6020821081141561193d57634e487b7160e01b600052602260045260246000fd5b50919050565b6020808252602e908201527f4552433732313a2063616c6c6572206973206e6f7420746f6b656e206f776e6560408201526d1c881b9bdc88185c1c1c9bdd995960921b606082015260800190565b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052601160045260246000fd5b600082198211156119d0576119d06119a7565b500190565b60006000198214156119e9576119e96119a7565b5060010190565b60008351611a02818460208801611686565b835190830190611a16818360208801611686565b01949350505050565b600082821015611a3157611a316119a7565b500390565b60208082526032908201527f4552433732313a207472616e7366657220746f206e6f6e20455243373231526560408201527131b2b4bb32b91034b6b83632b6b2b73a32b960711b606082015260800190565b634e487b7160e01b600052601260045260246000fd5b600082611aad57611aad611a88565b500490565b600082611ac157611ac1611a88565b500690565b6001600160a01b0385811682528416602082015260408101839052608060608201819052600090611af9908301846116b2565b9695505050505050565b600060208284031215611b1557600080fd5b8151610af781611653565b634e487b7160e01b600052603160045260246000fdfea2646970667358221220d9102720db39d609a369fb1bb44931643bb1e6c28be58fda8b0fc453a56621de64736f6c63430008090033";

type TheAssetsClubOZConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: TheAssetsClubOZConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class TheAssetsClubOZ__factory extends ContractFactory {
  constructor(...args: TheAssetsClubOZConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    _maxSupply: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<TheAssetsClubOZ> {
    return super.deploy(
      _maxSupply,
      overrides || {}
    ) as Promise<TheAssetsClubOZ>;
  }
  override getDeployTransaction(
    _maxSupply: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_maxSupply, overrides || {});
  }
  override attach(address: string): TheAssetsClubOZ {
    return super.attach(address) as TheAssetsClubOZ;
  }
  override connect(signer: Signer): TheAssetsClubOZ__factory {
    return super.connect(signer) as TheAssetsClubOZ__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): TheAssetsClubOZInterface {
    return new utils.Interface(_abi) as TheAssetsClubOZInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): TheAssetsClubOZ {
    return new Contract(address, _abi, signerOrProvider) as TheAssetsClubOZ;
  }
}
