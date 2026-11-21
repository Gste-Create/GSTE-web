const $=id=>document.getElementById(id);
const worker=new Worker('./worker.js');
let ready=false,busy=false,last=null,trackIndex=0;
const families=['GUITAR','BASS'];
function mode(){return document.querySelector('input[name=mode]:checked').value}
function update(){const m=mode();$('piano-fields').hidden=m!=='piano';$('ensemble-fields').hidden=m!=='ensemble';$('melody-options').hidden=m!=='melody'}
document.querySelectorAll('input[name=mode]').forEach(el=>el.addEventListener('change',update));
function addTrack(){if($('track-list').children.length>=6)return;const row=document.createElement('div');row.className='track';row.dataset.id=++trackIndex;const file=document.createElement('input');file.type='file';file.setAttribute('aria-label','伴奏軌 MusicXML');const select=document.createElement('select');select.setAttribute('aria-label','樂器類別');for(const family of families){const opt=document.createElement('option');opt.value=family;opt.textContent=family;select.append(opt)}const del=document.createElement('button');del.type='button';del.textContent='×';del.title='移除此軌';del.onclick=()=>row.remove();row.append(file,select,del);$('track-list').append(row)}
$('add-track').onclick=addTrack;addTrack();
function status(text,error=false){$('status').textContent=text;$('status').classList.toggle('error',error)}
function setBusy(value){busy=value;$('convert').disabled=value||!ready;$('convert').textContent=value?'轉換中…':'開始本機轉換'}
worker.onmessage=e=>{const {type,text,data,detail}=e.data;if(type==='status')status(text);if(type==='ready'){ready=true;setBusy(false);status('編曲引擎已就緒，樂譜只會在本機處理。')}if(type==='error'){setBusy(false);if(garPending){garPending=false;garStatus('GAR 錯誤：'+text,true)}else status('轉換失敗：'+text+'\n'+(detail||''),true)}if(type==='gar_result'){garPending=false;if(e.data.operation==='gar_open')onGarOpen(data);else onGarMeasure(data)}if(type==='result'){setBusy(false);last=data;$('context-download').hidden=!data.context;$('context-open').hidden=!data.context;$('actions').hidden=false;status('轉換完成！請下載並使用 MuseScore 檢查譜面。')}};
worker.onerror=e=>{setBusy(false);status('編曲引擎發生錯誤：'+e.message,true)};
async function readFile(file){if(!file)throw Error('請選擇必要的 MusicXML 樂譜');if(!/\.(xml|musicxml)$/i.test(file.name))throw Error('僅支援 .xml 或 .musicxml；MXL 請先解壓縮');if(file.size>12*1024*1024)throw Error('單一檔案目前上限 12 MB');return {name:file.name,bytes:new Uint8Array(await file.arrayBuffer())}}
$('convert').onclick=async()=>{if(busy||!ready)return;setBusy(true);last=null;$('context-download').hidden=true;$('context-open').hidden=true;$('actions').hidden=true;try{const m=mode();const payload={mode:m,melody:await readFile($('melody').files[0]),accompaniment_mode:$('accompaniment').value,tuning_name:$('tuning').value};if(m==='piano')payload.left=await readFile($('left').files[0]);if(m==='ensemble'){payload.tracks=[];for(const row of $('track-list').children){const file=row.querySelector('input').files[0];if(file)payload.tracks.push({...await readFile(file),family:row.querySelector('select').value})}if(!payload.tracks.length)throw Error('團譜模式至少需要一個伴奏軌')}worker.postMessage({type:'convert',payload})}catch(e){setBusy(false);status(e.message,true)}};
function download(data,name,type){const blob=new Blob([data],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000)}
$('download').onclick=()=>{if(last)download(new Uint8Array(last.score),last.name,'application/vnd.recordare.musicxml+xml')};
$('report').onclick=()=>{if(last)download(last.report||'No report','CONVERSION_REPORT.md','text/markdown;charset=utf-8')};
update();worker.postMessage({type:'init'});

// GAR is a separate read-only JSON-only viewer. The desktop Python reference index remains authoritative.
let garPending=false,garMeasures=[],garCurrent=null,garSelection=new Set(),garDrag=null;
const garStatus=(message,error=false)=>{const el=$('gar-status');el.textContent=message;el.classList.toggle('error',error)};
function garLoad(text){garPending=true;garSelection.clear();$('gar-view').hidden=true;garStatus('正在讀取 GAR Context…');worker.postMessage({type:'gar_open',payload:{text}})}
$('gar-file').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;if(file.size>30*1024*1024){garStatus('JSON 大小上限 30 MB',true);return}try{garLoad(await file.text())}catch(err){garStatus(err.message,true)}});
$('context-download').onclick=()=>{if(last?.context)download(last.context,'GSTE_EDITOR_CONTEXT.json','application/json;charset=utf-8')};
$('context-open').onclick=()=>{if(last?.context){garLoad(last.context);$('gar-panel').scrollIntoView({behavior:'smooth'})}};
function onGarOpen(data){garMeasures=data.measures;const select=$('gar-measure');select.replaceChildren();for(const m of garMeasures){const option=document.createElement('option');option.value=m.measure;option.textContent=`${m.label}｜${m.chords.join(' / ')||'C'}`;select.append(option)}$('gar-view').hidden=false;garStatus(`已載入 ${garMeasures.length} 小節（唯讀）`);garChoose()}
function garChoose(){const m=garMeasures.find(x=>String(x.measure)===$('gar-measure').value);if(!m)return;garSelection.clear();$('gar-chord').value=m.source_chord;garRefresh()}
function garRefresh(){if(!$('gar-measure').value)return;garPending=true;worker.postMessage({type:'gar_measure',payload:{measure:Number($('gar-measure').value),chord:$('gar-chord').value.trim(),selected:[...garSelection]}})}
$('gar-measure').onchange=garChoose;$('gar-refresh').onclick=garRefresh;$('gar-chord').addEventListener('keydown',e=>{if(e.key==='Enter')garRefresh()});
const svgNS='http://www.w3.org/2000/svg';
function node(tag,attrs={},content=''){const el=document.createElementNS(svgNS,tag);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,v);if(content!==undefined)el.textContent=String(content);return el}
function renderTab(measure){const svg=$('gar-tab');svg.replaceChildren();const left=45,right=730;for(let string=1;string<=6;string++){const y=15+string*23;svg.append(node('text',{x:15,y:y+4,'font-size':12},string));svg.append(node('line',{x1:left,y1:y,x2:right,y2:y,stroke:'#aeb9c5'}))}
 const hits=[];for(const n of measure.notes){if(!n.string||n.fret===null)continue;const x=left+20+(right-left-40)*n.offset/Math.max(measure.duration,.01),y=15+n.string*23;const id=String(n.event_id||n.note_id),melody=n.role==='melody';const g=node('g');g.append(node('rect',{x:x-12,y:y-10,width:24,height:20,fill:melody&&garSelection.has(id)?'#ffe59a':'white'}));g.append(node('text',{x,y:y+5,'font-size':14,'font-weight':700,'text-anchor':'middle',fill:melody?'#2463ad':'#777'},n.fret));g.append(node('line',{x1:x+12,y1:y+8,x2:Math.min(right-4,x+Math.max(0,n.duration)*(right-left-40)/Math.max(measure.duration,.01)),y2:y+8,stroke:melody?'#2463ad':'#777'}));svg.append(g);if(melody)hits.push({x1:x-13,y1:y-11,x2:x+13,y2:y+11,id})}
 const coords=e=>{const r=svg.getBoundingClientRect();return{x:(e.clientX-r.left)*760/r.width,y:(e.clientY-r.top)*175/r.height}};
 svg.onpointerdown=e=>{garDrag={start:coords(e),add:e.ctrlKey||e.metaKey};svg.setPointerCapture(e.pointerId)};
 svg.onpointerup=e=>{if(!garDrag)return;const p=coords(e),q=garDrag.start;const x1=Math.min(p.x,q.x),x2=Math.max(p.x,q.x),y1=Math.min(p.y,q.y),y2=Math.max(p.y,q.y);if(!garDrag.add)garSelection.clear();for(const h of hits)if(h.x1<=x2&&h.x2>=x1&&h.y1<=y2&&h.y2>=y1)garSelection.add(h.id);garDrag=null;garRefresh()};
}
function onGarMeasure(data){garCurrent=data;const m=data.measure,idx=data.index;$('gar-summary').textContent=`小節 ${m.label}｜和弦 ${idx.chord}｜主旋律參考把位 ${idx.anchor_fret} 格｜可用指板位置 ${idx.nearby.length} 個`;renderTab(m);
 const nearby=$('gar-nearby');nearby.replaceChildren();for(const p of idx.nearby.slice(0,48)){const div=document.createElement('div');div.textContent=`${p.string}弦 ${p.fret}格 · ${p.name} · MIDI ${p.midi} · ${p.role}`;nearby.append(div)}if(idx.nearby.length>48){const x=document.createElement('p');x.textContent=`其餘 ${idx.nearby.length-48} 個位置省略`;nearby.append(x)}if(!idx.nearby.length)nearby.textContent='此小節沒有符合簡化條件的指板位置。';
 const doubles=$('gar-doubles');doubles.replaceChildren();if(!data.doubles.length)doubles.textContent='請選取旋律音符查看雙音候選。';for(const d of data.doubles){const h=document.createElement('strong');h.textContent=`旋律 ${d.note.string}弦${d.note.fret}格 · MIDI ${d.note.pitch} · 起拍 ${d.note.offset+1}`;doubles.append(h);if(!d.proposals.length){const p=document.createElement('p');p.textContent='此把位無符合簡化條件的雙音建議';doubles.append(p)}for(const p of d.proposals){const row=document.createElement('div');row.textContent=`${p.string}弦 ${p.fret}格 · ${p.name} · MIDI ${p.midi} · ${p.interval}`;doubles.append(row)}}
 garStatus(`小節 ${m.label} 索引已更新（唯讀）`)
}
