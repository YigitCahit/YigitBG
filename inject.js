/**
 * YigitBG - Manuel Enjeksiyon Betiği
 *
 * Bu dosya Discord'un ANA SÜRECİNDE (main process) çalışır.
 * discord_desktop_core/index.js içine eklenen bir require(...) satırı
 * tarafından, core.asar (asıl Discord) yüklenmeden önce çağrılır.
 *
 * Görevi: Her Discord penceresi açıldığında YigitBG CSS'ini renderer'a
 * enjekte etmek. app.asar / core.asar dosyalarına HİÇ dokunmaz.
 */

const { app } = require("electron");
const fs = require("fs");
const path = require("path");

// Bu betikle aynı klasördeki CSS dosyaları
const MAIN_CSS = path.join(__dirname, "YigitBG.css");
const CONFIG_CSS = path.join(__dirname, "YigitBG.config.css");

// Önce kişisel ayarları (:root değişkenleri), sonra ana temayı birleştirir.
function buildCss() {
	let css = "";
	if (fs.existsSync(CONFIG_CSS)) {
		css += fs.readFileSync(CONFIG_CSS, "utf8") + "\n";
	}
	css += fs.readFileSync(MAIN_CSS, "utf8");
	return css;
}

function attach(window) {
	const apply = () => {
		try {
			window.webContents.insertCSS(buildCss());
		} catch (err) {
			console.error("[YigitBG] CSS enjekte edilemedi:", err);
		}
	};
	// Sayfa her hazır olduğunda (ilk açılış + Ctrl+R yenileme) CSS tekrar uygulanır.
	// Böylece CSS dosyasını düzenleyip Ctrl+R ile anında test edebilirsiniz.
	window.webContents.on("dom-ready", apply);
}

app.on("browser-window-created", (_event, window) => attach(window));

console.log("[YigitBG] Enjeksiyon betiği yüklendi.");
