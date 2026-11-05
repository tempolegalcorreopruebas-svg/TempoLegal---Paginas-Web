"""Apply approved service reference copy to existing page components.

Content is kept separately from reusable header, footer, images and animation code.
Run after other page generators when rebuilding these Spanish service pages.
"""
from pathlib import Path
from html import escape
from lxml import html
import json,re,posixpath,csv
from urllib.parse import urlsplit

ROOT=Path(__file__).resolve().parents[1]
MODEL=json.loads((ROOT/'service-reference-content.json').read_text())
SHARED=json.JSONDecoder().raw_decode((ROOT/'content.js').read_text().split('window.TEMPO_CONTENT = ',1)[1])[0]
TEAM={p['name']:p for p in SHARED['es']['teamItems']}
PEOPLE={'Juan Alberto Gómez':'juan-gomez','Daniela Barahona':'daniela-barahona','Emillie Donoso':'emilie-donoso','Rolando Valencia':'rolando-valencia','Gabriel Calvopiña':'gabriel-calvopina'}
ROUTES={'sas':'constitucion-de-empresas-sas/index.html','representacion':'representacion-legal-fiscal-ecuador/index.html','softlanding':'services/soft-landing/index.html','corporativo':'services/corporate-law/index.html','asesoria_mensual':'services/monthly-legal-advice/index.html','reformas':'tramites-notariales-y-societarios/index.html'}
def esc(s):return escape(s,quote=True)
def paragraph(s,cls=''):return '<p'+(' class="'+cls+'"' if cls else '')+'>'+esc(s)+'</p>'
def select(n,c):return n.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," '+c+' ")]')
def set_text(n,value):
    for child in list(n):n.remove(child)
    n.text=value
def raw_element(source,tag):return re.search(r'<'+tag+r'\b.*?</'+tag+'>',source,re.S)[0]
def schema_update(source,title,description,faqs):
    source=re.sub(r'<title\b[^>]*>.*?</title>',lambda _:'<title>'+esc(title)+'</title>',source,count=1,flags=re.S)
    def meta(m):
        tag=m[0]
        if re.search(r'(?:name|property)="(?:description|og:description|twitter:description)"',tag):return re.sub(r'content="[^"]*"',lambda _:'content="'+esc(description)+'"',tag)
        if re.search(r'(?:name|property)="(?:og:title|twitter:title)"',tag):return re.sub(r'content="[^"]*"',lambda _:'content="'+esc(title)+'"',tag)
        return tag
    source=re.sub(r'<meta\b[^>]*>',meta,source)
    def schema(m):
        data=json.loads(m[2]);graph=data.get('@graph',[data])
        for item in graph:
            if item.get('@type') in ['WebPage','Service']:item.update(name=title if item['@type']=='WebPage' else title.split(' | ')[0],description=description)
            if item.get('@type')=='FAQPage':item['mainEntity']=[{'@type':'Question','name':q['question'],'acceptedAnswer':{'@type':'Answer','text':q['answer']}} for q in faqs]
        return m[1]+json.dumps(data,ensure_ascii=False)+m[3]
    return re.sub(r'(<script\b[^>]*type="application/ld\+json"[^>]*>)(.*?)(</script>)',schema,source,flags=re.S)

def build(key,copy,language='es'):
    folder='' if language=='es' else language+'/'
    relative=folder+copy['target'];path=ROOT/relative;original=path.read_text()
    main=html.fragment_fromstring(raw_element(original,'main'))
    ids={s.get('sourceId'):s['id'] for s in copy['sections'] if s.get('sourceId')}
    ids.update(contacto='service-contact',inicio='service-main',**{'experiencia-internacional':'international-context'})
    def route(target):
        if folder and not target.startswith('assets/'):target=folder+target
        assert (ROOT/target).is_file(),target
        return posixpath.relpath(target,str(Path(relative).parent))
    contact=select(main,'service-actions')[0].xpath('./a')[0].get('href')
    parsed=urlsplit(contact)
    if not parsed.scheme and parsed.fragment:
        destination=(path.parent/parsed.path).resolve()
        if destination.is_dir():destination/='index.html'
        if destination.is_file() and not html.parse(str(destination)).xpath('//*[@id=$value]',value=parsed.fragment):contact=route('contactanos/index.html')
    def href(value):
        if value.startswith('#'):
            anchor=value[1:]
            if anchor=='contacto':return contact
            if anchor.startswith('ruta-'):anchor='situacion'
            if anchor not in ids:return '#'+copy['sections'][0]['id']
            return '#'+ids[anchor]
        if 'referencias_relacionadas/' in value:
            key=value.split('referencias_relacionadas/')[1].split('/')[0].lower();return route(ROUTES[key])
        if value.startswith('https://tempolegal.com/'):
            target=value.split('https://tempolegal.com/',1)[1].strip('/')
            target,separator,anchor=target.partition('#')
            return route((target.rstrip('/')+'/' if target else '')+'index.html')+('#'+anchor if separator else '')
        return value
    def render(items):
        output=''
        for item in items:
            kind=item['type']
            if kind=='paragraph':output+=paragraph(item['text'])
            elif kind=='eyebrow':output+=paragraph(item['text'],'eyebrow')
            elif kind=='heading':output+='<h3 class="service-content-heading">'+esc(item['text'])+'</h3>'
            elif kind=='link':
                url=href(item['href']);output+='<p><a class="text-link" href="'+esc(url)+'">'+esc(item['text'])+'</a></p>'
            elif kind=='disclosure':output+='<details class="service-question"><summary>'+esc(item['text'])+'</summary><div>'+render(item['blocks'])+'</div></details>'
            elif kind in ['list','steps']:
                tag='ul' if kind=='list' else 'ol';cls='service-scope' if kind=='list' else 'service-process'
                output+='<'+tag+' class="'+cls+'">'+''.join('<li>'+render(row)+'</li>' for row in item['items'])+'</'+tag+'>'
        return output
    hero=select(main,'service-hero-copy')[0]
    for extra in select(hero,'service-lead')[1:]:extra.getparent().remove(extra)
    set_text(select(hero,'eyebrow')[0],copy['eyebrow']);set_text(hero.xpath('./h1')[0],copy['title'])
    lead=select(hero,'service-lead')[0];set_text(lead,copy['lead'])
    hero.insert(list(hero).index(lead)+1,html.fragment_fromstring(paragraph(copy['description'],'service-lead')))
    action=select(hero,'service-actions')[0].xpath('./a')[0];action.set('href',contact);set_text(action,copy['action']);action.append(html.fragment_fromstring('<span aria-hidden="true">↗</span>'))
    overview=select(main,'service-overview')
    if overview:
        summary=copy.get('overview') or {'accounting-support':'Actividades, entregables, frecuencia y responsables definidos en su propuesta.','holding-structures':'Una holding es una alternativa. Primero revisamos sus compañías y el objetivo de la estructura.','sas-incorporation':'Desde USD 140 + IVA para un accionista persona natural. Firmas electrónicas aparte si las necesita.'}[key]
        set_text(select(overview[0],'service-overview-title')[0],summary)
        label={'es':'Conocer el alcance','en':'Explore the scope','pt':'Conhecer o escopo','fr':'Découvrir le périmètre'}[language]
        a=overview[0].xpath('./a')[0];set_text(a,label+' ↓');a.set('href','#scope')
    story=select(main,'service-story')[0]
    for child in list(story):story.remove(child)
    review_roles={r['name']:r.get('role','') for r in json.loads((ROOT/'corporate-page-content.json').read_text())[language]['reviews']}
    for section in copy['sections']:
        body=''
        if section.get('faq'):
            body=''.join(paragraph(p) for p in section.get('intro',[]))+''.join('<details class="service-question"><summary>'+esc(q['question'])+'</summary><div>'+paragraph(q['answer'])+'</div></details>' for q in copy['faqs'])
        elif 'people' in section:
            body=''.join(paragraph(p) for p in section['intro'])+render(section.get('extra',[]))+'<div class="about-team-grid">'
            for person in section['people']:
                info=next(p for p in SHARED['es']['teamItems'] if p['id']==PEOPLE[person['name']])
                body+='<article class="about-member"><img src="'+route(info['photo'])+'" alt="'+esc(person['name'])+'" width="900" height="900" loading="lazy" decoding="async"><div><h3>'+esc(person['name'])+'</h3>'+paragraph(person['degree'],'about-degree')+paragraph(person['role'])+paragraph(person['contribution'])
                label={'es':'Ver perfil','en':'View profile','pt':'Ver perfil','fr':'Voir le profil'}[language]
                if info.get('page') and (ROOT/(folder+info['page'])).exists():body+='<a class="text-link" href="'+route(info['page'])+'">'+label+' ↗</a>'
                body+='</div></article>'
            body+='</div>'+''.join(paragraph(p) for p in section['notes'])
        elif 'reviews' in section:
            body=''.join(paragraph(p) for p in section['intro'])
            for review in section['reviews']:
                body+='<details class="service-question"><summary>'+esc(review['name'])+'</summary><div>'+paragraph(review_roles.get(review['name'],''))+''.join(paragraph(p) for p in review['paragraphs'])
                if review['name']=='Pablo Lucio Paredes':body+=paragraph({'es':'Testimonio personal; la afiliación no implica aval institucional.','en':'Personal testimonial; the affiliation does not imply institutional endorsement.','pt':'Depoimento pessoal; a afiliação não implica aval institucional.','fr':'Témoignage personnel ; l’affiliation n’implique pas un soutien institutionnel.'}[language])
                body+='</div></details>'
        else:body=render(section['blocks'])
        sid=section['id'];markup='<section class="service-section service-reveal" id="'+sid+'" aria-labelledby="'+sid+'-title"><h2 id="'+sid+'-title">'+esc(section['title'])+'</h2>'+body+'</section>'
        story.append(html.fragment_fromstring(markup))
    sidebar=select(main,'service-sidebar')[0].xpath('.//ol')[0]
    for child in list(sidebar):sidebar.remove(child)
    for section in copy['sections']:
        sidebar.append(html.fragment_fromstring('<li><a href="#'+section['id']+'">'+esc(section['title'])+'</a></li>'))
    cta=select(main,'service-cta')[0];cta.set('id','service-contact')
    for link in cta.xpath('.//a[contains(concat(" ",@class," ")," button ")]'):link.set('href',contact)
    set_text(cta.xpath('.//h2')[0],copy['contact']['title'])
    body=cta.xpath('./div/div')[0]
    for p in body.xpath('./p[not(contains(@class,"eyebrow"))]'):body.remove(p)
    body.append(html.fragment_fromstring(paragraph(copy['contact']['intro'])))
    for p in copy['contact']['notes']:body.append(html.fragment_fromstring(paragraph(p)))
    for a in select(main,'service-related')[0].xpath('.//a[@href]'):
        if a.get('href').endswith('/') and (path.parent/a.get('href')/'index.html').is_file():a.set('href',a.get('href')+'index.html')
    source=original.replace(raw_element(original,'main'),html.tostring(main,encoding='unicode',method='html'))
    title=copy['title'].rstrip('.')+' | TempoLegal'
    source=schema_update(source,title,copy['description'],copy['faqs'])
    for tag in ['header','footer']:assert raw_element(source,tag)==raw_element(original,tag),tag+' changed'
    path.write_text(source)
    return title,copy['description']

def main():
    translations=json.loads((ROOT/'service-reference-translations.json').read_text())
    localized={'es':MODEL,**translations};updates={}
    for language,services in localized.items():
        for key,copy in services.items():
            relative=('' if language=='es' else language+'/')+copy['target'];updates[relative]=build(key,copy,language)
    path=ROOT/'service-content.json';shared=json.loads(path.read_text())
    for language,services in localized.items():
        for key,copy in services.items():
            old=shared[key][language];old[0]=copy['title'].rstrip('.');old[1]=copy['description'];old[2]=copy['lead']
            old[3]=[s['title'] for s in copy['sections'] if s['id'] not in ['team','testimonials','questions']]
            if copy.get('overview'):old[4]=copy['overview']
    path.write_text(json.dumps(shared,ensure_ascii=False,indent=2)+'\n')
    path=ROOT/'seo-inventory.json';inventory=json.loads(path.read_text())
    for row in inventory:
        if row['file'] in updates:row['title'],row['description']=updates[row['file']]
    path.write_text(json.dumps(inventory,ensure_ascii=False,indent=2)+'\n')
    path=ROOT/'URL-MAP.csv';rows=list(csv.DictReader(path.read_text().splitlines()));fields=list(rows[0])
    for row in rows:
        if row['file'] in updates:row['title']=updates[row['file']][0]
    with path.open('w',newline='') as handle:
        writer=csv.DictWriter(handle,fieldnames=fields);writer.writeheader();writer.writerows(rows)
    print('Updated four service pages and their English, Portuguese and French versions.')
if __name__=='__main__':main()
