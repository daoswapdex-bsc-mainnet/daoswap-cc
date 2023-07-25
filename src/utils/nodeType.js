import { JSBI } from "./jsbi";
import {
  USDT_DAO_PAIR_ADDRESS,
  NODE_TYPE_STELLAR_MIN_USD_VALUE,
  NODE_TYPE_PLANETARY_MIN_USD_VALUE,
  NODE_TYPE_100LP_MIN_USD_VALUE,
  STAKING_LIMIT_FOR_LP_CONTRACT_ADDRESS,
  HECO_STAKING_RECORD_CONTRACT_ADDRESS
} from "../constants/index";
import StakingLimit_abi from "../constants/abi/StakingLimit_abi.json";
import StakingHecoRecord_abi from "../constants/abi/StakingHecoRecord_abi.json";
import ERC20_abi from "../constants/abi/erc20_abi.json";
import { getContractByABI, checkAddressChecksum } from "./web3";

export async function getNodeTypeValue(account, web3) {
  if (!checkAddressChecksum(account)) {
    return 0;
  }

  // 查询heco质押记录数据
  let LPAmount = JSBI.BigInt(0);
  const HECO_STAKING_RECORD_CONTRACT = await getContractByABI(
    StakingHecoRecord_abi,
    HECO_STAKING_RECORD_CONTRACT_ADDRESS,
    web3
  );
  const hecoStakingRecordVestingTokenArray = await HECO_STAKING_RECORD_CONTRACT.methods
    .getVestingTokenList(account)
    .call({ from: account });
  const getResultForStakingHecoRecord = hecoStakingRecordVestingTokenArray.map(
    async item => {
      const vestingInfo = await HECO_STAKING_RECORD_CONTRACT.methods
        .getVestingTokenInfo(item)
        .call({ from: account });
      const nowDate = parseInt((new Date().getTime() / 1000).toString()); //当前时间
      const endDate = vestingInfo.end.toString();
      if (endDate > nowDate) {
        LPAmount = JSBI.add(LPAmount, JSBI.BigInt(vestingInfo.stakingAmount));
      }
    }
  );
  await Promise.all(getResultForStakingHecoRecord);

  // 查询质押数据
  let tokenVestingAddressListArray = [];
  const getResultForTokenVestingAddress = STAKING_LIMIT_FOR_LP_CONTRACT_ADDRESS.map(
    async item => {
      const contract = await getContractByABI(StakingLimit_abi, item, web3);
      const vestingAddress = await contract.methods
        .getTokenVestingAddressByAccount(account)
        .call({ from: account });

      if (vestingAddress.length > 0) {
        tokenVestingAddressListArray = tokenVestingAddressListArray.concat(
          vestingAddress
        );
      }
    }
  );
  await Promise.all(getResultForTokenVestingAddress);
  // 查询质押记录余额
  if (tokenVestingAddressListArray.length > 0) {
    const contractERC20 = await getContractByABI(
      ERC20_abi,
      USDT_DAO_PAIR_ADDRESS,
      web3
    );
    const getResultForTokenVestingAddress = tokenVestingAddressListArray.map(
      async item => {
        const balance = await contractERC20.methods.balanceOf(item).call();
        LPAmount = JSBI.add(LPAmount, JSBI.BigInt(balance));
      }
    );
    await Promise.all(getResultForTokenVestingAddress);
  }

  // 判断比较获取节点类型值
  let NodeTypeValue = 0;
  if (JSBI.greaterThanOrEqual(LPAmount, NODE_TYPE_STELLAR_MIN_USD_VALUE)) {
    NodeTypeValue = 1;
  } else if (
    JSBI.lessThan(LPAmount, NODE_TYPE_STELLAR_MIN_USD_VALUE) &&
    JSBI.greaterThanOrEqual(LPAmount, NODE_TYPE_PLANETARY_MIN_USD_VALUE)
  ) {
    NodeTypeValue = 2;
  } else if (
    JSBI.lessThan(LPAmount, NODE_TYPE_PLANETARY_MIN_USD_VALUE) &&
    JSBI.greaterThanOrEqual(LPAmount, NODE_TYPE_100LP_MIN_USD_VALUE)
  ) {
    NodeTypeValue = 3;
  }

  return NodeTypeValue;
}
