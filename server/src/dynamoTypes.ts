export type TDynamoRecord<T> = {
  pk: string;
  sk: string;
  ttl: number;
  data: T;
};

export function expireIn3Days(): number {
  return Date.now() / 1000 + 3 * 24 * 60 * 60;
}
