<template>
  <div>
    <v-app-bar
      id="home-app-bar"
      app
      elevation="1"
      elevate-on-scroll
      height="80"
    >
      <base-img
        :src="
          require(`@/assets/logo-${
            $vuetify.theme.isDark ? 'dark' : 'light'
          }.png`)
        "
        contain
        max-width="46"
        width="100%"
      />

      <v-spacer />

      <div>
        <v-tabs
          class="hidden-sm-and-down"
          optional
          background-color="transparent"
        >
          <v-tab
            to="/"
            :ripple="false"
            class="font-weight-bold"
            min-width="96"
            text
            >{{ $t("Home") }}</v-tab
          >
          <!-- <v-tab
            to="/stake"
            :ripple="false"
            class="font-weight-bold"
            min-width="96"
            text
            >{{ $t("Stake") }}</v-tab
          > -->
          <v-tab
            to="/stake-dst"
            :ripple="false"
            class="font-weight-bold"
            min-width="96"
            text
            >{{ $t("Stake DST") }}</v-tab
          >
          <!-- <v-tab
            to="/airdrop"
            :ripple="false"
            class="font-weight-bold"
            min-width="96"
            text
            >{{ $t("Airdrop") }}</v-tab
          > -->
          <v-tab
            to="/hash-mining"
            :ripple="false"
            class="font-weight-bold"
            min-width="96"
            text
            >{{ $t("Hash Mining") }}</v-tab
          >
          <v-tab
            to="/new-power-reward"
            :ripple="false"
            class="font-weight-bold"
            min-width="96"
            text
            >{{ $t("New Power Reward") }}</v-tab
          >
          <!-- <v-tab
            to="/competition-mining"
            :ripple="false"
            class="font-weight-bold"
            min-width="96"
            text
            >{{ $t("Competition Mining") }}</v-tab
          > -->
          <v-tab
            to="/task-6"
            :ripple="false"
            class="font-weight-bold"
            min-width="96"
            text
            >{{ $t("Task 6") }}</v-tab
          >
          <v-tab
            to="/task-8"
            :ripple="false"
            class="font-weight-bold"
            min-width="96"
            text
            >{{ $t("Task 8") }}</v-tab
          >
          <v-tab
            to="/invite"
            :ripple="false"
            class="font-weight-bold"
            min-width="96"
            text
            >{{ $t("Invite") }}</v-tab
          >
          <v-tab
            to="/relationship"
            :ripple="false"
            class="font-weight-bold"
            min-width="96"
            text
            >{{ $t("Relationship") }}</v-tab
          >
          <v-tab
            to="/certificate"
            :ripple="false"
            class="font-weight-bold"
            min-width="96"
            text
            >{{ $t("Certificate") }}</v-tab
          >
          <v-tab
            to="/Whitepaper.pdf"
            target="_blank"
            :ripple="false"
            class="font-weight-bold"
            min-width="96"
            text
            >{{ $t("Whitepaper") }}</v-tab
          >
        </v-tabs>
      </div>

      <v-app-bar-nav-icon class="hidden-md-and-up" @click="drawer = !drawer" />

      <!-- 多语言切换 -->
      <v-menu offset-y>
        <template v-slot:activator="{ on, attrs }">
          <v-btn text v-bind="attrs" v-on="on">
            <v-icon>mdi-translate</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item v-for="item in localeList" :key="item.locale" link>
            <v-list-item-title
              v-text="item.title"
              @click="changeLang(item.locale)"
            ></v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" absolute temporary>
      <v-list shaped>
        <v-list-item-group v-model="group" color="#93B954">
          <v-list-item to="/">
            <v-list-item-title>{{ $t("Home") }}</v-list-item-title>
          </v-list-item>
          <!-- <v-list-item to="/stake">
            <v-list-item-title>{{ $t("Stake") }}</v-list-item-title>
          </v-list-item> -->
          <v-list-item to="/stake-dst">
            <v-list-item-title>{{ $t("Stake DST") }}</v-list-item-title>
          </v-list-item>
          <!-- <v-list-item to="/airdrop">
            <v-list-item-title>{{ $t("Airdrop") }}</v-list-item-title>
          </v-list-item> -->
          <v-list-item to="/hash-mining">
            <v-list-item-title>{{ $t("Hash Mining") }}</v-list-item-title>
          </v-list-item>
          <v-list-item to="/new-power-reward">
            <v-list-item-title>{{ $t("New Power Reward") }}</v-list-item-title>
          </v-list-item>
          <!-- <v-list-item to="/competition-mining">
            <v-list-item-title>{{
              $t("Competition Mining")
            }}</v-list-item-title>
          </v-list-item> -->
          <v-list-item to="/task-6">
            <v-list-item-title>{{ $t("Task 6") }}</v-list-item-title>
          </v-list-item>
          <v-list-item to="/task-8">
            <v-list-item-title>{{ $t("Task 8") }}</v-list-item-title>
          </v-list-item>
          <v-list-item to="/invite">
            <v-list-item-title>{{ $t("Invite") }}</v-list-item-title>
          </v-list-item>
          <v-list-item to="/relationship">
            <v-list-item-title>{{ $t("Relationship") }}</v-list-item-title>
          </v-list-item>
          <v-list-item to="/certificate">
            <v-list-item-title>{{ $t("Certificate") }}</v-list-item-title>
          </v-list-item>
          <v-list-item to="/Whitepaper.pdf" target="_blank">
            <v-list-item-title>{{ $t("Whitepaper") }}</v-list-item-title>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script>
import { WHITE_LISTS_SWITCH, WHITE_LISTS } from "@/constants";

export default {
  name: "HomeAppBar",

  data: () => ({
    // 当前包含语言
    localeList: [
      {
        locale: "zh",
        title: "中文"
      },
      {
        locale: "en",
        title: "English"
      }
    ],
    // 导航
    drawer: false,
    group: null,
    items: ["Home", "Pro"]
  }),
  computed: {
    address() {
      return this.$store.state.web3.address;
    },
    isInWhiteList() {
      return WHITE_LISTS_SWITCH && WHITE_LISTS.indexOf(this.address) > -1;
    }
  },
  methods: {
    changeLang(locale) {
      this.$i18n.locale = locale;
    }
  }
};
</script>

<style lang="sass">
#home-app-bar
  .v-tabs-slider
    max-width: 24px
    margin: 0 auto

  .v-tab
    &::before
      display: none
</style>
