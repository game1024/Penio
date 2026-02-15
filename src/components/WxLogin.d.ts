interface WxLoginOptions {
  id: string;
  appid: string;
  scope: string;
  redirect_uri: string;
  state: string;
  style?: string;
  href?: string;
  self_redirect?: boolean;
  styletype?: string;
  sizetype?: string;
  bgcolor?: string;
  rst?: string;
  lang?: 'en' | 'zh_CN';
  stylelite?: 0 | 1;
  fast_login?: 0 | 1;
  color_scheme?: 'auto' | 'dark' | 'light';
  onReady?: (ready: boolean) => void;
  onQRcodeReady?: () => void;
  onCleanup?: () => void;
}

declare global {
  interface Window {
    WxLogin: new (options: WxLoginOptions) => void;
  }
}

export {};