FROM node:20-alpine

# 作業ディレクトリの設定
WORKDIR /app

# パッケージファイルのコピーとインストール
COPY package*.json ./
RUN npm install

# アプリケーションのコピー
COPY . .

# ポートの公開
EXPOSE 3000

# 開発サーバーの起動
CMD ["npm", "run", "dev"]

