# 定期実行

crontab -e で以下のように記載すれば良い

```
* * * * * curl "http://localhost:3003/court/get?id=999&password=aaa"
```
