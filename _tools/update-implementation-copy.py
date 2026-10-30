"""Apply the approved CumpliDatos correction to the existing implementation landing."""
from pathlib import Path
from lxml import html
import importlib.util,json,re

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('reference_builder',Path(__file__).with_name('build-service-reference-content.py'))
helper=importlib.util.module_from_spec(spec);spec.loader.exec_module(helper)
COPY=json.loads((ROOT/'data-service-copy.json').read_text())

for language in ['es','en']:
    path=ROOT/(('' if language=='es' else language+'/')+'proteccion-de-datos-personales-ecuador/implementacion-lopdp/index.html')
    source=path.read_text();main=html.fragment_fromstring(helper.raw_element(source,'main'));copy=COPY[language]
    banner=main.xpath('.//*[@id="cumplidatos"]')[0]
    helper.set_text(banner.xpath('.//p[@class="cd-kicker"]')[0],copy['kicker'])
    helper.set_text(banner.xpath('.//h2')[0],copy['title'])
    helper.set_text(banner.xpath('.//div[@class="cd-intro"]/p[not(@class)]')[0],copy['description'])
    for row,(title,description) in zip(banner.xpath('.//div[@class="cd-steps"]/div/p'),copy['steps']):
        helper.set_text(row,'');strong=html.Element('strong');strong.text=title;strong.tail=description;row.append(strong)
    for old in banner.xpath('.//p[@class="cd-future"]'):old.getparent().remove(old)
    helper.set_text(banner.xpath('.//p[@class="cd-limit"]')[0],copy['limit'])
    bridge=main.xpath('.//*[@id="continuidad"]/div')[0]
    paragraph=('Su equipo aplica y conserva las medidas. Si necesita un DPD externo, definimos una contratación diferenciada para asesoría y supervisión independiente.' if language=='es' else 'Your team applies and maintains the measures. If you need an external DPO, we define a separate engagement for independent advice and oversight.')
    if paragraph not in bridge.text_content():
        element=html.Element('p');element.text=paragraph;bridge.insert(3,element)
    for anchor in bridge.xpath('.//a[@data-url-publicacion]'):
        value=anchor.get('data-url-publicacion')
        if '#ventajas-delegado-externo' in value:anchor.set('data-url-publicacion',value.split('#')[0])
    resources=main.xpath('.//*[@id="recursos"]')[0]
    heading=resources.xpath('.//h3')[1];parent=heading.getparent()
    for p in parent.xpath('./p[not(contains(@class,"eyebrow"))]')[-1:]:helper.set_text(p,copy['dpdResourceDescription'])
    result=source.replace(helper.raw_element(source,'main'),html.tostring(main,encoding='unicode',method='html'))
    for tag in ['header','footer']:assert helper.raw_element(source,tag)==helper.raw_element(result,tag)
    path.write_text(result)
print('Updated implementation copy in Spanish and English; existing sections, imagery, tools and scripts retained.')
