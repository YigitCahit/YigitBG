Discord için arkaplanı değiştirebilşmenizi sağlayan CSS dosyaları.

## Manuel kurulum (client mod olmadan)

`app.asar`/`core.asar` dosyalarına dokunmadan, Discord'un başlangıç dosyasına
küçük bir `require(...)` satırı ekleyerek CSS'i enjekte eder.

1. Bu klasördeki dosyaları bilgisayarınızda sabit bir yere koyun.
2. PowerShell açıp şu komutu çalıştırın:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\install.ps1
   ```
   Bu komut, en güncel Discord sürümünün
   `...\modules\discord_desktop_core-*\discord_desktop_core\index.js` dosyasına
   `inject.js`'i yükleyen satırı ekler.
3. Discord'u **tamamen kapatıp** (sistem tepsisinden de çıkış yapın) yeniden açın.

### Ayarlar
`YigitBG.config.css` dosyasındaki `:root` değerlerini (arkaplan görseli, blur,
opaklık) düzenleyip Discord'da **Ctrl+R** ile anında güncelleyebilirsiniz.

### Kaldırma
```powershell
powershell -ExecutionPolicy Bypass -File .\uninstall.ps1
```

> Not: Discord her güncellendiğinde yeni bir `app-*` klasörü oluşturur ve eklenen
> satır silinir. Güncellemeden sonra `install.ps1`'i tekrar çalıştırın.

> Alternatif: Sisteminizde zaten **BetterDiscord** varsa, `YigitBG.theme.css`
> dosyasını BetterDiscord'un `themes` klasörüne atmak da yeterlidir.
