<template>
  <div class="fill-height">
    <v-container v-if="web3 && connected" class="fill-height">
      <v-row justify="center">
        <v-col md="6">
          <!-- 认购数据显示 -->
          <v-card justify="center" class="fill-width">
            <v-card-title>
              <span class="title font-weight-light">
                {{ $t("Status") }}
              </span>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text v-if="dataForCrowdsale.openingTime <= currentTime">
              <v-row align="center">
                <v-col class="body-1" cols="12">
                  <p>
                    {{ $t("OpeningTime") }}：
                    {{ 1625407200 | parseTime("{y}-{m}-{d} {h}:{i}:{s}") }}
                  </p>
                  <p>
                    {{ $t("ClosingTime") }}：
                    {{ 1625407500 | parseTime("{y}-{m}-{d} {h}:{i}:{s}") }}
                  </p>
                  <p>{{ $t("Price") }}：0.5 USDT</p>
                </v-col>
              </v-row>
            </v-card-text>
            <!-- 开始时间小于等于当前时间，显示PE信息， 7月1号0点打开 -->
            <!-- <v-card-text v-if="dataForCrowdsale.openingTime <= currentTime">
              <v-row align="center">
                <v-col class="body-1" cols="12">
                  <p>
                    {{ $t("OpeningTime") }}：
                    {{
                      dataForCrowdsale.openingTime
                        | parseTime("{y}-{m}-{d} {h}:{i}:{s}")
                    }}
                  </p>
                  <p>
                    {{ $t("ClosingTime") }}：
                    {{
                      dataForCrowdsale.closingTime
                        | parseTime("{y}-{m}-{d} {h}:{i}:{s}")
                    }}
                  </p>
                  <p>{{ $t("Price") }}：0.5 USDT</p>
                </v-col>
              </v-row>
            </v-card-text> -->
            <!-- 倒计时时间大于0并且未真正开始,显示开始倒计时信息 -->
            <!-- <v-card-text
              justify="center"
              v-if="
                dataForCrowdsale.openingTime > currentTime &&
                  countdownTime > 0 &&
                  !isRealStart
              "
            >
              <v-row align="center">
                <v-col class="display-1" cols="12">
                  <p>{{ $t("Stake begin in") }}：</p>
                  <p class="text-h5">
                    {{ countdownTime | formatCountdown() }}
                  </p>
                </v-col>
              </v-row>
            </v-card-text> -->
            <!-- 倒计时时间大于0并且真正开始,显示结束倒计时信息 -->
            <!-- <v-card-text
              justify="center"
              v-if="
                dataForCrowdsale.openingTime > currentTime &&
                  countdownTime > 0 &&
                  isRealStart
              "
            >
              <v-row align="center">
                <v-col class="display-1" cols="12">
                  <p>{{ $t("Stake end in") }}：</p>
                  <p class="text-h5">
                    {{ countdownTime | formatCountdown() }}
                  </p>
                </v-col>
              </v-row>
            </v-card-text> -->
          </v-card>
          <!-- 认购操作 -->
          <v-card class="fill-width mt-10">
            <!-- 未参与过 -->
            <v-card outlined v-if="dataForCrowdsale.joinedAmount <= 0">
              <v-card-title>
                <v-avatar size="24" class="mr-2">
                  <img :src="require('@/assets/logo.png')" alt="DAO" />
                </v-avatar>
                <span class="title font-weight-light">
                  {{ $t("Available Stake Amount") }}
                </span>
              </v-card-title>
              <v-card-subtitle>
                {{
                  $t(
                    "Stake DAT to monthly release DAO in 20 months. Release 40% in first 10 months, 60% in rest 10 months."
                  )
                }}
              </v-card-subtitle>
              <v-divider></v-divider>
              <v-card-text v-if="dataForCrowdsale.isOpen">
                <v-row align="center">
                  <v-col class="display-3" cols="12">
                    {{ accountAssets.balance }}
                    <span class="display-1">
                      {{ dataForCrowdsale.tokenSymbol }}
                    </span>
                  </v-col>
                </v-row>
              </v-card-text>
              <v-divider v-if="dataForCrowdsale.isOpen"></v-divider>
              <v-card-actions
                class="justify-center"
                v-if="dataForCrowdsale.isOpen && accountAssets.balance > 0"
              >
                <v-btn
                  large
                  color="#93B954"
                  dark
                  width="80%"
                  @click="
                    accountAssets.allowanceAmount &&
                    accountAssets.allowanceAmount >= accountAssets.balance
                      ? handleCrowdsale()
                      : handleApprove()
                  "
                  :disabled="accountAssets.balance <= 0"
                >
                  {{
                    accountAssets.allowanceAmount &&
                    accountAssets.allowanceAmount >= accountAssets.balance
                      ? $t("Stake")
                      : $t("Approve")
                  }}
                </v-btn>
              </v-card-actions>
              <!-- 未开始/已结束时的显示 -->
              <v-card-text justify="center" v-if="!dataForCrowdsale.isOpen">
                <v-row align="center">
                  <v-col class="display-1" cols="12">
                    {{
                      dataForCrowdsale.hasClosed
                        ? $t("Stake is closed")
                        : $t("Stake not started")
                    }}
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
            <!-- 已参与过 -->
            <v-card outlined v-if="dataForCrowdsale.joinedAmount > 0">
              <v-card-title>
                <v-avatar size="24" class="mr-2">
                  <img :src="require('@/assets/logo.png')" alt="DAO" />
                </v-avatar>
                <span class="title font-weight-light">
                  {{ $t("Staked Amount") }}
                </span>
              </v-card-title>
              <v-card-subtitle>
                {{
                  $t(
                    "Stake DAT to monthly release DAO in 20 months. Release 40% in first 10 months, 60% in rest 10 months."
                  )
                }}
              </v-card-subtitle>
              <v-divider></v-divider>
              <v-card-text>
                <v-row align="center">
                  <v-col class="display-3" cols="12">
                    {{ dataForCrowdsale.joinedAmount }}
                    <span class="display-1">
                      {{ dataForCrowdsale.tokenSymbol }}
                    </span>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-card>
          <!-- 分期释放操作 -->
          <v-card
            class="fill-width mt-10"
            v-if="dataForCrowdsale.tokenVestingAddress"
          >
            <v-card outlined>
              <v-card-title>
                <span class="title font-weight-light">
                  {{ $t("Release Info") }}
                </span>
              </v-card-title>
              <v-divider></v-divider>
              <v-card-text>
                <v-row align="center">
                  <v-col class="body-1" cols="12">
                    <p>
                      {{ $t("Beneficiary") }}：
                      {{ dataForTokenVesting.beneficiary }}
                    </p>
                    <p>
                      {{ $t("Balance") }}：
                      {{ dataForTokenVesting.balance }}
                      {{ dataForTokenVesting.tokenSymbol }}
                    </p>
                    <p>
                      {{ $t("ReleasableAmount") }}：
                      {{ dataForTokenVesting.releasableAmount }}
                      {{ dataForTokenVesting.tokenSymbol }}
                    </p>
                    <p>
                      {{ $t("Released") }}：
                      {{ dataForTokenVesting.released }}
                      {{ dataForTokenVesting.tokenSymbol }}
                    </p>
                    <p>
                      {{ $t("Start") }}：
                      {{
                        dataForTokenVesting.start
                          | parseTime("{y}-{m}-{d} {h}:{i}:{s}")
                      }}
                    </p>
                    <p>
                      {{ $t("Duration") }}：
                      {{ dataForTokenVesting.duration | formatSeconds() }}
                    </p>
                  </v-col>
                </v-row>
              </v-card-text>
              <v-divider
                v-if="dataForTokenVesting.releasableAmount > 0"
              ></v-divider>
              <v-card-actions
                class="justify-center"
                v-if="dataForTokenVesting.releasableAmount > 0"
              >
                <v-btn
                  large
                  color="#93B954"
                  dark
                  width="80%"
                  @click="handleRelease()"
                >
                  {{ $t("Claim") }}
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-card>
          <!-- 当前钱包账号 -->
          <v-card justify="center" class="fill-width mt-10">
            <v-card-title>
              <span class="title font-weight-light">
                {{ $t("Current Token Address") }}
              </span>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <v-row align="center">
                <v-col
                  class="body-1"
                  cols="12"
                  @click="handleCopy(address, $event)"
                >
                  <p>
                    {{ address }}
                    <v-icon>mdi-content-copy</v-icon>
                  </p>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
          <!-- 官方说明 -->
          <v-card justify="center" class="fill-width mt-10">
            <v-card-text>
              <v-row align="center">
                <v-col class="body-1" cols="12">
                  <p @click="handleCopy(DAOAddress, $event)">
                    DAO contract: {{ DAOAddress }}
                    <v-icon>mdi-content-copy</v-icon>
                  </p>
                  <p @click="handleCopy(DATAddress, $event)">
                    DAT contract: {{ DATAddress }}
                    <v-icon>mdi-content-copy</v-icon>
                  </p>
                  <p>
                    {{ $t("DAO is offical goverance token for DAOSWAP.") }}
                  </p>
                  <p>
                    {{
                      $t("DAT is PE credential to exchange DAO by staking DAT.")
                    }}
                  </p>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
          <!-- 遮罩层 -->
          <v-overlay z-index="9999" opacity="0.7" :value="loading">
            <v-progress-circular indeterminate size="64"></v-progress-circular>
          </v-overlay>
          <!-- 提示层 -->
          <v-snackbar
            v-model="operationResult.snackbar"
            color="success"
            centered
            timeout="3000"
          >
            {{ $t(operationResult.text) }}
          </v-snackbar>
        </v-col>
      </v-row>
    </v-container>
    <v-container v-else>
      <v-row justify="center">
        <v-col md="6">
          <!-- 认购数据显示 -->
          <v-card justify="center" class="fill-width">
            <v-card-actions class="justify-center">
              <!-- 连接钱包 -->
              <v-btn
                class="mr-2"
                v-if="!connected"
                color="#93B954"
                block
                @click="onConnect"
              >
                {{ $t("Connect Wallet") }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import clip from "@/utils/clipboard";
import {
  CrowdsaleForRetailContractAddress,
  DATAddress,
  DAOAddress,
  ZeroAddress
} from "@/constants";
import { getContract, weiToEther, etherToWei } from "@/utils/web3";
// 引入合约 ABI 文件
import CrowdsaleForRetail from "@/constants/contractJson/CrowdsaleForRetail.json";
import ERC20DAT from "@/constants/contractJson/ERC20DAT.json";
import ERC20DAO from "@/constants/contractJson/ERC20DAO.json";
import TokenVestingRetail from "@/constants/contractJson/TokenVestingRetail.json";

export default {
  name: "CrowdsaleForRetail",
  data: () => ({
    loading: false,
    DATAddress,
    DAOAddress,
    // 众筹信息
    dataForCrowdsale: {
      tokenSymbol: null,
      weiRaised: 0,
      openingTime: "",
      closingTime: "",
      cap: 0,
      joinedAmount: 0,
      isOpen: false,
      hasClosed: false,
      tokenVestingAddress: null
    },
    // 分期释放信息
    dataForTokenVesting: {
      tokenSymbol: null,
      beneficiary: null,
      balance: 0,
      released: 0,
      start: "",
      duration: null,
      releasableAmount: 0
    },
    // 当前账户相关信息
    accountAssets: {
      allowanceAmount: 0, // 已授权额度
      balance: 0 // 余额
    },
    // 提示框
    operationResult: {
      snackbar: false,
      text: `Hello`
    },
    currentTime: Math.floor(Date.now() / 1000),
    timer: null,
    // 倒计时时间值
    isRealStart: false,
    countdownTime: 0
  }),
  created() {
    if (this.web3 && this.connected) {
      this.getAccountAssets();
    } else {
      this.onConnect();
    }
  },
  watch: {
    web3(web3) {
      if (web3) {
        this.getAccountAssets();
      }
    },
    address(address) {
      if (address) {
        this.getAccountAssets();
      }
    }
  },
  computed: {
    connected() {
      return this.$store.state.web3.connected;
    },
    web3() {
      return this.$store.state.web3.web3;
    },
    address() {
      return this.$store.state.web3.address;
    }
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  methods: {
    // 连接钱包 OK
    onConnect() {
      this.$store.dispatch("web3/connect");
    },
    // 断开连接钱包 OK
    closeWallet() {
      this.$store.dispatch("web3/closeWallet");
    },
    // 复制地址
    handleCopy(text, event) {
      clip(text, event);
      this.operationResult.snackbar = true;
      this.operationResult.text = "Cope Success";
    },
    // 倒计时到了，刷新页面
    handleTimeup() {
      this.countdownTime -= 1;
      if (this.countdownTime <= 0 && this.isRealStart) {
        clearInterval(this.timer);
        window.location.reload();
      } else if (this.countdownTime <= 0 && !this.isRealStart) {
        this.countdownTime = 300;
        this.isRealStart = true;
      }
    },
    // 设置倒计时
    handleSetTimeup(value) {
      // 添加倒计时参数
      this.countdownTime = parseInt(value) - this.currentTime;
      this.timer = setInterval(this.handleTimeup, 1000);
    },
    // 获取众筹信息
    async getCrowdsaleInfo() {
      this.loading = true;
      try {
        const web3 = await this.web3;
        const contract = getContract(
          CrowdsaleForRetail,
          CrowdsaleForRetailContractAddress,
          web3
        );
        const joinedAmount = await contract.methods.joined(this.address).call();
        this.dataForCrowdsale.joinedAmount = weiToEther(joinedAmount, web3);
        this.dataForCrowdsale.isOpen = await contract.methods.isOpen().call();
        this.dataForCrowdsale.hasClosed = await contract.methods
          .hasClosed()
          .call();
        // 获取分期释放合约地址
        this.dataForCrowdsale.tokenVestingAddress = null;
        const TokenVestingInfo = await contract.methods
          .TokenVestingInfoByBeneficiaryToken(this.address)
          .call();
        if (TokenVestingInfo.tokenVesting != ZeroAddress) {
          this.dataForCrowdsale.tokenVestingAddress =
            TokenVestingInfo.tokenVesting;
        }
      } catch (error) {
        console.info(error);
      }
      this.loading = false;
    },
    // 获取分期释放信息
    async getTokenVestingInfo() {
      if (this.dataForCrowdsale.tokenVestingAddress) {
        const web3 = await this.web3;
        this.loading = true;
        try {
          // 获取分期释放合约余额
          const contractERC20 = await getContract(
            ERC20DAO,
            DAOAddress,
            this.web3
          );
          this.dataForTokenVesting.tokenSymbol = await contractERC20.methods
            .symbol()
            .call();
          const balance = await contractERC20.methods
            .balanceOf(this.dataForCrowdsale.tokenVestingAddress)
            .call();
          this.dataForTokenVesting.balance = weiToEther(balance, web3);
          // 获取分期释放合约信息
          const contract = await getContract(
            TokenVestingRetail,
            this.dataForCrowdsale.tokenVestingAddress,
            this.web3
          );
          this.dataForTokenVesting.beneficiary = await contract.methods
            .beneficiary()
            .call();
          const released = await contract.methods.released(DAOAddress).call();
          this.dataForTokenVesting.released = weiToEther(released, web3);
          this.dataForTokenVesting.start = await contract.methods
            .start()
            .call();
          this.dataForTokenVesting.duration = await contract.methods
            .duration()
            .call();
          const releasableAmount = await contract.methods
            .releasableAmount(DAOAddress)
            .call();
          this.dataForTokenVesting.releasableAmount = weiToEther(
            releasableAmount,
            web3
          );
        } catch (error) {
          console.info(error);
        }
        this.loading = false;
      }
    },
    // 获取账号信息
    async getAccountAssets() {
      this.loading = true;
      try {
        const web3 = await this.web3;
        const contract = getContract(ERC20DAT, DATAddress, web3);
        this.dataForCrowdsale.tokenSymbol = await contract.methods
          .symbol()
          .call();
        const allowance = await contract.methods
          .allowance(this.address, CrowdsaleForRetailContractAddress)
          .call();
        const balance = await contract.methods.balanceOf(this.address).call();
        this.accountAssets.allowanceAmount = weiToEther(allowance, web3);
        this.accountAssets.balance = weiToEther(balance, web3);
        await this.getCrowdsaleInfo();
        await this.getTokenVestingInfo();
      } catch (error) {
        console.info(error);
      }
      this.loading = false;
    },
    // 授权
    handleApprove() {
      this.loading = true;
      // 执行合约
      getContract(ERC20DAT, DATAddress, this.web3)
        .methods.approve(
          CrowdsaleForRetailContractAddress,
          etherToWei(this.accountAssets.balance, this.web3)
        )
        .send({ from: this.address })
        .then(() => {
          this.loading = false;
          this.operationResult.snackbar = true;
          this.operationResult.text = "Approve Success";
          this.getAccountAssets();
        })
        .catch(e => {
          this.loading = false;
          console.info(e);
        });
    },
    // 认购
    handleCrowdsale() {
      this.loading = true;
      // 执行合约
      getContract(
        CrowdsaleForRetail,
        CrowdsaleForRetailContractAddress,
        this.web3
      )
        .methods.buyTokens(this.accountAssets.balance)
        .send({ from: this.address })
        .then(() => {
          this.loading = false;
          this.operationResult.snackbar = true;
          this.operationResult.text = "Crowdsale Success";
          this.getAccountAssets();
        })
        .catch(e => {
          this.loading = false;
          console.info(e);
        });
    },
    // 提取DAO
    handleRelease() {
      this.loading = true;
      // 执行合约
      getContract(
        TokenVestingRetail,
        this.dataForCrowdsale.tokenVestingAddress,
        this.web3
      )
        .methods.release(DAOAddress)
        .send({ from: this.address })
        .then(() => {
          this.loading = false;
          this.operationResult.snackbar = true;
          this.operationResult.text = "Claim Success";
          this.getAccountAssets();
        })
        .catch(e => {
          this.loading = false;
          console.info(e);
        });
    }
  }
};
</script>
