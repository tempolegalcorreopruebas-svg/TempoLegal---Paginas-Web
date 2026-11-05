"""Apply supplied data-protection wording to existing landings and translations."""
from pathlib import Path
from lxml import html
import json,re,importlib.util,csv

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('reference_builder',Path(__file__).with_name('build-service-reference-content.py'))
helper=importlib.util.module_from_spec(spec);spec.loader.exec_module(helper)
COPY=json.loads((ROOT/'data-service-copy.json').read_text())

def first(n,x):return n.xpath(x)[0]
def text(n):return ' '.join(n.itertext()).strip()
def update(language,kind):
    folder='' if language=='es' else language+'/'
    target=folder+'proteccion-de-datos-personales-ecuador/'+('delegado-proteccion-datos-externo-ecuador/' if kind=='dpd' else '')+'index.html'
    path=ROOT/target;source=path.read_text();main=html.fragment_fromstring(helper.raw_element(source,'main'));copy=COPY[language]
    banner=first(main,'.//*[@id="cumplidatos"]')
    helper.set_text(first(banner,'.//p[@class="cd-kicker"]'),copy['kicker'])
    helper.set_text(first(banner,'.//h2'),copy['title'])
    helper.set_text(first(banner,'.//div[@class="cd-intro"]/p[not(@class)][1]'),copy['description'])
    rows=banner.xpath('.//div[@class="cd-steps"]/div/p')
    assert len(rows)==3
    for row,(title,description) in zip(rows,copy['steps']):
        helper.set_text(row,'');strong=html.Element('strong');strong.text=title;strong.tail=description;row.append(strong)
    for future in banner.xpath('.//p[@class="cd-future"]'):future.getparent().remove(future)
    helper.set_text(first(banner,'.//p[@class="cd-limit"]'),copy['limit'])
    resources=first(main,'.//*[@id="recursos"]')
    cards=resources.xpath('.//article|.//a[.//h3]')
    # The second resource has a stable destination across all translated pages.
    headings=resources.xpath('.//h3');assert len(headings)==3
    second=headings[1];helper.set_text(second,copy['dpdResource'] if kind=='dpd' else copy['resourceTitle'])
    if kind=='dpd':
        hero=first(main,'./section[contains(concat(" ",@class," ")," hero ")]')
        helper.set_text(first(hero,'.//h1'),copy['dpdTitle']);helper.set_text(first(hero,'.//p[@class="lead"]'),copy['dpdLead'])
        # Follow the supplied DPD reference completely instead of retaining earlier editorial additions.
        for old in main.xpath('./section[contains(concat(" ",@class," ")," sanctions-proof ")]|.//*[@id="ventajas-delegado-externo"]'):
            old.getparent().remove(old)
        for old in hero.xpath('.//p[contains(concat(" ",@class," ")," dpd-dpo-definition ")]|.//p[contains(concat(" ",@class," ")," response-promise ")]'):
            old.getparent().remove(old)
        related=first(main,'./nav[contains(concat(" ",@class," ")," revision-related ")]')
        helper.set_text(first(related,'.//p'),copy['areaHeading'])
        links=first(related,'.//div[@class="revision-links"]')
        source_links={a.get('data-url-publicacion'):a for a in links.xpath('./a')}
        for child in list(links):links.remove(child)
        root='https://tempolegal.com/proteccion-de-datos-personales-ecuador/'
        routes=['','implementacion-lopdp/','proteccion-datos-colegios-instituciones-educativas-ecuador/','proteccion-datos-clinicas-salud-ecuador/']
        for route,label in zip(routes,copy['areaLinks']):
            anchor=source_links[root+route]
            helper.set_text(anchor,label+' ↗')
            # Open the designed page directly when the project is viewed from local files.
            value=anchor.get('href')
            if value.endswith('/'):anchor.set('href',value+'index.html')
            links.append(anchor)
            if route=='implementacion-lopdp/':
                current=html.Element('span',{'aria-current':'page'});current.text=copy['areaCurrent'];links.append(current)
        parent=second.getparent();descriptions=parent.xpath('./p[not(contains(@class,"eyebrow"))]')
        if descriptions:helper.set_text(descriptions[-1],copy['dpdResourceDescription'])
        for anchor in parent.xpath('./a'):
            helper.set_text(anchor,copy['dpdResourceAction']+' ↗')
        faq=first(main,'.//*[@id="preguntas"]')
        for detail in faq.xpath('.//details'):
            if text(first(detail,'./summary')) in ['¿DPO y DPD son lo mismo?','Are DPO and DPD the same?']:
                detail.getparent().remove(detail)
        matches=[d for d in faq.xpath('.//details') if 'CumpliDatos' in text(first(d,'./summary'))]
        assert len(matches)==1;helper.set_text(first(matches[0],'.//p'),copy['faq'])
    else:
        section=first(main,'.//*[@id="servicios"]')
        headings=section.xpath('.//h3');assert len(headings)==3
        heading=headings[1];helper.set_text(heading,copy['serviceTitle'])
        parent=heading.getparent();description=parent.xpath('./p[not(contains(@class,"eyebrow"))]')
        assert description;helper.set_text(description[0],copy['serviceDescription'])
        # Preserve the existing supplementary DPD/DPO explanation and interactions.
        parent=second.getparent();eyebrows=parent.xpath('./p[contains(@class,"eyebrow")]')
        if eyebrows:helper.set_text(eyebrows[0],copy['resourceEyebrow'])
    result=source.replace(helper.raw_element(source,'main'),html.tostring(main,encoding='unicode',method='html'))
    faqs=[]
    for detail in main.xpath('.//*[@id="preguntas"]//details'):
        faqs.append({'question':text(first(detail,'./summary')).strip(' +＋'),'answer':' '.join(text(x) for x in detail.xpath('./p|./div/p'))})
    title=copy['dpdTitle']+' | TempoLegal' if kind=='dpd' else first(main,'.//h1').text_content().strip()+' | TempoLegal'
    description=copy['dpdLead'] if kind=='dpd' else first(main,'.//p[@class="lead"]').text_content().strip()
    result=helper.schema_update(result,title,description,faqs)
    for tag in ['header','footer']:assert helper.raw_element(result,tag)==helper.raw_element(source,tag)
    path.write_text(result)
    return target,title,description

def main():
    updates={}
    for language in COPY:
        for kind in ['hub','dpd']:
            folder='' if language=='es' else language+'/'
            target=folder+'proteccion-de-datos-personales-ecuador/'+('delegado-proteccion-datos-externo-ecuador/' if kind=='dpd' else '')+'index.html'
            if not (ROOT/target).is_file():continue
            path,title,description=update(language,kind);updates[path]=(title,description)
    path=ROOT/'seo-inventory.json';rows=json.loads(path.read_text())
    for row in rows:
        if row['file'] in updates:row['title'],row['description']=updates[row['file']]
    path.write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n')
    path=ROOT/'URL-MAP.csv';rows=list(csv.DictReader(path.read_text().splitlines()));fields=list(rows[0])
    for row in rows:
        if row['file'] in updates:row['title']=updates[row['file']][0]
    with path.open('w',newline='') as handle:
        writer=csv.DictWriter(handle,fieldnames=fields);writer.writeheader();writer.writerows(rows)
    print('Updated existing data-protection and external-DPO pages; shared page chrome and assets retained.')
if __name__=='__main__':main()
