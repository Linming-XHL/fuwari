export interface LineFeature {
  name: string;
}

export interface Line {
  name: string;
  url: string;
  features?: LineFeature[];
}

export const linesConfig = {
  enabled: true,
  lines: [
    {
      name: "主线路",
      url: "https://240900.xyz",
      features: [
        { name: "SSL" },
        { name: "QUIC" },
      ],
    },
    {
      name: "备用线路",
      url: "https://lmxhl.zakoflare.com",
      features: [
        { name: "SSL" },
        { name: "HTTP2" },
      ],
    },
    {
      name: "免费域名线路",
      url: "https://lmxhl.dpdns.org",
      features: [
        { name: "SSL" },
        { name: "QUIC" },
        { name: "FREE" },
      ],
    },
  ],
};
