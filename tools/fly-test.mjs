// Живая проверка garden.html в headless Edge через DevTools Protocol (без зависимостей,
// нужен node 22+ со встроенным WebSocket).
//
// Headless с --virtual-time-budget почти не крутит requestAnimationFrame, поэтому анимацию,
// полёт камеры и события так не проверить. Этот скрипт запускает Edge с отладочным портом,
// водит мышью, крутит колесо, жмёт пробел и проверяет подсказку про зум.
//
// Запуск:  node tools/fly-test.mjs [папка для скриншотов] [страница, по умолчанию garden.html]
// Вывод:   JSON с интервалами кадров (мс), видимостью подсказки по времени (hint, 0..1),
//          её уходом после колеса (cut) и ошибками JS;
//          скриншоты fly.png, zoomin.png, minimap.png, closing.png, hint.png.

import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const OUT = resolve(process.argv[2] || join(tmpdir(), 'empdata2k-fly-test'));
const PAGE = pathToFileURL(resolve(import.meta.dirname, '..', process.argv[3] || 'garden.html')).href;
const EDGE = process.env.EDGE || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const PORT = 9335;
mkdirSync(join(OUT, 'profile'), { recursive: true });
const edge = spawn(EDGE, ['--headless=new', '--remote-debugging-port=' + PORT, '--window-size=1600,1000',
  '--user-data-dir=' + join(OUT, 'profile'), 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));

let list = [];
for (let i = 0; i < 50 && !list.find(t => t.type === 'page'); i++) {
  try { list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json(); } catch (e) { await sleep(200); }
}
const ws = new WebSocket(list.find(t => t.type === 'page').webSocketDebuggerUrl);
await new Promise(r => ws.onopen = r);
let seq = 0; const pending = new Map();
ws.onmessage = m => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } };
const send = (method, params = {}) => new Promise(r => { const i = ++seq; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async expr => (await send('Runtime.evaluate', { expression: expr, returnByValue: true })).result.result.value;
const shot = async name => { const r = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(join(OUT, name + '.png'), Buffer.from(r.result.data, 'base64')); };
const mouse = (x, y) => send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
const wheel = (x, y, dy) => send('Input.dispatchMouseEvent', { type: 'mouseWheel', x, y, deltaX: 0, deltaY: dy });
const key = async (k, code, vk) => { await send('Input.dispatchKeyEvent', { type: 'keyDown', key: k, code, windowsVirtualKeyCode: vk }); await send('Input.dispatchKeyEvent', { type: 'keyUp', key: k, code, windowsVirtualKeyCode: vk }); };
const frames = () => ev('(function(){ var a=__ft.slice().sort(function(p,q){return p-q;}); __ft.length=0; return {n:a.length, med:a[a.length>>1], p95:a[Math.floor(a.length*0.95)], max:a[a.length-1]}; })()');
// насколько видна подсказка про зум (0..1); страница отдаёт это только с ?test
const hintLevel = async () => Math.round(await ev('__bosch.hint()') * 100) / 100;

await send('Page.enable'); await send('Runtime.enable');
await send('Page.addScriptToEvaluateOnNewDocument', { source: `
  window.__err=[]; addEventListener('error', function(e){ __err.push(e.message+' @'+e.lineno); });
  window.__ft=[]; (function f(t){ if (window.__lt) __ft.push(t-__lt); window.__lt=t; requestAnimationFrame(f); })();` });

// 1. подсказка: через секунду после загрузки проявляется, держится, пока открываются
//    створки, и уходит
const t0 = Date.now(), hint = [];
await send('Page.navigate', { url: PAGE + '?at=0.45,0.3&test' });
await mouse(700, 300);
for (const at of [900, 1800, 4000, 7000, 9600, 11500]) {
  await sleep(at - (Date.now() - t0));
  hint.push({ ms: at, level: await hintLevel() });
  if (at === 7000) await shot('hint');
}
// 2. открывается отзумленной (вся картина), зум колесом (подсказка должна сразу уйти),
//    полёт по всему окну, миникарта, створки
await send('Page.navigate', { url: PAGE + '?open&test' });
await mouse(800, 500); await sleep(2800);                     // створки открыты сразу, подсказка уже видна
const cut = { before: await hintLevel() };
await wheel(800, 500, -120); await sleep(1000);
cut.after = await hintLevel();
await wheel(800, 500, -120); await sleep(600); await frames(); // два шага от полного вида: есть куда лететь
for (let i = 0; i <= 120; i++) { const a = i / 120; await mouse(40 + a * 1520, 500 + 360 * Math.sin(a * 6.28)); await sleep(25); }
const fly = await frames(); await shot('fly');
await mouse(1200, 300); await wheel(1200, 300, -120); await sleep(600); await wheel(1200, 300, -120); await sleep(1200);
await shot('zoomin');
for (let k = 0; k < 8; k++) { await wheel(800, 500, 120); await sleep(150); }
await wheel(800, 500, -120); await sleep(300); await wheel(800, 500, -120); await sleep(800);
await mouse(1450, 820); await sleep(1800); await shot('minimap');
await key(' ', 'Space', 32); await sleep(1200); await shot('closing');
const errors = await ev('__err');

console.log(JSON.stringify({ out: OUT, hint, cut, fly, errors }));
ws.close(); edge.kill(); process.exit(errors.length ? 1 : 0);
