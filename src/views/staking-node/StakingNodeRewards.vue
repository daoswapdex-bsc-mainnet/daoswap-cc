<template>
  <div class="fill-height">
    <v-container v-if="web3 && connected" class="fill-height">
      <v-row justify="center">
        <v-col md="6">
          <!-- 公告 -->
          <v-card justify="center" class="fill-width">
            <v-card-title>
              <span class="title font-weight-bold text-h5">
                {{ $t("Activities") }}
              </span>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <v-row align="center">
                <v-col class="body-1" cols="12">
                  <p>{{ $t("Rewards Duration") }}：{{ powerDuration }}</p>
                  <p>
                    {{
                      $t(
                        "Will caculate and airdrop within 3 workdays after the last day."
                      )
                    }}
                  </p>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
          <!-- 操作 -->
          <v-card class="fill-width mt-10">
            <v-card outlined>
              <!-- 标题 -->
              <v-card-title>
                <v-avatar size="24" class="mr-2">
                  <img :src="require('@/assets/logo.png')" alt="DAO" />
                </v-avatar>
                <span class="title font-weight-bold text-h5">
                  {{ $t("Staking Node Rewards") }}
                </span>
              </v-card-title>
              <v-divider></v-divider>
              <v-card-text v-if="chainId === 56 && rewardsDataList.length > 0">
                <v-card
                  v-for="item in rewardsDataList"
                  :key="item.account"
                  :loading="loading"
                  class="ma-2"
                >
                  <v-card-title>
                    {{ $t("Phase") }} {{ item.periodId }} {{ $t("Expect") }}
                  </v-card-title>
                  <v-divider class="mx-4"></v-divider>
                  <v-card-text>
                    <p>
                      {{ $t("Stellar New Quantity") }}：{{
                        item.rewardsInfo.stellarNewQuantity
                      }}
                    </p>
                    <p>
                      {{ $t("Planetary New Quantity") }}：{{
                        item.rewardsInfo.planetaryNewQuantity
                      }}
                    </p>
                    <p>
                      {{ $t("Claimable Amount") }} /
                      {{ $t("Claimabled Amount") }}：{{
                        item.rewardsInfo.isClaim
                          ? 0
                          : item.rewardsInfo.totalRewards
                      }}
                      /
                      {{
                        item.rewardsInfo.isClaim
                          ? item.rewardsInfo.totalRewards
                          : 0
                      }}
                      {{ tokenSymbol }}
                    </p>
                  </v-card-text>
                  <v-divider class="mx-4"></v-divider>
                  <v-card-actions
                    class="justify-center"
                    v-if="
                      item.rewardsInfo.totalRewards > 0 &&
                        !item.rewardsInfo.isClaim
                    "
                  >
                    <v-btn
                      color="#93B954"
                      dark
                      width="80%"
                      @click="handleRelease(item)"
                      :disabled="
                        item.rewardsInfo.isClaim ||
                          item.rewardsInfo.totalRewards <= 0
                      "
                    >
                      {{ $t("Claim") }}
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-card-text>
              <v-card-text v-else>
                <v-row align="center">
                  <v-col class="body-3" cols="12">
                    {{ $t("No Data") }}
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-card>
          <!-- 当前钱包账号 -->
          <v-card justify="center" class="fill-width mt-10">
            <v-card-title>
              <span class="title font-weight-bold text-h5">
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
          <!-- 遮罩层 -->
          <v-overlay z-index="9999" opacity="0.7" :value="loading">
            <v-progress-circular indeterminate size="64"></v-progress-circular>
          </v-overlay>
          <!-- 提示层 -->
          <v-snackbar
            v-model="operationResult.snackbar"
            :color="operationResult.color"
            centered
            top
            timeout="4000"
          >
            {{ $t(operationResult.text) }}
          </v-snackbar>
        </v-col>
      </v-row>
    </v-container>
    <v-container v-else>
      <v-row justify="center">
        <v-col md="6">
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
import { getContractByABI, weiToEther } from "@/utils/web3";
import { compare } from "@/filters/index";
// 引入合约 ABI 文件
import StakingNodeRewards_ABI from "@/constants/contractJson/StakingNodeRewards_abi.json";

export default {
  name: "StakingNodeRewards",
  data: () => ({
    loading: false,
    tokenSymbol: "DST",
    // 算力合约列表
    powerDuration: "2022-11-01 11:00:00 ~ 2022-12-01 11:00:00",
    rewardsContractAddressList: [
      {
        id: 10,
        address: "0xCc3aE90512f1b1AE276197cfe09F753811fE972a"
      },
      {
        id: 9,
        address: "0x4d792140ede59611E42cd31c2da059A6a18b52D0"
      },
      {
        id: 8,
        address: "0x26EDBfB581fE69ad70264835a95f6A05a8E22E80"
      },
      {
        id: 7,
        address: "0x4079E56FB984cab196f33F45310d6289D755251a"
      },
      {
        id: 6,
        address: "0xb0B1bE3716386bC0fC4f47B63fB514a39B3e8ACA"
      },
      {
        id: 5,
        address: "0xd3040c2b56B8e7414Fba2B87f58a22CB61eD7dd9"
      },
      {
        id: 4,
        address: "0xBFf2F7b02c8bbcb3262cFc29c93AD310053B140C"
      },
      {
        id: 3,
        address: "0xE32edd74caEd595eE8078EF7fAACd45f53836BBA"
      },
      {
        id: 2,
        address: "0x226c3f5774798cb79dbec4b6d920b504e840f427"
      },
      {
        id: 1,
        address: "0x05f1732E87b70480F3CFB6be394b1C1Fd502E1a6"
      }
    ],
    // 算力数据列表
    rewardsDataList: [],
    // 提示框
    operationResult: {
      color: "success",
      snackbar: false,
      text: `Hello`
    }
  }),
  created() {
    if (this.web3 && this.connected) {
      this.getRewardsDataList();
    } else {
      this.onConnect();
    }
  },
  watch: {
    web3(web3) {
      if (web3) {
        this.getRewardsDataList();
      }
    },
    address(address) {
      if (address) {
        this.getRewardsDataList();
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
      // return "0x3d1d9c27ff3e397139e4f7fbacd5fdfb88580fcd";
      // return "0x7d3dE024dEB70741c6Dfa0FaD57775A47C227AE2";
      return this.$store.state.web3.address;
    },
    chainId() {
      return this.$store.state.web3.chainId;
    }
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
      this.operationResult.color = "success";
      this.operationResult.snackbar = true;
      this.operationResult.text = "Cope Success";
    },
    // 获取算力数据列表
    async getRewardsDataList() {
      if (this.rewardsContractAddressList.length > 0) {
        this.rewardsDataList = [];
        this.loading = true;
        const getResult = this.rewardsContractAddressList.map(async item => {
          const contract = await getContractByABI(
            StakingNodeRewards_ABI,
            item.address,
            this.web3
          );
          const hasRewardsInfo = await contract.methods
            .hasRewardsInfo(this.address)
            .call();
          const rewardsInfo = await contract.methods
            .accountRewardsMap(this.address)
            .call();
          const totalRewardsFormat = weiToEther(
            rewardsInfo.totalRewards,
            this.web3
          );
          if (hasRewardsInfo && parseFloat(totalRewardsFormat) > 0) {
            const tempData = {
              periodId: item.id,
              contractAddress: item.address,
              rewardsInfo: {
                stellarNewQuantity: rewardsInfo.stellarNewQuantity,
                planetaryNewQuantity: rewardsInfo.planetaryNewQuantity,
                totalRewards: totalRewardsFormat,
                isClaim: rewardsInfo.isClaim
              }
            };
            this.rewardsDataList.push(tempData);
          }
        });
        await Promise.all(getResult);
        this.rewardsDataList.sort(compare("periodId"));
        this.loading = false;
      }
    },
    // 提取DAO
    handleRelease(record) {
      this.loading = true;
      // 执行合约
      getContractByABI(
        StakingNodeRewards_ABI,
        record.contractAddress,
        this.web3
      )
        .methods.getRewards()
        .send({ from: this.address })
        .then(() => {
          this.loading = false;
          this.operationResult.snackbar = true;
          this.operationResult.text = "Claim Success";
          // 重新获取数据
          this.getRewardsDataList();
        })
        .catch(e => {
          this.loading = false;
          console.info(e);
        });
    }
  }
};
</script>

<style lang="sass">
.theme--dark.v-btn.v-btn--disabled.v-btn--has-bg
  background-color: rgb(147, 185, 84) !important
  border-color: rgb(147, 185, 84) !important
  opacity: 0.5 !important

.v-btn--disabled
  background-color: rgb(147, 185, 84)
  border-color: rgb(147, 185, 84)
  opacity: 0.5
</style>
