"""Integrate approved service content without rebuilding shared site chrome."""
from pathlib import Path
from html import escape
from lxml import html
import json,re,sys,posixpath,csv

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(Path(__file__).parent))
import importlib.util
spec=importlib.util.spec_from_file_location('reference_builder',Path(__file__).with_name('build-service-reference-content.py'))
reference=importlib.util.module_from_spec(spec);spec.loader.exec_module(reference)
MODEL=json.loads((ROOT/'service-page-updates.json').read_text())

def raw(source,tag):
    return re.search(r'<'+tag+r'\b.*?</'+tag+'>',source,re.S)[0]

def prefix(relative):
    return posixpath.relpath('.',str(Path(relative).parent)).rstrip('/')+'/'

def form_markup(base,key):
    doc=html.fromstring((ROOT/'contactanos/index.html').read_text())
    form=doc.xpath('//form[@id="contact-form"]')[0]
    result=doc.xpath('//*[@id="contact-result"]')[0]
    service={'accounting-support':'Contabilidad y tributario','corporate-amendments':'Trámites notariales','monthly-legal-advice':'Corporativo'}.get(key,'Empresas extranjeras')
    form.set('data-service-context',key)
    for option in form.xpath('.//select[@name="servicio"]/option'):
        option.attrib.pop('selected',None)
        if option.get('value')==service: option.set('selected','')
    for node in [form,result]:
        for element in [node,*node.iterdescendants()]:
            for attr in ['href','action','data-endpoint']:
                value=element.get(attr)
                if value and value.startswith('../'):element.set(attr,base+value[3:])
    return '<div class="contact-page-form">'+html.tostring(form,encoding='unicode')+html.tostring(result,encoding='unicode')+'</div>'

def add_resources(source,base):
    for name in ['approved-services.css','contact-form.css']:
        url=base+name
        if 'href="'+url+'"' not in source:source=source.replace('</head>','<link rel="stylesheet" href="'+url+'"></head>')
    for name in ['approved-services.js','contact-form.js']:
        url=base+name
        if 'src="'+url+'"' not in source:source=source.replace('</body>','<script defer src="'+url+'"></script></body>')
    return source

def main():
    updates={}
    for key,copy in MODEL.items():
        for relative in copy['targets']:
            path=ROOT/relative;source=path.read_text();before=source;base=prefix(relative)
            markup=copy['main'].replace('{root}',base)
            markup=re.sub(r'<div data-contact-slot=""></div>',lambda _:form_markup(base,key),markup)
            source=source.replace(raw(source,'main'),markup)
            source=reference.schema_update(source,copy['title'],copy['description'],copy['faqs'])
            source=add_resources(source,base)
            for tag in ['header','footer']:assert raw(source,tag)==raw(before,tag),tag
            path.write_text(source)
            updates[relative]=(copy['title'],copy['description'])
    inventory=ROOT/'seo-inventory.json';rows=json.loads(inventory.read_text())
    for row in rows:
        if row['file'] in updates:row['title'],row['description']=updates[row['file']]
    inventory.write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n')
    urlmap=ROOT/'URL-MAP.csv';rows=list(csv.DictReader(urlmap.read_text().splitlines()));fields=list(rows[0])
    for row in rows:
        if row['file'] in updates:row['title']=updates[row['file']][0]
    with urlmap.open('w',newline='') as handle:
        writer=csv.DictWriter(handle,fieldnames=fields);writer.writeheader();writer.writerows(rows)
    print('Updated',len(updates),'existing Spanish documents; shared header and footer preserved.')

if __name__=='__main__':main()
