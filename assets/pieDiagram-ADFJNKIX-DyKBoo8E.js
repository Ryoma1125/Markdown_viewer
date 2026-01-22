import{t as e}from"./ordinal-Bs01uwBv.js";import"./init-B8xRTswO.js";import{t}from"./arc-C2pYRdRQ.js";import{Gn as n,Jt as r,Mn as i,P as a,Pn as o,Pt as s,Sn as c,Wn as l,Yt as u,dn as d,gn as f,jn as p,jt as m,k as h,mn as g,vn as _,xn as v,yn as y}from"./index-PJ0TmLvI.js";import"./chunk-FPAJGGOC-BceANEb6.js";import"./reduce-DauDZIpp.js";import"./flatten-BrsxrPBL.js";import"./chunk-O7ZBX7Z2-0fDIUA28.js";import"./chunk-S6J4BHB3-BRGM7sR4.js";import"./chunk-LBM3YZW2-BH7L41YB.js";import"./chunk-76Q3JFCE-OvcpyqKY.js";import"./chunk-T53DSG4Q-HYK5nhKU.js";import"./chunk-LHMN2FUI-VRXC37XE.js";import"./chunk-FWNWRKHM-KAiGvm8n.js";import{t as b}from"./chunk-4BX2VUAB-DqxKBPbq.js";import{t as x}from"./mermaid-parser.core-DaqFPnnB.js";function S(e,t){return t<e?-1:t>e?1:t>=e?0:NaN}function C(e){return e}function w(){var e=C,t=S,n=null,i=u(0),a=u(r),o=u(0);function c(c){var l,u=(c=s(c)).length,d,f,p=0,m=Array(u),h=Array(u),g=+i.apply(this,arguments),_=Math.min(r,Math.max(-r,a.apply(this,arguments)-g)),v,y=Math.min(Math.abs(_)/u,o.apply(this,arguments)),b=y*(_<0?-1:1),x;for(l=0;l<u;++l)(x=h[m[l]=l]=+e(c[l],l,c))>0&&(p+=x);for(t==null?n!=null&&m.sort(function(e,t){return n(c[e],c[t])}):m.sort(function(e,n){return t(h[e],h[n])}),l=0,f=p?(_-u*b)/p:0;l<u;++l,g=v)d=m[l],x=h[d],v=g+(x>0?x*f:0)+b,h[d]={data:c[d],index:l,value:x,startAngle:g,endAngle:v,padAngle:y};return h}return c.value=function(t){return arguments.length?(e=typeof t==`function`?t:u(+t),c):e},c.sortValues=function(e){return arguments.length?(t=e,n=null,c):t},c.sort=function(e){return arguments.length?(n=e,t=null,c):n},c.startAngle=function(e){return arguments.length?(i=typeof e==`function`?e:u(+e),c):i},c.endAngle=function(e){return arguments.length?(a=typeof e==`function`?e:u(+e),c):a},c.padAngle=function(e){return arguments.length?(o=typeof e==`function`?e:u(+e),c):o},c}var T=f.pie,E={sections:new Map,showData:!1,config:T},D=E.sections,O=E.showData,k=structuredClone(T),A={getConfig:l(()=>structuredClone(k),`getConfig`),clear:l(()=>{D=new Map,O=E.showData,d()},`clear`),setDiagramTitle:o,getDiagramTitle:c,setAccTitle:i,getAccTitle:y,setAccDescription:p,getAccDescription:_,addSection:l(({label:e,value:t})=>{if(t<0)throw Error(`"${e}" has invalid value: ${t}. Negative values are not allowed in pie charts. All slice values must be >= 0.`);D.has(e)||(D.set(e,t),n.debug(`added new section: ${e}, with value: ${t}`))},`addSection`),getSections:l(()=>D,`getSections`),setShowData:l(e=>{O=e},`setShowData`),getShowData:l(()=>O,`getShowData`)},j=l((e,t)=>{b(e,t),t.setShowData(e.showData),e.sections.map(t.addSection)},`populateDb`),M={parse:l(async e=>{let t=await x(`pie`,e);n.debug(t),j(t,A)},`parse`)},N=l(e=>`
  .pieCircle{
    stroke: ${e.pieStrokeColor};
    stroke-width : ${e.pieStrokeWidth};
    opacity : ${e.pieOpacity};
  }
  .pieOuterCircle{
    stroke: ${e.pieOuterStrokeColor};
    stroke-width: ${e.pieOuterStrokeWidth};
    fill: none;
  }
  .pieTitleText {
    text-anchor: middle;
    font-size: ${e.pieTitleTextSize};
    fill: ${e.pieTitleTextColor};
    font-family: ${e.fontFamily};
  }
  .slice {
    font-family: ${e.fontFamily};
    fill: ${e.pieSectionTextColor};
    font-size:${e.pieSectionTextSize};
    // fill: white;
  }
  .legend text {
    fill: ${e.pieLegendTextColor};
    font-family: ${e.fontFamily};
    font-size: ${e.pieLegendTextSize};
  }
`,`getStyles`),P=l(e=>{let t=[...e.values()].reduce((e,t)=>e+t,0),n=[...e.entries()].map(([e,t])=>({label:e,value:t})).filter(e=>e.value/t*100>=1).sort((e,t)=>t.value-e.value);return w().value(e=>e.value)(n)},`createPieArcs`),F={parser:M,db:A,renderer:{draw:l((r,i,o,s)=>{n.debug(`rendering pie chart
`+r);let c=s.db,l=v(),u=h(c.getConfig(),l.pie),d=m(i),f=d.append(`g`);f.attr(`transform`,`translate(225,225)`);let{themeVariables:p}=l,[_]=a(p.pieOuterStrokeWidth);_??=2;let y=u.textPosition,b=t().innerRadius(0).outerRadius(185),x=t().innerRadius(185*y).outerRadius(185*y);f.append(`circle`).attr(`cx`,0).attr(`cy`,0).attr(`r`,185+_/2).attr(`class`,`pieOuterCircle`);let S=c.getSections(),C=P(S),w=[p.pie1,p.pie2,p.pie3,p.pie4,p.pie5,p.pie6,p.pie7,p.pie8,p.pie9,p.pie10,p.pie11,p.pie12],T=0;S.forEach(e=>{T+=e});let E=C.filter(e=>(e.data.value/T*100).toFixed(0)!==`0`),D=e(w);f.selectAll(`mySlices`).data(E).enter().append(`path`).attr(`d`,b).attr(`fill`,e=>D(e.data.label)).attr(`class`,`pieCircle`),f.selectAll(`mySlices`).data(E).enter().append(`text`).text(e=>(e.data.value/T*100).toFixed(0)+`%`).attr(`transform`,e=>`translate(`+x.centroid(e)+`)`).style(`text-anchor`,`middle`).attr(`class`,`slice`),f.append(`text`).text(c.getDiagramTitle()).attr(`x`,0).attr(`y`,-400/2).attr(`class`,`pieTitleText`);let O=[...S.entries()].map(([e,t])=>({label:e,value:t})),k=f.selectAll(`.legend`).data(O).enter().append(`g`).attr(`class`,`legend`).attr(`transform`,(e,t)=>{let n=22*O.length/2;return`translate(216,`+(t*22-n)+`)`});k.append(`rect`).attr(`width`,18).attr(`height`,18).style(`fill`,e=>D(e.label)).style(`stroke`,e=>D(e.label)),k.append(`text`).attr(`x`,22).attr(`y`,14).text(e=>c.getShowData()?`${e.label} [${e.value}]`:e.label);let A=512+Math.max(...k.selectAll(`text`).nodes().map(e=>e?.getBoundingClientRect().width??0));d.attr(`viewBox`,`0 0 ${A} 450`),g(d,450,A,u.useMaxWidth)},`draw`)},styles:N};export{F as diagram};