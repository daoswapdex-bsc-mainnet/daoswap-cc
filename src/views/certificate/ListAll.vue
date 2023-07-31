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
      "https://ipfs.io/ipfs/QmQVnZV8YdLxXBnHUshH2BHYfNp2xik1j33YF86gB6RLh7",
      "https://ipfs.io/ipfs/QmP4WuVESocQ4RJg2AuuwvhXApx5NWhHhPe7AUkp6aqTau",
      "https://ipfs.io/ipfs/QmWvvVpSHrjczidneG5yoUPe4DvfMjyWgCGVHuFqSQeGi6",
      "https://ipfs.io/ipfs/QmeZziMcwysaPoFnMs58Mfu6SkpFwgyGpWyoe6QcJBbEoE",
      "https://ipfs.io/ipfs/QmTRKcEwKeL8MS5VQnipkVWei1i3RoEMo3bbh9LghBBEUZ",
      "https://ipfs.io/ipfs/QmPaVoBuFzqJkh3BksPvZa1i4hNfLiyiZak6hn7wWt9DyP",
      "https://ipfs.io/ipfs/QmSQRJ2ZRkxkmogy7jzVk1Ze7zHsTr3Mx58bePMGb9tJVE",
      "https://ipfs.io/ipfs/QmZc9KncJXShj3btoXuPFRjmpiarEhHur5sqpQ4jNwfUD3",
      "https://ipfs.io/ipfs/QmT9it4A2YdiZE7Wme7hiQggM3Jf1erKVYSELXYSsHg4Mo",
      "https://ipfs.io/ipfs/QmYL9ALoP7yiMbZjAtt94C3GHPizcRe7f2UUeZVpc1QoWo",
      "https://ipfs.io/ipfs/QmYyxdNJTH7tpPXFnrZHi2CAj5F6aFsBjbhr6QG8F9MCzo",
      "https://ipfs.io/ipfs/Qmdrd9p8ThczbVZMev5THTK46W28SbffiUwNEiKPJDBd8Z",
      "https://ipfs.io/ipfs/QmewnvSU5oCo8135ng8fARBQ3Ljxpn8o4iDixFtHqQziuJ",
      "https://ipfs.io/ipfs/QmUcCFrKPWJtAwvmFHjz2Gt3ZoXUg3dttabN9aNCraXtkc",
      "https://ipfs.io/ipfs/QmSgsdvQoqYhtQY3sZAS1Nch55YT8rAidggErsgDNg68aB",
      "https://ipfs.io/ipfs/QmerCsdWzq7Q7mnr4CbzeDC1oMK3VfSrDJWWRzFhshoiDG",
      "https://ipfs.io/ipfs/QmVYhmsso5zfFztqChswUTLJ76eMoLv6kCkSbNJ34xc8su",
      "https://ipfs.io/ipfs/QmZJqeAroVhLzZGsYTYrkiWwVE7a1cvLsmNpFsxKaizzvF",
      "https://ipfs.io/ipfs/QmRMR7hpMdVC7TNabZz4WdhN6gyitNz8NaZaswBGNw5Md1",
      "https://ipfs.io/ipfs/Qmf923jwVjjZtzA7xyW61sZf156ZtUFmXkoG8JyP28f2Vw",
      "https://ipfs.io/ipfs/QmfJkjyeuz9bahxmmd11FcyEUKFUTCnwScFbCV9D9NNGwR",
      "https://ipfs.io/ipfs/QmbZsViv59NsqjKjjegshDGLaBNavWUF6nfRKuVxTusBQL",
      "https://ipfs.io/ipfs/QmQLoNzffRXCtCX5qp48EXe2w6TgT6f85MuvLEZcXH7BwZ",
      "https://ipfs.io/ipfs/QmRMyJaVK6ZwYVHG1veJzTcLsGquFkt47KDPxMzmNAvNQ7",
      "https://ipfs.io/ipfs/QmUYBsW8xn1o6PRHDZMaW2AvWDSWag1nVBeSBSEDvMZ6RH",
      "https://ipfs.io/ipfs/QmbpeYVM43kkhWHsk39NFjfNpbE5XAvkchqdf4kYYEivDP",
      "https://ipfs.io/ipfs/QmT7AvMdr4Socz9aTvCz3DL43hQqFYHe7FHdGc7MjVxRmN",
      "https://ipfs.io/ipfs/QmdS75C6hWnVDvqVZZ7qYmcGpNytB2nqCZQRg62nbqCC32",
      "https://ipfs.io/ipfs/QmUg1NbkiFA4oTTFH3w9KS9PBQsLp5GqwJa6bhcEnniXw1",
      "https://ipfs.io/ipfs/QmWS2V6VZyna2vUZpDrkzpNjwGWTggPZAfNcdp9Fmo35og",
      "https://ipfs.io/ipfs/QmSctFcQUGDwdXhoXfxLmbyNGX5FMvYS6KKMv45VaPP6Bg",
      "https://ipfs.io/ipfs/Qmcgh75bN1ea7bf8A3yQWjhT1u7mcSr2FSTKtELqezxVy7",
      "https://ipfs.io/ipfs/QmQewJP7gHnuiVrTZ3JSss6KcMikvqAYoDv9Gas2SYSEDE",
      "https://ipfs.io/ipfs/QmX3CUJfxv9FGx7Ns2xfeF6KuqBAs4mepULUFVJhf3GNHe",
      "https://ipfs.io/ipfs/QmdjuYE8NhACdxyy4cnZBJBo2Q9FjPaTRz3u63qSjwwNeE",
      "https://ipfs.io/ipfs/QmPQgEFBHZ4iaiqPej6dTBeWaheKeA74Zjd9qkNnS8bcZK",
      "https://ipfs.io/ipfs/QmXjXbjec9Hzxgy2AcvNHUSEVeAcXat1Le39yzPLber632",
      "https://ipfs.io/ipfs/QmNyYDAhVBxKwLABJswfGgc5qfAkTye2RPg5cH9kwQroVu",
      "https://ipfs.io/ipfs/QmcNJDnCKvmYXnxq11pa28f7Z8wwwooPeW1icqmFunzD9r",
      "https://ipfs.io/ipfs/QmYYHRA2QmiJkbhndXN1Vsy4Drxt6cBfBNcYoXdvGitgSy",
      "https://ipfs.io/ipfs/QmWmJunWAxmz9MkjvpbtH8d3pLA4CRjuRLnQ7vYaA4A7Et",
      "https://ipfs.io/ipfs/QmaWF4NzWxYxjcH69fcn9tq9K4KbF3qLAtNjid3qWkHA43",
      "https://ipfs.io/ipfs/QmeVB84rzm7YSXxLg2xPZKV4evANXH6LUQrcMRyvkLx71H",
      "https://ipfs.io/ipfs/QmNqd5XkgoJRPnj55BQA5w88NFnvK27mzYYoAJD6jDyHV9",
      "https://ipfs.io/ipfs/QmZtY5YxyXa6aD1gwc5wRTkZkFy7Hnzue2iXLx8VPZTXeK",
      "https://ipfs.io/ipfs/QmW3XQQbmWAeeBRXi8f5x1vJZk6Pit5eJL4hCYruaRHPpM",
      "https://ipfs.io/ipfs/QmeCkpTQ5JeTMnFPj9ri3R9A3DNTBUK3heqA5uSQRU4iFj",
      "https://ipfs.io/ipfs/QmQW4QScqn5dtNpiFYWdZLqvLdnpq4EiLiqVmxo98WMmB4",
      "https://ipfs.io/ipfs/QmZdUv9EM89wg6qwEmwUK71sxYYT1ZsP9LSKoTNMGMUHcW",
      "https://ipfs.io/ipfs/QmX3KNpjvxJypmsQeTPPHcLbCkd8AVTbaZkShiryAGWKrx",
      "https://ipfs.io/ipfs/QmfLHszWnZtFHkmXVbqt799HPvQhyLhrVfhBK6tH3n2fUi",
      "https://ipfs.io/ipfs/Qmarm3f6rEgn7h38LHVcVUjyaDGfNtUBJhoXdUurqLLXJT",
      "https://ipfs.io/ipfs/QmYntGN4YkhhWEUewXVw7pCMKxUGQFMYEbq5aBvmC8UkV4",
      "https://ipfs.io/ipfs/QmQYRQBZiSNKVQWPTiLsmju5mWavRqULFSkoVGxyuDeeMk",
      "https://ipfs.io/ipfs/Qmf9BAXvFDber2VrCk7EWfouukfV6kGbLVx9vVFVGP6gqi",
      "https://ipfs.io/ipfs/QmaWtEm7hyHKEKMvb89byBsNXbmyFxYWyWk6KBBNNJUEeA",
      "https://ipfs.io/ipfs/QmW6ntbrouHCfrg3h8Qrdez261tbm4C7RyoJu8isct64Zo",
      "https://ipfs.io/ipfs/QmTkXq4gsBDM9GuWi5HnvXFbNtSVq9cj8oTSMGV643wqgR",
      "https://ipfs.io/ipfs/QmUZ1j4UZ7mHsmC6nzyybSx43udvFzZToeZ5ft7y9PBmF7",
      "https://ipfs.io/ipfs/QmcJ3KCLAChhxxS1YSz5KNPkve58SYjp7EjBMgrMFzRkVE",
      "https://ipfs.io/ipfs/Qmc9tFSDYhwWV27VwWjjYzotjF9S9DJj2RZjH9JtpoHjD7",
      "https://ipfs.io/ipfs/Qma76v2ewAgyxCD8w1EdJV6b5uXrtqSvHMinGSoCFAyChQ",
      "https://ipfs.io/ipfs/QmVJGhQNnpvG98n1hBP7m5HJQPc9NwRBhwPSt2kEENfV2h",
      "https://ipfs.io/ipfs/QmUFdhMBfWyoM6QSZ169hRfZW4dvWw5yeRPFfQ9duZrrPm",
      "https://ipfs.io/ipfs/QmUYqFKn1MQefjjtdRZP47bPLHgCBcyiDfCpZmnhYXLdJ5",
      "https://ipfs.io/ipfs/QmWnUjA1ywenu892HfRLcs8C1wTgq7oZonCTsEfTaqRdpp",
      "https://ipfs.io/ipfs/QmeveD4g8JjEGuFvHMmhkghokmoudXXp76wCgNrk9C6JAD",
      "https://ipfs.io/ipfs/QmeDjDy2mFrYqaVZDxHzn16qCTskyigVBCw5PDnrvwt9tB",
      "https://ipfs.io/ipfs/QmSgHseA5R35skiNrYVSkbP3vtwF1BsU8ZFwsqDNoe9PfG",
      "https://ipfs.io/ipfs/Qme5NTFyXpWeyDTn2H5jkc9zP7ZibhuobXRK88H4vpTN89",
      "https://ipfs.io/ipfs/QmR8FHUCzgjQL9PYQYnQxHH8n6tWyp5iM1XuQGLZnRPqRv",
      "https://ipfs.io/ipfs/QmPGZ5Dy7aSEcBesvzz5LUw3X47bzqXiDRTTaV6zRXSS3f",
      "https://ipfs.io/ipfs/QmRN4z3pBdDz4igAeLdSBmw482dxhFDydeQZEWpp5SjRxB",
      "https://ipfs.io/ipfs/QmX3WfKq2oXRryUnm7k1YUwWZUTKEM5bEaxmy3qn5GEFm3",
      "https://ipfs.io/ipfs/QmWrjS2Yc5JY1sXz6PGNt3rVbtBkwrZPWpn7Byy8gcVFwY",
      "https://ipfs.io/ipfs/QmXZ4BJQmhfZKiFe8D1emxwPbvqppjyiVigizhENFs8rkq",
      "https://ipfs.io/ipfs/QmVid3Kda4QxBznSj8RgKNaJv6DhJmtgbzwCZ6GAq3afgC",
      "https://ipfs.io/ipfs/Qmf5zss8ZBfHbVbx1RV8hkbBsethGoEEPeP5pBRxwBt3eN",
      "https://ipfs.io/ipfs/QmbHYAaLboNpW7hXjey4gAmgvmdbC2AC1QgtXVsqQqESeg",
      "https://ipfs.io/ipfs/QmTw65DVfW4fsr2xwcQng98isdJCnjHJgP7Y4otnuMVfYs",
      "https://ipfs.io/ipfs/QmZPpFXGfxhA1j1kdxBrD2gfW75kQwWU2LgpX7u7fFyXFW",
      "https://ipfs.io/ipfs/QmSyZd6fm3nNEhguuptVQpxhkPDFsPuSEivJnBqDMenrUE",
      "https://ipfs.io/ipfs/QmdTEeafDVYE5fM4RtLU9acCFsKc6Rrt38SZerzM7RVGvR"
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
