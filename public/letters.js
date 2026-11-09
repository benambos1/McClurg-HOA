/* Home-code letters: builds a one-page-per-home PDF in the browser (no outside services).
   window.buildHomeCodePDF(rows, opts) -> Blob.  rows: [{address, code, expires_at}]
   opts: {name, full, url, email, cityLine, brand, brandSoft, logo:'water'|'tree'} */
(function(){
const WID={"helv":[278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584,761,556,556,222,556,333,1000,556,556,333,1000,667,333,1000,556,611,556,556,222,222,333,333,350,556,1000,333,1000,500,333,944,556,500,667,278,333,556,556,556,556,260,556,333,737,370,556,584,333,737,333,400,584,333,333,333,556,537,278,333,333,365,556,834,834,834,611,667,667,667,667,667,667,1000,722,667,667,667,667,278,278,278,278,722,722,778,778,778,778,778,584,778,722,722,722,722,667,667,611,556,556,556,556,556,556,889,500,556,556,556,556,278,278,278,278,556,556,556,556,556,556,556,584,611,556,556,556,556,500,556,500],"helvB":[278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584,761,556,611,278,556,500,1000,556,556,333,1000,667,333,1000,611,611,611,611,278,278,500,500,350,556,1000,333,1000,556,333,944,611,500,667,278,333,556,556,556,556,280,556,333,737,370,556,584,333,737,333,400,584,333,333,333,611,556,278,333,333,365,556,834,834,834,611,722,722,722,722,722,722,1000,722,667,667,667,667,278,278,278,278,722,722,778,778,778,778,778,584,778,722,722,722,722,667,667,611,556,556,556,556,556,556,889,556,556,556,556,556,278,278,278,278,611,611,611,611,611,611,611,584,611,611,611,611,611,556,611,556]};
const MAP={0x2019:0x92,0x2018:0x91,0x201C:0x93,0x201D:0x94,0x2013:0x96,0x2014:0x97,0x2022:0x95,0x2026:0x85,0x20AC:0x80};
function enc(s){let o='';for(const ch of String(s??'')){let c=ch.codePointAt(0);if(MAP[c])c=MAP[c];else if(c>255||(c>=0x80&&c<0xA0)||(c<32&&c!==9))c=63;o+=String.fromCharCode(c)}return o}
function width(s,f,sz,cs){const e=enc(s);let w=0;for(let i=0;i<e.length;i++){const c=e.charCodeAt(i);w+=f==='F3'?600:((f==='F2'?WID.helvB:WID.helv)[c-32]??556)}return w*sz/1000+(cs||0)*Math.max(0,e.length-1)}
const pesc=s=>enc(s).replace(/[\\()]/g,m=>'\\'+m);
const rgb=h=>{h=String(h).replace('#','');return [0,2,4].map(i=>(parseInt(h.slice(i,i+2),16)/255).toFixed(3)).join(' ')};
const n=v=>(+v).toFixed(2);
function Doc(title){this.W=612;this.H=792;this.pages=[];this.title=title||''}
Doc.prototype={
  addPage(){this.cur=[];this.pages.push(this.cur);return this},
  op(s){this.cur.push(s);return this},
  Y(y){return n(this.H-y)},
  text(s,x,y,o={}){const f=o.font||'F1',sz=o.size||12,cs=o.cs||0,w=width(s,f,sz,cs);let tx=x;if(o.align==='center')tx=x-w/2;else if(o.align==='right')tx=x-w;
    return this.op(`BT ${rgb(o.color||'#1a1a1a')} rg /${f} ${sz} Tf ${cs} Tc ${n(tx)} ${this.Y(y)} Td (${pesc(s)}) Tj ET`)},
  wrap(s,f,sz,maxW){const lines=[];for(const para of String(s).split('\n')){let line='';for(const w of para.split(/\s+/).filter(Boolean)){const t=line?line+' '+w:w;if(width(t,f,sz)>maxW&&line){lines.push(line);line=w}else line=t}lines.push(line)}return lines},
  para(s,x,y,maxW,o={}){const sz=o.size||12,lh=o.lh||sz*1.42,lines=this.wrap(s,o.font||'F1',sz,maxW);lines.forEach((l,i)=>this.text(l,x,y+sz+i*lh,o));return y+sz+(lines.length-1)*lh+(lh-sz)},
  rect(x,y,w,h,o={}){return this.op(`q ${o.fill?rgb(o.fill)+' rg ':''}${o.stroke?rgb(o.stroke)+' RG '+(o.lw||1)+' w ':''}${n(x)} ${n(this.H-y-h)} ${n(w)} ${n(h)} re ${o.fill&&o.stroke?'B':o.fill?'f':'S'} Q`)},
  rrect(x,y,w,h,r,o={}){const k=0.5523*r,X=n,Yy=v=>this.Y(v);
    const p=`${X(x+r)} ${Yy(y)} m ${X(x+w-r)} ${Yy(y)} l ${X(x+w-r+k)} ${Yy(y)} ${X(x+w)} ${Yy(y+r-k)} ${X(x+w)} ${Yy(y+r)} c ${X(x+w)} ${Yy(y+h-r)} l ${X(x+w)} ${Yy(y+h-r+k)} ${X(x+w-r+k)} ${Yy(y+h)} ${X(x+w-r)} ${Yy(y+h)} c ${X(x+r)} ${Yy(y+h)} l ${X(x+r-k)} ${Yy(y+h)} ${X(x)} ${Yy(y+h-r+k)} ${X(x)} ${Yy(y+h-r)} c ${X(x)} ${Yy(y+r)} l ${X(x)} ${Yy(y+r-k)} ${X(x+r-k)} ${Yy(y)} ${X(x+r)} ${Yy(y)} c h`;
    return this.op(`q ${o.fill?rgb(o.fill)+' rg ':''}${o.stroke?rgb(o.stroke)+' RG '+(o.lw||1)+' w ':''}${p} ${o.fill&&o.stroke?'B':o.fill?'f':'S'} Q`)},
  path(cmds,o={}){let p='';for(const c of cmds){if(c[0]==='M')p+=`${n(c[1])} ${this.Y(c[2])} m `;else if(c[0]==='L')p+=`${n(c[1])} ${this.Y(c[2])} l `;else if(c[0]==='C')p+=`${n(c[1])} ${this.Y(c[2])} ${n(c[3])} ${this.Y(c[4])} ${n(c[5])} ${this.Y(c[6])} c `;else if(c[0]==='Z')p+='h '}
    return this.op(`q 1 J 1 j ${o.fill?rgb(o.fill)+' rg ':''}${o.stroke?rgb(o.stroke)+' RG '+n(o.lw||1)+' w ':''}${p}${o.fill?'f':'S'} Q`)},
  circle(cx,cy,r,o){const k=0.5523*r;return this.path([['M',cx+r,cy],['C',cx+r,cy+k,cx+k,cy+r,cx,cy+r],['C',cx-k,cy+r,cx-r,cy+k,cx-r,cy],['C',cx-r,cy-k,cx-k,cy-r,cx,cy-r],['C',cx+k,cy-r,cx+r,cy-k,cx+r,cy],['Z']],o)},
  output(){const objs=[null,null];const add=s=>{objs.push(s);return objs.length};
    const fonts=[['F1','Helvetica'],['F2','Helvetica-Bold'],['F3','Courier-Bold']];
    const ids=fonts.map(([,b])=>add(`<< /Type /Font /Subtype /Type1 /BaseFont /${b} /Encoding /WinAnsiEncoding >>`));
    const res=`<< /Font << ${fonts.map(([f],i)=>`/${f} ${ids[i]} 0 R`).join(' ')} >> >>`;const kids=[];
    for(const pg of this.pages){const c=pg.join('\n');const cid=add(`<< /Length ${c.length} >>\nstream\n${c}\nendstream`);kids.push(add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${this.W} ${this.H}] /Resources ${res} /Contents ${cid} 0 R >>`))}
    const info=add(`<< /Title (${pesc(this.title)}) /Producer (HOA website) >>`);
    objs[0]='<< /Type /Catalog /Pages 2 0 R >>';objs[1]=`<< /Type /Pages /Kids [${kids.map(k=>k+' 0 R').join(' ')}] /Count ${kids.length} >>`;
    let out='%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';const offs=[];objs.forEach((o,i)=>{offs.push(out.length);out+=`${i+1} 0 obj\n${o}\nendobj\n`});
    const x=out.length;out+=`xref\n0 ${objs.length+1}\n0000000000 65535 f \n`+offs.map(o=>String(o).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<< /Size ${objs.length+1} /Root 1 0 R /Info ${info} 0 R >>\nstartxref\n${x}\n%%EOF\n`;
    const b=new Uint8Array(out.length);for(let i=0;i<out.length;i++)b[i]=out.charCodeAt(i)&255;return b}
};
/* logos, drawn in a 512-unit box */
function logo(d,kind,x,y,s,brand){const k=s/512,P=(px,py)=>[x+px*k,y+py*k];
  d.rrect(x,y,s,s,112*k,{fill:brand});
  const roofY=kind==='tree'?[226,120]:[238,130];
  d.path([['M',...P(128,roofY[0])],['L',...P(256,roofY[1])],['L',...P(384,roofY[0])]],{stroke:'#ffffff',lw:38*k});
  if(kind==='tree'){d.rrect(x+241*k,y+318*k,30*k,78*k,8*k,{fill:'#ffffff'});d.circle(...P(256,290),74*k,{fill:'#ffffff'});d.path([['M',...P(150,404)],['L',...P(362,404)]],{stroke:'#f3d3da',lw:26*k})}
  else{for(const [wy,col] of [[318,'#bfe4f0'],[388,'#ffffff']]){const c=[['M',...P(120,wy)]];let px=120,up=true;for(let i=0;i<4;i++){const qx=px+34,qy=wy+(up?-28:28),ex=px+68;
      c.push(['C',...P(px+2/3*(qx-px),wy+2/3*(qy-wy)),...P(ex+2/3*(qx-ex),wy+2/3*(qy-wy)),...P(ex,wy)]);px=ex;up=!up}
    d.path(c,{stroke:col,lw:30*k})}}}
function qr(d,text,x,y,size){const q=window.makeQR(text),m=q.size,quiet=2,u=size/(m+quiet*2);let ops='';
  d.rect(x,y,size,size,{fill:'#ffffff'});
  for(let r=0;r<m;r++){let c=0;while(c<m){if(q.dark(r,c)){let e=c;while(e<m&&q.dark(r,e))e++;ops+=`${n(x+(quiet+c)*u)} ${n(d.H-(y+(quiet+r+1)*u))} ${n((e-c)*u)} ${n(u)} re `;c=e}else c++}}
  d.op(`q 0 0 0 rg ${ops}f Q`)}
function fmtDate(t){const dt=new Date(t);return dt.toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}
window.buildHomeCodePDF=function(rows,o){
  const d=new Doc(`${o.name} home codes`),M=54,Wc=612-2*M,url=o.url.replace(/\/+$/,''),shown=url.replace(/^https?:\/\//,'');
  const ink='#1d1d1f',muted='#5b5f63';
  for(const r of rows){d.addPage();
    logo(d,o.logo,M,46,54,o.brand);
    d.text(o.full,M+68,o.cityLine?68:78,{font:'F2',size:15,color:ink});
    if(o.cityLine)d.text(o.cityLine,M+68,88,{size:11,color:muted});
    d.rect(M,118,Wc,2,{fill:o.brand});
    d.text('Hey Neighbor!',M,166,{font:'F2',size:32,color:o.brand});
    let y=d.para(`${o.name} has created a one-stop shop for everything in the neighborhood. Pay your dues, report issues, and follow along with community events and projects, all from your phone or computer.`,M,180,Wc,{size:13.5,color:ink,lh:20});
    y=d.para(`Your home has its own sign-in code. Use it once to set up your login, and your account is linked to ${r.address}.`,M,y+6,Wc,{size:13.5,color:ink,lh:20});
    const bx=M,by=y+18,bh=212;d.rrect(bx,by,Wc,bh,14,{fill:o.brandSoft,stroke:o.brand,lw:1.5});
    const qs=170;qr(d,`${url}/?code=${encodeURIComponent(r.code)}`,bx+22,by+22,qs);
    const tx=bx+22+qs+28,tw=Wc-(qs+72);
    d.text('SCAN WITH YOUR PHONE CAMERA',bx+22+qs/2,by+bh-8,{size:8,color:muted,align:'center',cs:.6});
    d.text('YOUR HOME CODE',tx,by+40,{font:'F2',size:10,color:muted,cs:1.2});
    d.text(r.code,tx,by+80,{font:'F3',size:34,color:ink,cs:2});
    d.text('FOR',tx,by+106,{font:'F2',size:10,color:muted,cs:1.2});
    d.para(r.address+(o.cityLine?', '+o.cityLine:''),tx,by+110,tw,{font:'F2',size:13,color:ink,lh:17});
    d.text('WEBSITE',tx,by+160,{font:'F2',size:10,color:muted,cs:1.2});
    let us=16;while(us>10&&d.cur&&width(shown,'F2',us)>tw)us--;d.text(shown,tx,by+182,{font:'F2',size:us,color:o.brand});
    y=by+bh+34;d.text('How to sign in',M,y,{font:'F2',size:15,color:ink});y+=8;
    const steps=[`Scan the QR code with your phone's camera, or go to ${shown}.`,`Tap "Create your login." If you scanned the QR code, your home code is already filled in. Otherwise, type the code above.`,'Enter your name, email and a password. Then open the confirmation email we send you and tap the link.',`That's it. You're signed in and linked to your home.`];
    steps.forEach((t,i)=>{d.circle(M+10,y+13,10,{fill:o.brand});d.text(String(i+1),M+10,y+17.2,{font:'F2',size:11,color:'#ffffff',align:'center'});y=d.para(t,M+30,y+3,Wc-30,{size:12,color:ink,lh:16})+5});
    d.para('Tip: add the site to your phone’s home screen and it works like an app.',M,y+2,Wc,{size:11,color:muted,lh:15});
    d.rect(M,728,Wc,.75,{fill:'#c9c9cc'});
    d.para(`This code works once and expires ${fmtDate(r.expires_at)}. Keep it private: it links an account to your home. Renting? Please pass this letter to the homeowner.${o.email?' Questions? '+o.email:''}`,M,732,Wc,{size:9,color:muted,lh:12});
  }
  return new Blob([d.output()],{type:'application/pdf'});
};
})();
