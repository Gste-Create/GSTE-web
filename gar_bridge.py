"""JSON-only read-only GAR adapter; desktop reference_index is authoritative."""
import json
from gste.editor.reference_index import index_measure, TUNING, NAMES

_GAR = None

def gar_open(raw):
    global _GAR
    _GAR = None
    ctx = json.loads(raw)
    if not isinstance(ctx, dict):
        raise ValueError('Context 必須是 JSON 物件')
    measures, score, windows = (ctx.get(k) for k in ('measures','score_notes','windows'))
    if not all(isinstance(x,list) for x in (measures,score,windows)) or not measures or not score:
        raise ValueError('JSON 缺少 measures、score_notes 或 windows；舊版 Context 不支援完整 GAR')
    by_measure={}
    for m in score:
        if not isinstance(m,dict) or not isinstance(m.get('notes'),list) or not isinstance(m.get('measure'),int) or not isinstance(m.get('duration'),(int,float)) or m['duration']<=0:
            raise ValueError('score_notes 的小節或音符資料不完整')
        for n in m['notes']:
            if not isinstance(n,dict) or any(k not in n for k in ('note_id','role','offset','duration','pitch','string','fret')):
                raise ValueError('score_notes.notes 缺少必要欄位')
            if n['role'] not in ('melody','accompaniment') or not isinstance(n['offset'],(int,float)) or not isinstance(n['duration'],(int,float)) or not isinstance(n['pitch'],int) or not isinstance(n['string'],int) or n['string'] not in range(1,7) or not isinstance(n['fret'],int) or not 0<=n['fret']<=24:
                raise ValueError('score_notes.notes 欄位格式錯誤')
        by_measure[m['measure']]=m
    rows=[]
    for m in measures:
        if not isinstance(m,dict) or any(k not in m for k in ('measure','start','duration','label')):
            raise ValueError('measures 欄位不完整')
        if m['measure'] not in by_measure:
            raise ValueError('找不到小節 %s 的 score_notes' % m['measure'])
        chords=[]
        for w in windows:
            h=w.get('harmony') if isinstance(w,dict) else None
            if isinstance(h,dict) and isinstance(h.get('start'),(int,float)) and m['start']<=h['start']<m['start']+m['duration']:
                symbol=h.get('chord_symbol')
                if isinstance(symbol,str) and symbol and symbol not in chords: chords.append(symbol)
        rows.append({'measure':m['measure'],'label':str(m['label']),'chords':chords,'source_chord':chords[0] if chords and chords[0] not in ('NONE','UNKNOWN') else 'C'})
    _GAR=by_measure
    return json.dumps({'measures':rows},ensure_ascii=False)

def gar_measure(number,chord,selected):
    if _GAR is None: raise ValueError('請先匯入 GAR JSON')
    m=_GAR.get(int(number))
    if m is None: raise ValueError('小節不存在')
    data=index_measure(m,str(chord))
    ids=set(selected or [])
    melody=data['melody']
    doubles=[]
    for n in melody:
        eid=str(n.get('event_id') or n['note_id'])
        if eid not in ids: continue
        proposals=[]
        for string,opened in enumerate(TUNING,1):
            if string==n['string']: continue
            if any(other is not n and other['string']==string and other['offset']<=n['offset']<other['offset']+other['duration'] for other in melody): continue
            for fret in range(25):
                if fret and abs(fret-max(n['fret'],data['anchor_fret']))>4: continue
                midi=opened+fret
                diff=abs(midi-n['pitch'])
                if diff not in (3,4,8,9,12): continue
                proposals.append((abs(fret-n['fret']),string,fret,midi,{3:'小三度',4:'大三度',8:'小六度',9:'大六度',12:'八度'}[diff]))
        doubles.append({'id':eid,'note':n,'proposals':[{'string':s,'fret':f,'midi':p,'name':NAMES[p%12]+str(p//12-1),'interval':label} for _,s,f,p,label in sorted(proposals)[:20]]})
    return json.dumps({'measure':m,'index':data,'doubles':doubles},ensure_ascii=False)
