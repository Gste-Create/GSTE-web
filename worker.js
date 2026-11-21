/* Runs only inside a dedicated worker. No uploads, telemetry, or server compute. */
let pyodide=null;
let initPromise=null;
const PYODIDE_URL='https://cdn.jsdelivr.net/pyodide/v0.27.7/full/';
async function init(){
  if(initPromise)return initPromise;
  initPromise=(async()=>{
    postMessage({type:'status',text:'載入 Python / WebAssembly 執行環境…'});
    importScripts(PYODIDE_URL+'pyodide.js');
    pyodide=await loadPyodide({indexURL:PYODIDE_URL});
    postMessage({type:'status',text:'載入 GSTE 原始編曲核心…'});
    const res=await fetch('./gste_core.zip');
    if(!res.ok)throw Error('無法載入 GSTE 核心檔案');
    pyodide.unpackArchive(await res.arrayBuffer(),'zip');
    const bridge=await fetch('./bridge.py');
    if(!bridge.ok)throw Error('無法載入瀏覽器適配器');
    await pyodide.runPythonAsync(await bridge.text());
    const garBridge=await fetch('./gar_bridge.py');
    if(!garBridge.ok)throw Error('無法載入 GAR 適配器');
    await pyodide.runPythonAsync(await garBridge.text());
    postMessage({type:'ready'});
  })();
  try{await initPromise}catch(e){initPromise=null;throw e}
}
self.onmessage=async event=>{
 const {type,payload}=event.data;
 try{
   if(type==='init'){await init();return}
   if(type==='gar_open'||type==='gar_measure'){
     await init();
     const fn=pyodide.globals.get(type);
     try{
       let selection=null;
       try{
         if(type==='gar_measure')selection=pyodide.toPy(payload.selected);
         const result=type==='gar_open'?fn(payload.text):fn(payload.measure,payload.chord,selection);
         try{postMessage({type:'gar_result',operation:type,data:JSON.parse(typeof result === 'string' ? result : result.toString())})}finally{if(result && typeof result.destroy === 'function')result.destroy()}
       }finally{selection?.destroy()}
     }finally{fn.destroy()}
     return;
   }
   if(type==='convert'){
     await init();
     postMessage({type:'status',text:'GSTE 正在本機編曲，複雜樂譜可能需要較長時間…'});
     const fn=pyodide.globals.get('convert');
     let result;
     const pyPayload=pyodide.toPy(payload);
     try{result=fn(pyPayload).toJs({dict_converter:Object.fromEntries})}finally{pyPayload.destroy();fn.destroy()}
     postMessage({type:'result',data:result});
   }
 }catch(e){postMessage({type:'error',text:String(e?.message||e),detail:String(e?.stack||'')})}
};
