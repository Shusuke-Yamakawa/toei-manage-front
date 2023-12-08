# 定期実行

crontab -e で以下のように記載すれば良い

```
* * * * * curl "http://localhost:3003/batch/auto-reserved?from=9&to=11"
```
