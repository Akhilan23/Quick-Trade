export const AppConstants = {
  PORT: 3001,
  DB_URI: 'mongodb://127.0.0.1:27017/quick-trade',
  CACHE_HOST: 'localhost',
  CACHE_PORT: 6379,
  IS_ORDER_WITH_PRICE: false,
  IS_STRATEGY_AVERAGE: true,
  FETCH_CALL_LATENCY: 30 * 1000,
  FINNHUB_TOKEN: 'cn90tohr01qoee99d38gcn90tohr01qoee99d390',
  SALT_ROUNDS: 10,
  HASH_SECRET: '',
};

export const JwtConstants = {
  SECRET: 'some-random-2024-jwt-key',
};
