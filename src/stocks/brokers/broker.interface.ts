export interface StockBroker {
  getStockData(symbol: string): Promise<StockData>;
}

export interface StockData {
  symbol: string;
  price: number;
  volume: number;
}
