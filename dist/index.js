var o=new Map,u=!1;function c(e,t){return o.set(e,t),u||(u=!0,window.addEventListener("overseer:shortcut",r=>{o.get(r.detail?.id)?.()})),()=>{o.get(e)===t&&o.delete(e)}}function v(e){return window.addEventListener("overseer:ready",e),()=>{window.removeEventListener("overseer:ready",e)}}function s(e,t,r,a){window.Overseer.send("overseer:toast#sendToast",{title:t,message:r,type:e,options:a})}var l={error:(e,t,r)=>s("error",e,t,r),success:(e,t,r)=>s("success",e,t,r),warning:(e,t,r)=>s("warning",e,t,r),info:(e,t,r)=>s("info",e,t,r)};function f(e){return window.Overseer.state.get(e)}function d(e,t){window.Overseer.state.set(e,t)}var n={lastRoll:null,lastTotal:null,modifier:0,history:[]},p=v(async()=>{let e=await f("d20_roller_data");e&&(n=e),w(),c("quick-roll-d20",()=>{g()})});function w(){let e=document.getElementById("app");if(!e)return;let t=n.lastTotal!==null?String(n.lastTotal):"--",r="";n.lastRoll===20&&(r="crit-success"),n.lastRoll===1&&(r="crit-fail"),e.innerHTML=`
    <div class="roller-frame">
      <div class="display-panel ${r}" id="roll-display">
        ${t}
      </div>
      
      <div class="modifier-row">
        <label for="roll-mod">MODIFIER:</label>
        <input type="number" id="roll-mod" value="${n.modifier}" step="1" />
      </div>

      <button class="roll-btn" id="roll-trigger">Engage Roller</button>

      <div class="history-log" id="roll-history">
        ${n.history.map(a=>`<div>${a}</div>`).reverse().join("")}
      </div>
    </div>
  `,document.getElementById("roll-trigger")?.addEventListener("click",g),document.getElementById("roll-mod")?.addEventListener("input",a=>{let i=parseInt(a.target.value,10);n.modifier=isNaN(i)?0:i,d("d20_roller_data",n)})}function g(){let e=Math.floor(Math.random()*20)+1,t=n.modifier,r=e+t,a=t>=0?"+":"",m=`[${new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"})}] d20(${e})${a}${t} = <strong>${r}</strong>`;n.lastRoll=e,n.lastTotal=r,n.history.push(m),n.history.length>5&&n.history.shift(),d("d20_roller_data",n),e===20?l.success("CRITICAL SUCCESS","A natural 20 was pulled from the iron engine!"):e===1&&l.error("CRITICAL FAILURE","A dark structural failure: Natural 1 rolled."),w()}var O=p;export{O as default};
