import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { cookieStorage, createStorage } from "wagmi";
import { } from "wagmi/chains";

export const projectId = "601f7b2bfff74bb3e8b910a176bbe82c";

if (!projectId) throw new Error("Project ID is not defined");

export const metadata = {
  name: "Web3Modal Example",
  description: "Web3Modal Example",
  url: "https://web3modal.com",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

export const config = defaultWagmiConfig({
  chains: [{
    id: 80002,
    name: "Polygon Amoy",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ["https://rpc-amoy.polygon.technology/"],
      },
      public: {
        http: ["https://rpc-amoy.polygon.technology/"],
      },
    },
    blockExplorers: {
      default: {
        name: "PolygonScan",
        url: "https://amoy.polygonscan.com",
      },
    },
    testnet: true,
  }],
  projectId,
  metadata,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
});