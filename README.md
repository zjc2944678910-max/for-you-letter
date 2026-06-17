# Love Letter Site

一个本地运行的情侣纪念网页，适合纪念日、生日、表白、道歉或惊喜场景。

## 本地预览

```bash
python3 -m http.server 5177
```

然后打开 `http://localhost:5177`。

## 可替换内容

- `index.html`：主标题、时间线、默认留言。
- `app.js`：纪念日起始日期 `startDate`、场景切换文案、彩蛋文案。
- 页面里的照片相框：在浏览器中点击相框上传，图片会保存在当前浏览器的 `localStorage`。

上传的照片不会联网，也不会写回项目文件。
