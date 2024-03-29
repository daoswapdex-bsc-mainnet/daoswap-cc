import Vue from "vue";
import VueRouter from "vue-router";
// import CrowdsaleForRetail from "../views/crowdsale/CrowdsaleForRetail.vue";
// import CrowdsaleForRetail2 from "../views/crowdsale/CrowdsaleForRetail2.vue";
// import CrowdsaleForRetail3 from "../views/crowdsale/CrowdsaleForRetail3.vue";
// import CrowdsaleForRetailEnd from "../views/crowdsale/CrowdsaleForRetailEnd.vue";
// import AirdropToRelationship from "../views/airdrop/AirdropToRelationship.vue";
// import AirdropForSwapsSnapshot from "../views/airdrop/AirdropForSwapsSnapshot.vue";
import ComputingPowerMiningForLiquidity from "../views/chn/ComputingPowerMiningForLiquidity.vue";
import NewPowerReward from "../views/chn/NewPowerReward.vue";
// import ComputingPowerMiningForLiquidityCreation from "../views/chn/ComputingPowerMiningForLiquidityCreation.vue";
import CrowdsaleForRetailUnlimited from "../views/crowdsale/crowdsaleForRetailUnlimited/CrowdsaleForRetailUnlimited.vue";
import CrowdsaleForRetailUnlimitedHistory from "../views/crowdsale/crowdsaleForRetailUnlimited/CrowdsaleForRetailUnlimitedHistory.vue";
import StakingNodeRewards from "../views/staking-node/StakingNodeRewards.vue";
import StakingNodeTask8 from "../views/staking-node/StakingNodeTask8.vue";
import InviteForRelationship from "../views/relationship/InviteForRelationship.vue";
import RelationshipOfChn from "../views/relationship/RelationshipOfChn.vue";
import Certificate from "../views/certificate/Index.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    component: () => import("@/layouts/home/Index.vue"),
    children: [
      {
        path: "",
        name: "Home",
        component: () => import("@/views/home/Index.vue")
      },
      // {
      //   path: "/stake",
      //   name: "Stake",
      //   redirect: "/stake/period-3",
      //   component: () => import("@/layouts/home/View.vue"),
      //   children: [
      //     {
      //       path: "/stake/end",
      //       name: "StakeEnd",
      //       component: CrowdsaleForRetailEnd
      //     },
      //     {
      //       path: "/stake/period-1",
      //       name: "StakePeriod1",
      //       component: CrowdsaleForRetail
      //     },
      //     {
      //       path: "/stake/period-2",
      //       name: "StakePeriod2",
      //       component: CrowdsaleForRetail2
      //     },
      //     {
      //       path: "/stake/period-3",
      //       name: "StakePeriod3",
      //       component: CrowdsaleForRetail3
      //     }
      //   ]
      // },
      {
        path: "/stake-dst",
        name: "StakeDST",
        redirect: "/stake-dst/stake",
        component: () => import("@/layouts/home/ViewBlank.vue"),
        children: [
          {
            path: "/stake-dst/stake",
            name: "CrowdsaleForRetailUnlimited",
            component: CrowdsaleForRetailUnlimited
          },
          {
            path: "/stake-dst/history",
            name: "CrowdsaleForRetailUnlimitedHistory",
            component: CrowdsaleForRetailUnlimitedHistory
          }
        ]
      },
      // {
      //   path: "/airdrop",
      //   name: "Airdrop",
      //   component: AirdropForSwapsSnapshot
      // },
      {
        path: "/hash-mining",
        name: "Hash Mining",
        component: ComputingPowerMiningForLiquidity
      },
      {
        path: "/new-power-reward",
        name: "New Power Reward",
        component: NewPowerReward
      },
      // {
      //   path: "/competition-mining",
      //   name: "Competition Mining",
      //   component: ComputingPowerMiningForLiquidityCreation
      // },
      {
        path: "/task-6",
        name: "StakingNodeRewards",
        component: StakingNodeRewards
      },
      {
        path: "/task-8",
        name: "StakingNodeTask8",
        component: StakingNodeTask8
      },
      {
        path: "/invite",
        name: "Invite",
        component: InviteForRelationship
      },
      {
        path: "/relationship",
        name: "Relationship",
        component: RelationshipOfChn
      },
      {
        path: "/certificate",
        name: "Certificate",
        component: Certificate
      },
      {
        path: "*",
        redirect: "/"
      }
    ]
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  scrollBehavior: (to, from, savedPosition) => {
    if (to.hash) return { selector: to.hash };
    if (savedPosition) return savedPosition;

    return { x: 0, y: 0 };
  },
  routes
});

export default router;
