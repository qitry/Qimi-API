export interface HotPlatform {
  alias: string;
  data: unknown[];
}

export interface HotApiResponse {
  code: number;
  data: HotPlatform[];
}
