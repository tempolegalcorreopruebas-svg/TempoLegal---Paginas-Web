"""Apply corporate reference copy while preserving each develop page's chrome and assets."""
from pathlib import Path
from html import escape
from lxml import html
import json,re,posixpath

ROOT=Path(__file__).resolve().parents[1]
COPY=json.loads((ROOT/'corporate-page-content.json').read_text())
SHARED=json.JSONDecoder().raw_decode((ROOT/'content.js').read_text().split('window.TEMPO_CONTENT = ',1)[1])[0]
ROUTES={'sas':'constitucion-de-empresas-sas/index.html','capital':'services/foreign-capital/index.html','holdings':'services/holding-structures/index.html','amendments':'tramites-notariales-y-societarios/index.html','monthly':'services/monthly-legal-advice/index.html','branches':'services/foreign-branches/index.html'}
PEOPLE=['juan-gomez','daniela-barahona','emilie-donoso','rolando-valencia','gabriel-calvopina']
def text(value):return escape(value,quote=True)
def paragraph(value):return '<p>'+text(value)+'</p>'
def fragment(value):return html.fragment_fromstring(value)
def serialize(node):return html.tostring(node,encoding='unicode',method='html')
def select(node,name):return node.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," '+name+' ")]')
def set_text(node,value):
    for child in list(node):node.remove(child)
    node.text=value
def section(id,title,body,extra=''):
    return fragment('<section class="service-section service-reveal'+(' '+extra if extra else '')+'" id="'+id+'" aria-labelledby="'+id+'-title"><h2 id="'+id+'-title">'+text(title)+'</h2>'+body+'</section>')
def footer(source):return re.search(r'<footer\b[^>]*class="[^"]*site-footer[^\"]*".*?</footer>',source,re.S)[0]
def build(language,copy):
    folder='' if language=='es' else language+'/'
    relative=folder+'services/corporate-law/index.html';path=ROOT/relative
    original=path.read_text();main=html.fragment_fromstring(re.search(r'<main\b.*?</main>',original,re.S)[0])
    original_footer=footer(original)
    def route(target,localized=True):
        destination=(folder if localized else '')+target
        assert (ROOT/destination).is_file(),destination
        return posixpath.relpath(destination,str(Path(relative).parent))
    home=route('index.html')
    hero=select(main,'service-hero-copy')[0]
    for extra in select(hero,'service-lead')[1:]:extra.getparent().remove(extra)
    set_text(select(hero,'eyebrow')[0],copy['heroEyebrow'])
    set_text(hero.xpath('./h1')[0],copy['title'])
    lead=select(hero,'service-lead')[0];set_text(lead,copy['tagline'])
    hero.insert(list(hero).index(lead)+1,fragment('<p class="service-lead">'+text(copy['description'])+'</p>'))
    primary=select(hero,'service-actions')[0].xpath('./a')[0]
    set_text(primary,copy['labels'][6]);primary.append(fragment('<span aria-hidden="true">↗</span>'))
    overview=select(main,'service-overview')[0];set_text(select(overview,'service-overview-title')[0],copy['conditions'])
    set_text(overview.xpath('./a')[0],copy['scopeTitle']+' ↓')
    story=select(main,'service-story')[0]
    for child in list(story):story.remove(child)
    routes='<ol class="service-process">'
    for item in copy['routes']:
        link=route(ROUTES[item['key']])
        routes+='<li><h3>'+text(item['title'])+'</h3>'+paragraph(item['description'])+'<p><a class="text-link" href="'+link+'">'+text(item['action'])+' <span aria-hidden="true">↗</span></a></p></li>'
    routes+='</ol>'
    story.append(section('context',copy['routesTitle'],paragraph(copy['routesIntro'])+routes))
    scope=paragraph(copy['scopeIntro'])
    for item in copy['scope']:
        scope+='<details class="service-question"><summary>'+text(item['title'])+'</summary><div><p class="eyebrow">'+text(item['label'])+'</p><ul class="service-scope">'+''.join('<li>'+text(value)+'</li>' for value in item['items'])+'</ul></div></details>'
    story.append(section('scope',copy['scopeTitle'],scope))
    process=paragraph(copy['processIntro'])+'<ol class="service-process">'+''.join('<li><h3>'+text(item['title'])+'</h3>'+paragraph(item['description'])+'</li>' for item in copy['process'])+'</ol>'
    story.append(section('process',copy['processTitle'],process))
    story.append(section('conditions',copy['labels'][0],paragraph(copy['conditions'])+paragraph(copy['teamNote']),'service-conditions'))
    references=paragraph(copy['referencesIntro'])+paragraph('; '.join(copy['references'])+'.')+paragraph(copy['referencesNote'])
    story.append(section('references',copy['referencesTitle'],references))
    review_body=paragraph(copy['reviewsIntro'])
    for review in copy['reviews']:
        identity=review.get('role','')
        review_body+='<details class="service-question"><summary>'+text(review['name'])+'</summary><div>'+paragraph(identity)+''.join(paragraph(value) for value in review['paragraphs'])
        if review['name']=='Pablo Lucio Paredes':
            note={'es':'Testimonio personal; la afiliación no implica aval institucional.','en':'Personal testimonial; the affiliation does not imply institutional endorsement.','pt':'Depoimento pessoal; a afiliação não implica aval institucional.','fr':'Témoignage personnel ; l’affiliation n’implique pas un soutien institutionnel.'}[language]
            review_body+=paragraph(note)
        review_body+='</div></details>'
    story.append(section('testimonials',copy['reviewsTitle'],review_body))
    known={person['id']:person for person in SHARED['es']['teamItems']}
    team=paragraph(copy['teamIntro'])+'<div class="about-team-grid">'
    for id,person in zip(PEOPLE,copy['people']):
        info=known[id];image=route(info['photo'],False)
        team+='<article class="about-member"><img src="'+image+'" alt="'+text(person['name'])+'" loading="lazy" decoding="async" width="'+str(info.get('photoWidth',900))+'" height="'+str(info.get('photoHeight',900))+'"><div><h3>'+text(person['name'])+'</h3><p class="about-degree">'+text(person['degree'])+'</p>'+paragraph(person['role'])+paragraph(person['contribution'])
        if info.get('page') and (ROOT/(folder+info['page'])).exists():team+='<a class="text-link" href="'+route(info['page'])+'">'+text(copy['labels'][4])+' ↗</a>'
        team+='</div></article>'
    team+='</div>'+paragraph(copy['teamNote'])+'<a class="text-link" href="'+home+'#equipo">'+text(copy['labels'][3])+' ↗</a>'
    story.append(section('team',copy['teamTitle'],team))
    countries=paragraph(copy['countriesIntro'])+paragraph('; '.join(copy['countries'])+'.')+paragraph(copy['countriesNote'])+'<a class="text-link" href="'+home+'#empresas-extranjeras">'+text(copy['labels'][5])+' ↗</a>'
    story.append(section('international',copy['labels'][2],countries))
    questions=paragraph(copy['faqIntro'])+''.join('<details class="service-question"><summary>'+text(item['question'])+'</summary><div>'+paragraph(item['answer'])+'</div></details>' for item in copy['faqs'])
    story.append(section('questions',copy['faqTitle'],questions))
    sidebar=select(main,'service-sidebar')[0];listing=sidebar.xpath('.//ol')[0]
    for child in list(listing):listing.remove(child)
    for item in story:
        title=item.xpath('./h2')[0].text
        listing.append(fragment('<li><a href="#'+item.get('id')+'">'+text(title)+'</a></li>'))
    related=select(main,'service-related')[0]
    set_text(related.xpath('.//h2')[0],copy['relatedTitle'])
    for node in related.xpath('./div/p[not(@class)]'):set_text(node,copy['relatedIntro'])
    # Keep every existing related service, but open its designed index directly for local files.
    for anchor in related.xpath('.//a[@href]'):
        href=anchor.get('href')
        if href.endswith('/') and (path.parent/href/'index.html').exists():anchor.set('href',href+'index.html')
    cta=select(main,'service-cta')[0];set_text(cta.xpath('.//h2')[0],copy['contactTitle'])
    for old_note in select(cta,'service-contact-note'):old_note.getparent().remove(old_note)
    for node in cta.xpath('.//p[not(@class)]'):set_text(node,copy['contactIntro'])
    cta.xpath('./div/div')[0].append(fragment('<p class="service-contact-note">'+text(copy['contactNote'])+'</p>'))
    source=re.sub(r'<main\b.*?</main>',lambda _:serialize(main),original,count=1,flags=re.S)
    title=copy['title'].rstrip('.')+' | TempoLegal';description=copy['description']
    source=re.sub(r'<title\b[^>]*>.*?</title>',lambda _:'<title>'+text(title)+'</title>',source,count=1,flags=re.S)
    def meta(match):
        tag=match.group(0)
        if re.search(r'(?:name|property)="(?:description|og:description|twitter:description)"',tag):return re.sub(r'content="[^"]*"',lambda _:'content="'+text(description)+'"',tag)
        if re.search(r'(?:name|property)="(?:og:title|twitter:title)"',tag):return re.sub(r'content="[^"]*"',lambda _:'content="'+text(title)+'"',tag)
        return tag
    source=re.sub(r'<meta\b[^>]*>',meta,source)
    def schema(match):
        opening,body,closing=match.groups();data=json.loads(body)
        for item in data.get('@graph',[]):
            if item.get('@type') in ['WebPage','Service']:item.update(name=title if item['@type']=='WebPage' else copy['title'].rstrip('.'),description=description)
            if item.get('@type')=='FAQPage':item['mainEntity']=[{'@type':'Question','name':q['question'],'acceptedAnswer':{'@type':'Answer','text':q['answer']}} for q in copy['faqs']]
        return opening+json.dumps(data,ensure_ascii=False)+closing
    source=re.sub(r'(<script\b[^>]*type="application/ld\+json"[^>]*>)(.*?)(</script>)',schema,source,flags=re.S)
    assert footer(source)==original_footer,'Footer changed: '+relative
    path.write_text(source)
    return relative,title,description

def main():
    updates={}
    for language,copy in COPY.items():
        filename,title,description=build(language,copy);updates[filename]=(title,description)
    # Keep the shared summary source aligned, without changing any other service record.
    p=ROOT/'service-content.json';shared=json.loads(p.read_text())
    for language,copy in COPY.items():
        shared['corporate-law'][language]=[copy['title'].rstrip('.'),copy['description'],copy['routesIntro'],[item['title'].rstrip('.') for item in copy['scope']],copy['conditions']]
    p.write_text(json.dumps(shared,ensure_ascii=False,indent=2)+'\n')
    p=ROOT/'seo-inventory.json';inventory=json.loads(p.read_text())
    for item in inventory:
        if item['file'] in updates:item['title'],item['description']=updates[item['file']]
    p.write_text(json.dumps(inventory,ensure_ascii=False,indent=2)+'\n')
    import csv
    p=ROOT/'URL-MAP.csv';rows=list(csv.DictReader(p.read_text().splitlines()));fields=list(rows[0])
    for row in rows:
        if row['file'] in updates:row['title']=updates[row['file']][0]
    with p.open('w',newline='') as handle:
        writer=csv.DictWriter(handle,fieldnames=fields);writer.writeheader();writer.writerows(rows)
    print('Updated corporate content in '+str(len(updates))+' language pages; original footer bytes retained.')
if __name__=='__main__':main()
