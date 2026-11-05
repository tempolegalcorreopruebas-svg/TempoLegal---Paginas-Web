'use strict';
document.documentElement.classList.add('js');
const menuButton=document.getElementById('menu-button');
const navigation=document.getElementById('navigation');
menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')==='true';menuButton.setAttribute('aria-expanded',String(!open));navigation.classList.toggle('is-open',!open);});
navigation.addEventListener('click',e=>{if(e.target.closest('a')){navigation.classList.remove('is-open');menuButton.setAttribute('aria-expanded','false');}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&navigation.classList.contains('is-open')){navigation.classList.remove('is-open');menuButton.setAttribute('aria-expanded','false');menuButton.focus();}});
const form=document.getElementById('consulta');
const status=document.getElementById('form-status');
form.addEventListener('submit',e=>{
 e.preventDefault();
 const fields=[...form.querySelectorAll('input,select,textarea')];
 let firstInvalid=null;
 for(const field of fields){const valid=field.checkValidity()&&(!field.required||field.value.trim().length>0);field.setAttribute('aria-invalid',String(!valid));if(!valid&&!firstInvalid)firstInvalid=field;}
 if(firstInvalid){status.textContent='Check the required fields and enter a valid email.';firstInvalid.focus();return;}
 status.textContent='The enquiry passes this mock-up’s validation. No information has been sent or stored. To contact TempoLegal, use WhatsApp, email or phone.';
});
form.querySelector('button[type=submit]').disabled=false;
form.addEventListener('input',e=>{if(e.target.matches('input,select,textarea'))e.target.removeAttribute('aria-invalid');status.textContent='';});
document.querySelectorAll('[data-need]').forEach(a=>a.addEventListener('click',()=>{form.elements.necesidad.value=a.dataset.need;}));

// Explorador de entrega: navegación manual, teclado y lectura sin JavaScript.
const deliveryTabs=[...document.querySelectorAll('[data-delivery]')];
if(deliveryTabs.length){
 const tablist=document.querySelector('.delivery-tabs');tablist.setAttribute('role','tablist');
 function selectDelivery(tab,focus=false){deliveryTabs.forEach(t=>{const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;document.getElementById('entrega-'+t.dataset.delivery).hidden=!active;});if(focus)tab.focus();}
 deliveryTabs.forEach((tab,i)=>{tab.id='tab-'+tab.dataset.delivery;tab.setAttribute('role','tab');tab.setAttribute('aria-controls','entrega-'+tab.dataset.delivery);const panel=document.getElementById('entrega-'+tab.dataset.delivery);panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',tab.id);panel.tabIndex=0;tab.addEventListener('click',()=>selectDelivery(tab));tab.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%deliveryTabs.length;else if(e.key==='ArrowLeft')n=(i+deliveryTabs.length-1)%deliveryTabs.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=deliveryTabs.length-1;else return;e.preventDefault();selectDelivery(deliveryTabs[n],true);});});selectDelivery(deliveryTabs[0]);
}

(()=>{const tabs=[...document.querySelectorAll('[data-stage]')],panels=[...document.querySelectorAll('.stage-panel')];if(!tabs.length)return;tabs[0].parentElement.setAttribute('role','tablist');function activate(i,focus=false){tabs.forEach((t,j)=>{t.setAttribute('aria-selected',j===i);t.tabIndex=j===i?0:-1;panels[j].hidden=j!==i});if(focus)tabs[i].focus()}tabs.forEach((t,i)=>{t.id='tab-'+t.dataset.stage;t.setAttribute('role','tab');t.setAttribute('aria-controls',panels[i].id);panels[i].setAttribute('role','tabpanel');panels[i].setAttribute('aria-labelledby',t.id);t.addEventListener('click',()=>activate(i));t.addEventListener('keydown',e=>{let n=i;if(e.key==='ArrowRight')n=(i+1)%tabs.length;else if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=tabs.length-1;else return;e.preventDefault();activate(n,true)})});activate(0)})();