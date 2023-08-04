<template>
  <div class="fill-height">
    <v-container v-if="web3 && connected" class="fill-height">
      <v-row justify="center">
        <v-col md="6">
          <!-- 操作 -->
          <v-card class="fill-width mt-10">
            <v-card outlined>
              <!-- 标题 -->
              <v-card-title>
                <v-avatar size="24" class="mr-2">
                  <img :src="require('@/assets/logo.png')" alt="DAO" />
                </v-avatar>
                <span class="title font-weight-bold text-h5">
                  {{ $t("Credential.title") }}
                </span>
              </v-card-title>
              <v-divider></v-divider>
              <v-card-text v-if="certificateList.length > 0">
                <v-row>
                  <v-col
                    v-for="(item, index) in certificateList"
                    :key="index"
                    class="d-flex child-flex list-item p-20"
                    cols="12"
                    style="border-bottom: 1px solid #93B954;"
                  >
                    <v-img :src="item" class="grey lighten-2 list-item-image">
                      <template v-slot:placeholder>
                        <v-row
                          class="fill-height ma-0"
                          align="center"
                          justify="center"
                        >
                          <v-progress-circular
                            indeterminate
                            color="grey lighten-5"
                          ></v-progress-circular>
                        </v-row>
                      </template>
                    </v-img>
                    <div class="list-item-title">
                      {{ index + 1 }} - {{ item }}
                    </div>
                  </v-col>
                </v-row>
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
    <!-- 图片放大 -->
    <v-row justify="center">
      <v-dialog
        v-model="dialog"
        fullscreen
        hide-overlay
        transition="dialog-bottom-transition"
      >
        <v-card dark>
          <v-toolbar dark color="primary" style="z-index: 100;">
            <v-toolbar-title>{{ previewImgTitle }}</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items>
              <v-btn icon dark @click="dialog = false">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-toolbar-items>
          </v-toolbar>
          <v-img class="dialog-image" contain :src="previewImgUrl"></v-img>
        </v-card>
      </v-dialog>
    </v-row>
  </div>
</template>

<script>
import clip from "@/utils/clipboard";
import { getContractByABI } from "@/utils/web3";
// 引入合约 ABI 文件
import Certificate_ABI from "@/constants/abi/Certificate_abi.json";

export default {
  name: "Certificate",
  data: () => ({
    loading: false,
    // 路径前缀
    pathDomain: "https://ipfs.io/ipfs/",
    contractAddress: "0x7713FB320BD6Fe93580Fe1f3e16D790425ca6647",
    // 证书数据列表
    certificateList: [
      "https://ipfs.io/ipfs/QmQVnZV8YdLxXBnHUshH2BHYfNp2xik1j33YF86gB6RLh7?filename=0x1f1A4C4Aae293127540Fd04eb5588864010aa669.png",
      "https://ipfs.io/ipfs/QmP4WuVESocQ4RJg2AuuwvhXApx5NWhHhPe7AUkp6aqTau?filename=0x2c5d295d34FE4af0A6395B0220584975623d1f5F.png",
      "https://ipfs.io/ipfs/QmWvvVpSHrjczidneG5yoUPe4DvfMjyWgCGVHuFqSQeGi6?filename=0x2E2daf9A55e02a4fC701D68c725b6BF5a1fAb1F5.png",
      "https://ipfs.io/ipfs/QmeZziMcwysaPoFnMs58Mfu6SkpFwgyGpWyoe6QcJBbEoE?filename=0x2Ff15F87F2d15a349E0D29E96E206F69B03C55Ad.png",
      "https://ipfs.io/ipfs/QmTRKcEwKeL8MS5VQnipkVWei1i3RoEMo3bbh9LghBBEUZ?filename=0x3F264cDB049111534fa6a5C5600B9c3539FC9550.png",
      "https://ipfs.io/ipfs/QmPaVoBuFzqJkh3BksPvZa1i4hNfLiyiZak6hn7wWt9DyP?filename=0x4dbb6d26c89C7314Cf625074A1CA1042B3066767.png",
      "https://ipfs.io/ipfs/QmSQRJ2ZRkxkmogy7jzVk1Ze7zHsTr3Mx58bePMGb9tJVE?filename=0x04Ed3B56c2aF2Cc658F3fDD878DaE749Ff4b241D.png",
      "https://ipfs.io/ipfs/QmZc9KncJXShj3btoXuPFRjmpiarEhHur5sqpQ4jNwfUD3?filename=0x7d2c5BfB1f8b580FEDD7FcC0D7699f4F13350F79.png",
      "https://ipfs.io/ipfs/QmT9it4A2YdiZE7Wme7hiQggM3Jf1erKVYSELXYSsHg4Mo?filename=0x7f0F640CBF02D345bf33C94825490EE0ddaf1f1F.png",
      "https://ipfs.io/ipfs/QmYL9ALoP7yiMbZjAtt94C3GHPizcRe7f2UUeZVpc1QoWo?filename=0x9D8529831e0Bd386fb588853633EeF06CA3bD277.png",
      "https://ipfs.io/ipfs/QmYyxdNJTH7tpPXFnrZHi2CAj5F6aFsBjbhr6QG8F9MCzo?filename=0x14e4f97f871C00C53D08f6CADb728F336dB73899.png",
      "https://ipfs.io/ipfs/Qmdrd9p8ThczbVZMev5THTK46W28SbffiUwNEiKPJDBd8Z?filename=0x42c37Ab82b6c57dF8F75E21a7536C3144119e613.png",
      "https://ipfs.io/ipfs/QmewnvSU5oCo8135ng8fARBQ3Ljxpn8o4iDixFtHqQziuJ?filename=0x73BE49Fca5eBdEc77F00f6AB22053B3D4DFD53C3.png",
      "https://ipfs.io/ipfs/QmUcCFrKPWJtAwvmFHjz2Gt3ZoXUg3dttabN9aNCraXtkc?filename=0x87A9FA11C293A2e3bb95ad4f979FdB81bf51df4e.png",
      "https://ipfs.io/ipfs/QmSgsdvQoqYhtQY3sZAS1Nch55YT8rAidggErsgDNg68aB?filename=0x230b647DCcAd184F1875c21B4deA9122a57f9cF9.png",
      "https://ipfs.io/ipfs/QmerCsdWzq7Q7mnr4CbzeDC1oMK3VfSrDJWWRzFhshoiDG?filename=0x808F2634d1679CB4016499B921e6593f754073C2.png",
      "https://ipfs.io/ipfs/QmVYhmsso5zfFztqChswUTLJ76eMoLv6kCkSbNJ34xc8su?filename=0x879CcE2ec2526D48da0799Dcc7F478ac582f78Ce.png",
      "https://ipfs.io/ipfs/QmZJqeAroVhLzZGsYTYrkiWwVE7a1cvLsmNpFsxKaizzvF?filename=0x2254d683D73232828c3E6FC7De98Afa96Cad1d45.png",
      "https://ipfs.io/ipfs/QmRMR7hpMdVC7TNabZz4WdhN6gyitNz8NaZaswBGNw5Md1?filename=0x4555A40251A7cCA4D150a08cB62e1b27345909c0.png",
      "https://ipfs.io/ipfs/Qmf923jwVjjZtzA7xyW61sZf156ZtUFmXkoG8JyP28f2Vw?filename=0x260703CE6352799E2f6987DAFf99fE6E45D9a16B.png",
      "https://ipfs.io/ipfs/QmfJkjyeuz9bahxmmd11FcyEUKFUTCnwScFbCV9D9NNGwR?filename=0x886247d2E29e05d14ad06604b511209D5842FbF7.png",
      "https://ipfs.io/ipfs/QmbZsViv59NsqjKjjegshDGLaBNavWUF6nfRKuVxTusBQL?filename=0x5354683896ecC9aaA5c8Fba4dD9FEf7fa930f88d.png",
      "https://ipfs.io/ipfs/QmQLoNzffRXCtCX5qp48EXe2w6TgT6f85MuvLEZcXH7BwZ?filename=0x001255248546496179245f1436f60BEb6B9608A9.png",
      "https://ipfs.io/ipfs/QmRMyJaVK6ZwYVHG1veJzTcLsGquFkt47KDPxMzmNAvNQ7?filename=0xaDa5aAF914b62Db4Cc952DBee916f95906dD15e6.png",
      "https://ipfs.io/ipfs/QmUYBsW8xn1o6PRHDZMaW2AvWDSWag1nVBeSBSEDvMZ6RH?filename=0xB3D8B511a3b1152e6f508D9675a824A4251A16e9.png",
      "https://ipfs.io/ipfs/QmbpeYVM43kkhWHsk39NFjfNpbE5XAvkchqdf4kYYEivDP?filename=0xb124f219c2C5c54E701fD85b218b3e7CE0FBE9cb.png",
      "https://ipfs.io/ipfs/QmT7AvMdr4Socz9aTvCz3DL43hQqFYHe7FHdGc7MjVxRmN?filename=0xCD6bb91593d527F30751cBaDd21D3A92DaCD40B8.png",
      "https://ipfs.io/ipfs/QmdS75C6hWnVDvqVZZ7qYmcGpNytB2nqCZQRg62nbqCC32?filename=0xCD6D09672E5aAc8e69F49C8303AAafF039391fcF.png",
      "https://ipfs.io/ipfs/QmUg1NbkiFA4oTTFH3w9KS9PBQsLp5GqwJa6bhcEnniXw1?filename=0xd3B5D1f0D00100ACd372C0EfD45aF081920fB8Da.png",
      "https://ipfs.io/ipfs/QmWS2V6VZyna2vUZpDrkzpNjwGWTggPZAfNcdp9Fmo35og?filename=0xD4d9d5Bbfe8b0c78529160f503Ab072d042b464F.png",
      "https://ipfs.io/ipfs/QmSctFcQUGDwdXhoXfxLmbyNGX5FMvYS6KKMv45VaPP6Bg?filename=0xd6E29e6fcF90CaFa62bCe4371c2E0E077EC8D296.png",
      "https://ipfs.io/ipfs/Qmcgh75bN1ea7bf8A3yQWjhT1u7mcSr2FSTKtELqezxVy7?filename=0xD818E9ac85b5C02840AAF8aC34C2AF8a9EabFd43.png",
      "https://ipfs.io/ipfs/QmQewJP7gHnuiVrTZ3JSss6KcMikvqAYoDv9Gas2SYSEDE?filename=0xE86ff1a34AB87c2e2720Cfe41Be2dCB47FA155Cf.png",
      "https://ipfs.io/ipfs/QmX3CUJfxv9FGx7Ns2xfeF6KuqBAs4mepULUFVJhf3GNHe?filename=0xF6364a1290B7E553CE7eCfD7E5cfC883f597Dc6E.png",
      "https://ipfs.io/ipfs/QmdjuYE8NhACdxyy4cnZBJBo2Q9FjPaTRz3u63qSjwwNeE?filename=0xf9754E953ec48aC44bf8070767517A61d62cFd05.png",
      "https://ipfs.io/ipfs/QmPQgEFBHZ4iaiqPej6dTBeWaheKeA74Zjd9qkNnS8bcZK?filename=0x2E9D1f134a3a705670ccB80dDe79f2Eac0a8a6ef.png",
      "https://ipfs.io/ipfs/QmXjXbjec9Hzxgy2AcvNHUSEVeAcXat1Le39yzPLber632?filename=0x04Ed3B56c2aF2Cc658F3fDD878DaE749Ff4b241D.png",
      "https://ipfs.io/ipfs/QmNyYDAhVBxKwLABJswfGgc5qfAkTye2RPg5cH9kwQroVu?filename=0x07A333e9028D68a8d2397C008Bf947E27401a169.png",
      "https://ipfs.io/ipfs/QmcNJDnCKvmYXnxq11pa28f7Z8wwwooPeW1icqmFunzD9r?filename=0x73BE49Fca5eBdEc77F00f6AB22053B3D4DFD53C3.png",
      "https://ipfs.io/ipfs/QmYYHRA2QmiJkbhndXN1Vsy4Drxt6cBfBNcYoXdvGitgSy?filename=0x75a2a590507e9CEEe70f5eeaC1F56a62c1c259Ab.png",
      "https://ipfs.io/ipfs/QmWmJunWAxmz9MkjvpbtH8d3pLA4CRjuRLnQ7vYaA4A7Et?filename=0x0743b472Ea8Eb388145455FB67840C4C1be81fB5.png",
      "https://ipfs.io/ipfs/QmaWF4NzWxYxjcH69fcn9tq9K4KbF3qLAtNjid3qWkHA43?filename=0xA47B0378cB6bd3BD075332721b1602504bBD4752.png",
      "https://ipfs.io/ipfs/QmeVB84rzm7YSXxLg2xPZKV4evANXH6LUQrcMRyvkLx71H?filename=0xA61B8F085907A878B9A9B9674284637C6A7230fd.png",
      "https://ipfs.io/ipfs/QmNqd5XkgoJRPnj55BQA5w88NFnvK27mzYYoAJD6jDyHV9?filename=0xB9cA5E6E5F3d1f8A5273fd67650F47B8e751FAae.png",
      "https://ipfs.io/ipfs/QmZtY5YxyXa6aD1gwc5wRTkZkFy7Hnzue2iXLx8VPZTXeK?filename=0xB8492bEaF8256bB730a3ba315986324E12B97bd5.png",
      "https://ipfs.io/ipfs/QmW3XQQbmWAeeBRXi8f5x1vJZk6Pit5eJL4hCYruaRHPpM?filename=0xCD6D09672E5aAc8e69F49C8303AAafF039391fcF.png",
      "https://ipfs.io/ipfs/QmeCkpTQ5JeTMnFPj9ri3R9A3DNTBUK3heqA5uSQRU4iFj?filename=0xf9754E953ec48aC44bf8070767517A61d62cFd05.png",
      "https://ipfs.io/ipfs/QmQW4QScqn5dtNpiFYWdZLqvLdnpq4EiLiqVmxo98WMmB4?filename=0xfC473B1bf484a6344Fd54e0E15c329Ce85874757.png",
      "https://ipfs.io/ipfs/QmZdUv9EM89wg6qwEmwUK71sxYYT1ZsP9LSKoTNMGMUHcW?filename=0x2E9D1f134a3a705670ccB80dDe79f2Eac0a8a6ef.png",
      "https://ipfs.io/ipfs/QmX3KNpjvxJypmsQeTPPHcLbCkd8AVTbaZkShiryAGWKrx?filename=0x3D431eac4D8a2356973dE19Ed7e86a15e6E0f1dD.png",
      "https://ipfs.io/ipfs/QmfLHszWnZtFHkmXVbqt799HPvQhyLhrVfhBK6tH3n2fUi?filename=0x7d2c5BfB1f8b580FEDD7FcC0D7699f4F13350F79.png",
      "https://ipfs.io/ipfs/Qmarm3f6rEgn7h38LHVcVUjyaDGfNtUBJhoXdUurqLLXJT?filename=0x7f0F640CBF02D345bf33C94825490EE0ddaf1f1F.png",
      "https://ipfs.io/ipfs/QmYntGN4YkhhWEUewXVw7pCMKxUGQFMYEbq5aBvmC8UkV4?filename=0x9DFB82CCC5B2636287D05990414E735C2F605786.png",
      "https://ipfs.io/ipfs/QmQYRQBZiSNKVQWPTiLsmju5mWavRqULFSkoVGxyuDeeMk?filename=0x9EB23F5A93fB2B240D6C9e4c86760b1a5E29D50C.png",
      "https://ipfs.io/ipfs/Qmf9BAXvFDber2VrCk7EWfouukfV6kGbLVx9vVFVGP6gqi?filename=0x21d669b6239971EB83019aefDcA79d00beb99508.png",
      "https://ipfs.io/ipfs/QmaWtEm7hyHKEKMvb89byBsNXbmyFxYWyWk6KBBNNJUEeA?filename=0x58f16706710326B5C112041b3f8487Fa32AF1EF0.png",
      "https://ipfs.io/ipfs/QmW6ntbrouHCfrg3h8Qrdez261tbm4C7RyoJu8isct64Zo?filename=0x757f0266F2D1D4E675aaB3045c2797Dd39989f91.png",
      "https://ipfs.io/ipfs/QmTkXq4gsBDM9GuWi5HnvXFbNtSVq9cj8oTSMGV643wqgR?filename=0xb485b3516773Eac9522387eAe5dF157015e5f219.png",
      "https://ipfs.io/ipfs/QmUZ1j4UZ7mHsmC6nzyybSx43udvFzZToeZ5ft7y9PBmF7?filename=0xb5890945a273b68233e03913d040b2a16928C4c5.png",
      "https://ipfs.io/ipfs/QmcJ3KCLAChhxxS1YSz5KNPkve58SYjp7EjBMgrMFzRkVE?filename=0xc86a68Fb5189636078eb1251E719C68824B883DD.png",
      "https://ipfs.io/ipfs/Qmc9tFSDYhwWV27VwWjjYzotjF9S9DJj2RZjH9JtpoHjD7?filename=0xFeD4727d734855c26297A5E50A41024e2a65A15c.png",
      "https://ipfs.io/ipfs/Qma76v2ewAgyxCD8w1EdJV6b5uXrtqSvHMinGSoCFAyChQ?filename=0x1C2c0e35F820da960a5AC0CD359535b14EAa930d.png",
      "https://ipfs.io/ipfs/QmVJGhQNnpvG98n1hBP7m5HJQPc9NwRBhwPSt2kEENfV2h?filename=0x1f943bb6c229323Bc564Eb12434e8C06292E9090.png",
      "https://ipfs.io/ipfs/QmUFdhMBfWyoM6QSZ169hRfZW4dvWw5yeRPFfQ9duZrrPm?filename=0x2E9D1f134a3a705670ccB80dDe79f2Eac0a8a6ef.png",
      "https://ipfs.io/ipfs/QmUYqFKn1MQefjjtdRZP47bPLHgCBcyiDfCpZmnhYXLdJ5?filename=0x4A2678C24f0CA4e097C5ff2a0105e1F6A7838cf1.png",
      "https://ipfs.io/ipfs/QmWnUjA1ywenu892HfRLcs8C1wTgq7oZonCTsEfTaqRdpp?filename=0xa7cec5319eb7b3364f8a626b234dfc9b24827536.png",
      "https://ipfs.io/ipfs/QmeveD4g8JjEGuFvHMmhkghokmoudXXp76wCgNrk9C6JAD?filename=0xAA72eeF0bE333eC4961343503Ecbf69Aa45127D0.png",
      "https://ipfs.io/ipfs/QmeDjDy2mFrYqaVZDxHzn16qCTskyigVBCw5PDnrvwt9tB?filename=0xac3477F79db084702478B19781D176D48D90c971.png",
      "https://ipfs.io/ipfs/QmSgHseA5R35skiNrYVSkbP3vtwF1BsU8ZFwsqDNoe9PfG?filename=0xbc818D5Dd4664e98e5D3Bb5be16BBD3F84bD599b.png",
      "https://ipfs.io/ipfs/Qme5NTFyXpWeyDTn2H5jkc9zP7ZibhuobXRK88H4vpTN89?filename=0xf38db654F3C391BD30689Fb2eB1d95D2601b4210.png",
      "https://ipfs.io/ipfs/QmR8FHUCzgjQL9PYQYnQxHH8n6tWyp5iM1XuQGLZnRPqRv?filename=0xFA3C2Dc2c5D24E8BeF9B23914f258f33688874F5.png",
      "https://ipfs.io/ipfs/QmPGZ5Dy7aSEcBesvzz5LUw3X47bzqXiDRTTaV6zRXSS3f?filename=0x2E2daf9A55e02a4fC701D68c725b6BF5a1fAb1F5.png",
      "https://ipfs.io/ipfs/QmRN4z3pBdDz4igAeLdSBmw482dxhFDydeQZEWpp5SjRxB?filename=0x4dbb6d26c89C7314Cf625074A1CA1042B3066767.png",
      "https://ipfs.io/ipfs/QmX3WfKq2oXRryUnm7k1YUwWZUTKEM5bEaxmy3qn5GEFm3?filename=0x5EA641eceB8C1D29E4F4F2F18761dFcc7d3f5a36.png",
      "https://ipfs.io/ipfs/QmWrjS2Yc5JY1sXz6PGNt3rVbtBkwrZPWpn7Byy8gcVFwY?filename=0x42c37Ab82b6c57dF8F75E21a7536C3144119e613.png",
      "https://ipfs.io/ipfs/QmXZ4BJQmhfZKiFe8D1emxwPbvqppjyiVigizhENFs8rkq?filename=0x95EDA4C596E42c14590F9bCf2D9CaB58650d33cb.png",
      "https://ipfs.io/ipfs/QmVid3Kda4QxBznSj8RgKNaJv6DhJmtgbzwCZ6GAq3afgC?filename=0x196C5599Fb001a398864B987C56cB59b60FF4cDF.png",
      "https://ipfs.io/ipfs/Qmf5zss8ZBfHbVbx1RV8hkbBsethGoEEPeP5pBRxwBt3eN?filename=0x879CcE2ec2526D48da0799Dcc7F478ac582f78Ce.png",
      "https://ipfs.io/ipfs/QmbHYAaLboNpW7hXjey4gAmgvmdbC2AC1QgtXVsqQqESeg?filename=0xb09dE6A6C339FbACf08a08Ee6a12121bC5882D30.png",
      "https://ipfs.io/ipfs/QmTw65DVfW4fsr2xwcQng98isdJCnjHJgP7Y4otnuMVfYs?filename=0xD2f525129043778fea2396B2f68AD6950063DA62.png",
      "https://ipfs.io/ipfs/QmZPpFXGfxhA1j1kdxBrD2gfW75kQwWU2LgpX7u7fFyXFW?filename=0xD4d9d5Bbfe8b0c78529160f503Ab072d042b464F.png",
      "https://ipfs.io/ipfs/QmSyZd6fm3nNEhguuptVQpxhkPDFsPuSEivJnBqDMenrUE?filename=0xd6E29e6fcF90CaFa62bCe4371c2E0E077EC8D296.png",
      "https://ipfs.io/ipfs/QmdTEeafDVYE5fM4RtLU9acCFsKc6Rrt38SZerzM7RVGvR?filename=0xD818E9ac85b5C02840AAF8aC34C2AF8a9EabFd43.png"
    ],
    // 提示框
    operationResult: {
      color: "success",
      snackbar: false,
      text: `Hello`
    },
    // 弹窗信息
    dialog: false,
    previewImgTitle: "",
    previewImgUrl: ""
  }),
  created() {
    if (this.web3 && this.connected) {
      // this.getCertificateList();
    } else {
      this.onConnect();
    }
  },
  watch: {
    web3(web3) {
      if (web3) {
        // this.getCertificateList();
      }
    },
    address(address) {
      if (address) {
        // this.getCertificateList();
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
      // return "0x3DdcFc89B4DD2b33d9a8Ca0F60180527E9810D4B";
      // return "0xBdB9BD48CDCF075D66f81f083b9Ab618a0530c31";
      // return "0x7f0F640CBF02D345bf33C94825490EE0ddaf1f1F";
      return this.$store.state.web3.address;
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
    // 获取数据列表
    async getCertificateList() {
      this.certificateList = [];
      if (this.contractAddress) {
        this.loading = true;
        const contract = await getContractByABI(
          Certificate_ABI,
          this.contractAddress,
          this.web3
        );
        const hasInfo = await contract.methods.hasInfo(this.address).call();
        if (hasInfo) {
          const accountInfo = await contract.methods
            .getAccountInfo()
            .call({ from: this.address });
          if (accountInfo.certificates.length > 0) {
            accountInfo.certificates.map(item => {
              const tempItem = {
                title: item.name,
                image: this.pathDomain + item.cid,
                cid: item.cid
              };
              this.certificateList.push(tempItem);
            });
          }
        }
        this.loading = false;
      }
    },
    // 预览图片
    previewImg(uri, title) {
      this.dialog = true;
      this.previewImgTitle = title;
      this.previewImgUrl = uri;
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

.list-item
  display: flex
  align-items: center
  justify-content: space-around
  flex-direction: column
.list-item-image
  width: 100%
.list-item-title
  margin-top: 10px
  overflow: hidden
  white-space: nowrap
  text-overflow: ellipsis
  width: 100%
  text-align: left
.dialog-image
  width: 100%
  height: 100%
  position: absolute !important
  top: 0
  z-index: 10
</style>
