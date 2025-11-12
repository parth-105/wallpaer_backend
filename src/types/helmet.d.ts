declare module 'helmet' {
  import { RequestHandler } from 'express';
  
  interface HelmetOptions {
    contentSecurityPolicy?: boolean | any;
    crossOriginEmbedderPolicy?: boolean | any;
    crossOriginOpenerPolicy?: boolean | any;
    crossOriginResourcePolicy?: boolean | any;
    dnsPrefetchControl?: boolean | any;
    frameguard?: boolean | any;
    hidePoweredBy?: boolean | any;
    hsts?: boolean | any;
    ieNoOpen?: boolean;
    noSniff?: boolean;
    originAgentCluster?: boolean | any;
    permittedCrossDomainPolicies?: boolean | any;
    referrerPolicy?: boolean | any;
    strictTransportSecurity?: boolean | any;
    xContentTypeOptions?: boolean;
    xDnsPrefetchControl?: boolean | any;
    xDownloadOptions?: boolean;
    xFrameOptions?: boolean | any;
    xPermittedCrossDomainPolicies?: boolean | any;
    xPoweredBy?: boolean | any;
    xXssProtection?: boolean | any;
    [key: string]: any;
  }
  
  function helmet(options?: HelmetOptions): RequestHandler;
  
  export default helmet;
}

