import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
// import { createHttpLink } from 'apollo-link-http'

export const client = new ApolloClient({
  link: new HttpLink({
    uri: "https://n10.hg.network/subgraphs/name/daoswapdex-heco-mainnet/heco"
  }),
  cache: new InMemoryCache(),
  shouldBatch: true
});

export const healthClient = new ApolloClient({
  link: new HttpLink({
    uri: "https://h10.hg.network/graphql"
  }),
  cache: new InMemoryCache(),
  shouldBatch: true
});

// export const v1Client = new ApolloClient({
//   link: new HttpLink({
//     uri: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap',
//   }),
//   cache: new InMemoryCache(),
//   shouldBatch: true,
// })

export const stakingClient = new ApolloClient({
  link: new HttpLink({
    uri: "https://api.thegraph.com/subgraphs/name/way2rach/talisman"
  }),
  cache: new InMemoryCache(),
  shouldBatch: true
});

export const blockClient = new ApolloClient({
  link: new HttpLink({
    uri: "https://q.hg.network/subgraphs/name/hecoblocks/heco"
  }),
  cache: new InMemoryCache()
});
