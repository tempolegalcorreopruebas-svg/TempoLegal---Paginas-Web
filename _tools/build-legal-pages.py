"""Render approved legal blocks with the existing page chrome and local file routes."""
from pathlib import Path
from html import escape
from lxml import html
import json, re

ROOT=Path(__file__).resolve().parents[1]
LABELS={
 'es':{'eyebrow':'Información legal','index':'En este documento','download':'Descargar original','print':'Imprimir documento','original':'Versión original en español','note':''},
 'en':{'eyebrow':'Legal information','index':'In this document','download':'Download Spanish original','print':'Print document','original':'Read the Spanish original','note':'Reference translation of the current Spanish version. Legal review of this translation is pending before publication.'},
 'pt':{'eyebrow':'Informações legais','index':'Neste documento','download':'Baixar original em espanhol','print':'Imprimir documento','original':'Ler o original em espanhol','note':'Tradução de referência da versão vigente em espanhol. A revisão jurídica desta tradução está pendente antes da publicação.'},
 'fr':{'eyebrow':'Informations juridiques','index':'Dans ce document','download':'Télécharger l’original espagnol','print':'Imprimer le document','original':'Lire l’original espagnol','note':'Traduction de référence de la version espagnole en vigueur. La révision juridique de cette traduction reste à effectuer avant publication.'}}
DOCUMENTS={
 'politica-de-privacidad':('privacy-policy.json','privacy-policy-v4-4.docx','4.4'),
 'terminos-y-condiciones':('terms-content.json','terms-and-legal-notice-v1-3.docx','1.3')}
def inline(text):return escape(text).replace('\n','<br>')
def render_main(blocks,labels,base,download,original):
    title,version,intro=[block['text'] for block in blocks[:3]]
    groups=[]
    for block in blocks[3:]:
        if block['type']=='heading':groups.append({'heading':block['text'],'blocks':[]})
        else:groups[-1]['blocks'].append(block)
    toc=''.join(f'<li><a href="#privacy-section-{index}">{escape(group["heading"])}</a></li>' for index,group in enumerate(groups,1))
    sections=[]
    for index,group in enumerate(groups,1):
        body=[]
        for block in group['blocks']:
            if block['type']=='paragraph':body.append('<p>'+inline(block['text'])+'</p>')
            else:
                rows=block['rows'];header=rows[0]
                table='<table class="privacy-table"><thead><tr>'+''.join('<th scope="col">'+inline(cell)+'</th>' for cell in header)+'</tr></thead><tbody>'
                for row in rows[1:]:table+='<tr>'+''.join('<td data-label="'+escape(header[i],quote=True)+'">'+inline(cell)+'</td>' for i,cell in enumerate(row))+'</tr>'
                body.append(table+'</tbody></table>')
        sections.append(f'<section class="privacy-section" id="privacy-section-{index}" aria-labelledby="privacy-heading-{index}"><h2 id="privacy-heading-{index}">{escape(group["heading"])}</h2>'+''.join(body)+'</section>')
    reference='<p class="privacy-translation-note">'+escape(labels['note'])+'</p><a class="privacy-original" href="'+original+'">'+escape(labels['original'])+' ↗</a>' if labels['note'] else ''
    return '<main id="policy-main"><section class="privacy-hero" aria-labelledby="policy-title"><div class="container"><p class="eyebrow">'+escape(labels['eyebrow'])+'</p><h1 id="policy-title">'+escape(title)+'</h1><p class="privacy-version">'+escape(version)+'</p>'+reference+'</div></section><div class="container privacy-layout"><aside class="privacy-sidebar"><details class="privacy-index" open><summary>'+escape(labels['index'])+'</summary><nav class="privacy-toc" aria-label="'+escape(labels['index'])+'"><ol>'+toc+'</ol></nav></details><div class="privacy-actions"><a href="'+base+'assets/legal/'+download+'" download>'+escape(labels['download'])+' ↗</a><button type="button" data-print-policy hidden>'+escape(labels['print'])+'</button></div></aside><article class="privacy-document" id="policy-text" aria-labelledby="policy-title" tabindex="-1"><p class="privacy-intro">'+inline(intro)+'</p>'+''.join(sections)+'</article></div></main>'
def main():
    count=0
    for slug,(filename,download,version) in DOCUMENTS.items():
        data=json.loads((ROOT/filename).read_text())
        for language,blocks in data.items():
            directory=Path('') if language=='es' else Path(language)
            for relative in [directory/(slug+'.html'),directory/slug/'index.html']:
                path=ROOT/relative
                if not path.exists():continue
                base='../'*len(relative.parent.parts)
                original=base+slug+'/index.html'
                source=path.read_text();source=re.sub(r'<main\b.*?</main>',lambda _:render_main(blocks,LABELS[language],base,download,original),source,count=1,flags=re.S)
                page=html.fromstring(source)
                title=blocks[0]['text']+' | TempoLegal';description=blocks[0]['text']+' · TempoLegal · V'+version+'.'
                page.xpath('//title')[0].text=title;page.xpath('//title')[0].attrib.pop('data-i18n',None)
                for element in page.xpath('//meta[@name="description"]|//meta[@property="og:description"]|//meta[@name="twitter:description"]'):
                    element.set('content',description);element.attrib.pop('data-i18n-content',None)
                for element in page.xpath('//meta[@property="og:title"]|//meta[@name="twitter:title"]'):element.set('content',title)
                for element in page.xpath('//script[@type="application/ld+json"]'):
                    schema=json.loads(element.text)
                    for node in schema.get('@graph',[]):
                        if node.get('@type')=='WebPage':node['name']=title;node['description']=description
                    element.text=json.dumps(schema,ensure_ascii=False)
                page.xpath('//*[@id="policy-text"]')[0].set('lang',language)
                path.write_text('<!doctype html>\n'+html.tostring(page,encoding='unicode',method='html')+'\n');count+=1
    # Page metadata is static; this compatibility file no longer injects obsolete legal versions.
    (ROOT/'privacy-content.js').write_text("'use strict';\n// Current legal content and metadata are prerendered by build-legal-pages.py.\n")
    print(f'Rendered {count} legal pages.')
if __name__=='__main__':main()
