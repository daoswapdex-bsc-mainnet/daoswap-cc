import { JSBI } from "@/utils/jsbi";

/********** Crowdsale Contract **********/
// export const CrowdsaleForAngelContractAddress =
//   "0x51490537eBC745206c947dcDC41B5A9d0094B37b";

// export const CrowdsaleForRetailContractAddress =
//   "0x363f4750bd1f702849B91d78AF107cDb17954440";

// export const CrowdsaleForRetailContractAddress2 =
//   "0x8872334365631F961fC04b0E9B14F186FE375F69";

// export const CrowdsaleForRetailContractAddress3 =
//   "0xC00A6Dc8e2b7a22A91D38b361DFcDE48F95055B2";

/********** Airdrop Contract **********/
// export const AirdropContractAddress =
//   "0x88d3Ce648AEA4403211BEcb7727e82bF00Aa1637";

// export const AirdropUnlimitedContractAddress =
//   "0x85e1d8e51b7806a061460C00c56aF4F8C53ca90e";

// export const AirdropToRelationshipContractAddress =
//   "0x1775f56Cff92281ca6aFE6bF087cE3fbd86EC1ae";

// export const AirdropToRelationshipContractAddress2 =
//   "0x345015F4E0E8390B154466eFfE75B250e7F30E33";

// export const AirdropForStakeContractAddress =
//   "0x783e3fD61e200fDc615164C2003DB4ce143c8E20";

// export const AirdropForHoldDAOContractAddress =
//   "0xd825DffB18f87a91732d1aCcC6c53345B4C4D412";

// export const AirdropForSwapsSnapshotContractAddress =
//   "0xDCC1eD5631C1d49FF96393ca3584A34E92c98500";

export const CrowdsaleForRetailUnlimitedContractAddress =
  "0x84473bC8c90E2aF6e295571556cFCd1112bc4Ba5";

export const InviteForRelationshipContractAddress =
  "0xe902390a2900758B7F55Ca447fd783b34b5ff6dA";

/********** base **********/
export const DAOAddress = "0xc096332CAacF00319703558988aD03eC6586e704";

export const DATAddress = "0x738B815eaDD06E0041b52B0C9d4F0d0D277B24bA";

export const DSTAddress = "0xC2ed68A614760BFE65e932329199d2F703219B8C";

export const ZeroAddress = "0x0000000000000000000000000000000000000000";

export const CHAIN_ID = process.env.VUE_APP_CHAIN_ID || 56;

export const NETWORK_ID = process.env.VUE_APP_NETWORK_ID || 56;

export const FACTORY_ADDRESS = "0x2216574F455CCc9E5FF9384Bbbd24e47c569CF67";

export const BUNDLE_ID = "1";

export const WHITE_LISTS_SWITCH = true;
export const WHITE_LISTS = [
  "0x3DdcFc89B4DD2b33d9a8Ca0F60180527E9810D4B",
  "0xa9bB710996d6ed61B83a5EAB583bAe683199c2de",
  "0x9b1d0c9c1aE96011776e6786b4Efe884665918D2"
];

// Node Type
export const USDT_DAO_PAIR_ADDRESS =
  "0x69217cF12bD760D6eA850A128646b21F7A61EE07";
export const STAKING_LIMIT_FOR_LP_CONTRACT_ADDRESS = [
  "0x489cc30482499DA25057B78a9a64043a042BA421",
  "0x7137E710961a5754362932Cc9543C337cA1c9B0e",
  "0xf36Dd3A5100a2ce0014A78Cb40B5EfE30639eB5d",
  "0x739f5C2a5Ee387fFde600A72ed293431Bf7C6517",
  "0x271aFA5D75D2C090C8763FA29eeabaed94A7Bd16",
  "0xBD22E68ea007a21D313E34e0955B44F356273344",
  "0xe6D688b65EDA351D57a663f4578c1d8e3D9b7C48",
  "0xBE1162f12c32737Cf42a30eE34500db81cf96517",
  "0xe2931E97516BCd0a447bbF4594Da66f048B213B1",
  "0xf246606f83DFd8B221dad80A3304a02e07c500e3",
  "0x7a1162F1175eCB34048695E0628448c3F7FE2850",
  "0x401203b0ee5845D84e5E86d41d45c053739E6a59"
];
export const HECO_STAKING_RECORD_CONTRACT_ADDRESS =
  "0x9d27efE2E7a0493413a0136340812fA0603BA062";

export const NODE_TYPE_STELLAR_MIN_USD_VALUE = JSBI.multiply(
  JSBI.BigInt(10000),
  JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(18))
); // 10000
export const NODE_TYPE_PLANETARY_MIN_USD_VALUE = JSBI.multiply(
  JSBI.BigInt(1000),
  JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(18))
); // 1000
export const NODE_TYPE_100LP_MIN_USD_VALUE = JSBI.multiply(
  JSBI.BigInt(100),
  JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(18))
); // 100
