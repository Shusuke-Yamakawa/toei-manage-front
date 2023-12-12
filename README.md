# 定期実行

crontab -e で以下のように記載すれば良い

```
* * * * * curl "http://localhost:3003/batch/auto-reserved?from=9&to=11"
```

# db 関連

## 接続のコマンド

```
pscale connect toei-court main --port 3309
```

## スキーマから DB に反映させる

`npx prisma db push`

※schema.prisma

## GUI を立ち上げるコマンド

npx prisma studio
