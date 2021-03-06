import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'
import '@tenderly/hardhat-tenderly'
import '@eth-optimism/hardhat-ovm'
import 'hardhat-contract-sizer'
import 'hardhat-deploy'
import 'hardhat-gas-reporter'
 

import { config } from 'dotenv'
import { ethers } from 'ethers'
import * as fs from 'fs'
import { extendEnvironment, HardhatUserConfig } from 'hardhat/config'



import {
  HardhatRuntimeEnvironment,
  HardhatNetworkHDAccountsUserConfig,
  NetworkUserConfig,
} from 'hardhat/types'
import * as path from 'path'
  


const {
  ALCHEMY_KOVAN_KEY,
  ALCHEMY_RINKEBY_KEY,
  ALCHEMY_ROPSTEN_KEY,
  ALCHEMY_MAINNET_KEY,
  COMPILING,
  CMC_KEY,
  ETHERSCAN_API_KEY,
  INFURA_KEY,
  FORKING_NETWORK,
  MATIC_MAINNET_KEY,
  MATIC_MUMBAI_KEY,
  MNEMONIC_KEY,
  SAVE_GAS_REPORT,
  TESTING,
} = process.env

if (COMPILING != 'true') {
  require('./tasks')
  require('./utils/hre-extensions')
}
let isTesting = false
if (TESTING === '1') {
  isTesting = true

  require('./test/helpers/chai-helpers')
}




const getLatestDeploymentBlock = (networkName: string): number | undefined => {
  try {
    return parseInt(
      fs
        .readFileSync(
          path.resolve(
            __dirname,
            'deployments',
            networkName,
            '.latestDeploymentBlock'
          )
        )
        .toString()
    )
  } catch {
    // Network deployment does not exist
  }
}

 

const mnemonic = (): string => {
  try {
    return fs.readFileSync('./mnemonic.txt').toString().trim();
  } catch (e) {
    console.log(
      '☢️ WARNING: No mnemonic file created for a deploy account.'
    )
  }
  return ''
}

const accounts: HardhatNetworkHDAccountsUserConfig = {
  mnemonic: mnemonic(),
  count: 15,
  accountsBalance: ethers.utils.parseEther('100000000').toString(),
}

const networkConfig = (config: NetworkUserConfig): NetworkUserConfig => {
  config = {
    ...config,
    accounts,
  }

  return config
}



// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export default <HardhatUserConfig>{
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  tenderly: {
    username: 'teller',
    project: '{see utils/hre-extensions.ts}',
  },
  paths: {
    sources: 'contracts',
  },
  external: {
    contracts: [
      {
        artifacts: 'node_modules/hardhat-deploy/extendedArtifacts',
      },
      {
        artifacts: 'node_modules/@openzeppelin/contracts/build/contracts',
      },
    ],
  },
  solidity: {
    compilers: [
      {
        version: '0.8.4',
        settings: {
          optimizer: {
            enabled: !isTesting,
            runs: 200,
          },
        },
      },
    ],
  },
  ovm: {
    solcVersion: "0.8.4",
  },
  contractSizer: {
    runOnCompile: !!COMPILING,
    alphaSort: false,
    disambiguatePaths: false,
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
    coinmarketcap: CMC_KEY,
    outputFile: SAVE_GAS_REPORT ? 'gas-reporter.txt' : undefined,
    noColors: !!SAVE_GAS_REPORT,
    showMethodSig: false,
    showTimeSpent: true,
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
    },
    lender: {
      hardhat: 5,
      localhost: 5,
    },
    lender2: {
      hardhat: 6,
      localhost: 6,
    },
    borrower: {
      hardhat: 7,
      localhost: 7,
    },
    liquidator: {
      hardhat: 9,
      localhost: 9,
    },
    funder: {
      hardhat: 14,
      localhost: 14,
    },
    craSigner: {
      hardhat: 10,
      localhost: 10,
    },
    attacker: {
      hardhat: 11,
      localhost: 11,
    },
  },
  networks: {
    kovan: networkConfig({
      url: `https://kovan.infura.io/v3/${INFURA_KEY}`,
      chainId: 42 
    }),
    rinkeby: networkConfig({
      url: `https://rinkeby.infura.io/v3/${INFURA_KEY}`,
      chainId: 4
    }),
    ropsten: networkConfig({
      url: `https://ropsten.infura.io/v3/${INFURA_KEY}`,
      chainId: 3
    }),
    goerli: networkConfig({
      url: `https://goerli.infura.io/v3/${INFURA_KEY}`,
      chainId: 5
    }),
    mainnet: networkConfig({
      url: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
      chainId: 1
    }),
    polygon: networkConfig({
      url: `https://polygon-mainnet.infura.io/v3/${INFURA_KEY}`,
      chainId: 137
    }),
    polygon_mumbai: networkConfig({
      url: `https://polygon-mumbai.infura.io/v3/${INFURA_KEY}`,
      chainId: 80001
    }),
    xdai: networkConfig({
      url: 'https://rpc.xdaichain.com/',
      // chainId: 
    }),
    rinkebyArbitrum: networkConfig({
      url: 'https://rinkeby.arbitrum.io/rpc',
      // chainId: , 
    }),
    localArbitrum: networkConfig({
      url: 'http://localhost:8547',
      // chainId: , 
    }),
    localArbitrumL1: networkConfig({
      url: 'http://localhost:7545' 
      
    }),
    kovanOptimism: networkConfig({
      url: 'https://kovan.optimism.io',
      // chainId: ,
      ovm: true 
    }),
    localOptimism: networkConfig({
      url: 'http://localhost:8545',
      // chainId: ,
      ovm: true, 
    }),
    localOptimismL1: networkConfig({
      url: 'http://localhost:9545',
      // chainId: , 
    }),
    localAvalanche: networkConfig({
      url: 'http://localhost:9650/ext/bc/C/rpc',
      chainId: 43112,
    }),
    fujiAvalanche: networkConfig({
      url: 'https://api.avax-test.network/ext/bc/C/rpc',
      chainId: 43113,
    }),
    mainnetAvalanche: networkConfig({
      url: 'https://api.avax.network/ext/bc/C/rpc',
      chainId: 43114,
    }),
    testnetHarmony: networkConfig({
      url: 'https://api.s0.b.hmny.io',
      chainId: 1666700000,
    }),
    mainnetHarmony: networkConfig({
      url: 'https://api.harmony.one',
      chainId: 1666600000,
    }),
    hardhat: networkConfig({
      chainId: 31337,
      allowUnlimitedContractSize: true,
      // forking:
      //   FORKING_NETWORK == null
      //     ? undefined
      //     : {
      //         enabled: true,
      //         url: networkUrls[FORKING_NETWORK],
      //         blockNumber: getLatestDeploymentBlock(FORKING_NETWORK),
      //       },
    }),
    localhost: networkConfig({
      url: 'http://127.0.0.1:8545',
      timeout: 10000000,
    }),
  },
  mocha: {
    timeout: 10000000,
  },
}
 

