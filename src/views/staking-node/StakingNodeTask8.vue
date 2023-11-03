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
import StakingNodeTask8_ABI from "@/constants/contractJson/StakingNodeTask8_abi.json";

export default {
  name: "StakingNodeTask8",
  data: () => ({
    loading: false,
    tokenSymbol: "DST",
    // 算力合约列表
    powerDuration: "2023-10-01 11:00:00 ~ 2023-11-01 11:00:00",
    rewardsContractAddressList: [
      {
        id: 16,
        address: "0x9b537B39Ca979ffa1c260Fb85bea0Fd761e885DE"
      },
      {
        id: 15,
        address: "0x204B8450360D7e2374B6E8bDB8ccf27b758FCD0B"
      },
      {
        id: 14,
        address: "0x4Eb975085823e2418A492b3b349189C1E6d16CA1"
      },
      {
        id: 13,
        address: "0x941B0A009d270293aa8Cd39286316F841Ca0d28F"
      },
      {
        id: 12,
        address: "0x3F173DBD5f99ca7f6A4D3B85efFC89eC39c48949"
      },
      {
        id: 11,
        address: "0x0aB79922cEdE9212E614AFD435564c788FD8Fc7C"
      },
      {
        id: 10,
        address: "0x650c240eFb893BFe5Ff9e0702DdCd42183584D7E"
      },
      {
        id: 9,
        address: "0x0E4B00F6B3228C96db5857b3f07441813335aCF2"
      },
      {
        id: 8,
        address: "0x86761a761da909a0647a800E25f3f6683451B819"
      },
      {
        id: 7,
        address: "0xE1779cbcE797ca81b73E8aA7A5aC1c505737731B"
      },
      {
        id: 6,
        address: "0x0D73B25F0D2452E575f23Af19CDE0828D03A2811"
      },
      {
        id: 5,
        address: "0x70F1745339A79126ce6888db4Ffdc702451c7Be0"
      },
      {
        id: 4,
        address: "0x1f619AC96792dfb5b5eeFe2ac0c47BCAb9A91005"
      },
      {
        id: 3,
        address: "0xe96CB806F25ff74f37DBe4F73ecAD84a4e93e784"
      },
      {
        id: 2,
        address: "0x15B2258694B6535cff6332aEdD6F09546a221171"
      },
      {
        id: 1,
        address: "0xA1Bd28C603892de696Ff8DB754d0c6a05f842ac8"
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
            StakingNodeTask8_ABI,
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
      getContractByABI(StakingNodeTask8_ABI, record.contractAddress, this.web3)
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
