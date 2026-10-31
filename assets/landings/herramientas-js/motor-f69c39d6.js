(function(root){'use strict';
function multa(base,tipo){if(!Number.isFinite(base)||base<=0||!['leve','grave'].includes(tipo))return null;return {min:base*(tipo==='leve'?.001:.007),max:base*(tipo==='leve'?.007:.01)};}
function puntosTitulares(n){if(!Number.isInteger(n)||n<0)return null;if(n<=1000)return 1;if(n<=10000)return 2;if(n<=100000)return 3;if(n>=101000)return 4;return null;}
function escala(v){const domains=[[1,2,3,4],[.5,1,2,3],[.5,2,3],[.5,1,2],[.5,1,2],[1,2,3]];if(v.length!==6||v.some((n,i)=>!domains[i].includes(n)))return null;const total=v.reduce((a,b)=>a+b,0);return {total,granEscala:total>=6};}
function diagnostico(values){if(values.length!==5||values.some(x=>!['si','parcial','no','nose'].includes(x)))return null;return values.map((value,index)=>({index,value}));}
const api={multa,puntosTitulares,escala,diagnostico};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.TempoTools=api;
})(typeof globalThis!=='undefined'?globalThis:this);