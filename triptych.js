'use strict';

/* ------------------------------------------------------------------ */
/*  eMPDATA2K  ·  bOSCH tRiPTYCHS iN tEXT mODE                          */
/*  the shared engine of garden.html, haywain.html and anthony.html: a   */
/*  triptych as one huge text mode screen of half blocks and ░▒▓, far   */
/*  bigger than the window, flown over with the mouse.                  */
/*                                                                      */
/*  a page loads this file, then                                        */
/*    triptychWorld({wing:110, title:'the haywain'})   sets the layout  */
/*    ...paints its panels with the painter below...                    */
/*    triptychStart({id, paint, labels, byline, scroll, step, draw...}) */
/*  everything here is a plain global, so the page's art can use it.    */
/* ------------------------------------------------------------------ */

// the three pages, for the menu in the top bar
var TRIPTYCHS = [
  { url:'garden.html',   name:'tHE gARDEN oF eARTHLY dELiGHTS', short:'gARDEN' },
  { url:'haywain.html', name:'tHE hAYWAiN',                    short:'hAYWAiN' },
  { url:'anthony.html', name:'tHE tEMPTATiON oF sT aNTHONY',   short:'aNTHONY' }
];

var PAL = ['#000000','#0000aa','#00aa00','#00aaaa','#aa0000','#aa00aa','#aa5500','#aaaaaa',
           '#555555','#5555ff','#55ff55','#55ffff','#ff5555','#ff55ff','#ffff55','#ffffff'];
function C(i){ return PAL[i]; }
var FONT = '"Perfect DOS VGA 437","Px437 IBM VGA8",Consolas,"Lucida Console","DejaVu Sans Mono","Courier New",monospace';

// painting palette, one char per colour (the same trick as the dragon on the main page)
var K = {
  '0':'#000000','1':'#181818','2':'#2e2e2e','3':'#484848','4':'#686868','5':'#8a8a8a','6':'#aaaaaa','7':'#c6c6c2','8':'#e2e2dc','9':'#ffffff',
  f:'#f6e0cc', F:'#dcb896', q:'#8a5a3c', h:'#402614', H:'#dcb45c',                   // skin, hair
  j:'#c2d478', G:'#9eba52', g:'#7c9c3c', d:'#587a2e', D:'#34501e',                   // greens
  a:'#d8e8e2', b:'#aed0e2', c:'#84b2da', e:'#5c8ec8',                                // sky
  W:'#a0c4d6', w:'#6e9cba', x:'#3a6888', m:'#9aacc0', M:'#6e86a4', B:'#2e4cb4', l:'#6a8ae4', // water, rock, blue
  k:'#f8dae2', p:'#ecb4c2', P:'#c88494', r:'#cc2e2e', R:'#861a1a', o:'#e8804a',       // pinks, reds
  s:'#f2e4aa', t:'#bc9052', n:'#8c6636', N:'#5a3e1e', u:'#2a1a0c', S:'#d6ae4c', T:'#8c6c22', // wood, gold
  y:'#ffff55', Y:'#ffaa22', z:'#ff5555', Z:'#aa0000',                                // fire
  v:'#0c0a12', V:'#1c1624', i:'#302838', I:'#4c3e4a', X:'#4c1612',                   // hell
  E:'#9eb8c8', A:'#6c8698',                                                          // ice (+ 'C' below)
  L:'#e0e4d8', O:'#b6bcac', Q:'#8e9486', U:'#666c5e', J:'#40463a', '#':'#22261e',     // grisaille
  '@':'#4a2458', '%':'#7c4a8c'                                                       // berries
};
K.C = '#cadee6';

/* ----------------------------- glyphs ----------------------------- */
var BOX = {
  '─':{l:1,r:1}, '│':{u:1,d:1}, '┌':{r:1,d:1}, '┐':{l:1,d:1}, '└':{u:1,r:1}, '┘':{u:1,l:1},
  '├':{u:1,d:1,r:1}, '┤':{u:1,d:1,l:1}, '┬':{l:1,r:1,d:1}, '┴':{l:1,r:1,u:1}, '┼':{u:1,d:1,l:1,r:1},
  '═':{l:2,r:2}, '║':{u:2,d:2}, '╔':{r:2,d:2}, '╗':{l:2,d:2}, '╚':{u:2,r:2}, '╝':{u:2,l:2},
  '╠':{u:2,d:2,r:2}, '╣':{u:2,d:2,l:2}, '╦':{l:2,r:2,d:2}, '╩':{l:2,r:2,u:2}, '╬':{u:2,d:2,l:2,r:2}
};
function drawBox(g,b,W,H){
  var lw=Math.max(1,Math.round(W/8));
  var cx=Math.floor(W/2), cy=Math.floor(H/2);
  var dbl = b.u===2||b.d===2||b.l===2||b.r===2;
  if (!dbl){
    var x0=cx-Math.floor(lw/2), y0=cy-Math.floor(lw/2);
    if (b.l) g.fillRect(0,y0,x0+lw,lw);
    if (b.r) g.fillRect(x0,y0,W-x0,lw);
    if (b.u) g.fillRect(x0,0,lw,y0+lw);
    if (b.d) g.fillRect(x0,y0,lw,H-y0);
    return;
  }
  var Ty=cy-Math.floor(lw/2)-lw, By=cy-Math.floor(lw/2)+lw;
  var Lx=cx-Math.floor(lw/2)-lw, Rx=cx-Math.floor(lw/2)+lw;
  function Hl(y,xa,xb){ g.fillRect(xa,y,xb-xa,lw); }
  function Vl(x,ya,yb){ g.fillRect(x,ya,lw,yb-ya); }
  var L=b.l,R=b.r,U=b.u,D=b.d;
  if (L&&R&&!U&&!D){ Hl(Ty,0,W); Hl(By,0,W); return; }
  if (U&&D&&!L&&!R){ Vl(Lx,0,H); Vl(Rx,0,H); return; }
  if (R&&D&&!L&&!U){ Hl(Ty,Lx,W); Vl(Lx,Ty,H); Hl(By,Rx,W); Vl(Rx,By,H); return; }
  if (L&&D&&!R&&!U){ Hl(Ty,0,Rx+lw); Vl(Rx,Ty,H); Hl(By,0,Lx+lw); Vl(Lx,By,H); return; }
  if (U&&R&&!L&&!D){ Hl(By,Lx,W); Vl(Lx,0,By+lw); Hl(Ty,Rx,W); Vl(Rx,0,Ty+lw); return; }
  if (U&&L&&!R&&!D){ Hl(By,0,Rx+lw); Vl(Rx,0,By+lw); Hl(Ty,0,Lx+lw); Vl(Lx,0,Ty+lw); return; }
  if (U&&D&&R&&!L){ Vl(Lx,0,H); Vl(Rx,0,Ty+lw); Vl(Rx,By,H); Hl(Ty,Rx,W); Hl(By,Rx,W); return; }
  if (U&&D&&L&&!R){ Vl(Rx,0,H); Vl(Lx,0,Ty+lw); Vl(Lx,By,H); Hl(Ty,0,Lx+lw); Hl(By,0,Lx+lw); return; }
  if (L&&R&&D&&!U){ Hl(Ty,0,W); Hl(By,0,Lx+lw); Hl(By,Rx,W); Vl(Lx,By,H); Vl(Rx,By,H); return; }
  if (L&&R&&U&&!D){ Hl(By,0,W); Hl(Ty,0,Lx+lw); Hl(Ty,Rx,W); Vl(Lx,0,Ty+lw); Vl(Rx,0,Ty+lw); return; }
  Hl(Ty,0,Lx+lw); Hl(Ty,Rx,W); Hl(By,0,Lx+lw); Hl(By,Rx,W);
  Vl(Lx,0,Ty+lw); Vl(Lx,By,H); Vl(Rx,0,Ty+lw); Vl(Rx,By,H);
}
function shade(g,chr,W,H){
  var px=W/8, py=H/16;
  for (var y=0;y<16;y++) for (var x=0;x<8;x++){
    var on;
    if (chr==='▒') on = ((x+y)&1)===0;
    else { var a = (y&1)===0 ? (x&3)===0 : (x&3)===2; on = chr==='░' ? a : !a; }
    if (!on) continue;
    var x0=Math.round(x*px), x1=Math.round((x+1)*px), y0=Math.round(y*py), y1=Math.round((y+1)*py);
    g.fillRect(x0,y0,x1-x0,y1-y0);
  }
}
// a few 8x16 bitmaps straight out of the VGA font (plus two birds), crisp at any zoom
var BITS = {
  '·':'00000000000000181800000000000000',
  '*':'0000000000663cff3c66000000000000',
  '+':'000000000018187e1818000000000000',
  '~':'00000000000076dc0000000000000000',
  '≈':'000000000076dc0076dc000000000000',
  '°':'00386c6c380000000000000000000000',
  '♪':'00003f333f3030303070f0e000000000',
  '♫':'00007f637f6363636367e7e6c0000000',
  '☼':'0000001818db3ce73cdb181800000000',
  '♦':'0000000010387cfe7c38100000000000',
  '►':'000080c0e0f0f8fef8f0e0c080000000',
  'v':'00000000000081c3663c180000000000',
  '^':'000000000000183c66c3810000000000'
};
function drawBits(g,hex,W,H){
  for (var y=0;y<16;y++){
    var v=parseInt(hex.substr(y*2,2),16); if (!v) continue;
    var y0=Math.round(y*H/16), y1=Math.round((y+1)*H/16);
    for (var x=0;x<8;x++) if (v&(128>>x)){ var x0=Math.round(x*W/8), x1=Math.round((x+1)*W/8); g.fillRect(x0,y0,x1-x0,y1-y0); }
  }
}
function drawGlyph(g,chr,W,H,fpx){
  var cx=Math.floor(W/2), cy=Math.floor(H/2);
  switch(chr){
    case ' ': return;
    case '█': g.fillRect(0,0,W,H); return;
    case '▀': g.fillRect(0,0,W,cy); return;
    case '▄': g.fillRect(0,cy,W,H-cy); return;
    case '▌': g.fillRect(0,0,cx,H); return;
    case '▐': g.fillRect(cx,0,W-cx,H); return;
    case '░': case '▒': case '▓': shade(g,chr,W,H); return;
  }
  var b=BOX[chr]; if (b){ drawBox(g,b,W,H); return; }
  var bits=BITS[chr]; if (bits){ drawBits(g,bits,W,H); return; }
  g.font=fpx+'px '+FONT; g.textAlign='center'; g.textBaseline='middle';
  g.fillText(chr,W/2,H/2+1);
}
function fitFont(W,H){
  var g=document.createElement('canvas').getContext('2d');
  var fs=H*0.9; g.font=fs+'px '+FONT;
  var w=Math.max(g.measureText('W').width, g.measureText('Θ').width);
  if (w>W*0.95) fs*=(W*0.95)/w;
  return Math.max(6,Math.floor(fs));
}
// tile cache for one cell size: every char|fg|bg is drawn once into a small canvas
function makeTiles(W,H){
  var cache={}, fpx=fitFont(W,H);
  var f=function(chr,fg,bg){
    var key=chr+'|'+fg+'|'+(bg||''), t=cache[key];
    if (t) return t;
    t=document.createElement('canvas'); t.width=W; t.height=H;
    var g=t.getContext('2d');
    if (bg){ g.fillStyle=bg; g.fillRect(0,0,W,H); }
    g.fillStyle=fg; drawGlyph(g,chr,W,H,fpx);
    cache[key]=t; return t;
  };
  f.fpx=fpx; return f;
}
var CW=8, CH=16;                       // base cell: the VGA 8x16, one art pixel = 8x8
var btile = makeTiles(CW,CH);

/* --------------------------- the world ---------------------------- */
// title on top, three framed panels, labels below; 144 rows always, the width follows the
// panels. art pixels are half blocks. a wing is `wing` art pixels wide inside its frame, the
// centre exactly two wings with their frames, so the shut wings cover it.
var WC=0, WR=144, WX=0, WY=0, WBX=0, WBY=0;
var TOP=16, PROWS=122;                 // first frame row and panel height (with frames)
var PANELS=null, PL=null, PC=null, PR=null;
var TITLE=null, TITLE_ROW=2, TITLE_COL=0;
var WORLD=null, DOORS=null, STAT=null;
function triptychWorld(o){
  var ww=o.wing+4;                                     // a wing with its frame, in cells
  WC=8+4*ww+8; WX=WC; WY=WR*2; WBX=WC*CW; WBY=WR*CH;
  PANELS={ L:{c0:8,w:ww}, C:{c0:8+ww,w:2*ww}, R:{c0:8+3*ww,w:ww} };
  for (var k in PANELS){ var p=PANELS[k]; p.x=p.c0+2; p.y=(TOP+1)*2; p.iw=p.w-4; p.ih=(PROWS-2)*2; }
  PL=PANELS.L; PC=PANELS.C; PR=PANELS.R;
  TITLE=logoRows(o.title); TITLE_COL=(WC-TITLE[0].length)>>1;
  WORLD=Buf(WX,WY); DOORS=Buf(PC.w,PROWS*2); STAT=new Array(WX*WY);
}


function RNG(seed){ return function(){ seed=seed+0x6D2B79F5|0; var t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function hash(x,y){ var h=Math.imul(x|0,374761393)+Math.imul(y|0,668265263)|0; h=Math.imul(h^h>>>13,1274126177); return ((h^h>>>16)>>>0)/4294967296; }
function vnoise(x,y){
  var xi=Math.floor(x), yi=Math.floor(y), fx=x-xi, fy=y-yi;
  fx=fx*fx*(3-2*fx); fy=fy*fy*(3-2*fy);
  var a=hash(xi,yi), b=hash(xi+1,yi), c=hash(xi,yi+1), d=hash(xi+1,yi+1);
  return a+(b-a)*fx+(c-a)*fy+(a-b-c+d)*fx*fy;
}
function fbm(x,y){ return vnoise(x,y)*0.55+vnoise(x*2.1+7,y*2.1+3)*0.3+vnoise(x*4.3+1,y*4.3+9)*0.15; }
function clamp(v,a,b){ return v<a?a:v>b?b:v; }

/* -------------------------- tiny painter -------------------------- */
// a buffer holds one "ink" per art pixel: a palette char ('g') or a dither of two
// palette chars and a level ('gG2' = g with G dots, ▒). two pixels stacked make a cell:
// equal dithers become ░▒▓, anything else a half block ▀ with two colours.
function Buf(w,h){ return { w:w, h:h, px:new Array(w*h), gl:new Array(w*(h>>1)) }; }
var cur=null, OX=0, OY=0, CLX=0, CLY=0, CRX=0, CRY=0;
function target(b){ cur=b; OX=0; OY=0; CLX=0; CLY=0; CRX=b.w; CRY=b.h; }
function panel(x,y,w,h){ OX=x; OY=y; CLX=x; CLY=y; CRX=x+w; CRY=y+h; }
function P(x,y,k){
  x=Math.round(x); y=Math.round(y);
  var X=x+OX, Y=y+OY;
  if (X<CLX||X>=CRX||Y<CLY||Y>=CRY) return;
  if (typeof k==='function'){ k=k(x,y); if (!k) return; }
  cur.px[Y*cur.w+X]=k;
}
function get(x,y){ var X=x+OX, Y=y+OY; if (X<0||Y<0||X>=cur.w||Y>=cur.h) return null; return cur.px[Y*cur.w+X]||null; }
function glc(r,c,ch,fg,bg){ if (r<0||c<0||c>=cur.w||r>=(cur.h>>1)) return; cur.gl[r*cur.w+c]={ch:ch,fg:fg,bg:bg}; }
function dom(k){ return k.length===1 ? k : (k.charCodeAt(2)>=51 ? k[1] : k[0]); }
var SHADE={'1':'░','2':'▒','3':'▓'};
function rampInk(ramp,t){
  t=t<0?0:t>1?1:t;
  var steps=(ramp.length-1)*4, s=Math.round(t*steps), i=s>>2, l=s&3;
  return l ? ramp[i]+ramp[i+1]+l : ramp[i];
}
function rect(x,y,w,h,k){ for (var j=y;j<y+h;j++) for (var i=x;i<x+w;i++) P(i,j,k); }
function ell(cx,cy,rx,ry,k){
  for (var j=Math.floor(cy-ry); j<=Math.ceil(cy+ry); j++) for (var i=Math.floor(cx-rx); i<=Math.ceil(cx+rx); i++){
    var dx=(i-cx)/rx, dy=(j-cy)/ry; if (dx*dx+dy*dy<=1) P(i,j,k);
  }
}
function ring(cx,cy,r,w,k){
  for (var j=Math.floor(cy-r-1); j<=Math.ceil(cy+r+1); j++) for (var i=Math.floor(cx-r-1); i<=Math.ceil(cx+r+1); i++){
    var d=Math.sqrt((i-cx)*(i-cx)+(j-cy)*(j-cy)); if (Math.abs(d-r)<=w) P(i,j,k);
  }
}
function poly(pts,k){
  var n=pts.length/2, ymin=1e9, ymax=-1e9, i;
  for (i=0;i<n;i++){ ymin=Math.min(ymin,pts[2*i+1]); ymax=Math.max(ymax,pts[2*i+1]); }
  for (var y=Math.floor(ymin); y<=Math.ceil(ymax); y++){
    var yc=y+0.5, xs=[];
    for (var a=0;a<n;a++){
      var b=(a+1)%n, x0=pts[2*a], y0=pts[2*a+1], x1=pts[2*b], y1=pts[2*b+1];
      if ((y0<=yc&&y1>yc)||(y1<=yc&&y0>yc)) xs.push(x0+(yc-y0)/(y1-y0)*(x1-x0));
    }
    xs.sort(function(p,q){ return p-q; });
    for (var s=0;s+1<xs.length;s+=2) for (var x=Math.ceil(xs[s]-0.5); x<=Math.floor(xs[s+1]-0.5); x++) P(x,y,k);
  }
}
function line(x0,y0,x1,y1,k){
  x0=Math.round(x0); y0=Math.round(y0); x1=Math.round(x1); y1=Math.round(y1);
  var dx=Math.abs(x1-x0), dy=-Math.abs(y1-y0), sx=x0<x1?1:-1, sy=y0<y1?1:-1, e=dx+dy;
  for (;;){ P(x0,y0,k); if (x0===x1&&y0===y1) break; var e2=2*e; if (e2>=dy){ e+=dy; x0+=sx; } if (e2<=dx){ e+=dx; y0+=sy; } }
}
function path(pts,k){ for (var i=0;i+3<pts.length;i+=2) line(pts[i],pts[i+1],pts[i+2],pts[i+3],k); }
// a capsule: thick line with round ends
function limb(x0,y0,x1,y1,r,k){
  var minx=Math.floor(Math.min(x0,x1)-r), maxx=Math.ceil(Math.max(x0,x1)+r);
  var miny=Math.floor(Math.min(y0,y1)-r), maxy=Math.ceil(Math.max(y0,y1)+r);
  var dx=x1-x0, dy=y1-y0, L=dx*dx+dy*dy||1;
  for (var j=miny;j<=maxy;j++) for (var i=minx;i<=maxx;i++){
    var t=((i-x0)*dx+(j-y0)*dy)/L; t=t<0?0:t>1?1:t;
    var ex=x0+t*dx-i, ey=y0+t*dy-j;
    if (ex*ex+ey*ey<=r*r) P(i,j,k);
  }
}
// sprite from strings, '.' is transparent; map recolours chars
function spr(x,y,rows,flip,map){
  for (var j=0;j<rows.length;j++){
    var s=rows[j];
    for (var i=0;i<s.length;i++){
      var ch=s[flip ? s.length-1-i : i];
      if (ch==='.'||ch===' ') continue;
      P(x+i,y+j,(map&&map[ch])||ch);
    }
  }
}
// inks: vertical gradient stepped per text row (so ░▒▓ line up), horizontal gradient,
// a lit ellipsoid, noise textures and a see-through tint
function vg(ramp,y0,y1){ return function(x,y){ var yc=((OY+y)&~1)-OY+0.5; return rampInk(ramp,(yc-y0)/(y1-y0)); }; }
function hg(ramp,x0,x1){ return function(x){ return rampInk(ramp,(x-x0)/(x1-x0)); }; }
function lit(cx,cy,rx,ry,ramp,bias){
  bias=bias||0;
  return function(x,y){
    var yc=((OY+y)&~1)-OY+0.5, nx=(x-cx)/rx, ny=(yc-cy)/ry, d=nx*nx+ny*ny; if (d>1) d=1;
    var l=-0.55*nx-0.55*ny+0.63*Math.sqrt(1-d);
    return rampInk(ramp, l*0.85+0.2+bias);
  };
}
function ball(cx,cy,r,ramp,bias){ ell(cx,cy,r,r,lit(cx,cy,r,r,ramp,bias)); }
function egg(cx,cy,rx,ry,ramp,bias){ ell(cx,cy,rx,ry,lit(cx,cy,rx,ry,ramp,bias)); }
function tex(ramp,sx,sy,bias,amp){ return function(x,y){ return rampInk(ramp, bias+amp*(fbm((x+OX)*sx,(y+OY)*sy)-0.5)); }; }
function tint(dot,lvl){ return function(x,y){ var k=get(x,y); return k ? dom(k)+dot+lvl : dot; }; }
function speck(R,x,y,w,h,n,k){ for (var i=0;i<n;i++) P(x+Math.floor(R()*w), y+Math.floor(R()*h), typeof k==='string'&&k.length>1&&k.length!==3 ? k[Math.floor(R()*k.length)] : k); }

/* --------------------------- tiny people -------------------------- */
// a nude 4 px wide, 10 tall; feet on row y, left leg in column x.
// pose 0 arms down, 1 arms up, 2 one arm up, 3 walking
function nude(x,y,pose,dir,sk,hair,longHair){
  var s=sk||'f', d=s==='q'?'N':'F', h=hair||'h';
  if (pose===3){ P(x-1,y,s); P(x,y-1,s); P(x,y-2,s); P(x+2,y,d); P(x+1,y-1,d); P(x+1,y-2,d); P(x,y-3,s); P(x+1,y-3,d); }
  else { rect(x,y-3,1,4,s); rect(x+1,y-3,1,4,d); }
  rect(x,y-7,1,4,s); rect(x+1,y-7,1,4,d);
  P(x,y-8,s); P(x+1,y-8,s); P(x,y-9,h); P(x+1,y-9,h);
  P(dir>0?x:x+1, y-8, h);
  if (pose===1){ rect(x-1,y-10,1,4,s); rect(x+2,y-10,1,4,d); }
  else if (pose===2){ if (dir>0){ rect(x+2,y-10,1,4,d); rect(x-1,y-7,1,3,s); } else { rect(x-1,y-10,1,4,s); rect(x+2,y-7,1,3,d); } }
  else { rect(x-1,y-7,1,3,s); rect(x+2,y-7,1,3,d); }
  if (longHair) rect(dir>0?x:x+1, y-7, 1, 3, h);
}
// sitting on the ground facing dir, hips at (x,y)
function sitter(x,y,dir,sk,hair){
  var s=sk||'f', d=s==='q'?'N':'F', h=hair||'h';
  rect(x,y-4,1,4,s); rect(x+1,y-4,1,4,d);
  P(x,y-5,s); P(x+1,y-5,s); P(x,y-6,h); P(x+1,y-6,h); P(dir>0?x:x+1,y-5,h);
  var fx = dir>0 ? x+2 : x-4;
  rect(fx,y,4,1,d); P(dir>0?x+3:x-2,y-1,s);
  P(dir>0?x+2:x-1,y-3,s); P(dir>0?x+3:x-2,y-2,s);
}
// lying on the ground, head towards dir
function lier(x,y,dir,sk,hair){
  var s=sk||'f', d=s==='q'?'N':'F', h=hair||'h';
  var hx = dir<0 ? x : x+9;
  P(hx,y-1,h); P(hx+(dir<0?1:-1),y-1,h); P(hx,y,s); P(hx+(dir<0?1:-1),y,s);
  var b0 = dir<0 ? x+2 : x+3;
  rect(b0,y-1,5,1,s); rect(b0,y,5,1,d);
  var l0 = dir<0 ? x+7 : x;
  rect(l0,y,3,1,d); P(dir<0?l0+2:l0,y-1,s);
}
function legsUp(x,y,sk){ var s=sk||'f', d=s==='q'?'N':'F'; rect(x,y-5,1,5,s); rect(x+2,y-5,1,5,d); P(x-1,y-5,s); P(x+3,y-5,d); rect(x,y,3,1,'W'); }
function swimmer(x,y,sk,hair){ var s=sk||'f'; P(x,y-1,hair||'h'); P(x+1,y-1,hair||'h'); P(x,y,s); P(x+1,y,s); P(x-1,y,'a'); P(x+2,y,'a'); }
// man-sized fruit and berries
function strawberry(cx,cy,r){
  ell(cx,cy,r,r*1.15,lit(cx,cy,r,r*1.15,['R','r','z','o']));
  for (var j=Math.floor(cy-r*1.1); j<=cy+r*1.1; j++) for (var i=Math.floor(cx-r); i<=cx+r; i++){
    var dx=(i-cx)/r, dy=(j-cy)/(r*1.15);
    if (dx*dx+dy*dy<0.8 && ((i*3+j*5)%7+7)%7===0) P(i,j,(i+j)&1?'y':'s');
  }
  var ty=Math.round(cy-r*1.15);
  for (var a=0;a<5;a++){ var an=Math.PI*(1.05+a*0.225); line(cx,ty+1,cx+Math.cos(an)*r*0.7,ty+1-Math.sin(an)*r*0.35,'d'); }
  line(cx,ty,cx+1,ty-3,'D');
}
function berries(cx,cy,r,ramp,R){
  for (var i=0;i<r*r*1.4;i++){
    var a=R()*6.283, d=Math.sqrt(R())*r*0.85;
    ball(cx+Math.cos(a)*d, cy+Math.sin(a)*d*0.95, 1.3, ramp);
  }
}
function cherries(cx,cy){ ball(cx-3,cy,3.2,['R','r','z','k']); ball(cx+3,cy+1,3.2,['R','r','z','k']); line(cx-3,cy-3,cx,cy-8,'d'); line(cx+3,cy-2,cx,cy-8,'d'); P(cx+1,cy-8,'g'); }

// a clothed figure the size of nude(): o.c robe, o.d its shade, o.sk skin, o.hair, o.pose
// (0 arms down, 1 arms up, 2 praying, 3 one arm out in front), o.hat: hood, wimple (a nun),
// tiara (the pope), crown, hat, cap, helmet, turban, tall; o.hc hat colour
function robed(x,y,dir,o){
  o=o||{};
  var c=o.c||'n', d=o.d||'N', s=o.sk||'f', h=o.hair||'h', f=dir>0?1:-1;
  var fx=dir>0?x+2:x-1, bx=dir>0?x-1:x+2, fc=dir>0?d:c, bc=dir>0?c:d;
  rect(x,y-7,1,8,c); rect(x+1,y-7,1,8,d);
  P(x-1,y-7,c); P(x+2,y-7,d);
  P(x-1,y-2,c); P(x-1,y-1,c); P(x-1,y,c); P(x+2,y-2,d); P(x+2,y-1,d); P(x+2,y,d);
  P(x,y-8,s); P(x+1,y-8,s); P(x,y-9,h); P(x+1,y-9,h); P(dir>0?x:x+1,y-8,h);
  var pose=o.pose||0;
  if (pose===1){ rect(x-1,y-10,1,3,c); rect(x+2,y-10,1,3,d); P(x-1,y-11,s); P(x+2,y-11,s); }
  else if (pose===2){ rect(bx,y-6,1,2,bc); P(fx,y-6,fc); P(fx+f,y-7,s); }
  else if (pose===3){ rect(bx,y-6,1,3,bc); P(fx,y-6,fc); P(fx+f,y-6,fc); P(fx+2*f,y-6,s); }
  else { rect(x-1,y-6,1,3,c); rect(x+2,y-6,1,3,d); P(x-1,y-3,s); P(x+2,y-3,s); }
  var hat=o.hat, hc=o.hc||c;
  if (hat==='hood'||hat==='wimple'){ var vc = hat==='wimple' ? '2' : hc; rect(x,y-10,2,1,vc); P(x-1,y-9,vc); P(x+2,y-9,vc); P(x,y-9,vc); P(x+1,y-9,vc); P(dir>0?x:x+1,y-8,vc); P(dir>0?x-1:x+2,y-8,vc); if (hat==='wimple'){ P(x,y-7,'9'); P(x+1,y-7,'9'); } }
  else if (hat==='tiara'){ rect(x,y-10,2,1,'9'); rect(x,y-11,2,1,'S'); rect(x,y-12,2,1,'9'); P(x,y-13,'S'); P(x+1,y-13,'S'); }
  else if (hat==='crown'){ rect(x-1,y-10,4,1,'S'); P(x-1,y-11,'S'); P(x+2,y-11,'S'); P(x,y-11,'y'); }
  else if (hat==='hat'){ rect(x-1,y-10,4,1,hc); rect(x,y-11,2,1,hc); }
  else if (hat==='cap'){ rect(x,y-10,2,1,hc); }
  else if (hat==='helmet'){ rect(x-1,y-10,4,1,'6'); rect(x,y-11,2,1,'7'); P(dir>0?x:x+1,y-8,'5'); P(dir>0?x-1:x+2,y-9,'6'); }
  else if (hat==='turban'){ rect(x-1,y-11,4,2,hc); P(x,y-12,hc); }
  else if (hat==='tall'){ rect(x,y-13,2,4,hc); rect(x-1,y-10,4,1,hc); }
}
// a bigger nude, about 22 px tall, feet round (x,y): o.arm down, reach, up, cover, bless;
// o.long for long hair
function bigNude(x,y,dir,o){
  o=o||{};
  var s=o.sk||'f', d=o.d||'F', h=o.hair||'h', f=dir>0?1:-1;
  limb(x-1,y,x-1,y-9,1.1,s); limb(x+1,y,x+1,y-9,1.1,d);
  limb(x,y-10,x,y-17,2,s); line(x+f,y-16,x+f,y-11,d);
  ell(x+f*0.3,y-20,2.2,2.6,s);
  if (o.long) limb(x-f,y-22,x-f*1.6,y-12,1.3,h); else ell(x-f*0.4,y-21.6,2.1,1.3,h);
  var arm=o.arm||'down';
  if (arm==='reach'){ limb(x+f*2,y-16,x+f*6,y-21,0.8,s); limb(x-f*2,y-16,x-f*3,y-9,0.8,d); }
  else if (arm==='up'){ limb(x+f*2,y-16,x+f*4,y-24,0.8,s); limb(x-f*2,y-16,x-f*4,y-24,0.8,d); }
  else if (arm==='cover'){ limb(x+f*2,y-16,x+f*1,y-11,0.8,s); limb(x-f*2,y-16,x+f*0,y-18,0.8,d); }
  else if (arm==='bless'){ limb(x+f*2,y-16,x+f*5,y-18,0.8,s); P(x+f*5,y-20,s); limb(x-f*2,y-16,x-f*3,y-9,0.8,d); }
  else { limb(x-2,y-16,x-3,y-9,0.8,s); limb(x+2,y-16,x+3,y-9,0.8,d); }
}
// a big robed figure, about 24 px, feet round (x,y), robe c with folds d: god, an angel,
// christ; o.bless, o.sword, o.wings, o.beard, o.hair, o.sk skin, o.halo colour (or false)
function bigRobe(x,y,dir,c,d,o){
  o=o||{}; var f=dir>0?1:-1, s=o.sk||'f';
  poly([x-3,y-18, x+3,y-18, x+6,y, x-6,y], function(px){ return (px-x)%3===0 ? d : c; });
  ell(x+f*0.4,y-21,2.3,2.7,s); ell(x-f*0.4,y-22.6,2.3,1.3,o.hair||'H');
  if (o.beard){ rect(x-1+f,y-19,2,2,o.hair||'H'); }
  if (o.bless){ limb(x+f*3,y-16,x+f*6,y-21,1,c); P(x+f*6,y-23,s); P(x+f*7,y-22,s); limb(x-f*3,y-16,x-f*4,y-9,1,d); }
  else if (o.sword){ limb(x+f*3,y-16,x+f*7,y-19,1,c); line(x+f*7,y-19,x+f*9,y-30,'8'); line(x+f*6,y-19,x+f*8,y-19,'S'); limb(x-f*3,y-16,x-f*4,y-9,1,d); }
  else { limb(x-3,y-16,x-4,y-9,1,c); limb(x+3,y-16,x+4,y-9,1,d); }
  if (o.wings){ poly([x-f*2,y-17, x-f*9,y-27, x-f*10,y-18, x-f*4,y-12], function(px,py){ return (px+py)%3===0 ? '7' : 'k'; }); }
  if (o.halo!==false) ring(x+f*0.4,y-21,3.6,0.45,o.halo||'S');
}
// a little devil, feet at y: o.kind horn, bird, fish, rat; o.c body, o.d shade; o.wings
function demon(x,y,dir,o){
  o=o||{};
  var c=o.c||'i', d=o.d||'I', k=o.kind||'horn', f=dir>0?1:-1;
  line(x,y,x,y-2,c); line(x+2,y,x+2,y-2,d);
  egg(x+1,y-4.5,2,2.4,[c,d]);
  var hx=x+1+f, hy=y-8;
  if (k==='fish'){ ell(hx+f,hy,2.6,1.6,'W'); P(hx+f*3,hy+1,'R'); P(hx+f*2,hy-1,'0'); P(hx-f*2,hy-1,'W'); }
  else { ball(hx,hy,1.6,[c,d]); P(hx+f,hy,'y'); }
  if (k==='horn'){ P(hx-1,hy-2,d); P(hx+1,hy-2,d); }
  if (k==='bird'){ line(hx+f*2,hy,hx+f*4,hy+1,'S'); P(hx,hy-2,d); }
  if (k==='rat'){ line(hx+f*2,hy+1,hx+f*3,hy+1,'k'); P(hx-f,hy-2,'k'); }
  line(x+1-f*2,y-4,x+1-f*4,y-1,d); P(x+1-f*4,y-2,d);
  if (o.wings){ path([x+1-f,y-6, x+1-f*4,y-10, x+1-f*6,y-8],d); P(x+1-f*5,y-7,d); }
}

/* -------------------------- frames & logo ------------------------- */
function frameAt(c0,r0,cols,rows){
  var gold=K.S, wood=K.u;
  for (var c=c0;c<c0+cols;c++){
    var top = c===c0||c===c0+cols-1 ? '█' : c===c0+1 ? '╔' : c===c0+cols-2 ? '╗' : '═';
    var bot = c===c0||c===c0+cols-1 ? '█' : c===c0+1 ? '╚' : c===c0+cols-2 ? '╝' : '═';
    glc(r0,c,top,top==='█'?wood:gold,wood); glc(r0+rows-1,c,bot,bot==='█'?wood:gold,wood);
  }
  for (var r=r0+1;r<r0+rows-1;r++){ glc(r,c0,'█',wood,wood); glc(r,c0+1,'║',gold,wood); glc(r,c0+cols-2,'║',gold,wood); glc(r,c0+cols-1,'█',wood,wood); }
}
// the title in lowercase ANSI Shadow, same letters and colours as the main page logo
function shadow(mask){
  var h=mask.length, w=mask[0].length, out=[];
  function S(r,c){ return r>=0&&r<h&&c>=0&&c<w&&mask[r][c]==='#'; }
  for (var r=0;r<h;r++){
    var ln='';
    for (var c=0;c<=w;c++){
      if (S(r,c)){ ln+='█'; continue; }
      var up=S(r-1,c-1)&&!S(r-1,c), left=S(r-1,c-1)&&!S(r,c-1), down=S(r,c-1), right=S(r-1,c), ch=' ';
      if (up&&left) ch='╝'; else if (down&&right) ch='╔'; else if (up&&down) ch='║'; else if (left&&right) ch='═'; else if (down) ch='╗'; else if (right) ch='╚';
      ln+=ch;
    }
    out.push(ln);
  }
  return out;
}
var MASKS = {
  a:{2:'.#####.',3:'.....##',4:'.######',5:'##...##',6:'.######'},
  d:{0:'.....##',1:'.....##',2:'.######',3:'##...##',4:'##...##',5:'##...##',6:'.######'},
  e:{2:'.#####.',3:'##...##',4:'#######',5:'##.....',6:'.#####.'},
  t:{0:'.##...',1:'.##...',2:'######',3:'.##...',4:'.##...',5:'.##...',6:'..####'},
  g:{2:'.######',3:'##...##',4:'##...##',5:'##...##',6:'.######',7:'.....##',8:'.#####.'},
  r:{2:'######.',3:'##...##',4:'##.....',5:'##.....',6:'##.....'},
  n:{2:'######.',3:'##...##',4:'##...##',5:'##...##',6:'##...##'},
  o:{2:'.#####.',3:'##...##',4:'##...##',5:'##...##',6:'.#####.'},
  f:{0:'..###',1:'.##..',2:'#####',3:'.##..',4:'.##..',5:'.##..',6:'.##..'},
  h:{0:'##.....',1:'##.....',2:'######.',3:'##...##',4:'##...##',5:'##...##',6:'##...##'},
  l:{0:'##..',1:'##..',2:'##..',3:'##..',4:'##..',5:'##..',6:'.###'},
  y:{2:'##...##',3:'##...##',4:'##...##',5:'##...##',6:'.######',7:'.....##',8:'.#####.'},
  i:{0:'##',2:'##',3:'##',4:'##',5:'##',6:'##'},
  s:{2:'.######',3:'##.....',4:'.#####.',5:'.....##',6:'######.'},
  m:{2:'########',3:'##.##.##',4:'##.##.##',5:'##.##.##',6:'##.##.##'},
  p:{2:'######.',3:'##...##',4:'##...##',5:'##...##',6:'######.',7:'##.....',8:'##.....'},
  w:{2:'##.##.##',3:'##.##.##',4:'##.##.##',5:'##.##.##',6:'########'},
  k:{0:'##.....',1:'##.....',2:'##...##',3:'##..##.',4:'#####..',5:'##..##.',6:'##...##'},
  c:{2:'.######',3:'##.....',4:'##.....',5:'##.....',6:'.######'},
  u:{2:'##...##',3:'##...##',4:'##...##',5:'##...##',6:'.######'},
  b:{0:'##.....',1:'##.....',2:'######.',3:'##...##',4:'##...##',5:'##...##',6:'######.'}
};
var LOGO_GRAD = ['#ffffff','#f8f8f8','#f0f0f0','#e4e4e4','#d6d6d6','#c6c6c6','#b6b6b6','#a6a6a6','#969696','#888888'];
var LOGO_SHADOW = '#2a2aa8';
function logoRows(word){
  var G={}, rows=[];
  for (var l in MASKS){ var m=MASKS[l], w=0; for (var q in m) w=m[q].length; var mk=[]; for (var r=0;r<10;r++) mk.push(m[r]||new Array(w+1).join('.')); G[l]=shadow(mk); }
  for (var r2=0;r2<10;r2++) rows.push(word.split('').map(function(ch){ return ch===' ' ? '   ' : G[ch][r2]; }).join(''));
  return rows;
}
/* --------------------------- build it all -------------------------- */
var worldCv=document.createElement('canvas'), doorCv=document.createElement('canvas');
function renderBuf(buf,cv){
  cv.width=buf.w*CW; cv.height=(buf.h>>1)*CH;
  var g=cv.getContext('2d');
  g.fillStyle='#000'; g.fillRect(0,0,cv.width,cv.height);
  for (var r=0;r<buf.h>>1;r++) for (var c=0;c<buf.w;c++){
    var t=buf.px[2*r*buf.w+c], b=buf.px[(2*r+1)*buf.w+c], o=buf.gl[r*buf.w+c], x=c*CW, y=r*CH;
    if (o){ g.drawImage(btile(o.ch,o.fg,o.bg||(b?K[dom(b)]:'#000')),x,y); continue; }
    if (!t&&!b) continue;
    if (t===b&&t.length===3){ g.drawImage(btile(SHADE[t[2]],K[t[1]],K[t[0]]),x,y); continue; }
    g.fillStyle=t?K[dom(t)]:'#000'; g.fillRect(x,y,CW,CH/2);
    g.fillStyle=b?K[dom(b)]:'#000'; g.fillRect(x,y+CH/2,CW,CH/2);
  }
}
// paint: {L, C, R, doors} of the page; each panel painter sets its own panel(),
// the doors painter gets the DOORS buffer (both wings side by side, frames go on top)
function buildWorld(paint){
  target(WORLD);
  paint.L(); paint.C(); paint.R();
  target(WORLD);
  frameAt(PL.c0,TOP,PL.w,PROWS); frameAt(PC.c0,TOP,PC.w,PROWS); frameAt(PR.c0,TOP,PR.w,PROWS);
  for (var r=0;r<TITLE.length;r++) for (var c=0;c<TITLE[r].length;c++){
    var ch=TITLE[r][c]; if (ch===' ') continue;
    glc(TITLE_ROW+r, TITLE_COL+c, ch, ch==='█' ? LOGO_GRAD[r] : LOGO_SHADOW, '#000');
  }
  renderBuf(WORLD,worldCv);
  for (var i=0;i<WX*WY;i++){
    var o=WORLD.gl[((i/WX|0)>>1)*WX+i%WX];
    STAT[i] = o ? (o.bg||'#000') : WORLD.px[i] ? K[dom(WORLD.px[i])] : null;
  }
  target(DOORS); panel(0,0,DOORS.w,DOORS.h);
  paint.doors();
  target(DOORS);
  frameAt(0,0,PL.w,PROWS); frameAt(PL.w,0,PL.w,PROWS);
  renderBuf(DOORS,doorCv);
  target(WORLD);
}

/* ---------------------------- screen ------------------------------ */
var scr=document.getElementById('scr'), ctx=scr.getContext('2d');
var VW=0, VH=0, dpr=1;
var zoom=1, zoomT=1, cam={x:0,y:0}, RX=0, RY=0;
var VX0=0, VY0=0, VX1=0, VY1=0;               // visible art pixels
function vis(p){ return p.x+p.iw>VX0 && p.x<VX1 && p.y+p.ih>VY0 && p.y<VY1; }
function cellRect(c,r,cols,rows){
  var X0=Math.round(c*CW*zoom)-RX, Y0=Math.round(r*CH*zoom)-RY;
  return [X0, Y0, Math.round((c+cols)*CW*zoom)-RX-X0, Math.round((r+rows)*CH*zoom)-RY-Y0];
}
// copy a block of cells of a source canvas onto the world position (dc,dr), visible part only
function blit(src,sc,sr,cols,rows,dc,dr){
  var c0=Math.max(dc,VX0), c1=Math.min(dc+cols,VX1), r0=Math.max(dr,VY0>>1), r1=Math.min(dr+rows,(VY1+1)>>1);
  if (c1<=c0||r1<=r0) return;
  var q=cellRect(c0,r0,c1-c0,r1-r0);
  ctx.drawImage(src,(sc+c0-dc)*CW,(sr+r0-dr)*CH,(c1-c0)*CW,(r1-r0)*CH,q[0],q[1],q[2],q[3]);
}

/* ------------------------- moving things -------------------------- */
// sprites move over the static picture pixel by pixel; every touched cell is redrawn as a
// ▀ half block, the other half taking the colour of the picture below, as a real text screen would
var DYN=new Map(), DCELL=new Map(), DGL=[];
function dp(x,y,col){ x=Math.round(x); y=Math.round(y); if (x<VX0||x>=VX1||y<VY0||y>=VY1) return; DYN.set(y*WX+x,col); }
function dspr(sp,x,y,flip){ x=Math.round(x); y=Math.round(y); var p=sp.p; for (var i=0;i<p.length;i+=3) dp(x+(flip?sp.w-1-p[i]:p[i]), y+p[i+1], p[i+2]); }
function dglyph(r,c,ch,fg){ if (c<VX0||c>=VX1||2*r+1<VY0||2*r>=VY1) return; DGL.push(r,c,ch,fg); }
function flushDyn(){
  DCELL.clear();
  DYN.forEach(function(col,key){ var y=(key/WX)|0, x=key-y*WX; DCELL.set((y>>1)*WX+x,1); });
  DCELL.forEach(function(v,ck){
    var r=(ck/WX)|0, c=ck-r*WX, kt=2*r*WX+c, kb=kt+WX;
    var T=DYN.get(kt)||STAT[kt]||'#000', B=DYN.get(kb)||STAT[kb]||'#000';
    var X0=Math.round(c*CW*zoom)-RX, X1=Math.round((c+1)*CW*zoom)-RX;
    var Y0=Math.round(r*CH*zoom)-RY, Ym=Math.round((r*CH+CH/2)*zoom)-RY, Y1=Math.round((r+1)*CH*zoom)-RY;
    ctx.fillStyle=T; ctx.fillRect(X0,Y0,X1-X0,Ym-Y0);
    ctx.fillStyle=B; ctx.fillRect(X0,Ym,X1-X0,Y1-Ym);
  });
  DYN.clear();
  for (var i=0;i<DGL.length;i+=4){ var q=cellRect(DGL[i+1],DGL[i],1,1); ctx.drawImage(btile(DGL[i+2],DGL[i+3],null),q[0],q[1],q[2],q[3]); }
  DGL.length=0;
}
function mkSpr(w,h,fn){
  var save=[cur,OX,OY,CLX,CLY,CRX,CRY], b=Buf(w,h), p=[];
  target(b); fn();
  for (var y=0;y<h;y++) for (var x=0;x<w;x++){ var k=b.px[y*w+x]; if (k) p.push(x,y,K[dom(k)]); }
  cur=save[0]; OX=save[1]; OY=save[2]; CLX=save[3]; CLY=save[4]; CRX=save[5]; CRY=save[6];
  return {w:w,h:h,p:p};
}
function rowsSpr(rows,map){ return mkSpr(rows[0].length,rows.length,function(){ spr(0,0,rows,false,map); }); }
var tick=0;
function dline(x0,y0,x1,y1,col){
  x0=Math.round(x0); y0=Math.round(y0); x1=Math.round(x1); y1=Math.round(y1);
  var dx=Math.abs(x1-x0), dy=-Math.abs(y1-y0), sx=x0<x1?1:-1, sy=y0<y1?1:-1, e=dx+dy;
  for (;;){ dp(x0,y0,col); if (x0===x1&&y0===y1) break; var e2=2*e; if (e2>=dy){ e+=dy; x0+=sx; } if (e2<=dx){ e+=dx; y0+=sy; } }
}
// particle systems a page can use; sources are panel-local [x, y, size]
// flames: ▓▒░ rising and cooling white, yellow, red, like the dragon's fire on the main page
function makeFire(p,src,rate){
  var parts=[];
  return {
    step:function(){
      for (var i=0;i<rate;i++){ var s=src[Math.floor(Math.random()*src.length)], b=s[2]||1;
        parts.push({x:s[0]+(Math.random()-0.5)*4*b, y:s[1], vx:(Math.random()-0.5)*0.3, vy:-(0.4+Math.random()*0.6)*b, life:0, max:(6+Math.random()*9)*b}); }
      for (var j=parts.length-1;j>=0;j--){ var f=parts[j]; f.x+=f.vx; f.y+=f.vy; f.vy*=0.97; if (++f.life>=f.max) parts.splice(j,1); }
    },
    draw:function(){
      for (var i=0;i<parts.length;i++){
        var q=parts[i], f=q.life/q.max, x=Math.round(p.x+q.x), y=Math.round(p.y+q.y);
        if (x<p.x||x>=p.x+p.iw||y<p.y) continue;
        dglyph(y>>1, x, f<0.35?'▓':f<0.7?'▒':'░', f<0.15?C(15):f<0.4?C(14):f<0.65?C(12):f<0.85?C(4):C(8));
      }
    }
  };
}
// smoke: grey ░▒ puffs drifting up and sideways
function makeSmoke(p,src,rate,wind){
  var parts=[]; wind=wind||0.15;
  return {
    step:function(){
      if (Math.random()<rate){ var s=src[Math.floor(Math.random()*src.length)]; parts.push({x:s[0]+(Math.random()-0.5)*4, y:s[1], life:0, max:40+Math.random()*40}); }
      for (var j=parts.length-1;j>=0;j--){ var q=parts[j]; q.x+=wind+(Math.random()-0.5)*0.3; q.y-=0.35; if (++q.life>=q.max) parts.splice(j,1); }
    },
    draw:function(){
      for (var i=0;i<parts.length;i++){
        var q=parts[i], f=q.life/q.max, x=Math.round(p.x+q.x), y=Math.round(p.y+q.y);
        if (x<p.x||x>=p.x+p.iw||y<p.y) continue;
        dglyph(y>>1, x, f<0.4?'▒':'░', f<0.6?K.I:K.i); if (f>0.3) dglyph(y>>1, x+1, '░', K.i);
      }
    }
  };
}
// music: ♪ and ♫ floating up from the players
function makeNotes(p,src,every,cols){
  var notes=[]; cols=cols||[K.s,K['6'],K.I];
  return {
    step:function(){
      if (tick%every===0){ var s=src[Math.floor(Math.random()*src.length)]; notes.push({x:s[0], y:s[1], life:0, ch:Math.random()<0.5?'♪':'♫'}); }
      for (var n=notes.length-1;n>=0;n--){ var q=notes[n]; q.y-=0.35; q.x+=Math.sin((q.life+n)*0.2)*0.4; if (++q.life>60) notes.splice(n,1); }
    },
    draw:function(){
      for (var i=0;i<notes.length;i++){ var q=notes[i], f=q.life/60; dglyph(Math.round(p.y+q.y)>>1, Math.round(p.x+q.x), q.ch, f<0.5?cols[0]:f<0.8?cols[1]:cols[2]); }
    }
  };
}

// water that glitters: a few cells of every pond flicker with ~ and ≈
var glitter=[];
function findWater(p,n,R){
  var tries=0;
  while (n>0 && tries++<5000){
    var x=p.x+Math.floor(R()*p.iw), y=p.y+Math.floor(R()*p.ih)&~1, k=WORLD.px[y*WX+x];
    if (k==='w'||k==='W'||k==='Ww1'||k==='Ww2'||k==='Ww3'||k==='wx1'||k==='wx2'){ glitter.push({r:y>>1,c:x,ph:R()*6.28,sp:0.05+R()*0.08,p:p}); n--; }
  }
}
function drawGlitter(p){
  for (var i=0;i<glitter.length;i++){
    var g=glitter[i]; if (g.p!==p) continue;
    var b=Math.sin(tick*g.sp+g.ph); if (b<0.55) continue;
    dglyph(g.r,g.c,b>0.85?'≈':'~',b>0.8?K.a:K.W);
  }
}

/* --- the wall: twinkling stars round the triptych --- */
var stars=[];
function placeStars(){
  for (var i=0;i<400 && stars.length<110;i++){
    var r=Math.floor(Math.random()*WR), c=Math.floor(Math.random()*WC);
    if (r>=TOP-1 && r<=TOP+PROWS && c>=PL.c0-1 && c<=PR.c0+PR.w) continue;
    if (r>=TITLE_ROW-1 && r<=TITLE_ROW+10 && c>=TITLE_COL-2 && c<=TITLE_COL+TITLE[0].length+1) continue;
    if (r===13 || r===139) continue;
    stars.push({r:r,c:c,ph:Math.random()*6.28,sp:0.04+Math.random()*0.08});
  }
}
function drawStars(){
  for (var i=0;i<stars.length;i++){ var s=stars[i], b=Math.sin(tick*s.sp+s.ph); if (b<-0.3) continue; dglyph(s.r,s.c,'·',b>0.6?C(7):C(8)); }
}

/* ------------------------- the shutters --------------------------- */
// door.a goes 0 (closed) .. 1 (open). each wing turns on its hinge towards the viewer:
// columns are squeezed by cos, the free edge grows with perspective
var door={a:0, to:0, hold:false};
function ease(t){ return t<0.5 ? 2*t*t : 1-2*(1-t)*(1-t); }
function drawDoor(side, th){
  var W=PL.w, D=620, c=Math.cos(th), s=Math.sin(th);
  var hinge = side>0 ? PC.c0 : PC.c0+PC.w;
  var dmax = W*c*D/(D-W*s);
  var k0=Math.floor(Math.min(0,dmax)), k1=Math.ceil(Math.max(0,dmax));
  var cyr = TOP+PROWS/2;
  for (var k=k0;k<k1;k++){
    var dc=k+0.5, u=dc*D/(W*(c*D+dc*s));
    if (!(u>=0&&u<=1)) continue;
    var j=Math.min(W-1,Math.floor(u*W)), f=D/(D-u*W*s), src, sx;
    if (c>0){ src=doorCv; sx = side>0 ? j : W+(W-1-j); }
    else { src=worldCv; sx = side>0 ? PL.c0+(W-1-j) : PR.c0+j; }
    var col = side>0 ? hinge+k : hinge-1-k;
    if (col<VX0-1||col>VX1) continue;
    var hr=PROWS*f/2;
    var X0=Math.round(col*CW*zoom)-RX, X1=Math.round((col+1)*CW*zoom)-RX;
    var Y0=Math.round((cyr-hr)*CH*zoom)-RY, Y1=Math.round((cyr+hr)*CH*zoom)-RY;
    ctx.drawImage(src, sx*CW, (c>0?0:TOP*CH), CW, PROWS*CH, X0, Y0, X1-X0, Y1-Y0);
    var dark=1-Math.abs(c);
    if (dark>0.15){
      var pat = dark>0.7 ? SHADEPAT[2] : dark>0.4 ? SHADEPAT[1] : SHADEPAT[0];
      if (pat.setTransform && window.DOMMatrix) pat.setTransform(new DOMMatrix([zoom,0,0,zoom,X0,Y0]));
      ctx.fillStyle=pat; ctx.fillRect(X0,Y0,X1-X0,Y1-Y0);
    }
  }
}
// the turning wings darken with black ░▒▓ laid over them
var SHADEPAT=['░','▒','▓'].map(function(ch){ return scr.getContext('2d').createPattern(btile(ch,'#000',null),'repeat'); });
function drawDoors(){
  var th=ease(door.a)*Math.PI;
  // black out where the open wings will hang
  var q=cellRect(PL.c0,TOP,PL.w,PROWS); ctx.fillStyle='#000'; ctx.fillRect(q[0],q[1],q[2],q[3]);
  q=cellRect(PR.c0,TOP,PR.w,PROWS); ctx.fillRect(q[0],q[1],q[2],q[3]);
  if (door.a===0){ blit(doorCv,0,0,PC.w,PROWS,PC.c0,TOP); return; }
  drawDoor(1,th); drawDoor(-1,th);
}

/* --------------------- labels drawn as real text ------------------ */
function vlen(s){ var n=0; for (var i=0;i<s.length;i++){ if (s[i]==='§'){ i += (s[i+1]==='#') ? 7 : 1; continue; } n++; } return n; }
function rep(ch,n){ return n>0 ? new Array(n+1).join(ch) : ''; }
function three(total,l,c,r){
  var ll=vlen(l), cl=vlen(c), rl=vlen(r), cs=Math.floor((total-cl)/2);
  return l + rep(' ', Math.max(1, cs-ll)) + c + rep(' ', Math.max(1, total-rl-(cs+cl))) + r;
}
function autoColor(ch){
  if ('█▀▄▌▐▓▒░'.indexOf(ch)>=0) return C(7);
  if (BOX[ch]) return C(8);
  if (ch>='A'&&ch<='Z') return C(15);
  if ('.:,'.indexOf(ch)>=0) return C(8);
  return C(7);
}
function parseText(s){
  var out=[], col=null;
  for (var i=0;i<s.length;i++){
    var ch=s[i];
    if (ch==='§'){ var n=s[i+1]; if (n==='-'){ col=null; i++; } else if (n==='#'){ col=s.substr(i+1,7); i+=7; } else { col=C(parseInt(n,16)); i++; } continue; }
    out.push({ch:ch, fg:col||autoColor(ch)});
  }
  return out;
}
function block(t){ return '§8░§7▒▓§f█ §f'+t+' §f█§7▓▒§8░'; }
function rule(t,w){ var mid=block('§-'+t), n=vlen(mid), left=(w-n-2)>>1; return '§8'+rep('─',left)+' '+mid+' §8'+rep('─',w-n-2-left); }
// byline [left block, middle, right block] under the title, labels {L,C,R,closed} under the
// panels, texts: more {r,c,s,when} of the page ('open', 'closed', 'shut' = only when closed)
var TEXTS=[];
function makeTexts(cfg){
  var lb=cfg.labels||{}, b=cfg.byline;
  TEXTS=[{ r:13, c:PL.c0, s:three(PR.c0+PR.w-PL.c0, block(b[0]), '§8- §7'+b[1]+' §8-', block(b[2])) }];
  if (lb.L) TEXTS.push({ r:139, c:PL.c0, s:rule(lb.L,PL.w), when:'open' });
  if (lb.C) TEXTS.push({ r:139, c:PC.c0, s:rule(lb.C,PC.w), when:'open' });
  if (lb.R) TEXTS.push({ r:139, c:PR.c0, s:rule(lb.R,PR.w), when:'open' });
  if (lb.closed) TEXTS.push({ r:139, c:PC.c0, s:rule(lb.closed,PC.w), when:'closed' });
  (cfg.texts||[]).forEach(function(t){ TEXTS.push(t); });
  TEXTS.forEach(function(t){ t.cells=parseText(t.s); });
}
var txtFont={w:0,h:0,px:10};
function drawTexts(){
  var w=Math.round(CW*zoom), h=Math.round(CH*zoom);
  if (h<9) return;                                          // too small to read anyway
  if (txtFont.w!==w||txtFont.h!==h){ txtFont={w:w,h:h,px:fitFont(w,h)}; }
  ctx.font=txtFont.px+'px '+FONT; ctx.textAlign='center'; ctx.textBaseline='middle';
  var state = door.a===1 ? 'open' : door.a===0 ? 'closed' : 'moving';
  for (var i=0;i<TEXTS.length;i++){
    var t=TEXTS[i];
    if (t.when==='open' && state!=='open') continue;
    if (t.when==='closed' && state!=='closed') continue;
    if (t.when==='shut' && state!=='closed') continue;
    if (2*t.r+1<VY0||2*t.r>VY1) continue;
    for (var j=0;j<t.cells.length;j++){
      var c=t.c+j, cell=t.cells[j]; if (c<VX0-1||c>VX1) continue;
      var q=cellRect(c,t.r,1,1);
      if (t.bg){ ctx.fillStyle=t.bg; ctx.fillRect(q[0],q[1],q[2],q[3]); }
      if (cell.ch===' ') continue;
      if ('█▀▄▌▐░▒▓'.indexOf(cell.ch)>=0||BOX[cell.ch]||BITS[cell.ch]) ctx.drawImage(btile(cell.ch,cell.fg,null),q[0],q[1],q[2],q[3]);
      else { ctx.fillStyle=cell.fg; ctx.fillText(cell.ch,q[0]+q[2]/2,q[1]+q[3]/2+1); }
    }
  }
}

/* ------------------------------ HUD ------------------------------- */
var hud={cw:8,ch:16,cols:80,tiles:null,top:document.createElement('canvas'),bot:document.createElement('canvas'),hotBack:false,hotWings:false,hotNav:-1,mm:null};
var SCROLL='', CUR=0, NAVLINKS=[];
// the scroller: the painting's name, how to fly, then the page's own lines
function makeScroll(lines){
  var all=['hiERONYMUS bOSCH - '+TRIPTYCHS[CUR].name, 'mOVE tHE mOUSE (oR dRAG) tO fLY oVER tHE pANELS',
           'tHE wHEEL (oR a pINCH) zOOMS iN aND oUT', 'sPACE oPENS aND cLOSES tHE wiNGS',
           'tHE tABS aT tHE tOP sWiTCH tHE tRiPTYCHS']
          .concat(lines||[], [WC+'x'+WR+' cHARACTERS, bECAUSE 80x25 wAS nOT eNOUGH']);
  SCROLL='   »»»   '+all.join('   »»»   ')+'   »»»   ';
}
// the menu between the triptychs sits in the middle of the top bar; real <a> over each name
function makeNav(){
  TRIPTYCHS.forEach(function(t,i){
    if (i===CUR){ NAVLINKS.push(null); return; }
    var a=document.createElement('a'); a.className='hud'; a.href=t.url; a.textContent=t.name;
    function on(){ hud.hotNav=i; tabs.off=true; renderHudTop(); dirty=true; } function off(){ if (hud.hotNav===i){ hud.hotNav=-1; renderHudTop(); dirty=true; } }
    a.addEventListener('mouseenter',on); a.addEventListener('focus',on); a.addEventListener('mouseleave',off); a.addEventListener('blur',off);
    document.body.appendChild(a); NAVLINKS.push(a);
  });
}
function hudTopH(){ return 3*hud.ch; }
function hudBotH(){ return 3*hud.ch; }
function layoutHud(){
  var css=clamp(window.innerWidth/110, 6, 11);
  hud.cw=Math.max(4,Math.round(css*dpr)); hud.ch=hud.cw*2;
  hud.cols=Math.floor(VW/hud.cw);
  hud.tiles=makeTiles(hud.cw,hud.ch);
  renderHudTop(); renderHudBottom();
  buildMinimap();
}
// forms of the top bar from the widest down: [tRiPTYCH: label, left block, right block,
// padding inside the tabs, gap between tabs, bare ends without ░▒▓█, room for ► tabs ◄]
var HUD_FORMS=[[1,'◄ empdata2k','',1,2,0,1], [0,'◄ empdata2k','',1,2,0,1], [0,'◄','wiNGS',1,1,0,1], [0,'◄','wiNGS',0,1,0,1], [0,'◄','wiNGS',0,1,1,0]];
function hudTexts(){
  // the menu of triptychs is a row of tabs: plates ▐ name ▌, the current one white, the others
  // grey, yellow under the mouse (the plates are painted in renderHudTop). the bar takes the
  // widest form whose tabs fit in the middle, else the widest that fits at all
  var total=hud.cols-2, wl = door.to===1 ? 'cLOSE tHE wiNGS' : 'oPEN tHE wiNGS';
  function hb(t,on){ return on ? '§8░§7▒▓§f█ §e'+t+' §f█§7▓▒§8░' : block(t); }
  function bare(t,on){ return (on?'§e':'§f')+t; }
  function build(F){
    var mk=F[5]?bare:hb, b={ l:mk(F[1],hud.hotBack), r:mk(F[2]||wl,hud.hotWings), pad:F[3], nav:[] };
    var gap=rep(' ',F[4]), c=F[0]?'§8tRiPTYCH: ':'', pos=F[0]?10:0;
    b.ac = F[6] ? pos : -1; if (F[6]){ c += '  '; pos += 2; }
    TRIPTYCHS.forEach(function(t,i){
      if (i){ c += gap; pos += gap.length; }
      b.nav.push({ at:pos+1+b.pad, len:t.short.length });
      var plate='▐'+rep(' ',b.pad)+t.short+rep(' ',b.pad)+'▌'; c += '§8'+plate; pos += plate.length;
    });
    b.ac2 = F[6] ? pos+1 : -1; if (F[6]) c += '  ';
    b.c=c; b.ll=vlen(b.l); b.rl=vlen(b.r); b.cl=vlen(c); b.cs=Math.floor((total-b.cl)/2);
    b.centred = b.cs>=b.ll+1 && b.cs+b.cl<=total-b.rl-1;
    b.fits = b.ll+b.cl+b.rl+2<=total;
    return b;
  }
  var forms=HUD_FORMS.map(build), b=null, f;
  for (f=0; f<forms.length && !b; f++) if (forms[f].centred) b=forms[f];
  for (f=0; f<forms.length && !b; f++) if (forms[f].fits) b=forms[f];
  if (!b) b=forms[forms.length-1];
  if (!b.centred) b.cs=b.ll+1;
  var line=' '+b.l+rep(' ',b.cs-b.ll)+b.c+rep(' ',Math.max(1,total-b.rl-b.cs-b.cl))+b.r;
  b.nav.forEach(function(n){ n.col = 1+b.cs+n.at; });
  return { line:line, l:b.l, r:b.r, nav:b.nav, pad:b.pad, arrows: b.ac<0 ? null : [1+b.cs+b.ac, 1+b.cs+b.ac2] };
}
function renderHudTop(){
  var cv=hud.top, cw=hud.cw, ch=hud.ch, cols=hud.cols;
  cv.width=VW; cv.height=3*ch;
  var g=cv.getContext('2d'); g.fillStyle='#000'; g.fillRect(0,0,cv.width,cv.height);
  var t=hudTexts(), cells=parseText(t.line), ox=Math.floor((VW-cols*cw)/2);
  hud.arrows=t.arrows;
  for (var c=0;c<cols;c++){
    g.drawImage(hud.tiles('▄',C(7)),ox+c*cw,0);
    g.drawImage(hud.tiles('▀',C(7)),ox+c*cw,2*ch);
    if (c>0 && c<cols-1 && cells[c] && cells[c].ch!==' ') g.drawImage(hud.tiles(cells[c].ch,cells[c].fg),ox+c*cw,ch);
  }
  // the tabs: a plate behind each name, rounded off by half blocks
  t.nav.forEach(function(n,i){
    var on=i===CUR, hot=hud.hotNav===i, plate = on ? C(15) : hot ? C(14) : C(8), ink = on||hot ? C(0) : C(15);
    g.fillStyle=plate; g.fillRect(ox+(n.col-t.pad)*cw, ch, (n.len+2*t.pad)*cw, ch);
    for (var k=0;k<n.len;k++) g.drawImage(hud.tiles(TRIPTYCHS[i].short[k],ink),ox+(n.col+k)*cw,ch);
    g.drawImage(hud.tiles('▐',plate,'#000'),ox+(n.col-t.pad-1)*cw,ch);
    g.drawImage(hud.tiles('▌',plate,'#000'),ox+(n.col+n.len+t.pad)*cw,ch);
  });
  // real links over the two end blocks and over the whole tab of each other triptych
  var u=cw/dpr, v=ch/dpr, lw=vlen(t.l), rw=vlen(t.r);
  place(document.getElementById('back'), ox/dpr+1*u, v, lw*u, v);
  place(document.getElementById('wings'), ox/dpr+(cols-1-rw)*u, v, rw*u, v);
  t.nav.forEach(function(n,i){ if (NAVLINKS[i]) place(NAVLINKS[i], ox/dpr+(n.col-t.pad-1)*u, v, (n.len+2*t.pad+2)*u, v); });
}
function place(a,x,y,w,h){ a.style.left=x+'px'; a.style.top=y+'px'; a.style.width=w+'px'; a.style.height=h+'px'; }
function renderHudBottom(){
  var cv=hud.bot, cw=hud.cw, ch=hud.ch, ox=Math.floor((VW-hud.cols*cw)/2);
  cv.width=VW; cv.height=3*ch;
  var g=cv.getContext('2d'); g.fillStyle='#000'; g.fillRect(0,0,cv.width,cv.height);
  for (var c=0;c<hud.cols;c++){ g.drawImage(hud.tiles('▄',C(7)),ox+c*cw,0); g.drawImage(hud.tiles('▀',C(7)),ox+c*cw,2*ch); }
}
function drawHud(){
  ctx.drawImage(hud.top,0,0);
  var cw=hud.cw, ch=hud.ch, cols=hud.cols, y0=VH-3*ch, ox=Math.floor((VW-cols*cw)/2);
  ctx.drawImage(hud.bot,0,y0);
  if (hud.arrows && tabsArrow(performance.now())){               // ► before the tabs, the same one mirrored after
    var at=hud.tiles('►',TABS_INK);
    ctx.drawImage(at,ox+hud.arrows[0]*cw,ch);
    ctx.save(); ctx.scale(-1,1); ctx.drawImage(at,-(ox+(hud.arrows[1]+1)*cw),ch); ctx.restore();
  }
  var off=Math.floor(tick/2);
  for (var c=1;c<cols-1;c++){
    var chr=SCROLL[(off+c)%SCROLL.length]; if (chr===' ') continue;
    var col=(c<5||c>=cols-5)?C(1):(c<11||c>=cols-11)?C(3):C(11);
    ctx.drawImage(hud.tiles(chr,col),ox+c*cw,y0+ch);
  }
  drawMinimap();
}

// minimap: the whole triptych in tiny half blocks, bottom right, with the view marked
function buildMinimap(){
  hud.mm=null;
  if (VW<640*dpr || VH<480*dpr) return;
  var mcw=Math.max(2,Math.round(2.5*dpr)), mch=mcw*2;
  var mw=Math.floor(Math.min(VW*0.2,440*dpr)/mcw), mh=Math.ceil(mw*WY/WX/2);
  var mm={w:mw,h:mh,cw:mcw,ch:mch,tiles:makeTiles(mcw,mch),open:null,shut:null};
  mm.x=Math.floor((VW+hud.cols*hud.cw)/2)-(mw+2)*mcw-hud.cw;
  mm.y=VH-hudBotH()-(mh+2)*mch-hud.ch;
  function thumb(closed){
    var t=document.createElement('canvas'); t.width=mw; t.height=mh*2;
    var g=t.getContext('2d'); g.imageSmoothingEnabled=true; g.imageSmoothingQuality='high';
    g.drawImage(worldCv,0,0,WBX,WBY,0,0,mw,mh*2);
    if (closed){
      var sx=mw/WC, sy=mh*2/WR;
      g.fillStyle='#000'; g.fillRect(PL.c0*sx,TOP*sy,PL.w*sx,PROWS*sy); g.fillRect(PR.c0*sx,TOP*sy,PR.w*sx,PROWS*sy);
      g.drawImage(doorCv,0,0,doorCv.width,doorCv.height,PC.c0*sx,TOP*sy,PC.w*sx,PROWS*sy);
    }
    var d=g.getImageData(0,0,mw,mh*2).data, cv=document.createElement('canvas'), cw=mm.cw, ch=mm.ch;
    cv.width=(mw+2)*cw; cv.height=(mh+2)*ch;
    var o=cv.getContext('2d'); o.fillStyle='#000'; o.fillRect(0,0,cv.width,cv.height);
    function hex(i){ return 'rgb('+d[i]+','+d[i+1]+','+d[i+2]+')'; }
    for (var r=0;r<mh;r++) for (var c=0;c<mw;c++){
      o.fillStyle=hex((2*r*mw+c)*4); o.fillRect((c+1)*cw,(r+1)*ch,cw,ch/2);
      o.fillStyle=hex(((2*r+1)*mw+c)*4); o.fillRect((c+1)*cw,(r+1)*ch+ch/2,cw,ch/2);
    }
    for (c=0;c<mw+2;c++){
      var tc = c===0?'┌':c===mw+1?'┐':'─', bc = c===0?'└':c===mw+1?'┘':'─';
      o.drawImage(mm.tiles(tc,C(8),'#000'),c*cw,0); o.drawImage(mm.tiles(bc,C(8),'#000'),c*cw,(mh+1)*ch);
    }
    for (r=1;r<=mh;r++){ o.drawImage(mm.tiles('│',C(8),'#000'),0,r*ch); o.drawImage(mm.tiles('│',C(8),'#000'),(mw+1)*cw,r*ch); }
    return cv;
  }
  mm.open=thumb(false); mm.shut=thumb(true);
  hud.mm=mm;
}
function mmShown(){ return hud.mm && !(VW/zoom>=WBX*0.9 && (VH-hudTopH()-hudBotH())/zoom>=WBY*0.9); }
function drawMinimap(){
  if (!mmShown()) return;
  var mm=hud.mm;
  ctx.drawImage(door.a>0.5?mm.open:mm.shut, mm.x, mm.y);
  // view rectangle in minimap cells
  var sx=mm.w/WBX, sy=mm.h/WBY;
  var c0=clamp(Math.floor(cam.x*sx),0,mm.w-1), c1=clamp(Math.ceil((cam.x+VW/zoom)*sx)-1,c0,mm.w-1);
  var r0=clamp(Math.floor((cam.y+hudTopH()/zoom)*sy),0,mm.h-1), r1=clamp(Math.ceil((cam.y+(VH-hudBotH())/zoom)*sy)-1,r0,mm.h-1);
  var col=C(14);
  function put(r,c,ch){ ctx.drawImage(mm.tiles(ch,col),mm.x+(c+1)*mm.cw,mm.y+(r+1)*mm.ch); }
  if (c1-c0<1||r1-r0<1){ put(r0,c0,'█'); return; }
  for (var c=c0+1;c<c1;c++){ put(r0,c,'─'); put(r1,c,'─'); }
  for (var r=r0+1;r<r1;r++){ put(r,c0,'│'); put(r,c1,'│'); }
  put(r0,c0,'┌'); put(r0,c1,'┐'); put(r1,c0,'└'); put(r1,c1,'┘');
}
function overMinimap(mx,my){
  if (!mmShown()) return null;
  var mm=hud.mm, x=(mx*dpr-mm.x)/mm.cw-1, y=(my*dpr-mm.y)/mm.ch-1;
  if (x<0||y<0||x>mm.w||y>mm.h) return null;
  return { x:x/mm.w*WBX, y:y/mm.h*WBY };
}

/* ---------------------------- zoom hint --------------------------- */
// a second after the page opens (the wings are still shut) a small panel above the minimap
// says the wheel zooms. it fades in smoothly, stays until well after the wings have opened
// and fades out; anyone who zooms already knows, so it goes at once
var TOUCH = !!(window.matchMedia && matchMedia('(hover: none)').matches);
var HINT_TEXT = '§8░§7▒▓§f█ §e'+(TOUCH?'pINCH':'sCROLL')+' §7tO §fzOOM iN §7aND §foUT §f█§7▓▒§8░';
var HINT_DELAY=1000, HINT_IN=900, HINT_HOLD=6500, HINT_OUT=1300;  // ms, counted from the first frame
var hint={ start:null, cut:null, cutLvl:0, off:false, force:null, cells:parseText(HINT_TEXT) };
function hintLevel(now){
  if (hint.force!==null) return hint.force;
  if (hint.off || hint.start===null) return 0;
  var t=now-hint.start;
  var l = t<0 ? 0 : t<HINT_IN ? t/HINT_IN : t<HINT_IN+HINT_HOLD ? 1 : 1-(t-HINT_IN-HINT_HOLD)/HINT_OUT;
  if (hint.cut!==null) l=Math.min(l, hint.cutLvl-(now-hint.cut)/(HINT_OUT*0.6));
  return clamp(l,0,1);
}
function hintCut(){
  if (hint.start===null){ hint.off=true; return; }            // zoomed before it came: never show
  if (hint.cut===null){ var now=performance.now(); hint.cutLvl=hintLevel(now); hint.cut=now; }
}
function drawHint(){
  var l=hintLevel(performance.now());
  if (l<=0) return;
  var cw=hud.cw, ch=hud.ch, n=hint.cells.length, w=n+4, h=3, W=w*cw, H=h*ch, x0, y0, c;
  if (mmShown()){ var mm=hud.mm; x0=mm.x+(mm.w+2)*mm.cw-W; y0=mm.y-H-Math.round(ch/2); }   // right above the minimap
  else { x0=Math.floor((VW+hud.cols*cw)/2)-cw-W; y0=VH-hudBotH()-H-ch; }                   // no minimap: same corner
  ctx.save();
  ctx.globalAlpha=l*l*(3-2*l);
  ctx.fillStyle='#000'; ctx.fillRect(x0,y0,W,H);
  for (c=1;c<w-1;c++){ ctx.drawImage(hud.tiles('▄',C(7)),x0+c*cw,y0); ctx.drawImage(hud.tiles('▀',C(7)),x0+c*cw,y0+2*ch); }
  for (var i=0;i<n;i++){ var cell=hint.cells[i]; if (cell.ch!==' ') ctx.drawImage(hud.tiles(cell.ch,cell.fg),x0+(2+i)*cw,y0+ch); }
  ctx.restore();
}

/* --------------------------- tabs arrow --------------------------- */
// people did not see that the tabs switch the triptychs, so right after the page opens
// small yellow-orange arrows ► tabs ◄ blink a few times and go: off, on, off, on... hovering
// a tab ends it. the clock starts once frames run smoothly: the first frame takes ~0.5 s, and
// counted from it the arrows were already lit when the page first showed up
var TABS_INK=K.Y, TABS_DELAY=700, TABS_ON=450, TABS_OFF=300, TABS_BLINKS=3;   // ms
var tabs={ start:null, frames:0, prev:0, off:false, force:false };
function tabsArrow(now){
  if (tabs.force) return true;
  if (tabs.off || tabs.start===null) return false;
  var t=now-tabs.start-TABS_DELAY;
  return t>=0 && t<TABS_BLINKS*(TABS_ON+TABS_OFF) && t%(TABS_ON+TABS_OFF)<TABS_ON;
}

/* ----------------------------- camera ----------------------------- */
// the mouse position picks the spot of the world to look at, the camera glides there
var aim={fx:0.5,fy:0.42}, aimPt=null, mouse={x:0,y:0,seen:false}, mode='fly', drag=null, vel={x:0,y:0};
var FIT=0.25, LEVELS=[1,1.5,2,3,4,6,8], STEP_MAX=1.5;
function levels(){
  var l=LEVELS.filter(function(z){ return z>FIT*1.08; });
  if (FIT<1){   // from the whole picture up to 1 in even steps, none bigger than the ones above 1
    var n=Math.ceil(Math.log(1/FIT)/Math.log(STEP_MAX)), s=Math.pow(1/FIT,1/n);
    for (var k=n-1;k>=0;k--) l.unshift(FIT*Math.pow(s,k));
  }
  return l;
}
function camRange(){
  var vw=VW/zoom, vh=VH/zoom, top=hudTopH()/zoom, bot=hudBotH()/zoom, r={};
  if (WBX>vw){ r.x0=0; r.x1=WBX-vw; } else r.x0=r.x1=(WBX-vw)/2;
  var eh=vh-top-bot;
  if (WBY>eh){ r.y0=-top; r.y1=WBY-vh+bot; } else r.y0=r.y1=(WBY-eh)/2-top;
  return r;
}
function camGoal(){
  var r=camRange();
  if (aimPt) return { x:clamp(aimPt.x-VW/zoom/2,r.x0,r.x1), y:clamp(aimPt.y-VH/zoom/2,r.y0,r.y1) };
  return { x:r.x0+aim.fx*(r.x1-r.x0), y:r.y0+aim.fy*(r.y1-r.y0) };
}
function setZoom(z,anchorX,anchorY){           // anchor in device px stays put on screen
  var wx=cam.x+anchorX/zoom, wy=cam.y+anchorY/zoom;
  zoom=z; cam.x=wx-anchorX/zoom; cam.y=wy-anchorY/zoom;
}
function stepZoom(dir){
  var l=levels(), i=0, best=1e9;
  for (var k=0;k<l.length;k++){ var d=Math.abs(Math.log(l[k]/zoomT)); if (d<best){ best=d; i=k; } }
  zoomT=l[clamp(i+dir,0,l.length-1)];
  hintCut();
}
function updateCam(dt){
  var moved=false;
  if (zoom!==zoomT){
    var ax = mode==='fly'&&mouse.seen ? mouse.x*dpr : VW/2, ay = mode==='fly'&&mouse.seen ? mouse.y*dpr : VH/2;
    if (drag&&drag.pinch){ ax=drag.cx; ay=drag.cy; }
    var nz=Math.exp(Math.log(zoom)+(Math.log(zoomT)-Math.log(zoom))*(1-Math.exp(-dt*12)));
    if (Math.abs(Math.log(nz/zoomT))<0.004) nz=zoomT;
    setZoom(nz,ax,ay); moved=true;
  }
  var r=camRange();
  if (mode==='fly'){
    var g=camGoal(), k=1-Math.exp(-dt*2.6);
    var dx=(g.x-cam.x)*k, dy=(g.y-cam.y)*k;
    if (Math.abs(dx)>0.01||Math.abs(dy)>0.01){ cam.x+=dx; cam.y+=dy; moved=true; }
  } else if (!drag){
    if (Math.abs(vel.x)+Math.abs(vel.y)>0.02){ cam.x+=vel.x*dt*60; cam.y+=vel.y*dt*60; var f=Math.exp(-dt*3.5); vel.x*=f; vel.y*=f; moved=true; }
    var cx=clamp(cam.x,r.x0,r.x1), cy=clamp(cam.y,r.y0,r.y1);
    if (cx!==cam.x||cy!==cam.y){ cam.x+=(cx-cam.x)*0.3; cam.y+=(cy-cam.y)*0.3; moved=true; }
  }
  return moved;
}

/* ----------------------------- input ------------------------------ */
function toggleWings(){ door.to = door.to===1 ? 0 : 1; door.hold=false; renderHudTop(); dirty=true; }
var dirty=true;
window.addEventListener('pointermove',function(ev){
  if (ev.pointerType==='mouse'){
    mode='fly'; mouse.x=ev.clientX; mouse.y=ev.clientY; mouse.seen=true;
    var w=window.innerWidth, h=window.innerHeight;
    aim.fx=clamp((ev.clientX/w-0.06)/0.88,0,1); aim.fy=clamp((ev.clientY/h-0.08)/0.84,0,1);
    aimPt=overMinimap(ev.clientX,ev.clientY);
    return;
  }
  if (!drag||!drag.pts[ev.pointerId]) return;
  var p=drag.pts[ev.pointerId]; p.x=ev.clientX; p.y=ev.clientY;
  var ids=Object.keys(drag.pts);
  if (ids.length>=2){
    var a=drag.pts[ids[0]], b=drag.pts[ids[1]], d=Math.hypot(a.x-b.x,a.y-b.y), cx=(a.x+b.x)/2*dpr, cy=(a.y+b.y)/2*dpr;
    if (drag.pinch){
      var nz=clamp(drag.z0*d/drag.d0, FIT, 8); zoomT=nz; setZoom(nz,cx,cy); hintCut();
      cam.x-=(cx-drag.cx)/zoom; cam.y-=(cy-drag.cy)/zoom;
    }
    drag.pinch=true; drag.cx=cx; drag.cy=cy; if (!drag.d0){ drag.d0=d; drag.z0=zoom; }
  } else {
    var dx=(ev.clientX-p.lx)*dpr/zoom, dy=(ev.clientY-p.ly)*dpr/zoom;
    cam.x-=dx; cam.y-=dy; vel.x=-dx*0.5+vel.x*0.5; vel.y=-dy*0.5+vel.y*0.5;
  }
  p.lx=ev.clientX; p.ly=ev.clientY; dirty=true;
});
scr.addEventListener('pointerdown',function(ev){
  if (ev.pointerType==='mouse') return;
  mode='drag'; aimPt=null;
  if (!drag) drag={pts:{}};
  drag.pts[ev.pointerId]={x:ev.clientX,y:ev.clientY,lx:ev.clientX,ly:ev.clientY};
  drag.d0=0; drag.pinch=false; vel.x=vel.y=0;
  var mp=overMinimap(ev.clientX,ev.clientY);
  if (mp){ cam.x=mp.x-VW/zoom/2; cam.y=mp.y-VH/zoom/2; }
});
function endPointer(ev){ if (!drag) return; delete drag.pts[ev.pointerId]; if (!Object.keys(drag.pts).length) drag=null; else { drag.d0=0; drag.pinch=false; var id=Object.keys(drag.pts)[0], p=drag.pts[id]; p.lx=p.x; p.ly=p.y; } }
window.addEventListener('pointerup',endPointer); window.addEventListener('pointercancel',endPointer);
window.addEventListener('wheel',function(ev){ ev.preventDefault(); stepZoom(ev.deltaY<0?1:-1); },{passive:false});
window.addEventListener('keydown',function(ev){
  var k=ev.key;
  if (k===' '||k==='Enter'&&ev.target===document.body){ ev.preventDefault(); toggleWings(); return; }
  if (k==='+'||k==='='){ stepZoom(1); return; }
  if (k==='-'||k==='_'){ stepZoom(-1); return; }
  if (k==='0'){ zoomT=levels()[0]; hintCut(); return; }
  var dx = k==='ArrowLeft'?-1 : k==='ArrowRight'?1 : 0, dy = k==='ArrowUp'?-1 : k==='ArrowDown'?1 : 0;
  if (dx||dy){ ev.preventDefault(); mode='fly'; aimPt=null; aim.fx=clamp(aim.fx+dx*0.08,0,1); aim.fy=clamp(aim.fy+dy*0.08,0,1); }
});
document.getElementById('wings').addEventListener('click',function(ev){ ev.preventDefault(); toggleWings(); });
// back goes to the site's root (empdata2k.com, not /index.html); from a local file ./ would
// open the folder, so there it goes to index.html
if (location.protocol==='file:') document.getElementById('back').href='index.html';
function hover(id,key){ var a=document.getElementById(id); function on(){ hud[key]=true; renderHudTop(); dirty=true; } function off(){ hud[key]=false; renderHudTop(); dirty=true; } a.addEventListener('mouseenter',on); a.addEventListener('focus',on); a.addEventListener('mouseleave',off); a.addEventListener('blur',off); }
hover('back','hotBack'); hover('wings','hotWings');

/* ---------------------------- main loop --------------------------- */
function resize(){
  dpr=window.devicePixelRatio||1;
  var w=window.innerWidth, h=window.innerHeight;
  scr.width=Math.round(w*dpr); scr.height=Math.round(h*dpr);
  scr.style.width=w+'px'; scr.style.height=h+'px';
  VW=scr.width; VH=scr.height;
  layoutHud();
  FIT=Math.min(VW/WBX,(VH-hudTopH()-hudBotH())/WBY)*0.97;
  dirty=true;
}
var CFG={ draw:{} };
function step(){
  tick++;
  if (CFG.step) CFG.step();
}
// the page's moving things: draw.C runs under the wings, draw.L and draw.R only once they are
// open, draw.closed only while they are shut
function render(){
  RX=Math.round(cam.x*zoom); RY=Math.round(cam.y*zoom);
  VX0=Math.max(0,Math.floor(cam.x/CW)); VX1=Math.min(WX,Math.ceil((cam.x+VW/zoom)/CW)+1);
  VY0=Math.max(0,Math.floor(cam.y/(CH/2))); VY1=Math.min(WY,Math.ceil((cam.y+VH/zoom)/(CH/2))+2);
  ctx.imageSmoothingEnabled = zoom<1;
  ctx.fillStyle='#000'; ctx.fillRect(0,0,VW,VH);
  blit(worldCv,0,0,WC,WR,0,0);
  drawStars();
  var D=CFG.draw;
  if (vis(PC)){ drawGlitter(PC); if (D.C) D.C(); }
  flushDyn();
  if (door.a<1){
    drawDoors();
    if (door.a===0 && D.closed) D.closed();
  } else {
    if (vis(PL)){ drawGlitter(PL); if (D.L) D.L(); }
    if (vis(PR)){ drawGlitter(PR); if (D.R) D.R(); }
  }
  flushDyn();
  drawTexts();
  if (!noHud){ drawHud(); drawHint(); }
}
var TICK_MS=50, acc=0, last=0;
function frame(now){
  if (!last) last=now;
  var dt=Math.min(now-last,250); last=now; acc+=dt;
  var n=0;
  while (acc>=TICK_MS && n<5){ step(); acc-=TICK_MS; n++; }
  if (!door.hold && door.a!==door.to){
    door.a = door.to>door.a ? Math.min(1,door.a+dt/2600) : Math.max(0,door.a-dt/2200);
    if (door.a===door.to) renderHudTop();
    n++;
  }
  if (hint.start===null && !hint.off) hint.start=now+HINT_DELAY;                 // first frame: the hint's clock starts
  if (tabs.start===null && tabs.frames++ && now-tabs.prev<100) tabs.start=now;   // not before the heavy first frames are on screen
  tabs.prev=now;
  var hl=hintLevel(now); if (hl>0 && hl<1) n++;                                  // a smooth fade wants every frame
  if (updateCam(dt/1000)) n++;
  if (n>0||dirty){ render(); dirty=false; }
  requestAnimationFrame(frame);
}

/* ------------------------------ start ------------------------------ */
// cfg: id (index in TRIPTYCHS), paint {L,C,R,doors}, byline, labels, texts, scroll (lines),
// glitter {L:n,C:n,R:n} (how many water cells sparkle), step() per tick, draw {C,L,R,closed}
var noHud=false;
function triptychStart(cfg){
  CFG=cfg; CUR=cfg.id; CFG.draw=cfg.draw||{};
  buildWorld(cfg.paint);
  placeStars(); makeTexts(cfg); makeScroll(cfg.scroll); makeNav();
  window.addEventListener('resize',function(){ var z=zoom/(dpr||1); resize(); zoom=zoomT=clamp(z*dpr,FIT,8); var g=camGoal(); cam.x=g.x; cam.y=g.y; });
  resize();
  var R=RNG(77), gl=cfg.glitter||{};
  if (gl.L) findWater(PL,gl.L,R); if (gl.C) findWater(PC,gl.C,R); if (gl.R) findWater(PR,gl.R,R);

  // debug helpers: ?open starts with the wings open, ?closed keeps them shut, ?door=0.3 freezes
  // them half way, ?z=3 zoom (device px per VGA pixel; without it the whole picture fits
  // the screen), ?at=0.2,0.8 where to look,
  // ?t=N fast-forwards N ticks, ?nohud hides the bars (and the hints), ?hint keeps the zoom hint
  // on screen (?hint=0.4 freezes it part way through the fade), ?nohint never shows it,
  // ?tabs keeps the arrows by the tabs lit
  var qs=location.search; noHud=/[?&]nohud(=|&|$)/.test(qs);
  var qHint=/[?&]hint(=([\d.]+))?(&|$)/.exec(qs);
  if (qHint) hint.force=clamp(+(qHint[2]||1),0.05,1);
  if (/[?&]nohint(=|&|$)/.test(qs)) hint.off=true;
  if (/[?&]tabs(=|&|$)/.test(qs)) tabs.force=true;
  if (/[?&]test(=|&|$)/.test(qs)) window.__bosch={ hint:function(){ return hintLevel(performance.now()); }, tabs:function(){ return tabsArrow(performance.now()); } };   // for tools/fly-test.mjs
  var qZ=/[?&]z=([\d.]+)/.exec(qs), qAt=/[?&]at=([\d.]+),([\d.]+)/.exec(qs), qT=/[?&]t=(\d+)/.exec(qs), qD=/[?&]door=([\d.]+)/.exec(qs);
  zoom=zoomT = qZ ? clamp(+qZ[1],FIT,8) : FIT;
  if (qAt){ aim.fx=clamp(+qAt[1],0,1); aim.fy=clamp(+qAt[2],0,1); }
  if (/[?&]open(=|&|$)/.test(qs)) door.a=door.to=1;
  else if (qD){ door.a=door.to=clamp(+qD[1],0,1); door.hold=true; }
  else if (!/[?&]closed(=|&|$)/.test(qs)) setTimeout(function(){ if (door.to===0 && !door.hold){ door.to=1; renderHudTop(); } }, 1400);
  if (qT) for (var ff=0; ff<Math.min(+qT[1],5000); ff++) step();
  var g0=camGoal(); cam.x=g0.x; cam.y=g0.y;
  renderHudTop();
  render();
  requestAnimationFrame(frame);
}
