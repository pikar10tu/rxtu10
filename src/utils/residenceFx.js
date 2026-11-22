// ✨ เอฟเฟคฉากบ้าน (ResidenceScene) — จุดพิกเซลขยับบน canvas 180×100 (20 พ.ย. 2026)
// แต่ละฉากมีชนิดของตัวเอง + ความอลังการไล่ตามขั้น (user: "แสงอลังการตามระดับบ้าน")
//   ขั้น 1–5  เบาๆ ไม่กี่จุด
//   ขั้น 6–10 จุดเยอะขึ้น + ประกายใหญ่
//   ขั้น 11–15 + แสงเรืองทั้งฉาก
//   ขั้น 16–20 + ลำแสงส่องลงมา + ประกายดาวสี่แฉก
// 22 พ.ย. ยกเครื่อง (user เคาะจากห้องเทียบ): อนุภาคมีระยะใกล้-ไกล + รัศมีพิกเซล + ลายเซ็นประจำฉาก (SIG)
//   ตามของในภาพจริง: ลำแสงหน้าต่าง ไฟตึก น้ำระยิบ แสงใต้น้ำ ดาวตก วงแหวน เนบิวลา รัศมีอาทิตย์
// sceneFx(n) → step(g, t) วาด 1 เฟรม (ล้างเองทุกเฟรม)

// [ชนิด, สี, จำนวนตั้งต้น, y0, y1]
const KIND = {
  1: ['leaf', '#9cc58a', 4, 20, 90], 2: ['flick', '#ffd98a', 4, 40, 85], 3: ['mote', '#fff6d8', 8, 10, 90],
  4: ['leaf', '#c9a46a', 5, 20, 90], 5: ['mote', '#fff3dc', 8, 10, 90], 6: ['leaf', '#a6d6c4', 5, 20, 90],
  7: ['twinkle', '#ffe9a8', 10, 30, 60], 8: ['cloud', '#ffffff', 3, 4, 26], 9: ['sparkle', '#ffffff', 10, 48, 66],
  10: ['sparkle', '#ffffff', 8, 82, 96], 11: ['twinkle', '#ffe9a8', 12, 50, 66], 12: ['sparkle', '#ffffff', 12, 58, 92],
  13: ['sparkle', '#ffffff', 14, 56, 98], 14: ['bubble', '#e6fbff', 12, 0, 100], 15: ['petal', '#ffd1e6', 10, 0, 100],
  16: ['twinkle', '#ffffff', 16, 0, 40], 17: ['shoot', '#ffffff', 16, 0, 60], 18: ['twinkle', '#ffe4ff', 16, 0, 70],
  19: ['rainbow', '', 14, 0, 90], 20: ['twinkle', '#fff2b0', 16, 0, 100],
}
// สีแสงเรือง/ลำแสง ของฉากขั้นสูง
const GLOW = { 11: '#ffd9a0', 12: '#fff4c0', 13: '#d8f6ff', 14: '#c8fff4', 15: '#ffe6f6', 16: '#e8dcff', 17: '#cfe6ff', 18: '#ffd6fb', 19: '#ffe0f0', 20: '#fff1a8' }

const rnd = (i, k) => { const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v) }

// ลายเซ็นประจำฉาก — พิกัดในภาพ 180×100 (ไล่ตำแหน่งจากภาพจริงแล้ว)
const SIG={
  1:{wind:1},
  2:{wind:1},
  3:{beam:[[140,6],[170,6],[118,95],[78,95]]},
  4:{wind:1},
  5:{beam:[[128,22],[138,22],[112,95],[88,95]]},
  6:{wind:1,birds:1},
  7:{city:[0,62,18,58],plane:1},
  8:{birds:1},
  9:{water:[0,130,28,48],birds:1},
  10:{water:[120,178,80,95]},
  11:{city:[0,60,38,58],water:[110,180,86,100]},
  12:{water:[0,140,48,100],birds:1},
  13:{water:[0,180,28,100]},
  14:{caustic:1},
  15:{puffs:1},
  16:{halo:[166,10,6],shoot:1},
  17:{shoot:3},
  18:{orbit:[113,31,11,3],crystal:[90,150,40,95]},
  19:{nebula:1,shoot:1},
  20:{sun:[140,42],embers:1},
};
function halo(g,x,y,c,a){g.globalAlpha=a*.35;g.fillStyle=c;g.fillRect(x-1,y,1,1);g.fillRect(x+1,y,1,1);g.fillRect(x,y-1,1,1);g.fillRect(x,y+1,1,1)}
export function sceneFx(n){
  const [kind,col,base,y0,y1]=KIND[n]||KIND[1]; const X=SIG[n]||{};
  const boost=n<=5?1.3:n<=10?1.7:n<=15?2.1:2.6; const N=Math.round(base*boost);
  const big=n>5, glow=n>10?GLOW[n]:null, rays=n>15&&!X.sun;
  const P=[...Array(N)].map((_,i)=>[rnd(i,1),rnd(i,2),rnd(i,3)]);
  const W=X.water?[...Array(26)].map((_,i)=>[rnd(i,7),rnd(i,8),rnd(i,9)]):null;
  const C=X.city?[...Array(22)].map((_,i)=>[rnd(i,11),rnd(i,12),rnd(i,13)]):null;
  return function(g,t){
    g.clearRect(0,0,180,100);
    if(X.nebula){ for(let k=0;k<3;k++){ const cx=40+k*55+Math.sin(t/200+k)*10, cy=18+k*8; const gr=g.createRadialGradient(cx,cy,2,cx,cy,50); gr.addColorStop(0,`hsl(${(t*.4+k*110)%360} 90% 85%)`); gr.addColorStop(1,'transparent'); g.globalAlpha=.16; g.fillStyle=gr; g.fillRect(0,0,180,100) } }
    if(glow){ const a=.12+.06*Math.sin(t/90); const gr=g.createRadialGradient(125,30,4,125,30,110); gr.addColorStop(0,glow); gr.addColorStop(1,'transparent'); g.globalAlpha=a; g.fillStyle=gr; g.fillRect(0,0,180,100) }
    if(X.sun){ const [sx,sy]=X.sun; g.fillStyle='#fff1a8'; for(let r=0;r<10;r++){ const an=t/400+r*Math.PI/5; g.globalAlpha=.07+.03*Math.sin(t/50+r); g.beginPath(); g.moveTo(sx,sy); g.lineTo(sx+Math.cos(an-.07)*140,sy+Math.sin(an-.07)*140); g.lineTo(sx+Math.cos(an+.07)*140,sy+Math.sin(an+.07)*140); g.fill() }
      const gr=g.createRadialGradient(sx,sy,2,sx,sy,30); gr.addColorStop(0,'#fffbe0'); gr.addColorStop(1,'transparent'); g.globalAlpha=.35+.1*Math.sin(t/60); g.fillStyle=gr; g.fillRect(sx-30,sy-30,60,60) }
    if(rays){ g.fillStyle=glow; for(let r=0;r<3;r++){ g.globalAlpha=.08+.05*Math.sin(t/70+r*2); const x=95+r*28+Math.sin(t/120+r)*6; g.beginPath(); g.moveTo(x,0); g.lineTo(x+8,0); g.lineTo(x-14,100); g.lineTo(x-26,100); g.fill() } }
    if(X.caustic){ g.fillStyle='#e9fffb'; for(let r=0;r<5;r++){ g.globalAlpha=.06+.05*Math.sin(t/60+r*1.3); const x=10+r*26+Math.sin(t/90+r)*10; g.beginPath(); g.moveTo(x,0); g.lineTo(x+10,0); g.lineTo(x+40,100); g.lineTo(x+24,100); g.fill() }
      for(let i=0;i<18;i++){ const x=(rnd(i,21)*120+Math.sin(t/40+i)*3)|0, y=(78+rnd(i,22)*20)|0; g.globalAlpha=Math.max(0,Math.sin(t/22+i*2))*.55; g.fillStyle='#ffffff'; g.fillRect(x,y,3,1) } }
    if(X.beam){ const b=X.beam; g.globalAlpha=.10+.04*Math.sin(t/80); g.fillStyle='#fff6d8'; g.beginPath(); g.moveTo(...b[0]); g.lineTo(...b[1]); g.lineTo(...b[2]); g.lineTo(...b[3]); g.fill() }
    if(X.halo){ const [hx,hy,hr]=X.halo; for(let k=0;k<2;k++){ const p=((t/120)+k*.5)%1; g.globalAlpha=(1-p)*.5; g.strokeStyle='#efe6ff'; g.lineWidth=1; g.beginPath(); g.arc(hx,hy,hr+p*10,0,Math.PI*2); g.stroke() } }
    if(W){ const [x0,x1,wy0,wy1]=X.water; for(let i=0;i<W.length;i++){ const [a,b,c]=W[i]; const y=wy0+b*(wy1-wy0); const near=(y-wy0)/(wy1-wy0); const len=1+Math.round(near*4); const x=x0+((a*(x1-x0)+t*(.05+c*.08))%(x1-x0)); const al=Math.max(0,Math.sin(t/(18+c*14)+i*2.1)); g.globalAlpha=al*(.5+near*.5); g.fillStyle='#ffffff'; g.fillRect(x|0,y|0,len,1); if(al>.9&&near>.5) halo(g,(x+len/2)|0,y|0,'#ffffff',al) } }
    if(C){ const [x0,x1,cy0,cy1]=X.city; for(let i=0;i<C.length;i++){ const [a,b,c]=C[i]; const on=Math.sin(t/(60+c*80)+i*3)>-.2; if(!on) continue; g.globalAlpha=.55+.3*c; g.fillStyle=c>.6?'#fff3c4':'#ffd98a'; g.fillRect((x0+a*(x1-x0))|0,(cy0+b*(cy1-cy0))|0,1,1) } }
    if(X.crystal){ const [x0,x1,cy0,cy1]=X.crystal; for(let i=0;i<9;i++){ const al=Math.max(0,Math.sin(t/16+i*2.4)); if(al<.6) continue; const x=(x0+rnd(i,31)*(x1-x0))|0, y=(cy0+rnd(i,32)*(cy1-cy0))|0; g.globalAlpha=al; g.fillStyle='#ffffff'; g.fillRect(x,y,1,1); g.globalAlpha=al*.6; g.fillRect(x-2,y,5,1); g.fillRect(x,y-2,1,5) } }
    if(X.orbit){ const [ox,oy,rx,ry]=X.orbit; for(let k=0;k<3;k++){ const an=t/50+k*2.1; const x=ox+Math.cos(an)*rx, y=oy+Math.sin(an)*ry; if(Math.sin(an)<-.3) continue; g.globalAlpha=1; g.fillStyle='#ffffff'; g.fillRect(x|0,y|0,1,1); halo(g,x|0,y|0,'#ffe4ff',1) } }
    // อนุภาคหลัก (ระยะใกล้ไกล + รัศมี)
    for(let i=0;i<N;i++){ const [a,b,z]=P[i]; const sp=.6+z*.9, dim=.45+z*.55;
      let x=a*180, y=y0+b*(y1-y0), s=z>.7&&big?2:1, al=1, c=col;
      if(kind==='leaf'||kind==='petal'){ x=((a*180+t*(.25+b*.2)*sp)%190)-5+Math.sin(t/20+i)*3*sp; y=y0+((t*(.15+a*.1)*sp+b*80)%(y1-y0)); s=kind==='petal'?(z>.5?2:1):(z>.75?2:1);
        if(kind==='petal'&&s===2){ g.globalAlpha=dim; g.fillStyle='#f7a8c8'; g.fillRect((x+1)|0,(y+1)|0,1,1) }
        if(kind==='leaf'&&s===2){ g.globalAlpha=dim; g.fillStyle=col; g.fillRect((x+1)|0,(y-1)|0,1,1) } }
      else if(kind==='mote'||kind==='flick'){ if(kind==='flick') x=110+a*60; x+=Math.sin(t/60+i)*4*sp; y+=Math.cos(t/70+i)*3*sp; al=.35+.55*Math.max(0,Math.sin(t/30+i));
        if(X.beam){ const inB=x>X.beam[3][0]&&x<X.beam[1][0]; al*=inB?1.3:.5 } }
      else if(kind==='twinkle'||kind==='sparkle'){ al=Math.max(0,Math.sin(t/(kind==='sparkle'?14:25)/sp*1.2+i*1.7)); if(kind==='sparkle') x=(x+t*.1*sp)%180; s=big&&al>.8&&z>.4?2:1 }
      else if(kind==='bubble'){ y=100-((t*(.3+a*.3)*sp+b*100)%100); x+=Math.sin(t/15+i)*2; s=z>.55?2:1; al=.75;
        if(s===2){ g.globalAlpha=.6*dim; g.strokeStyle=col; g.lineWidth=1; g.strokeRect((x|0)-.5,(y|0)-.5,3,3); g.globalAlpha=dim; g.fillStyle='#ffffff'; g.fillRect(x|0,y|0,1,1); continue } }
      else if(kind==='cloud'){ x=((a*180+t*.06*(1+i))%220)-30; g.globalAlpha=.6; g.fillStyle=col; g.fillRect(x|0,y|0,18,3); g.fillRect((x+4)|0,(y-2)|0,9,2); g.fillRect((x+11)|0,(y-1)|0,5,1); g.globalAlpha=.35; g.fillStyle='#c9dcf2'; g.fillRect((x+1)|0,(y+3)|0,16,1); continue }
      else if(kind==='rainbow'){ c=`hsl(${(i*40+t)%360} 90% 82%)`; x+=Math.sin(t/40+i)*6; y=(y+t*.1*sp)%y1; al=.5+.5*Math.sin(t/20+i) }
      else if(kind==='shoot'){ al=Math.max(0,Math.sin(t/25/sp+i*1.7)) }
      x|=0; y|=0; g.globalAlpha=al*dim; g.fillStyle=c; g.fillRect(x,y,s,s);
      if(al*dim>.75&&n>3) halo(g,x+(s>1?1:0),y,c,al);
      if(n>15&&al>.92&&s===2){ g.globalAlpha=al*.8; g.fillRect(x-2,y,6,1); g.fillRect(x+.5|0,y-2,1,6) }
    }
    if(kind==='flick'){ const gr=g.createRadialGradient(140,55,2,140,55,45); gr.addColorStop(0,col); gr.addColorStop(1,'transparent'); g.globalAlpha=.12+.05*Math.sin(t/80); g.fillStyle=gr; g.fillRect(90,10,90,90) }
    if(n===1){ const gr=g.createRadialGradient(171,72,1,171,72,16); gr.addColorStop(0,'#ffe2a0'); gr.addColorStop(1,'transparent'); g.globalAlpha=.35+.08*Math.sin(t/50); g.fillStyle=gr; g.fillRect(150,52,40,40) }
    if(X.puffs){ for(let k=0;k<3;k++){ const x=((t*.12*(1+k*.4)+k*80)%240)-40, y=86+k*4; g.globalAlpha=.7; g.fillStyle='#ffffff'; g.fillRect(x|0,y|0,22,4); g.fillRect((x+5)|0,(y-3)|0,11,3); g.fillRect((x+13)|0,(y-2)|0,6,2) } }
    if(X.wind){ const p=(t%360)/90; if(p<1){ for(let k=0;k<3;k++){ const x=(p*220-30+k*14)|0, y=30+k*9+Math.sin(p*6+k)*2; g.globalAlpha=(1-Math.abs(p-.5)*2)*.5; g.fillStyle='#ffffff'; g.fillRect(x,y|0,8-k*2,1) } } }
    if(X.birds){ const p=(t%600)/300; if(p<1){ for(let k=0;k<2;k++){ const x=(190-p*220+k*7)|0, y=(14+k*3+Math.sin(t/12+k)*1)|0, up=Math.floor(t/8+k)%2; g.globalAlpha=.75; g.fillStyle='#5b6a86'; g.fillRect(x,y,1,1); g.fillRect(x-1,y-up,1,1); g.fillRect(x+1,y-up,1,1) } } }
    if(X.plane){ const p=(t%900)/600; if(p<1){ const x=(p*200-10)|0, y=(12-p*4)|0; g.globalAlpha=.8; g.fillStyle='#e9e3f3'; g.fillRect(x,y,3,1); if(Math.floor(t/15)%2){ g.fillStyle='#ff6b6b'; g.fillRect(x+3,y,1,1) } } }
    if(X.shoot){ for(let k=0;k<X.shoot;k++){ const per=260+k*90, p=((t+k*130)%per)/36; if(p>=1) continue; const sx=160-k*40, sy=6+k*10; g.fillStyle='#ffffff'; for(let j=0;j<12;j++){ g.globalAlpha=(1-p)*(1-j/12); g.fillRect((sx-p*80+j)|0,(sy+p*26+j*.33)|0,1,1) } g.globalAlpha=1-p; halo(g,(sx-p*80)|0,(sy+p*26)|0,'#ffffff',1-p) } }
    if(n===17){ if(Math.floor(t/30)%3===0){ g.globalAlpha=.9; g.fillStyle='#ff8fa3'; g.fillRect(156,26,1,1); halo(g,156,26,'#ff8fa3',1) } }
    if(X.embers){ for(let i=0;i<14;i++){ const z=rnd(i,41); const x=(110+rnd(i,42)*70+Math.sin(t/30+i)*3)|0, y=(100-((t*(.15+z*.25)+rnd(i,43)*100)%100))|0; const al=.4+.6*Math.max(0,Math.sin(t/20+i)); g.globalAlpha=al; g.fillStyle=z>.5?'#ffe08a':'#fff6c8'; g.fillRect(x,y,1,1); if(al>.85) halo(g,x,y,'#ffd56a',al) } }
    g.globalAlpha=1;
  }
}

