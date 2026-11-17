const form=document.getElementById("chatForm"), promptBox=document.getElementById("prompt"), results=document.getElementById("results"), sendBtn=document.getElementById("sendBtn");
const names={openai:"ChatGPT · OpenAI",gemini:"Gemini · Google",llama:"Meta Llama"};
let history=[];
function selected(){return document.querySelector('input[name="mode"]:checked').value}
function card(id,body,cls=""){return `<article class="answer"><div class="answer-head">${names[id]}</div><div class="answer-body ${cls}">${body}</div></article>`}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
async function ask(id,message){
 const el=document.getElementById("body-"+id);
 try{
  const r=await fetch(`/api/chat/${id}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message,history})});
  const data=await r.json(); if(!r.ok) throw new Error(data.error||"တစ်ခုခု မှားယွင်းနေပါသည်။");
  el.textContent=data.answer;
  return {role:"assistant",content:data.answer};
 }catch(e){el.textContent="အမှား: "+e.message;el.classList.add("error");return null}
}
form.addEventListener("submit",async e=>{
 e.preventDefault();const message=promptBox.value.trim();if(!message)return;
 const mode=selected(), ids=mode==="all"?["openai","gemini","llama"]:[mode];
 results.innerHTML=ids.map(id=>card(id,`<span class="loading">အဖြေရှာနေပါတယ်...</span>`)).join("");
 ids.forEach(id=>{const body=results.querySelectorAll(".answer-body")[ids.indexOf(id)];body.id="body-"+id});
 sendBtn.disabled=true;sendBtn.textContent="စောင့်ပါ...";
 const prior=history.slice(-12);
 const settled=await Promise.all(ids.map(id=>ask(id,message)));
 history.push({role:"user",content:message});
 settled.forEach((a,i)=>{if(a)history.push(a)});
 try{localStorage.setItem("my-ai-hub-history",JSON.stringify(history.slice(-40)))}catch{}
 sendBtn.disabled=false;sendBtn.textContent="မေးမယ် ➤";promptBox.value="";
});
promptBox.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();form.requestSubmit()}});
document.getElementById("clearBtn").addEventListener("click",()=>{history=[];localStorage.removeItem("my-ai-hub-history");results.innerHTML='<div class="empty"><div class="empty-icon">✧</div><b>မှတ်တမ်းရှင်းပြီးပါပြီ</b><p>မေးခွန်းအသစ် စတင်နိုင်ပါပြီ။</p></div>'});
try{history=JSON.parse(localStorage.getItem("my-ai-hub-history")||"[]")}catch{history=[]}
