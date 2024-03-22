# 定期実行

crontab -e で以下のように記載すれば良い

```
* * * * * curl "http://localhost:3003/batch/auto-reserved-new?from=9&to=11&court=main"
* * * * * curl "http://localhost:3003/batch/auto-reserved-new?from=11&to=13&court=main"
* * * * * curl "http://localhost:3003/batch/auto-reserved-new?from=13&to=15&court=main"
* * * * * curl "http://localhost:3003/batch/auto-reserved-new?from=15&to=17&court=main"
#* * * * * curl "http://localhost:3003/batch/auto-reserved-new?from=9&to=11&court=sub"
#* * * * * curl "http://localhost:3003/batch/auto-reserved-new?from=11&to=13&court=sub"
#* * * * * curl "http://localhost:3003/batch/auto-reserved-new?from=13&to=15&court=sub"
#* * * * * curl "http://localhost:3003/batch/auto-reserved-new?from=15&to=17&court=sub"
*/3 * * * * curl "http://localhost:3003/batch/auto-reserved-mitaka"
0 21 * * * curl "http://localhost:3003/batch/warning-cancel?day=5"
30 9 * * * curl "http://localhost:3003/batch/warning-cancel?day=4"
```

# db 関連

## CLI インストール

https://github.com/planetscale/cli#installation

windows は以下を見た方がいい
https://zenn.dev/renoa/scraps/0cd5fe38702876

## ログイン

```
pscale auth login
```

## 接続のコマンド

```
pscale connect toei-court main --port 3309
```

## スキーマから DB に反映させる

```
npx prisma db push
```

※schema.prisma

## スキーマをコード（prisma client）に反映させる

```
npx prisma generate
```

### windows の場合の注意点

npm install から管理者権限があるターミナルで実行すること
operation not permitted, unlink が発生する

## GUI を立ち上げるコマンド

```
npx prisma studio
```
