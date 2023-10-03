<template>
  <div class="fill-height">
    <v-container v-if="web3 && connected" class="fill-height">
      <v-row justify="center">
        <v-col md="6">
          <v-card class="fill-width">
            <v-card outlined>
              <v-card-title>
                <v-avatar size="24" class="mr-2">
                  <img :src="require('@/assets/logo.png')" alt="DAO" />
                </v-avatar>
                <span class="title font-weight-light">
                  {{ $t("Community Relations") }}
                </span>
              </v-card-title>
              <v-divider></v-divider>
              <template v-if="chainId === 56 && contractAddress">
                <v-simple-table style="width: 100%;">
                  <template v-slot:default>
                    <thead>
                      <tr>
                        <th class="text-left">
                          {{ $t("List Account") }}
                        </th>
                        <th class="text-left" style="min-width: 80px;">
                          {{ $t("List Node Type") }}
                        </th>
                        <th class="text-left">
                          {{ $t("List Power") }}
                        </th>
                        <th class="text-left" style="min-width: 160px;">
                          {{ $t("List Power Increment") }}
                        </th>
                        <th class="text-left">
                          {{ $t("List Power Activation") }}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <template v-if="dataList.length > 0">
                        <tr v-for="item in dataList" :key="item.account">
                          <!-- @click="handleCopy(item.account, $event)"
                          style="cursor: pointer; text-decoration: underline; color: blue;" -->
                          <td>
                            {{ item.account | ellipseAddress(5) }}
                          </td>
                          <td :style="`color: ${item.nodeTypeColor};`">
                            {{ $t(`Relation Node.${item.nodeType}`) }}
                          </td>
                          <td>
                            {{
                              parseFloat(item.power) > 0
                                ? item.power
                                : $t("None")
                            }}
                          </td>
                          <td>
                            <v-icon
                              v-if="item.isIncrement == 1"
                              color="green"
                              small
                            >
                              mdi-arrow-up
                            </v-icon>
                            <v-icon
                              v-else-if="item.isIncrement == 0"
                              color="red"
                              small
                            >
                              mdi-arrow-down
                            </v-icon>
                            <span :style="`color: ${item.isIncrementColor};`">
                              {{
                                parseFloat(item.powerIncrement) > 0
                                  ? item.powerIncrement
                                  : $t("None")
                              }}
                            </span>
                          </td>
                          <td>
                            {{ item.activation }}
                          </td>
                        </tr>
                      </template>
                      <template v-else>
                        <tr>
                          <td colspan="4" align="center">
                            {{ $t("No Data") }}
                          </td>
                        </tr>
                      </template>
                    </tbody>
                  </template>
                </v-simple-table>
              </template>
              <template v-else>
                <v-card-text>
                  <v-row align="center">
                    <v-col class="subtitle-1" cols="12">
                      {{ $t("Please change BNB Smart Chain") }}
                    </v-col>
                  </v-row>
                </v-card-text>
              </template>
            </v-card>
          </v-card>
          <v-card justify="center" class="fill-width mt-10">
            <v-card-text style="color: red;">
              {{ $t("Relation tips") }}
            </v-card-text>
          </v-card>
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
import { InviteForRelationshipContractAddress } from "@/constants";
import { getContractByABI, weiToEther } from "@/utils/web3";
import { judgeCHNNodeTypeByValue, keepNumber, compare } from "@/filters/index";
import { getNodeTypeValue } from "@/utils/nodeType";
// 引入合约 ABI 文件
import InviteForRelationship_ABI from "@/constants/abi/InviteForRelationship_abi.json";
import CHNPowerMining_ABI from "@/constants/abi/CHNPowerMining4_abi.json";

export default {
  name: "RelationshipOfChn",
  data: () => ({
    contractAddress: InviteForRelationshipContractAddress,
    // 最新一期算力合约地址，持续更新最新地址
    powerContractAddress: "0xDA27df127f5e381dC0256276eDCD5B84551B5675",
    loading: false,
    // 查询数据
    inviteeList: [],
    dataList: [],
    // 提示框
    operationResult: {
      color: "success",
      snackbar: false,
      text: `Hello`
    }
  }),
  created() {
    if (this.web3 && this.connected) {
      this.loadData();
    } else {
      this.onConnect();
    }
  },
  watch: {
    web3(web3) {
      if (web3) {
        this.loadData();
      }
    },
    address(address) {
      if (address) {
        this.loadData();
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
      // return "0xFA3C2Dc2c5D24E8BeF9B23914f258f33688874F5";
      // return "0x2E9D1f134a3a705670ccB80dDe79f2Eac0a8a6ef";
      // return "0x7d3de024deb70741c6dfa0fad57775a47c227ae2";
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
    // 加载数据
    async loadData() {
      await this.queryInvitee();
      await this.queryPowerInfo();
    },
    // 查询被邀请人
    async queryInvitee() {
      const contract = getContractByABI(
        InviteForRelationship_ABI,
        this.contractAddress,
        this.web3
      );
      this.loading = true;
      // 执行合约
      this.inviteeList = await contract.methods
        .getMemberList()
        .call({ from: this.address });
      this.loading = false;
    },
    // 查询算力信息
    async queryPowerInfo() {
      this.dataList = [];
      if (this.inviteeList.length > 0 && this.inviteeList.length <= 400) {
        this.loading = true;
        const getResult = this.inviteeList.map(async account => {
          const contract = await getContractByABI(
            CHNPowerMining_ABI,
            this.powerContractAddress,
            this.web3
          );
          const hasRewardsInfo = await contract.methods
            .hasRewardsInfo(account)
            .call();
          const nodeTypeValue = await getNodeTypeValue(account, this.web3);
          let nodeTypeColor = "rgba(0, 0, 0, 0.87)";
          if (nodeTypeValue == 1) {
            nodeTypeColor = "red";
          } else if (nodeTypeValue == 2) {
            nodeTypeColor = "green";
          } else if (nodeTypeValue == 3) {
            nodeTypeColor = "blue";
          }
          const tempData = {
            account: account,
            nodeTypeColor: nodeTypeColor,
            nodeType: judgeCHNNodeTypeByValue(nodeTypeValue),
            power: 0,
            powerIncrement: 0,
            isIncrement: 2,
            isIncrementColor: "rgba(0, 0, 0, 0.87)",
            activation: 0
          };
          if (hasRewardsInfo) {
            const rewardsInfo = await contract.methods
              .getRewardsInfo()
              .call({ from: account });
            tempData.power = keepNumber(
              weiToEther(rewardsInfo.power, this.web3)
            );
            tempData.powerIncrement = keepNumber(
              weiToEther(rewardsInfo.powerIncrement, this.web3)
            );
            tempData.isIncrement = rewardsInfo.isIncrement;
            if (rewardsInfo.isIncrement == 1) {
              tempData.isIncrementColor = "green";
            } else if (rewardsInfo.isIncrement == 0) {
              tempData.isIncrementColor = "red";
            }
            tempData.activation = rewardsInfo.activation;
          }
          // 追加数据
          this.dataList.push(tempData);
        });
        await Promise.all(getResult);
        this.dataList.sort(compare("power"));
        this.loading = false;
      }
    }
  }
};
</script>

<style lang="sass">
.custom-btn
  .theme--dark.v-btn.v-btn--disabled.v-btn--has-bg
    background-color: rgb(147, 185, 84) !important
    border-color: rgb(147, 185, 84) !important
    opacity: 0.5 !important

  .v-btn--disabled
    background-color: rgb(147, 185, 84)
    border-color: rgb(147, 185, 84)
    opacity: 0.5
</style>
