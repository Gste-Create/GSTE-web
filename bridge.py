"""GSTE browser adapter. No network requests, only Pyodide virtual FS."""
from pathlib import Path
import shutil
import json
from gste.conversion_service import ConversionRequest, run_conversion
from gste.pipeline.ensemble_priority import EnsemblePriorityTrack



def finalize_drop_d_musicxml(score):
    """Align TAB staff tuning and visible label with Drop D fingering.

    Reject inconsistent sixth-string note pitches rather than silently altering music.
    """
    import xml.etree.ElementTree as ET
    root=ET.fromstring(score)
    ns_uri=root.tag[1:].split('}')[0] if root.tag.startswith('{') else ''
    q=lambda tag: ('{%s}%s' % (ns_uri,tag)) if ns_uri else tag
    part_names={}
    for sp in root.findall('./'+q('part-list')+'/'+q('score-part')):
        part_names[sp.get('id')]=(sp.findtext(q('part-name')) or '')
    tab_parts=[p for p in root.findall(q('part')) if 'TAB' in part_names.get(p.get('id'),'').upper()]
    if not tab_parts:
        raise ValueError('Drop D export: Guitar TAB part not found')
    semitones={'C':0,'D':2,'E':4,'F':5,'G':7,'A':9,'B':11}
    for part in tab_parts:
        for note in part.iter(q('note')):
            tech=note.find('./'+q('notations')+'/'+q('technical'))
            if tech is None or tech.findtext(q('string'))!='6': continue
            fret=tech.findtext(q('fret'))
            pitch=note.find(q('pitch'))
            if fret is None or pitch is None: continue
            step=pitch.findtext(q('step')); octave=pitch.findtext(q('octave'))
            if step not in semitones or octave is None: continue
            alter=int(pitch.findtext(q('alter'),'0'))
            midi=12*(int(octave)+1)+semitones[step]+alter
            if midi-int(fret)!=38:
                raise ValueError('Drop D export: sixth-string fingering and pitch disagree')
        measures=part.findall(q('measure'))
        if not measures: continue
        for measure in measures:
            for details in measure.iter(q('staff-details')):
                for st in details.findall(q('staff-tuning')):
                    if st.get('line')=='1':
                        step=st.find(q('tuning-step'))
                        if step is None: step=ET.SubElement(st,q('tuning-step'))
                        step.text='D'
                        octv=st.find(q('tuning-octave'))
                        if octv is None: octv=ET.SubElement(st,q('tuning-octave'))
                        octv.text='2'
                        alter=st.find(q('tuning-alter'))
                        if alter is not None: st.remove(alter)
        # Explicit tuning at first measure even if exporter omitted staff-details.
        first=measures[0]
        attrs=first.find(q('attributes'))
        if attrs is None:
            attrs=ET.Element(q('attributes'))
            first.insert(0,attrs)
        details=attrs.find(q('staff-details'))
        if details is None: details=ET.SubElement(attrs,q('staff-details'))
        st=next((x for x in details.findall(q('staff-tuning')) if x.get('line')=='1'),None)
        if st is None: st=ET.SubElement(details,q('staff-tuning'),{'line':'1'})
        for tag,value in [('tuning-step','D'),('tuning-octave','2')]:
            child=st.find(q(tag))
            if child is None: child=ET.SubElement(st,q(tag))
            child.text=value
        direction=ET.Element(q('direction'),{'placement':'above'})
        dtype=ET.SubElement(direction,q('direction-type'))
        ET.SubElement(dtype,q('words')).text='Tuning: Drop D (D A D G B E)'
        idx=list(first).index(attrs)+1
        first.insert(idx,direction)
    return ET.tostring(root,encoding='utf-8',xml_declaration=True)

def convert(payload):
    base=Path('/home/pyodide/gste_jobs')
    base.mkdir(parents=True,exist_ok=True)
    # Reuse a single workspace, clearing input and output after each conversion.
    work=base/'current'
    if work.exists(): shutil.rmtree(work)
    work.mkdir()
    try:
        def write_input(obj, stem):
            filename=obj['name']
            ext=Path(filename).suffix.lower()
            if ext not in ('.xml','.musicxml'):
                raise ValueError('Only uncompressed .xml / .musicxml are supported in this release')
            dest=work/(stem+ext)
            dest.write_bytes(bytes(obj['bytes']))
            return dest
        melody=write_input(payload['melody'],'melody')
        mode=payload['mode']
        if mode not in ('melody','piano','ensemble'): raise ValueError('Invalid conversion mode')
        left=None
        if mode=='piano': left=write_input(payload['left'],'left_hand')
        tracks=[]
        if mode=='ensemble':
            for i,t in enumerate(payload['tracks']):
                tracks.append(EnsemblePriorityTrack(path=write_input(t,f'ensemble_{i}'),instrument_family=t['family'],priority=i+1))
            if not tracks: raise ValueError('Ensemble mode requires an accompaniment track')
        result=run_conversion(ConversionRequest(kind=mode,melody=melody,left_hand=left,ensemble_tracks=tuple(tracks),output_dir=work/'output',accompaniment_mode=payload.get('accompaniment_mode','AUTO_GENERATED'),tuning_name=payload.get('tuning_name','standard')))
        score=result.tab_musicxml.read_bytes()
        if payload.get('tuning_name','standard')=='drop_d':
            score=finalize_drop_d_musicxml(score)
        report=result.report.read_text(encoding='utf-8') if result.report and result.report.exists() else ''
        contexts=list((work/'output').rglob('GSTE_EDITOR_CONTEXT.json'))
        context=contexts[0].read_text(encoding='utf-8') if contexts else None
        return {'score':list(score),'report':report,'name':'GSTE_TAB.musicxml','context':context}
    finally:
        if work.exists(): shutil.rmtree(work)
