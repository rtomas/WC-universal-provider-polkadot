import UniversalProvider from "@walletconnect/universal-provider";

export enum Chains {
  relayChain = "91b171bb158e2d3848fa23a9f1c25182" 
}

export class PolkadotService {
  private provider?: UniversalProvider;
  private isTestnet: boolean;

  constructor(provider?: UniversalProvider) {
    this.provider = provider;
    this.isTestnet = false;
  }

  public async signMessage(
    message: string,
    address: string
  ) {
    if (!this.provider) {
      throw new Error("Provider is required to sign a message.");
    }
    try {
      const method = "polkadot_signMessage"
      const result = await this.provider!.request<{ signature: string }>({
        method,
        params: { address, message },
      }, "polkadot:91b171bb158e2d3848fa23a9f1c25182");

      return {
        method,
        address,
        valid: true,
        result: result.signature,
      };
    } catch (error: any) {
      throw new Error(error);
    }
  }
}
