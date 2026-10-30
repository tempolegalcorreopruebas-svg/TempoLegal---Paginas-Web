"""Add Rolando's brief profile and apply the requested home testimonial sequence."""
from pathlib import Path
from copy import deepcopy
from html import escape
from lxml import html,etree
from PIL import Image
import json,re,csv

ROOT=Path(__file__).resolve().parents[1]
COPY=json.loads((ROOT/'rolando-profile-content.json').read_text())
NAME='Rolando Valencia';ID='rolando-valencia';PAGE='team-rolando-valencia.html'
PHOTO='assets/team/2026-10-24_Rolando_TempoLegal_Fondo_Quito_RECREACION_HD.png'
ORDER=['francisco','pablo','ana','eleazar','juan']
width,height=Image.open(ROOT/PHOTO).size
def raw(s,tag):return re.search(r'<'+tag+r'\b.*?</'+tag+'>',s,re.S)[0]
def serialize(e):return html.tostring(e,encoding='unicode',method='html')
def first(e,x):return e.xpath(x)[0]
def cls(e,name):return e.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," '+name+' ")]')
def set_text(e,s):
    for child in list(e):e.remove(child)
    e.text=s
def para(s,c=''):return '<p'+(' class="'+c+'"' if c else '')+'>'+escape(s)+'</p>'
def replace_main(source,main):return source.replace(raw(source,'main'),serialize(main))

source=(ROOT/'content.js').read_text();prefix='window.TEMPO_CONTENT = '
before,payload=source.split(prefix,1);CONTENT,end=json.JSONDecoder().raw_decode(payload);tail=payload[end:]
base_eleazar=deepcopy(next(p for p in CONTENT['es']['reviewItems'] if p['id']=='eleazar'))
corporate=json.loads((ROOT/'corporate-page-content.json').read_text())
extra={
 'en':'In particular, we have trusted Juan Alberto Gómez to serve as the legal representative of companies in our group in Ecuador. For me, that responsibility is only delegated when there is complete trust.',
 'pt':'Em particular, confiamos em Juan Alberto Gómez para assumir a representação legal de empresas do nosso grupo no Equador. Para mim, essa responsabilidade só é delegada quando existe plena confiança.',
 'fr':'Nous avons notamment fait confiance à Juan Alberto Gómez pour assurer la représentation légale de sociétés de notre groupe en Équateur. Pour moi, cette responsabilité ne se délègue que dans une relation de pleine confiance.'}
roles={'en':'Chief executive and majority shareholder','pt':'Diretor-geral e acionista principal','fr':'Directeur général et actionnaire principal'}
for language,copy in COPY.items():
    members=CONTENT[language]['teamItems'];person=next((p for p in members if p['id']==ID),None)
    if person is None:
        person={'id':ID,'name':NAME};members.insert(next((i for i,p in enumerate(members) if p['id']=='gabriel-calvopina'),len(members)),person)
    person.update(degree=copy['degree'],role=copy['role'],specialty=copy['specialty'],bio=copy['bio'],photo=PHOTO,photoWidth=width,photoHeight=height,page=PAGE)
    if language!='es':person['role']=copy['degree']+' · '+copy['role']
    reviews=CONTENT[language]['reviewItems']
    if not any(r['id']=='eleazar' for r in reviews):
        review=deepcopy(base_eleazar);translation=next(r for r in corporate[language]['reviews'] if r['name']=='Eleazar Becerra')
        review['paragraphs']=deepcopy(translation['paragraphs']);review['paragraphs'].insert(2,extra[language]);review['role']=roles[language];reviews.append(review)
    lookup={r['id']:r for r in reviews};CONTENT[language]['reviewItems']=[lookup[key] for key in ORDER]+[r for r in reviews if r['id'] not in ORDER]
(ROOT/'content.js').write_text(before+prefix+json.dumps(CONTENT,ensure_ascii=False,indent=2)+tail)
profiles=json.loads((ROOT/'team-profiles.json').read_text());profiles[ID]={language:{k:v for k,v in copy.items() if k in ['intro','about','areas','facts','careerTitle']} for language,copy in COPY.items()}
(ROOT/'team-profiles.json').write_text(json.dumps(profiles,ensure_ascii=False,indent=2)+'\n')

def build_profile(language,copy):
    folder='' if language=='es' else language+'/';base='' if language=='es' else '../'
    source=(ROOT/folder/'team-gabriel-calvopina.html').read_text();original=source
    source=source.replace('team-gabriel-calvopina.html',PAGE)
    main=html.fragment_fromstring(raw(source,'main'))
    set_text(first(main,'.//h1'),NAME)
    set_text(cls(main,'profile-role')[0],copy['degree']+' · '+copy['role'])
    set_text(cls(main,'profile-intro')[0],copy['intro']);set_text(cls(main,'profile-specialty')[0],copy['specialty'])
    picture=cls(main,'profile-photo')[0];img=first(picture,'./img');img.set('src',base+PHOTO);img.set('alt',NAME);img.set('width',str(width));img.set('height',str(height))
    caption=first(picture,'./figcaption');caption.text=NAME
    story=cls(main,'profile-story')[0];set_text(first(story,'./h2'),NAME)
    bio=cls(story,'profile-bio')[0];set_text(bio,copy['bio'])
    other=story.xpath('./p[not(@class)]');assert len(other)==1;set_text(other[0],copy['about'])
    listing=first(cls(main,'profile-practice')[0],'./ul')
    for e in list(listing):listing.remove(e)
    for area in copy['areas']:li=html.Element('li');li.text=area;listing.append(li)
    career=cls(main,'profile-career')[0];set_text(first(career,'./h2'),copy['careerTitle']);dl=first(career,'./dl')
    for e in list(dl):dl.remove(e)
    for label,value in copy['facts']:
        div=html.Element('div');dt=html.Element('dt');dt.text=label;dd=html.Element('dd');dd.text=value;div.extend([dt,dd]);dl.append(div)
    group=cls(main,'profile-colleagues')[0]
    for child in list(group):group.remove(child)
    for person in CONTENT[language]['teamItems']:
        if person['id']==ID:continue
        markup='<a class="profile-colleague" href="'+person['page']+'"><img src="'+base+person['photo']+'" width="96" height="96" alt="" loading="lazy" decoding="async"><span><strong>'+escape(person['name'])+'</strong><span>'+escape(person['role'])+'</span></span><span class="profile-colleague-arrow" aria-hidden="true">→</span></a>'
        group.append(html.fragment_fromstring(markup))
    source=replace_main(source,main);doc=html.fromstring(source)
    title=NAME+' | Tempo Legal';description=NAME+' · '+copy['role']+'. '+copy['intro'];url='https://tempolegal.com/'+folder+PAGE
    set_text(first(doc,'.//title'),title)
    # Change head metadata only; preserve the template's actual header/footer bytes.
    head=first(doc,'.//head')
    for meta in head.xpath('./meta'):
        name=meta.get('name') or meta.get('property')
        if name in ['description','og:description','twitter:description']:meta.set('content',description)
        elif name in ['og:title','twitter:title']:meta.set('content',title)
        elif name=='og:url':meta.set('content',url)
        elif name in ['og:image','twitter:image']:meta.set('content','https://tempolegal.com/'+PHOTO)
        elif name=='og:image:width':meta.set('content',str(width))
        elif name=='og:image:height':meta.set('content',str(height))
    for preload in head.xpath('./link[@rel="preload"][@as="image"]'):preload.set('href',base+PHOTO)
    for script in head.xpath('./script[@type="application/ld+json"]'):
        data=json.loads(script.text)
        for item in data.get('@graph',[data]):
            kind=item.get('@type')
            if kind=='WebPage':item.update(name=title,description=description)
            elif kind=='Person':item.update(name=NAME,jobTitle=copy['role'],description=copy['bio'],image='https://tempolegal.com/'+PHOTO)
            elif kind=='BreadcrumbList':item['itemListElement'][-1].update(name=NAME)
        script.text=json.dumps(data,ensure_ascii=False)
    source=source.replace(raw(source,'head'),serialize(head))
    for tag in ['header','footer']:assert raw(source,tag)==raw(original,tag)
    (ROOT/folder/PAGE).write_text(source)
    return {'file':folder+PAGE,'language':language,'canonical':url,'title':title,'description':description,'robots':first(head,'./meta[@name="robots"]').get('content'),'alternates':{lang:('' if lang=='es' else lang+'/')+PAGE for lang in COPY},'types':[['LegalService','Organization'],'WebSite','WebPage','BreadcrumbList','Person']}

entries=[]
for language,copy in COPY.items():
    entries.append(build_profile(language,copy));folder='' if language=='es' else language+'/';base='' if language=='es' else '../'
    # Rolando's card uses precisely the same component as his colleagues on About.
    path=ROOT/folder/'sobre-nosotros/index.html';source=path.read_text();main=html.fragment_fromstring(raw(source,'main'))
    old=next(e for e in main.xpath('.//article[.//h3]') if first(e,'.//h3').text==NAME)
    label=CONTENT[language]['profileMore'];markup='<article class="about-member service-reveal"><img src="'+base+'../'+PHOTO+'" alt="'+NAME+'" width="'+str(width)+'" height="'+str(height)+'" loading="lazy"><div><h3>'+NAME+'</h3>'+para(copy['degree'],'about-degree')+para(copy['role'])+para(copy['specialty'])+'<a class="text-link" href="../'+PAGE+'">'+escape(label)+' <span aria-hidden="true">↗</span></a></div></article>'
    old.getparent().replace(old,html.fragment_fromstring(markup));path.write_text(replace_main(source,main))
    # Preserve existing static testimonial cards, updating DOM order for no-JS browsing too.
    path=ROOT/folder/'index.html';source=path.read_text();main=html.fragment_fromstring(raw(source,'main'));stage=first(main,'.//*[@id="review-stage"]');stage.set('data-testimonial-layout','paired-featured')
    cards={e.get('id').replace('testimonio-',''):e for e in stage.xpath('./article')}
    if 'eleazar' not in cards:
        template=html.parse(str(ROOT/'index.html')).xpath('//*[@id="testimonio-eleazar"]')[0];card=deepcopy(template);review=next(r for r in CONTENT[language]['reviewItems'] if r['id']=='eleazar')
        quote=cls(card,'quote-text')[0]
        for child in list(quote):quote.remove(child)
        quote.append(html.fragment_fromstring(para(review['paragraphs'][0])))
        details=html.Element('details',{'class':'quote-full'});summary=html.Element('summary');summary.text={'en':'Read full testimonial','pt':'Ler depoimento completo','fr':'Lire le témoignage complet'}[language];details.append(summary)
        for p in review['paragraphs'][1:]:details.append(html.fragment_fromstring(para(p)))
        quote.append(details);set_text(cls(card,'quote-role')[0],review['role'])
        for img in card.xpath('.//img[@src]'):img.set('src',base+img.get('src'))
        cards['eleazar']=card
    for e in list(stage):stage.remove(e)
    for id in ORDER:stage.append(cards[id])
    for card in main.xpath('.//*[@id="client-review"]/article'):
        heading=first(card,'.//h3[@id]')
        if not card.get('id','').endswith('-client'):card.set('id',card.get('id')+'-client')
        if not heading.get('id').endswith('-client'):heading.set('id',heading.get('id')+'-client')
        card.set('aria-labelledby',heading.get('id'))
    # Add the new profile action to the existing home member card or its localized copy.
    grid=first(main,'.//*[@id="team-grid"]');rolando=next((e for e in grid.xpath('./article') if NAME in ''.join(e.xpath('.//h3/text()'))),None)
    if rolando is None:
        template=next(e for e in grid.xpath('./article') if 'Gabriel Calvopiña' in ''.join(e.xpath('.//h3/text()')));rolando=deepcopy(template)
        set_text(first(rolando,'.//h3'),NAME);set_text(cls(rolando,'team-person-role')[0],copy['degree']+' · '+copy['role']);set_text(cls(rolando,'team-person-specialty')[0],copy['specialty'])
        img=first(rolando,'.//img');img.set('src',base+PHOTO);img.set('alt',NAME);img.set('width',str(width));img.set('height',str(height));grid.insert(list(grid).index(template),rolando)
    old_links=cls(rolando,'team-profile-link')
    if old_links:link=old_links[0]
    else:link=html.Element('a',{'class':'team-profile-link'});rolando.append(link)
    link.set('href',PAGE);link.set('target','_blank');link.set('rel','noopener noreferrer');link.set('aria-label',CONTENT[language]['profileOpenLabel'].replace('{name}',NAME));set_text(link,label+' ↗')
    path.write_text(replace_main(source,main))
    # Make the new colleague discoverable from existing profiles without rebuilding their chrome.
    for person in CONTENT[language]['teamItems']:
        if person['id']==ID:continue
        path=ROOT/folder/person['page'];source=path.read_text();main=html.fragment_fromstring(raw(source,'main'));group=cls(main,'profile-colleagues')[0]
        if not group.xpath('./a[@href=$page]',page=PAGE):
            markup='<a class="profile-colleague" href="'+PAGE+'"><img src="'+base+PHOTO+'" width="96" height="96" alt="" loading="lazy" decoding="async"><span><strong>'+NAME+'</strong><span>'+escape(copy['degree']+' · '+copy['role'])+'</span></span><span class="profile-colleague-arrow" aria-hidden="true">→</span></a>'
            group.append(html.fragment_fromstring(markup));path.write_text(replace_main(source,main))

path=ROOT/'seo-inventory.json';inventory=json.loads(path.read_text());inventory=[r for r in inventory if not r['file'].endswith(PAGE)]+entries;path.write_text(json.dumps(inventory,ensure_ascii=False,indent=2)+'\n')
path=ROOT/'URL-MAP.csv';rows=list(csv.DictReader(path.read_text().splitlines()));fields=list(rows[0]);rows=[r for r in rows if not r['file'].endswith(PAGE)]
for entry in entries:
    row=next(dict(r) for r in rows if r['file']==entry['file'].replace(PAGE,'team-gabriel-calvopina.html'))
    for key,value in list(row.items()):row[key]=value.replace('team-gabriel-calvopina.html',PAGE).replace('Gabriel Calvopiña',NAME)
    rows.append(row)
with path.open('w',newline='') as handle:
    writer=csv.DictWriter(handle,fieldnames=fields);writer.writeheader();writer.writerows(rows)
path=ROOT/'sitemap.xml';source=path.read_text();namespace='http://www.sitemaps.org/schemas/sitemap/0.9';xml=etree.fromstring(source.encode())
for node in list(xml):
    loc=node.find('{'+namespace+'}loc')
    if loc is not None and loc.text.endswith(PAGE):xml.remove(node)
for entry in entries:
    template=next(n for n in xml if n.find('{'+namespace+'}loc').text==entry['canonical'].replace(PAGE,'team-gabriel-calvopina.html'))
    added=deepcopy(template)
    for el in added.iter():
        if el.text:el.text=el.text.replace('team-gabriel-calvopina.html',PAGE)
        for key,value in list(el.attrib.items()):el.set(key,value.replace('team-gabriel-calvopina.html',PAGE))
    xml.append(added)
path.write_bytes(etree.tostring(xml,encoding='utf-8',xml_declaration=True))
print('Added Rolando profiles and About cards in four languages; home testimonials ordered Francisco, Pablo, Ana, Eleazar, Juan.')
