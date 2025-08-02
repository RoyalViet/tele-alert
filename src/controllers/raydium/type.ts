export interface TokenInfo {
  name: string;
  symbol: string;
  icon: string;
  decimals: number;
  tokenAuthority: null;
  freezeAuthority: null;
  supply: string;
  created_tx: string;
  created_time: number;
  first_mint_tx: string;
  first_mint_time: number;
  type: string;
}

export interface Metadata {
  key: number;
  updateAuthority: string;
  mint: string;
  data: {
    name: string;
    symbol: string;
    uri: string;
    sellerFeeBasisPoints: number;
  };
  primarySaleHappened: number;
  isMutable: number;
  editionNonce: number;
  tokenStandard: number;
}

export interface Account {
  account_address: string;
  account_tags: string[];
  account_type: string;
}

export interface Tags {
  [key: string]: {
    tag_id: string;
    tag_name: string;
    tag_type: number;
    tag_metadata: {
      icon?: string;
      website?: string;
    };
  };
}

export interface TokenMetadata {
  [key: string]: {
    token_address: string;
    token_name: string;
    token_symbol: string;
    token_icon: string;
    token_decimals: number;
    token_type: string;
    price_usdt: number;
    extensions: {
      website?: string;
      description?: string;
      twitter?: string;
    };
    onchain_extensions: string;
    token_label: {
      token_address: string;
      token_name: string;
      token_symbol: string;
      token_icon: string;
    };
  };
}

export interface AccountMetadata {
  [key: string]: Account;
}

export interface TagsMetadata {
  [key: string]: Tags;
}

export interface ResponseGetTokenFromSolscan {
  success: boolean;
  data: {
    account: string;
    lamports: number;
    ownerProgram: string;
    type: string;
    rentEpoch: number;
    executable: boolean;
    isOnCurve: boolean;
    space: number;
    notifications: {
      tags: string[];
    };
    tokenInfo: TokenInfo;
    metadata: Metadata;
  };
  metadata: {
    tokens: TokenMetadata;
    accounts: AccountMetadata;
    tags: TagsMetadata;
    programs: any;
    nftCollections: any;
    nftMarketplaces: any;
  };
}
