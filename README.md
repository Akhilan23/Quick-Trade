# Quick Trade

## Installation

#### 1. Install NestJS
Install using ```npm i -g @nestjs/cli```. If already installed, run ```nest --version``` to confirm. Follow the steps from the below page for further help
Reference: [https://docs.nestjs.com/](https://docs.nestjs.com/)

#### 2. Install Redis
Install using ```brew install redis```. Follow the steps from the below page based on your operating system for further help
Reference: [Install Redis](https://redis.io/docs/install/install-redis/install-redis-on-mac-os/)

#### 3. Install MongoDB
Follow the steps from the below page based on your operating system for further help
Reference: [Install MongoDB](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-os-x/)

## Running The App

#### 1. Start MongoDB
```bash
$ brew services start mongodb-community@4.4
```
or
```bash
$ mongod --port 27017 --dbpath ~/data/db
```

#### 2. Start Redis
```bash
$ brew services start redis
```

#### 3. Install dependencies of the app
```bash
$ npm install
```

#### 4. Run the app
```bash
$ npm run dev
```

## Working With The App

The user journey of the app is simple. 
1. Register yourself as an user.
2. Load your wallet with as much as amount you want. Every registered user, by default, has a wallet linked to their account.
3. View all the stocks listed in the app. 2 seconds into start of app, some stocks & symbols will be loaded. Then, every 30 seconds, the stock data for the same stocks will be updated.
4. Place your buy/sell orders.
5. View your portfolio.

## Technicalities

The problem statement is quite interesting & easy to get carried away with, to build a full-fledged stock exchange app. Spent some time trying to understand how a stock exchange system works in general.

While working with the framework & libraries were relatively easy, the main challenge was to come up with the solution for settling/squaring off sell orders as there were many algorithms like average/FIFO/LIFO, using which one can calculate the P/L at the time of selling. This app uses the average algorithm. Also, MongoDB is being used to store all the stock price change data every 30 seconds. Ideally, in a high-traffic scenario, it's better to store all this data in redis cache, saving loads of database calls.

Apart from that, JWT is being used for authentication. Though only a single access token with 60 minutes as ttl is being used, a better approach would be to refresh-token strategy. During logout scenario, since this is more of a server-side app, those tokens are stored in the redis as a blacklist.

## Stock Broker API Keys

### Finnhub API Key
cn90tohr01qoee99d38gcn90tohr01qoee99d390

### AlphaVantage API Key
20AV4079TKTYCPW2