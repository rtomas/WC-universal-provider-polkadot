import UniversalProvider from "@walletconnect/universal-provider";
import { Web3Modal } from "@web3modal/standalone"; 
import { useEffect, useState } from "react";
import { PolkadotService, Chains } from "./utils/polkadotService";

const projectId = import.meta.env.VITE_PROJECT_ID;

const events: string[] = [];

// 1. select chains 
const chains = [`polkadot:${Chains.relayChain}`];

// 2. select methods
const methods = ["polkadot_signMessage", "polkadot_signTransaction"];

// 3. create modal instance
const modal = new Web3Modal({
  projectId,
  themeMode: "light",
  walletConnectVersion: 2,
  enableExplorer: true,
  explorerRecommendedWalletIds: ["9ce87712b99b3eb57396cc8621db8900ac983c712236f48fb70ad28760be3f6a"], // get id from https://explorer.walletconnect.com/
  //termsOfServiceUrl: "<url>",
  //privacyPolicyUrl: "https://reown.com/privacy",
});


const App = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState("");

  // 4. create State for Universal Provider and Service
  const [provider, setProvider] = useState<UniversalProvider | null>(null);
  const [polkadotService, setPolkadotService] = useState<PolkadotService | null>(null);


  // 5. initialize Universal Provider onLoad
  useEffect(() => {
    async function setOnInitProvider() {
      const providerValue = await UniversalProvider.init({
        logger: "error", // log level
        projectId: projectId,
        metadata: {
          name: "Reown UP & Polkadot",
          description: "Polkadot integration with Reown's Universal Provider",
          url: "https://reown.com/",
          icons: ["https://avatars.githubusercontent.com/u/179229932"],
        },
      });
        
      setProvider(providerValue);
    }
    
    setOnInitProvider();
    
  }, []);

  // set Service and address on setProvider
  useEffect(() => {
    if (!provider) return;

    provider.on("display_uri", async (uri: string) => {
      console.log("uri", uri);
      await modal.openModal({
        uri,
        standaloneChains: [`polkadot:${Chains.relayChain}`],
      });
    });
  }, [provider]);

  // handle connect event
  const connect = async () => {
    try {
      if (!provider) return;
      console.log("connecting");
      await provider.connect({
        optionalNamespaces: {
          polkadot: {
            methods,
            chains,
            events,
          },
        },
      });

      const serviceValue = new PolkadotService(provider);
      setPolkadotService(serviceValue);

      console.log("session?", provider);
      setAddress(provider.session?.namespaces.polkadot?.accounts[0].split(":")[2]!);

      setIsConnected(true);
    } catch {
      console.log("Something went wrong, request cancelled");
    }
    modal.closeModal();
  };

  // handle disconnect event
  const disconnect = async () => {
    await provider!.disconnect();
    setIsConnected(false);
  };

  // handle get Balance, signMessage and sendTransaction
  const handleSign = async () => {
    console.log("signing");
    const res = await polkadotService!.signMessage(
      `Can i have authorize this request pls - ${Date.now()}`,
      address!
    );
    console.log("result sign: ",res);
  };

  return (
    <div className="App center-content">
      <h2>Reown + QR + Polkadot</h2>
      {isConnected ? (
        <>
          <p>
            <b>Relay Address: </b>{address}<br />
          </p>
          <div className="btn-container">
            <button onClick={handleSign}>Sign MSG</button>
            <button onClick={disconnect}>Disconnect</button>
          </div>
        </>
      ) : (
        <button onClick={connect}>Connect</button>
      )}
      <div className="circle">
        <a href="https://github.com/rtomas/WC-universal-provider-polkadot" target="_blank"><img src="/github.png" alt="GitHub" width="50" /></a>
      </div>
    </div>
  );
};

export default App;
