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
                  <p>{{ $t("Power Duration") }}：{{ powerDuration }}</p>
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
                  {{ $t("Hash Mining") }}
                </span>
              </v-card-title>
              <v-divider></v-divider>
              <v-card-text
                v-if="chainId === 56 && powerDataListNew4.length > 0"
              >
                <v-card
                  v-for="item in powerDataListNew4"
                  :key="item.account"
                  :loading="loading"
                  class="ma-2"
                >
                  <v-card-title>
                    {{ $t("Power Phase") }}
                    {{ item.periodId }}
                    {{ $t("Power Expect") }}
                  </v-card-title>
                  <v-divider class="mx-4"></v-divider>
                  <v-card-text>
                    <p>
                      {{ $t("Power Duration") }}：{{ item.startTime }}
                      ~
                      {{ item.endTime }}
                    </p>
                    <p>
                      {{ $t("Power Node Status") }}：{{
                        $t(`Node.${item.nodeType}`)
                      }}
                    </p>
                    <p>
                      {{
                        $t("Personal cumulative total accounting strength")
                      }}：{{ item.power | keepNumber }}
                    </p>
                    <p>
                      {{
                        $t("Actual reward cumulative total computing power")
                      }}：{{ item.powerExpandReality | keepNumber }}
                    </p>
                    <p v-if="parseFloat(item.periodId) != 20.1">
                      {{
                        $t(
                          "New accumulated calculation power in the current period"
                        )
                      }}
                      <v-dialog v-model="dialogForIsIncrement" width="500">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon
                            color="#93B954"
                            v-bind="attrs"
                            v-on="on"
                            small
                          >
                            mdi-help-circle-outline
                          </v-icon>
                        </template>
                        <v-card>
                          <v-card-title class="text-h5 grey lighten-2">
                            {{
                              $t(
                                "Explanation of adding cumulative computing power"
                              )
                            }}
                          </v-card-title>

                          <v-card-text style="padding-top: 20px;">
                            <p>
                              <v-icon color="green">
                                mdi-arrow-up
                              </v-icon>
                              ：
                              <span>
                                {{
                                  $t(
                                    "Added cumulative computing power increase"
                                  )
                                }}
                              </span>
                            </p>
                            <p style="margin-bottom: 0;">
                              <v-icon color="red">
                                mdi-arrow-down
                              </v-icon>
                              ：
                              <span>
                                {{
                                  $t(
                                    "Added cumulative computing power reduction"
                                  )
                                }}
                              </span>
                            </p>
                          </v-card-text>
                        </v-card>
                      </v-dialog>
                      ：
                      <v-icon v-if="item.isIncrement > 0" color="green" small>
                        mdi-arrow-up
                      </v-icon>
                      <v-icon v-else color="red" small>
                        mdi-arrow-down
                      </v-icon>
                      <span
                        :style="
                          `color: ${item.isIncrement > 0 ? 'green' : 'red'};`
                        "
                      >
                        {{ item.powerIncrement | keepNumber }}
                      </span>
                    </p>
                    <p>
                      {{ $t("Reward ratio of each calculation power") }}：{{
                        item.rewardRatio
                      }}
                      (20%{{ item.rewardDAO.tokenSymbol }}, 80%{{
                        item.rewardDST.tokenSymbol
                      }})
                    </p>
                    <p>
                      {{
                        $t(
                          "LP quantity of DAO-USDT to be added in the next period"
                        )
                      }}：{{ item.nextStandard }}
                    </p>
                    <p>{{ $t("Power Activation") }}：{{ item.activation }}</p>
                  </v-card-text>
                  <v-divider v-if="item.isAllowClaim" class="mx-4"></v-divider>
                  <v-card-actions
                    v-if="item.isAllowClaim"
                    class="justify-space-between"
                  >
                    <v-simple-table style="width: 100%;">
                      <template v-slot:default>
                        <thead>
                          <tr>
                            <th class="text-left">
                              {{ $t("Token Symbol") }}
                            </th>
                            <th class="text-left">
                              {{ $t("Claimable Amount") }}
                            </th>
                            <th class="text-left">
                              {{ $t("Claimabled Amount") }}
                            </th>
                            <th class="text-left">{{ $t("Operation") }}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>{{ item.rewardDAO.tokenSymbol }}</td>
                            <td>
                              {{
                                (item.rewardDAO.isClaim
                                  ? 0
                                  : item.rewardDAO.amount) | keepNumber
                              }}
                            </td>
                            <td>
                              {{
                                (item.rewardDAO.isClaim
                                  ? item.rewardDAO.amount
                                  : 0) | keepNumber
                              }}
                            </td>
                            <td>
                              <v-btn
                                v-if="
                                  !item.rewardDAO.isClaim &&
                                    item.rewardDAO.isAble
                                "
                                small
                                color="#93B954"
                                dark
                                width="80%"
                                @click="
                                  handleReleaseNew(
                                    item.contractAddress,
                                    item.rewardDAO.token
                                  )
                                "
                              >
                                {{ $t("Claim") }}
                              </v-btn>
                            </td>
                          </tr>
                          <tr>
                            <td>{{ item.rewardDST.tokenSymbol }}</td>
                            <td>
                              {{
                                (item.rewardDST.isClaim
                                  ? 0
                                  : item.rewardDST.amount) | keepNumber
                              }}
                            </td>
                            <td>
                              {{
                                (item.rewardDST.isClaim
                                  ? item.rewardDST.amount
                                  : 0) | keepNumber
                              }}
                            </td>
                            <td>
                              <v-btn
                                v-if="
                                  !item.rewardDST.isClaim &&
                                    item.rewardDST.isAble
                                "
                                small
                                color="#93B954"
                                dark
                                width="80%"
                                @click="
                                  handleReleaseNew(
                                    item.contractAddress,
                                    item.rewardDST.token
                                  )
                                "
                              >
                                {{ $t("Claim") }}
                              </v-btn>
                            </td>
                          </tr>
                          <!-- 分隔符 -->
                          <tr
                            v-if="
                              item.rewardDAOForReissue ||
                                item.rewardDSTForReissue
                            "
                          >
                            <th class="text-center" colspan="4">2.0</th>
                          </tr>
                          <!-- 分隔符 -->
                          <tr v-if="item.rewardDAOForReissue">
                            <td>{{ item.rewardDAOForReissue.tokenSymbol }}</td>
                            <td>
                              {{
                                (item.rewardDAOForReissue.isClaim
                                  ? 0
                                  : item.rewardDAOForReissue.amount)
                                  | keepNumber
                              }}
                            </td>
                            <td>
                              {{
                                (item.rewardDAOForReissue.isClaim
                                  ? item.rewardDAOForReissue.amount
                                  : 0) | keepNumber
                              }}
                            </td>
                            <td>
                              <v-btn
                                v-if="
                                  !item.rewardDAOForReissue.isClaim &&
                                    item.rewardDAOForReissue.isAble
                                "
                                small
                                color="#93B954"
                                dark
                                width="80%"
                                @click="
                                  handleReleaseNew(
                                    item.reissueContractAddress,
                                    item.rewardDAOForReissue.token
                                  )
                                "
                              >
                                {{ $t("Claim") }}
                              </v-btn>
                            </td>
                          </tr>
                          <tr v-if="item.rewardDSTForReissue">
                            <td>{{ item.rewardDSTForReissue.tokenSymbol }}</td>
                            <td>
                              {{
                                (item.rewardDSTForReissue.isClaim
                                  ? 0
                                  : item.rewardDSTForReissue.amount)
                                  | keepNumber
                              }}
                            </td>
                            <td>
                              {{
                                (item.rewardDSTForReissue.isClaim
                                  ? item.rewardDSTForReissue.amount
                                  : 0) | keepNumber
                              }}
                            </td>
                            <td>
                              <v-btn
                                v-if="
                                  !item.rewardDSTForReissue.isClaim &&
                                    item.rewardDSTForReissue.isAble
                                "
                                small
                                color="#93B954"
                                dark
                                width="80%"
                                @click="
                                  handleReleaseNew(
                                    item.reissueContractAddress,
                                    item.rewardDSTForReissue.token
                                  )
                                "
                              >
                                {{ $t("Claim") }}
                              </v-btn>
                            </td>
                          </tr>
                        </tbody>
                      </template>
                    </v-simple-table>
                  </v-card-actions>
                </v-card>
              </v-card-text>
              <v-card-text
                v-if="chainId === 56 && powerDataListNew3.length > 0"
              >
                <v-card
                  v-for="item in powerDataListNew3"
                  :key="item.account"
                  :loading="loading"
                  class="ma-2"
                >
                  <v-card-title>
                    {{ $t("Power Phase") }}
                    {{ item.periodId }}
                    {{ $t("Power Expect") }}
                  </v-card-title>
                  <v-divider class="mx-4"></v-divider>
                  <v-card-text>
                    <p>
                      {{ $t("Power Duration") }}：{{
                        item.startTime | parseTime("{y}-{m}-{d}")
                      }}
                      ~
                      {{ item.endTime | parseTime("{y}-{m}-{d}") }}
                    </p>
                    <p>
                      {{ $t("Power Node Status") }}：{{
                        $t(`Node.${item.nodeType}`)
                      }}
                    </p>
                    <p>
                      {{
                        $t("Personal cumulative total accounting strength")
                      }}：{{ item.power | keepNumber }}
                    </p>
                    <p>
                      {{
                        $t(
                          "New accumulated calculation power in the current period"
                        )
                      }}
                      <v-dialog v-model="dialogForIsIncrement" width="500">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon
                            color="#93B954"
                            v-bind="attrs"
                            v-on="on"
                            small
                          >
                            mdi-help-circle-outline
                          </v-icon>
                        </template>
                        <v-card>
                          <v-card-title class="text-h5 grey lighten-2">
                            {{
                              $t(
                                "Explanation of adding cumulative computing power"
                              )
                            }}
                          </v-card-title>

                          <v-card-text style="padding-top: 20px;">
                            <p>
                              <v-icon color="green">
                                mdi-arrow-up
                              </v-icon>
                              ：
                              <span>
                                {{
                                  $t(
                                    "Added cumulative computing power increase"
                                  )
                                }}
                              </span>
                            </p>
                            <p style="margin-bottom: 0;">
                              <v-icon color="red">
                                mdi-arrow-down
                              </v-icon>
                              ：
                              <span>
                                {{
                                  $t(
                                    "Added cumulative computing power reduction"
                                  )
                                }}
                              </span>
                            </p>
                          </v-card-text>
                        </v-card>
                      </v-dialog>
                      ：
                      <v-icon v-if="item.isIncrement > 0" color="green" small>
                        mdi-arrow-up
                      </v-icon>
                      <v-icon v-else color="red" small>
                        mdi-arrow-down
                      </v-icon>
                      <span
                        :style="
                          `color: ${item.isIncrement > 0 ? 'green' : 'red'};`
                        "
                      >
                        {{ item.powerIncrement | keepNumber }}
                      </span>
                    </p>
                    <p>
                      {{ $t("Reward ratio of each calculation power") }}：{{
                        item.rewardRatio
                      }}
                      (20%{{ item.rewardDAO.tokenSymbol }}, 80%{{
                        item.rewardDST.tokenSymbol
                      }})
                    </p>
                    <p>
                      {{
                        $t(
                          "LP quantity of DAO-USDT to be added in the next period"
                        )
                      }}：{{ item.nextStandard }}
                    </p>
                  </v-card-text>
                  <v-divider class="mx-4"></v-divider>
                  <v-card-actions class="justify-space-between">
                    <v-simple-table style="width: 100%;">
                      <template v-slot:default>
                        <thead>
                          <tr>
                            <th class="text-left">
                              {{ $t("Token Symbol") }}
                            </th>
                            <th class="text-left">
                              {{ $t("Claimable Amount") }}
                            </th>
                            <th class="text-left">
                              {{ $t("Claimabled Amount") }}
                            </th>
                            <th class="text-left">{{ $t("Operation") }}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>{{ item.rewardDAO.tokenSymbol }}</td>
                            <td>
                              {{
                                (item.rewardDAO.isClaim
                                  ? 0
                                  : item.rewardDAO.amount) | keepNumber
                              }}
                            </td>
                            <td>
                              {{
                                (item.rewardDAO.isClaim
                                  ? item.rewardDAO.amount
                                  : 0) | keepNumber
                              }}
                            </td>
                            <td>
                              <v-btn
                                v-if="
                                  !item.rewardDAO.isClaim &&
                                    item.rewardDAO.isAble
                                "
                                small
                                color="#93B954"
                                dark
                                width="80%"
                                @click="
                                  handleReleaseNew(
                                    item.contractAddress,
                                    item.rewardDAO.token
                                  )
                                "
                              >
                                {{ $t("Claim") }}
                              </v-btn>
                            </td>
                          </tr>
                          <tr>
                            <td>{{ item.rewardDST.tokenSymbol }}</td>
                            <td>
                              {{
                                (item.rewardDST.isClaim
                                  ? 0
                                  : item.rewardDST.amount) | keepNumber
                              }}
                            </td>
                            <td>
                              {{
                                (item.rewardDST.isClaim
                                  ? item.rewardDST.amount
                                  : 0) | keepNumber
                              }}
                            </td>
                            <td>
                              <v-btn
                                v-if="
                                  !item.rewardDST.isClaim &&
                                    item.rewardDST.isAble
                                "
                                small
                                color="#93B954"
                                dark
                                width="80%"
                                @click="
                                  handleReleaseNew(
                                    item.contractAddress,
                                    item.rewardDST.token
                                  )
                                "
                              >
                                {{ $t("Claim") }}
                              </v-btn>
                            </td>
                          </tr>
                        </tbody>
                      </template>
                    </v-simple-table>
                  </v-card-actions>
                </v-card>
              </v-card-text>
              <v-card-text
                v-if="chainId === 56 && powerDataListNew2.length > 0"
              >
                <v-card
                  v-for="item in powerDataListNew2"
                  :key="item.account"
                  :loading="loading"
                  class="ma-2"
                >
                  <v-card-title>
                    {{ $t("Power Phase") }}
                    {{ item.periodId }}
                    {{ $t("Power Expect") }}
                  </v-card-title>
                  <v-divider class="mx-4"></v-divider>
                  <v-card-text>
                    <p>
                      {{ $t("Power Duration") }}：{{
                        item.startTime | parseTime("{y}-{m}-{d}")
                      }}
                      ~
                      {{ item.endTime | parseTime("{y}-{m}-{d}") }}
                    </p>
                    <p>
                      {{ $t("Power Node Status") }}：{{
                        $t(`Node.${item.nodeType}`)
                      }}
                    </p>
                    <p>
                      {{
                        $t("Personal cumulative total accounting strength")
                      }}：{{ item.power | keepNumber }}
                    </p>
                    <p>
                      {{
                        $t(
                          "New accumulated calculation power in the current period"
                        )
                      }}：{{ item.powerIncrement | keepNumber }}
                    </p>
                    <p>
                      {{ $t("Reward ratio of each calculation power") }}：{{
                        item.rewardRatio
                      }}
                      (20%{{ item.rewardDAO.tokenSymbol }}, 80%{{
                        item.rewardDST.tokenSymbol
                      }})
                    </p>
                    <p>
                      {{
                        $t(
                          "LP quantity of DAO-USDT to be added in the next period"
                        )
                      }}：{{ item.nextStandard }}
                    </p>
                  </v-card-text>
                  <v-divider class="mx-4"></v-divider>
                  <v-card-actions class="justify-space-between">
                    <v-simple-table style="width: 100%;">
                      <template v-slot:default>
                        <thead>
                          <tr>
                            <th class="text-left">
                              {{ $t("Token Symbol") }}
                            </th>
                            <th class="text-left">
                              {{ $t("Claimable Amount") }}
                            </th>
                            <th class="text-left">
                              {{ $t("Claimabled Amount") }}
                            </th>
                            <th class="text-left">{{ $t("Operation") }}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>{{ item.rewardDAO.tokenSymbol }}</td>
                            <td>
                              {{
                                (item.rewardDAO.isClaim
                                  ? 0
                                  : item.rewardDAO.amount) | keepNumber
                              }}
                            </td>
                            <td>
                              {{
                                (item.rewardDAO.isClaim
                                  ? item.rewardDAO.amount
                                  : 0) | keepNumber
                              }}
                            </td>
                            <td>
                              <v-btn
                                v-if="
                                  !item.rewardDAO.isClaim &&
                                    item.rewardDAO.isAble
                                "
                                small
                                color="#93B954"
                                dark
                                width="80%"
                                @click="
                                  handleReleaseNew(
                                    item.contractAddress,
                                    item.rewardDAO.token
                                  )
                                "
                              >
                                {{ $t("Claim") }}
                              </v-btn>
                            </td>
                          </tr>
                          <tr>
                            <td>{{ item.rewardDST.tokenSymbol }}</td>
                            <td>
                              {{
                                (item.rewardDST.isClaim
                                  ? 0
                                  : item.rewardDST.amount) | keepNumber
                              }}
                            </td>
                            <td>
                              {{
                                (item.rewardDST.isClaim
                                  ? item.rewardDST.amount
                                  : 0) | keepNumber
                              }}
                            </td>
                            <td>
                              <v-btn
                                v-if="
                                  !item.rewardDST.isClaim &&
                                    item.rewardDST.isAble
                                "
                                small
                                color="#93B954"
                                dark
                                width="80%"
                                @click="
                                  handleReleaseNew(
                                    item.contractAddress,
                                    item.rewardDST.token
                                  )
                                "
                              >
                                {{ $t("Claim") }}
                              </v-btn>
                            </td>
                          </tr>
                        </tbody>
                      </template>
                    </v-simple-table>
                  </v-card-actions>
                </v-card>
              </v-card-text>
              <v-card-text v-if="chainId === 56 && powerDataListNew.length > 0">
                <v-card
                  v-for="item in powerDataListNew"
                  :key="item.account"
                  :loading="loading"
                  class="ma-2"
                >
                  <v-card-title>
                    {{ $t("Power Phase") }}
                    {{ item.periodId }}
                    {{ $t("Power Expect") }}
                  </v-card-title>
                  <v-divider class="mx-4"></v-divider>
                  <v-card-text>
                    <p>
                      {{ $t("Power Duration") }}：{{
                        item.startTime | parseTime("{y}-{m}-{d}")
                      }}
                      ~
                      {{ item.endTime | parseTime("{y}-{m}-{d}") }}
                    </p>
                    <p>
                      {{ $t("Power Node Status") }}：{{
                        $t(`Node.${item.nodeType}`)
                      }}
                    </p>
                    <p>
                      {{
                        $t("Personal cumulative total accounting strength")
                      }}：{{ item.power | keepNumber }}
                    </p>
                    <p>
                      {{
                        $t(
                          "LP quantity of DAO-USDT to be added in the next period"
                        )
                      }}：{{ item.nextStandard }}
                    </p>
                  </v-card-text>
                  <v-divider class="mx-4"></v-divider>
                  <v-card-actions class="justify-space-between">
                    <v-simple-table style="width: 100%;">
                      <template v-slot:default>
                        <thead>
                          <tr>
                            <th class="text-left">
                              {{ $t("Token Symbol") }}
                            </th>
                            <th class="text-left">
                              {{ $t("Claimable Amount") }}
                            </th>
                            <th class="text-left">
                              {{ $t("Claimabled Amount") }}
                            </th>
                            <th class="text-left">{{ $t("Operation") }}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>{{ item.rewardDAO.tokenSymbol }}</td>
                            <td>
                              {{
                                (item.rewardDAO.isClaim
                                  ? 0
                                  : item.rewardDAO.amount) | keepNumber
                              }}
                            </td>
                            <td>
                              {{
                                (item.rewardDAO.isClaim
                                  ? item.rewardDAO.amount
                                  : 0) | keepNumber
                              }}
                            </td>
                            <td>
                              <v-btn
                                v-if="!item.rewardDAO.isClaim"
                                small
                                color="#93B954"
                                dark
                                width="80%"
                                @click="
                                  handleReleaseNew(
                                    item.contractAddress,
                                    item.rewardDAO.token
                                  )
                                "
                              >
                                {{ $t("Claim") }}
                              </v-btn>
                            </td>
                          </tr>
                          <tr>
                            <td>{{ item.rewardDST.tokenSymbol }}</td>
                            <td>
                              {{
                                (item.rewardDST.isClaim
                                  ? 0
                                  : item.rewardDST.amount) | keepNumber
                              }}
                            </td>
                            <td>
                              {{
                                (item.rewardDST.isClaim
                                  ? item.rewardDST.amount
                                  : 0) | keepNumber
                              }}
                            </td>
                            <td>
                              <v-btn
                                v-if="!item.rewardDST.isClaim"
                                small
                                color="#93B954"
                                dark
                                width="80%"
                                @click="
                                  handleReleaseNew(
                                    item.contractAddress,
                                    item.rewardDST.token
                                  )
                                "
                              >
                                {{ $t("Claim") }}
                              </v-btn>
                            </td>
                          </tr>
                        </tbody>
                      </template>
                    </v-simple-table>
                  </v-card-actions>
                </v-card>
              </v-card-text>
              <v-card-text v-if="chainId === 56 && powerDataList.length > 0">
                <v-card
                  v-for="item in powerDataList"
                  :key="item.account"
                  :loading="loading"
                  class="ma-2"
                >
                  <v-card-title>
                    {{ $t("Power Phase") }}
                    {{ item.periodId }}
                    {{ $t("Power Expect") }}
                  </v-card-title>
                  <v-divider class="mx-4"></v-divider>
                  <v-card-text>
                    <p>
                      {{ $t("Power Duration") }}：{{
                        item.startTime | parseTime("{y}-{m}-{d}")
                      }}
                      ~
                      {{ item.endTime | parseTime("{y}-{m}-{d}") }}
                    </p>
                    <p>{{ $t("Power All Hash") }}：{{ item.countedPower }}</p>
                    <p>
                      {{ $t("Power Node Proportion") }}：{{
                        item.annualizedRate
                      }}
                      %
                    </p>
                    <p>
                      {{ $t("Power Node Status") }}：{{
                        $t(`Node.${item.powerInfo.nodeType}`)
                      }}
                    </p>
                    <!-- <p>
                      {{ $t("Power DAO-USDT Liquidity Value") }}：$
                      {{ item.powerInfo.liquidity }}
                    </p> -->
                    <p>
                      {{ $t("Claimable Amount") }} /
                      {{ $t("Claimabled Amount") }}：{{
                        item.powerInfo.isClaim
                          ? 0
                          : item.powerInfo.receiveAmount
                      }}
                      /
                      {{
                        item.powerInfo.isClaim
                          ? item.powerInfo.receiveAmount
                          : 0
                      }}
                      {{ tokenSymbol }}
                    </p>
                  </v-card-text>
                  <v-divider
                    class="mx-4"
                    v-if="!item.powerInfo.isClaim"
                  ></v-divider>
                  <v-card-actions class="justify-center">
                    <v-btn
                      v-if="!item.powerInfo.isClaim"
                      color="#93B954"
                      dark
                      width="80%"
                      @click="handleRelease(item)"
                      :disabled="item.powerInfo.isClaim"
                    >
                      {{ $t("Claim") }}
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-card-text>
              <v-card-text
                v-if="
                  chainId !== 56 ||
                    (powerDataListNew4.length <= 0 &&
                      powerDataListNew3.length <= 0 &&
                      powerDataListNew2.length <= 0 &&
                      powerDataListNew.length <= 0 &&
                      powerDataList.length <= 0)
                "
              >
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
import { JSBI } from "@/utils/jsbi";
import clip from "@/utils/clipboard";
import { getContractByABI, weiToEther } from "@/utils/web3";
import { judgeCHNNodeTypeByValue, compare } from "@/filters/index";
// 引入合约 ABI 文件
import ComputingPowerMining_ABI from "@/constants/contractJson/ComputingPowerMiningForLiquidityOnBsc_abi.json";
import CHNPowerMining_ABI from "@/constants/abi/CHNPowerMining_abi.json";
import CHNPowerMining2_ABI from "@/constants/abi/CHNPowerMining2_abi.json";
import CHNPowerMining3_ABI from "@/constants/abi/CHNPowerMining3_abi.json";
import CHNPowerMining4_ABI from "@/constants/abi/CHNPowerMining4_abi.json";

export default {
  name: "ComputingPowerMiningForLiquidity",
  data: () => ({
    loading: false,
    tokenSymbol: "DST",
    // 算力合约列表
    powerDuration: "2023-10-01 11:00:00 ~ 2023-11-01 11:00:00",
    powerContractAddressList: [
      {
        id: 9,
        address: "0x2aaA1A0aADee1952b5c75bbDF82D691305A94Ce5"
      },
      {
        id: 8,
        address: "0xFa90857C9DDCB344781F0AE8d2243609F1aCcA0a"
      },
      {
        id: 7.2,
        address: "0xD3D2e6Ab7D76ef8Fc617E50F9884F20f5bD09528"
      },
      {
        id: 7,
        address: "0x452D71236CB695f4F9Ed106DC10dd26D5f6d4A52"
      },
      {
        id: 6,
        address: "0xd285504a12B42eF96f4B19A07C23A6D08f4790bd"
      },
      {
        id: 5,
        address: "0xEfb17F89B153F9c9F4B5B1030e92047DbD3c5c9a"
      },
      {
        id: 4,
        address: "0xCa2fCA74d3F5a66991896A70015359bF2989704C"
      },
      {
        id: 3,
        address: "0xb18C7e2ba4C5cdA22B3EF5E6294Ae0A8B538fFD2"
      },
      {
        id: 2,
        address: "0x0eeb3e3614366147fb8aa732d4a40e11b8ca0d97"
      },
      {
        id: 1,
        address: "0x58B33f4ee75497Cf52C3Ce0954Ca3a9b81dab2fD"
      }
    ],
    powerContractAddressListNew: [
      {
        id: 12,
        address: "0xe0B86DBF00Fc25f66Be3868216B16fcc040B84e2"
      },
      {
        id: 11,
        address: "0xB548e84C6d033B2797D18fc76DBadd283769C351"
      },
      {
        id: 10,
        address: "0x3108FA5149bB2E801ed263d67f78498c66e10A0b"
      }
    ],
    powerContractAddressListNew2: [
      {
        id: 18,
        address: "0x9538795a16C4DDD71571Cf354080c64Fcb6DF680"
      },
      {
        id: 17,
        address: "0xe46dF90664dA35A188765DB534065bDA22539aFB"
      },
      {
        id: 16,
        address: "0x7AE96D04Cf4cEF37be8D6Ab079e79e0ca1808c09"
      },
      {
        id: 15,
        address: "0x8bFCa6899793C00f3A271b90921c19da5953E1e0"
      },
      {
        id: 14,
        address: "0x3D84c5bDeFa186A5CD61A98Bfb8910382DCa50b8"
      },
      {
        id: 13,
        address: "0x5CFA899d74232981e119F0e6E233d233E6B85033"
      }
    ],
    powerContractAddressListNew3: [
      {
        id: 19,
        address: "0xe4fE8b3d1F86296D8573140A6667186bD5c323c4"
      }
    ],
    powerContractAddressListNew4: [
      {
        id: 21,
        address: "0xDA27df127f5e381dC0256276eDCD5B84551B5675",
        startTime: "2023-09-01",
        endTime: "2023-10-01",
        reissueAddress: "",
        isAllowClaim: true
      },
      {
        id: 20.1,
        address: "0xe1801a9D68A55468E1743592cc20523E2f1cba35",
        startTime: "2023-08-01",
        endTime: "2023-09-01",
        reissueAddress: "",
        isAllowClaim: true
      },
      {
        id: 20,
        address: "0x29cAE5e5BF321d478Bd6C188fe2D8dBBB8309018",
        startTime: "2023-08-01",
        endTime: "2023-09-01",
        reissueAddress: "0xd63dBb75130638702231298d9B6520D2FBcA10af",
        isAllowClaim: true
      }
    ],
    // 算力数据列表
    powerDataList: [],
    powerDataListNew: [],
    powerDataListNew2: [],
    powerDataListNew3: [],
    powerDataListNew4: [],
    // 提示框
    operationResult: {
      color: "success",
      snackbar: false,
      text: `Hello`
    },
    dialogForIsIncrement: false
  }),
  created() {
    if (this.web3 && this.connected) {
      this.getPowerInfo();
    } else {
      this.onConnect();
    }
  },
  watch: {
    web3(web3) {
      if (web3) {
        this.getPowerInfo();
      }
    },
    address(address) {
      if (address) {
        this.getPowerInfo();
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
      // return "0xE86ff1a34AB87c2e2720Cfe41Be2dCB47FA155Cf";
      // return "0xf38db654F3C391BD30689Fb2eB1d95D2601b4210";
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
    // 获取算力数据
    async getPowerInfo() {
      await this.getPowerDataListNew4();
      await this.getPowerDataListNew3();
      await this.getPowerDataListNew2();
      await this.getPowerDataListNew();
      await this.getPowerDataList();
    },
    // 获取算力数据列表-新版4
    async getPowerDataListNew4() {
      if (this.powerContractAddressListNew4.length > 0) {
        this.powerDataListNew4 = [];
        this.loading = true;
        const getResult = this.powerContractAddressListNew4.map(async item => {
          const contract = await getContractByABI(
            CHNPowerMining4_ABI,
            item.address,
            this.web3
          );
          const hasRewardsInfo = await contract.methods
            .hasRewardsInfo(this.address)
            .call();
          if (hasRewardsInfo) {
            const rewardRatio = await contract.methods.rewardRatio().call();
            const rewardsInfo = await contract.methods
              .getRewardsInfo()
              .call({ from: this.address });

            // 获取补发奖励数据
            let rewardDAOForReissue = null;
            let rewardDSTForReissue = null;
            if (item.reissueAddress) {
              const contractForReissue = await getContractByABI(
                CHNPowerMining4_ABI,
                item.reissueAddress,
                this.web3
              );
              const hasRewardsInfoForReissue = await contractForReissue.methods
                .hasRewardsInfo(this.address)
                .call();
              if (hasRewardsInfoForReissue) {
                const rewardsInfoForReissue = await contractForReissue.methods
                  .getRewardsInfo()
                  .call({ from: this.address });
                rewardDAOForReissue = {
                  token: rewardsInfoForReissue.rewardDAO.token,
                  tokenSymbol: rewardsInfoForReissue.rewardDAO.tokenSymbol,
                  amount: weiToEther(
                    rewardsInfoForReissue.rewardDAO.amount,
                    this.web3
                  ),
                  isClaim: rewardsInfoForReissue.rewardDAO.isClaim,
                  isAble: JSBI.greaterThan(
                    JSBI.BigInt(rewardsInfoForReissue.rewardDAO.amount),
                    JSBI.BigInt(0)
                  )
                };
                rewardDSTForReissue = {
                  token: rewardsInfoForReissue.rewardDST.token,
                  tokenSymbol: rewardsInfoForReissue.rewardDST.tokenSymbol,
                  amount: weiToEther(
                    rewardsInfoForReissue.rewardDST.amount,
                    this.web3
                  ),
                  isClaim: rewardsInfoForReissue.rewardDST.isClaim,
                  isAble: JSBI.greaterThan(
                    JSBI.BigInt(rewardsInfoForReissue.rewardDST.amount),
                    JSBI.BigInt(0)
                  )
                };
              }
            }
            // 补发奖励数据
            const tempData = {
              periodId: item.id,
              contractAddress: item.address,
              isAllowClaim: item.isAllowClaim,
              reissueContractAddress: item.reissueAddress,
              nodeType: judgeCHNNodeTypeByValue(rewardsInfo.nodeType),
              power: weiToEther(rewardsInfo.power, this.web3),
              powerExpandReality: weiToEther(
                rewardsInfo.powerExpandReality,
                this.web3
              ),
              powerIncrement: weiToEther(rewardsInfo.powerIncrement, this.web3),
              isIncrement: rewardsInfo.isIncrement,
              nextStandard: rewardsInfo.nextStandard,
              activation: rewardsInfo.activation,
              rewardDAO: {
                token: rewardsInfo.rewardDAO.token,
                tokenSymbol: rewardsInfo.rewardDAO.tokenSymbol,
                amount: weiToEther(rewardsInfo.rewardDAO.amount, this.web3),
                isClaim: rewardsInfo.rewardDAO.isClaim,
                isAble: JSBI.greaterThan(
                  JSBI.BigInt(rewardsInfo.rewardDAO.amount),
                  JSBI.BigInt(0)
                )
              },
              rewardDST: {
                token: rewardsInfo.rewardDST.token,
                tokenSymbol: rewardsInfo.rewardDST.tokenSymbol,
                amount: weiToEther(rewardsInfo.rewardDST.amount, this.web3),
                isClaim: rewardsInfo.rewardDST.isClaim,
                isAble: JSBI.greaterThan(
                  JSBI.BigInt(rewardsInfo.rewardDST.amount),
                  JSBI.BigInt(0)
                )
              },
              rewardDAOForReissue: rewardDAOForReissue,
              rewardDSTForReissue: rewardDSTForReissue,
              startTime: item.startTime,
              endTime: item.endTime,
              rewardRatio: rewardRatio
            };
            this.powerDataListNew4.push(tempData);
          }
        });
        await Promise.all(getResult);
        this.powerDataListNew4.sort(compare("periodId"));
        this.loading = false;
      }
    },
    // 获取算力数据列表-新版3
    async getPowerDataListNew3() {
      if (this.powerContractAddressListNew3.length > 0) {
        this.powerDataListNew3 = [];
        this.loading = true;
        const getResult = this.powerContractAddressListNew3.map(async item => {
          const contract = await getContractByABI(
            CHNPowerMining3_ABI,
            item.address,
            this.web3
          );
          const hasRewardsInfo = await contract.methods
            .hasRewardsInfo(this.address)
            .call();
          if (hasRewardsInfo) {
            const startTime = await contract.methods.startTime().call();
            const endTime = await contract.methods.endTime().call();
            const rewardRatio = await contract.methods.rewardRatio().call();
            const rewardsInfo = await contract.methods
              .getRewardsInfo()
              .call({ from: this.address });
            const tempData = {
              periodId: item.id,
              contractAddress: item.address,
              nodeType: judgeCHNNodeTypeByValue(rewardsInfo.nodeType),
              power: weiToEther(rewardsInfo.power, this.web3),
              powerIncrement: weiToEther(rewardsInfo.powerIncrement, this.web3),
              isIncrement: rewardsInfo.isIncrement,
              nextStandard: rewardsInfo.nextStandard,
              rewardDAO: {
                token: rewardsInfo.rewardDAO.token,
                tokenSymbol: rewardsInfo.rewardDAO.tokenSymbol,
                amount: weiToEther(rewardsInfo.rewardDAO.amount, this.web3),
                isClaim: rewardsInfo.rewardDAO.isClaim,
                isAble: JSBI.greaterThan(
                  JSBI.BigInt(rewardsInfo.rewardDAO.amount),
                  JSBI.BigInt(0)
                )
              },
              rewardDST: {
                token: rewardsInfo.rewardDST.token,
                tokenSymbol: rewardsInfo.rewardDST.tokenSymbol,
                amount: weiToEther(rewardsInfo.rewardDST.amount, this.web3),
                isClaim: rewardsInfo.rewardDST.isClaim,
                isAble: JSBI.greaterThan(
                  JSBI.BigInt(rewardsInfo.rewardDST.amount),
                  JSBI.BigInt(0)
                )
              },
              startTime: startTime,
              endTime: endTime,
              rewardRatio: rewardRatio
            };
            this.powerDataListNew3.push(tempData);
          }
        });
        await Promise.all(getResult);
        this.powerDataListNew3.sort(compare("periodId"));
        this.loading = false;
      }
    },
    // 获取算力数据列表-新版2
    async getPowerDataListNew2() {
      if (this.powerContractAddressListNew2.length > 0) {
        this.powerDataListNew2 = [];
        this.loading = true;
        const getResult = this.powerContractAddressListNew2.map(async item => {
          const contract = await getContractByABI(
            CHNPowerMining2_ABI,
            item.address,
            this.web3
          );
          const hasRewardsInfo = await contract.methods
            .hasRewardsInfo(this.address)
            .call();
          if (hasRewardsInfo) {
            const startTime = await contract.methods.startTime().call();
            const endTime = await contract.methods.endTime().call();
            const rewardRatio = await contract.methods.rewardRatio().call();
            const rewardsInfo = await contract.methods
              .getRewardsInfo()
              .call({ from: this.address });
            // if (
            //   !rewardsInfo.rewardDAO.isClaim ||
            //   !rewardsInfo.rewardDST.isClaim
            // ) {
            const tempData = {
              periodId: item.id,
              contractAddress: item.address,
              nodeType: judgeCHNNodeTypeByValue(rewardsInfo.nodeType),
              power: weiToEther(rewardsInfo.power, this.web3),
              powerIncrement: weiToEther(rewardsInfo.powerIncrement, this.web3),
              nextStandard: rewardsInfo.nextStandard,
              rewardDAO: {
                token: rewardsInfo.rewardDAO.token,
                tokenSymbol: rewardsInfo.rewardDAO.tokenSymbol,
                amount: weiToEther(rewardsInfo.rewardDAO.amount, this.web3),
                isClaim: rewardsInfo.rewardDAO.isClaim,
                isAble: JSBI.greaterThan(
                  JSBI.BigInt(rewardsInfo.rewardDAO.amount),
                  JSBI.BigInt(0)
                )
              },
              rewardDST: {
                token: rewardsInfo.rewardDST.token,
                tokenSymbol: rewardsInfo.rewardDST.tokenSymbol,
                amount: weiToEther(rewardsInfo.rewardDST.amount, this.web3),
                isClaim: rewardsInfo.rewardDST.isClaim,
                isAble: JSBI.greaterThan(
                  JSBI.BigInt(rewardsInfo.rewardDST.amount),
                  JSBI.BigInt(0)
                )
              },
              startTime: startTime,
              endTime: endTime,
              rewardRatio: rewardRatio
            };
            // if (
            //   item.address == "0x8bFCa6899793C00f3A271b90921c19da5953E1e0" &&
            //   this.address == "0xFEfDF726f16d6666169c8ADb54d0162A19957dA0"
            // ) {
            //   tempData.power = "24765.063606857662480177";
            //   tempData.powerIncrement = "12455.349774571016714972";
            // }
            this.powerDataListNew2.push(tempData);
            // }
          }
        });
        await Promise.all(getResult);
        this.powerDataListNew2.sort(compare("periodId"));
        this.loading = false;
      }
    },
    // 获取算力数据列表-新版
    async getPowerDataListNew() {
      if (this.powerContractAddressListNew.length > 0) {
        this.powerDataListNew = [];
        this.loading = true;
        const getResult = this.powerContractAddressListNew.map(async item => {
          const contract = await getContractByABI(
            CHNPowerMining_ABI,
            item.address,
            this.web3
          );
          const hasRewardsInfo = await contract.methods
            .hasRewardsInfo(this.address)
            .call();
          if (hasRewardsInfo) {
            const startTime = await contract.methods.startTime().call();
            const endTime = await contract.methods.endTime().call();
            const rewardsInfo = await contract.methods
              .getRewardsInfo()
              .call({ from: this.address });
            // if (
            //   !rewardsInfo.rewardDAO.isClaim ||
            //   !rewardsInfo.rewardDST.isClaim
            // ) {
            const tempData = {
              periodId: item.id,
              contractAddress: item.address,
              nodeType: judgeCHNNodeTypeByValue(rewardsInfo.nodeType),
              power: weiToEther(rewardsInfo.power, this.web3),
              nextStandard: rewardsInfo.nextStandard,
              rewardDAO: {
                token: rewardsInfo.rewardDAO.token,
                tokenSymbol: rewardsInfo.rewardDAO.tokenSymbol,
                amount: weiToEther(rewardsInfo.rewardDAO.amount, this.web3),
                isClaim: rewardsInfo.rewardDAO.isClaim
              },
              rewardDST: {
                token: rewardsInfo.rewardDST.token,
                tokenSymbol: rewardsInfo.rewardDST.tokenSymbol,
                amount: weiToEther(rewardsInfo.rewardDST.amount, this.web3),
                isClaim: rewardsInfo.rewardDST.isClaim
              },
              startTime: startTime,
              endTime: endTime
            };
            this.powerDataListNew.push(tempData);
            // }
          }
        });
        await Promise.all(getResult);
        this.powerDataListNew.sort(compare("periodId"));
        this.loading = false;
      }
    },
    // 获取算力数据列表
    async getPowerDataList() {
      if (this.powerContractAddressList.length > 0) {
        this.powerDataList = [];
        this.loading = true;
        const getResult = this.powerContractAddressList.map(async item => {
          const contract = await getContractByABI(
            ComputingPowerMining_ABI,
            item.address,
            this.web3
          );
          const hasPowerInfo = await contract.methods
            .hasPowerInfo(this.address)
            .call();
          if (hasPowerInfo) {
            const countedPower = await contract.methods.countedPower().call();
            const startTime = await contract.methods.startTime().call();
            const endTime = await contract.methods.endTime().call();
            const powerInfo = await contract.methods
              .accountPowerInfoList(this.address)
              .call();
            // if (!powerInfo.isClaim) {
            const annualizedRate = (powerInfo.power / countedPower) * 100;
            const tempData = {
              periodId: item.id,
              contractAddress: item.address,
              countedPower: weiToEther(countedPower, this.web3),
              startTime: startTime,
              endTime: endTime,
              powerInfo: {
                power: weiToEther(powerInfo.power, this.web3),
                receiveAmount: weiToEther(powerInfo.receiveAmount, this.web3),
                nodeType: judgeCHNNodeTypeByValue(powerInfo.nodeType),
                liquidity: weiToEther(powerInfo.liquidity, this.web3),
                isClaim: powerInfo.isClaim
              },
              annualizedRate: parseFloat(annualizedRate).toFixed(2)
            };
            this.powerDataList.push(tempData);
            // }
          }
        });
        await Promise.all(getResult);
        this.powerDataList.sort(compare("periodId"));
        this.loading = false;
      }
    },
    // 提取DAO
    handleRelease(record) {
      this.loading = true;
      // 执行合约
      getContractByABI(
        ComputingPowerMining_ABI,
        record.contractAddress,
        this.web3
      )
        .methods.claim()
        .send({ from: this.address })
        .then(() => {
          this.loading = false;
          this.operationResult.snackbar = true;
          this.operationResult.text = "Claim Success";
          // 重新获取数据
          this.getPowerInfo();
        })
        .catch(e => {
          this.loading = false;
          console.info(e);
        });
    },
    // 提取代币
    handleReleaseNew(contractAddress, token) {
      this.loading = true;
      // 执行合约
      getContractByABI(CHNPowerMining_ABI, contractAddress, this.web3)
        .methods.getRewards(token)
        .send({ from: this.address })
        .then(() => {
          this.loading = false;
          this.operationResult.snackbar = true;
          this.operationResult.text = "Claim Success";
          // 重新获取数据
          this.getPowerInfo();
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
