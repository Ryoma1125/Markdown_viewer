import{Gn as e,Mn as t,Pn as n,Sn as r,Wn as i,bn as a,dn as o,gn as s,jn as c,jt as l,k as u,mn as d,vn as f,yn as p}from"./index-PJ0TmLvI.js";import"./chunk-FPAJGGOC-BceANEb6.js";import"./reduce-DauDZIpp.js";import"./flatten-BrsxrPBL.js";import"./chunk-O7ZBX7Z2-0fDIUA28.js";import"./chunk-S6J4BHB3-BRGM7sR4.js";import"./chunk-LBM3YZW2-BH7L41YB.js";import"./chunk-76Q3JFCE-OvcpyqKY.js";import"./chunk-T53DSG4Q-HYK5nhKU.js";import"./chunk-LHMN2FUI-VRXC37XE.js";import"./chunk-FWNWRKHM-KAiGvm8n.js";import{t as m}from"./chunk-4BX2VUAB-DqxKBPbq.js";import{t as h}from"./mermaid-parser.core-DaqFPnnB.js";var g=s.packet,_=class{constructor(){this.packet=[],this.setAccTitle=t,this.getAccTitle=p,this.setDiagramTitle=n,this.getDiagramTitle=r,this.getAccDescription=f,this.setAccDescription=c}static#e=i(this,`PacketDB`);getConfig(){let e=u({...g,...a().packet});return e.showBits&&(e.paddingY+=10),e}getPacket(){return this.packet}pushWord(e){e.length>0&&this.packet.push(e)}clear(){o(),this.packet=[]}},v=1e4,y=i((t,n)=>{m(t,n);let r=-1,i=[],a=1,{bitsPerRow:o}=n.getConfig();for(let{start:s,end:c,bits:l,label:u}of t.blocks){if(s!==void 0&&c!==void 0&&c<s)throw Error(`Packet block ${s} - ${c} is invalid. End must be greater than start.`);if(s??=r+1,s!==r+1)throw Error(`Packet block ${s} - ${c??s} is not contiguous. It should start from ${r+1}.`);if(l===0)throw Error(`Packet block ${s} is invalid. Cannot have a zero bit field.`);for(c??=s+(l??1)-1,l??=c-s+1,r=c,e.debug(`Packet block ${s} - ${r} with label ${u}`);i.length<=o+1&&n.getPacket().length<v;){let[e,t]=b({start:s,end:c,bits:l,label:u},a,o);if(i.push(e),e.end+1===a*o&&(n.pushWord(i),i=[],a++),!t)break;({start:s,end:c,bits:l,label:u}=t)}}n.pushWord(i)},`populate`),b=i((e,t,n)=>{if(e.start===void 0)throw Error(`start should have been set during first phase`);if(e.end===void 0)throw Error(`end should have been set during first phase`);if(e.start>e.end)throw Error(`Block start ${e.start} is greater than block end ${e.end}.`);if(e.end+1<=t*n)return[e,void 0];let r=t*n-1,i=t*n;return[{start:e.start,end:r,label:e.label,bits:r-e.start},{start:i,end:e.end,label:e.label,bits:e.end-i}]},`getNextFittingBlock`),x={parser:{yy:void 0},parse:i(async t=>{let n=await h(`packet`,t),r=x.parser?.yy;if(!(r instanceof _))throw Error(`parser.parser?.yy was not a PacketDB. This is due to a bug within Mermaid, please report this issue at https://github.com/mermaid-js/mermaid/issues.`);e.debug(n),y(n,r)},`parse`)},S=i((e,t,n,r)=>{let i=r.db,a=i.getConfig(),{rowHeight:o,paddingY:s,bitWidth:c,bitsPerRow:u}=a,f=i.getPacket(),p=i.getDiagramTitle(),m=o+s,h=m*(f.length+1)-(p?0:o),g=c*u+2,_=l(t);_.attr(`viewbox`,`0 0 ${g} ${h}`),d(_,h,g,a.useMaxWidth);for(let[e,t]of f.entries())C(_,t,e,a);_.append(`text`).text(p).attr(`x`,g/2).attr(`y`,h-m/2).attr(`dominant-baseline`,`middle`).attr(`text-anchor`,`middle`).attr(`class`,`packetTitle`)},`draw`),C=i((e,t,n,{rowHeight:r,paddingX:i,paddingY:a,bitWidth:o,bitsPerRow:s,showBits:c})=>{let l=e.append(`g`),u=n*(r+a)+a;for(let e of t){let t=e.start%s*o+1,n=(e.end-e.start+1)*o-i;if(l.append(`rect`).attr(`x`,t).attr(`y`,u).attr(`width`,n).attr(`height`,r).attr(`class`,`packetBlock`),l.append(`text`).attr(`x`,t+n/2).attr(`y`,u+r/2).attr(`class`,`packetLabel`).attr(`dominant-baseline`,`middle`).attr(`text-anchor`,`middle`).text(e.label),!c)continue;let a=e.end===e.start,d=u-2;l.append(`text`).attr(`x`,t+(a?n/2:0)).attr(`y`,d).attr(`class`,`packetByte start`).attr(`dominant-baseline`,`auto`).attr(`text-anchor`,a?`middle`:`start`).text(e.start),a||l.append(`text`).attr(`x`,t+n).attr(`y`,d).attr(`class`,`packetByte end`).attr(`dominant-baseline`,`auto`).attr(`text-anchor`,`end`).text(e.end)}},`drawWord`),w={draw:S},T={byteFontSize:`10px`,startByteColor:`black`,endByteColor:`black`,labelColor:`black`,labelFontSize:`12px`,titleColor:`black`,titleFontSize:`14px`,blockStrokeColor:`black`,blockStrokeWidth:`1`,blockFillColor:`#efefef`},E={parser:x,get db(){return new _},renderer:w,styles:i(({packet:e}={})=>{let t=u(T,e);return`
	.packetByte {
		font-size: ${t.byteFontSize};
	}
	.packetByte.start {
		fill: ${t.startByteColor};
	}
	.packetByte.end {
		fill: ${t.endByteColor};
	}
	.packetLabel {
		fill: ${t.labelColor};
		font-size: ${t.labelFontSize};
	}
	.packetTitle {
		fill: ${t.titleColor};
		font-size: ${t.titleFontSize};
	}
	.packetBlock {
		stroke: ${t.blockStrokeColor};
		stroke-width: ${t.blockStrokeWidth};
		fill: ${t.blockFillColor};
	}
	`},`styles`)};export{E as diagram};