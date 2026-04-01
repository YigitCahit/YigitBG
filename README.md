Discord icin arkaplani degistirebilmenizi saglayan CSS dosyalari.

## Chrome uzantisi

Projeye, Discord web surumu icin bir Chrome uzantisi eklendi:

- `chrome-extension/manifest.json`
- `chrome-extension/rules.json`
- `chrome-extension/content.css`
- `chrome-extension/content.js`
- `chrome-extension/popup.html`
- `chrome-extension/popup.css`
- `chrome-extension/popup.js`

Popup panelinden su ayarlari degistirebilirsiniz:

- Background URL (`--background`)
- Background position (`--backgroundposition`)
- Background size (`--backgroundsize`)
- Blur (`--backgroundblur`)
- Opacity (`--backgroundopacity`)

Not: Discord CSP kisitlari nedeniyle dogrudan dis kaynaklar engellenebilir. Uzanti, kaydederken URL'i mumkun oldugunda `data:` formuna cevirerek bu engeli asar.
Ek olarak uzanti, Discord cevabindaki CSP header'ini kaldiran bir DNR kurali kullanir.

### Yukleme

1. Chrome'da `chrome://extensions` sayfasini acin.
2. Gelistirici modunu acin.
3. `Paketlenmemis oge yukle` secenegine basin.
4. Bu depodaki `chrome-extension` klasorunu secin.
5. `https://discord.com/app` sayfasini acip popup panelinden ayarlari degistirin.

Eger uzantiyi daha once yuklediyseniz, `chrome://extensions` ekraninda uzantiyi bir kez `Yenile` ile guncelleyin.
Sonra Discord sekmesini kapatip yeniden acin (tercihen hard refresh: `Cmd + Shift + R`).
