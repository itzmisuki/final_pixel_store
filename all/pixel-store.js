
document.addEventListener("DOMContentLoaded",()=>{
  const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];
  const logged=location.pathname.toLowerCase().includes("iniciada")||location.pathname.toLowerCase().includes("perfil");
  const CART_KEY="pixelStoreCart";
  const getCart=()=>{try{return JSON.parse(localStorage.getItem(CART_KEY))||[]}catch{return[]}};
  const saveCart=c=>{localStorage.setItem(CART_KEY,JSON.stringify(c));updateCartCount();};
  function updateCartCount(){const n=getCart().reduce((a,x)=>a+(x.qty||1),0);$$("[data-cart-count]").forEach(x=>x.textContent=n)}
  updateCartCount();

  // Category dropdown
  $$(".category-trigger").forEach(btn=>btn.addEventListener("click",e=>{
    e.stopPropagation(); btn.closest(".category-dropdown")?.classList.toggle("open");
  }));
  document.addEventListener("click",e=>$$(".category-dropdown.open").forEach(x=>{if(!x.contains(e.target))x.classList.remove("open")}));

  // Search: filters catalog if present; otherwise opens explore.
  const params=new URLSearchParams(location.search);
  const initialQ=params.get("q")||"";
  $$("[data-search]").forEach(input=>{
    input.value=initialQ;
    const apply=()=>{
      const q=input.value.trim().toLowerCase();
      const cards=$$(".game-card");
      if(!cards.length){location.href=(logged?"explorariniciada.html":"explorar.html")+(q?"?q="+encodeURIComponent(q):"");return}
      let shown=0;
      cards.forEach(c=>{const ok=!q||c.dataset.game?.includes(q);c.style.display=ok?"":"none";if(ok)shown++});
      const empty=$("#emptySearch"); if(empty)empty.style.display=shown?"none":"block";
    };
    input.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();apply()}});
    input.addEventListener("input",()=>{if($$(".game-card").length)apply()});
  });

  // Catalog platform filters and sorting
  $$(".filter-btn").forEach(btn=>btn.addEventListener("click",()=>{
    $$(".filter-btn").forEach(b=>b.classList.remove("active"));btn.classList.add("active");
    const f=btn.dataset.filter; let shown=0;
    $$(".catalog-grid .game-card").forEach(c=>{
      const p=c.dataset.platform||"";
      const ok=f==="all"||(f==="ps5"&&p.includes("ps5"))||(f==="xbox"&&p.includes("xbox"))||(f==="switch"&&p.includes("switch"));
      c.style.display=ok?"":"none";if(ok)shown++;
    });
    const empty=$("#emptySearch");if(empty)empty.style.display=shown?"none":"block";
  }));
  const sort=$("#sortGames"),grid=$("#catalogGrid");
  if(sort&&grid)sort.addEventListener("change",()=>{
    const cards=$$(".game-card",grid);
    const val=sort.value;
    cards.sort((a,b)=>{
      if(val==="name")return a.querySelector("h3").textContent.localeCompare(b.querySelector("h3").textContent);
      if(val.startsWith("price")){const p=x=>parseInt((x.querySelector("strong")?.textContent||"").replace(/\D/g,""))||0;return val==="price-low"?p(a)-p(b):p(b)-p(a)}
      return 0;
    }).forEach(c=>grid.appendChild(c));
  });

  // Profile tabs
  $$(".profile-tab").forEach(tab=>tab.addEventListener("click",()=>{
    const key=tab.dataset.profileTab;
    $$(".profile-tab").forEach(t=>t.classList.toggle("active",t===tab));
    $$(".profile-panel").forEach(p=>p.classList.toggle("active",p.dataset.panel===key));
  }));
  const profileData=JSON.parse(localStorage.getItem("pixelStoreUser")||"null");
  if(profileData){
    const fields={profileName:profileData.name,profileUsername:profileData.username,profileEmail:profileData.email};
    Object.entries(fields).forEach(([id,v])=>{const el=$("#"+id);if(el)el.value=v||el.value});
    const name=profileData.name||"Tu nombre", user="@"+(profileData.username||"usuario");
    if($("#sidebarName"))$("#sidebarName").textContent=name;if($("#sidebarUser"))$("#sidebarUser").textContent=user;
    if($("#profileAvatar"))$("#profileAvatar").textContent=name.trim().charAt(0).toUpperCase();
  }
  const edit=$("#editProfileBtn"), actions=$("#profileActions"), form=$("#profileForm");
  if(edit)edit.addEventListener("click",()=>{$$("#profileForm input").forEach(x=>x.disabled=false);actions.hidden=false;edit.hidden=true});
  $("#cancelProfile")?.addEventListener("click",()=>location.reload());
  form?.addEventListener("submit",e=>{
    e.preventDefault();const data={name:$("#profileName").value.trim(),username:$("#profileUsername").value.trim().replace(/^@/,""),email:$("#profileEmail").value.trim()};
    localStorage.setItem("pixelStoreUser",JSON.stringify({...profileData,...data}));
    $$("#profileForm input").forEach(x=>x.disabled=true);actions.hidden=true;edit.hidden=false;
    if($("#sidebarName"))$("#sidebarName").textContent=data.name;if($("#sidebarUser"))$("#sidebarUser").textContent="@"+data.username;if($("#profileAvatar"))$("#profileAvatar").textContent=data.name.charAt(0).toUpperCase();
    if($("#profileMessage"))$("#profileMessage").textContent="Cambios guardados correctamente.";
  });
  $("#logoutBtn")?.addEventListener("click",()=>{localStorage.removeItem("pixelStoreSession");location.href="index.html"});
  $("#changePasswordBtn")?.addEventListener("click",()=>{const f=$("#passwordForm");if(f)f.hidden=!f.hidden});
  $$("[data-toggle-password]").forEach(b=>b.addEventListener("click",()=>{const i=$("#"+b.dataset.togglePassword);if(i){i.type=i.type==="password"?"text":"password";b.innerHTML=i.type==="password"?'<i class="fa-solid fa-eye"></i>':'<i class="fa-solid fa-eye-slash"></i>'}}));
  $("#passwordForm")?.addEventListener("submit",e=>{e.preventDefault();const a=$("#newPassword").value,b=$("#confirmPassword").value,m=$("#passwordMessage");if(a!==b){m.textContent="Las contraseñas no coinciden.";return}m.textContent="Contraseña actualizada correctamente.";e.target.reset()});

  // Login/register demo functionality for school project
  $("#loginForm")?.addEventListener("submit",e=>{
    e.preventDefault();const email=$("#loginEmail").value.trim(),msg=$("#loginMessage");
    const user=JSON.parse(localStorage.getItem("pixelStoreUser")||"null");
    if(user && user.email && user.email!==email){msg.textContent="El correo no coincide con la cuenta registrada en este navegador.";return}
    if(!user)localStorage.setItem("pixelStoreUser",JSON.stringify({name:"Usuario Pixel",username:"pixeluser",email}));
    localStorage.setItem("pixelStoreSession","1");location.href="indexiniciada.html";
  });
  $("#registerForm")?.addEventListener("submit",e=>{
    e.preventDefault();const a=$("#registerPassword").value,b=$("#registerConfirm").value,m=$("#registerMessage");
    if(a!==b){m.textContent="Las contraseñas no coinciden.";return}
    const user={name:$("#registerName").value.trim(),username:$("#registerUsername").value.trim().replace(/^@/,""),email:$("#registerEmail").value.trim()};
    localStorage.setItem("pixelStoreUser",JSON.stringify(user));localStorage.setItem("pixelStoreSession","1");location.href="indexiniciada.html";
  });
  $("#forgotForm")?.addEventListener("submit",e=>{e.preventDefault();const a=$("#forgotPassword").value,b=$("#forgotConfirm").value,m=$("#forgotMessage");if(a!==b){m.textContent="Las contraseñas no coinciden.";return}m.textContent="Contraseña actualizada. Ya puedes iniciar sesión.";});

  // Cart
  function money(n){return "$"+Number(n).toLocaleString("es-CO")}
  function renderCart(){
    const list=$("#cartList");if(!list)return;
    let sub=0;
    $$(".cart-item",list).forEach(item=>{
      const price=Number(item.dataset.price)||0,qty=Number($("[data-qty-value]",item)?.textContent)||1;sub+=price*qty;
    });
    const tax=Math.round(sub*.19),total=sub+tax;
    if($("#subtotal"))$("#subtotal").textContent=money(sub);if($("#tax"))$("#tax").textContent=money(tax);if($("#total"))$("#total").textContent=money(total);
    updateCartCount();
  }
  $$(".cart-item").forEach(item=>{
    $$("[data-qty]",item).forEach(btn=>btn.addEventListener("click",()=>{let q=Number($("[data-qty-value]",item).textContent)||1;q=Math.max(1,q+Number(btn.dataset.qty));$("[data-qty-value]",item).textContent=q;renderCart()}));
    $("[data-remove]",item)?.addEventListener("click",()=>{item.remove();renderCart()});
  });
  renderCart();
  $("#checkoutBtn")?.addEventListener("click",()=>{if(!$$(".cart-item").length){alert("Tu carrito está vacío.");return}alert("Compra de demostración realizada. ¡Gracias por usar Pixel Store!");});
  // Add buttons from product pages
  $$(".buy,.cart").forEach(btn=>btn.addEventListener("click",e=>{
    e.preventDefault();
    const card=btn.closest(".game-product,.product-container,main")||document;
    const name=card.querySelector("h1")?.textContent?.trim()||"Videojuego";
    const img=card.querySelector(".product-cover img, .game-product img")?.getAttribute("src")||"banner.jpg";
    const priceText=card.querySelector(".price")?.textContent||"0";
    const price=parseInt(priceText.replace(/\D/g,""))||0;
    const c=getCart();const found=c.find(x=>x.name===name);if(found)found.qty=(found.qty||1)+1;else c.push({name,img,price,qty:1});saveCart(c);
    const target=logged?"carritoiniciada.html":"carrito.html";location.href=target;
  }));
  $$(".favorite").forEach(btn=>btn.addEventListener("click",e=>{e.preventDefault();btn.classList.toggle("selected");btn.setAttribute("aria-pressed",btn.classList.contains("selected"));}));

  // Make old product page image links local and avoid accidental form navigation
  $$("a[href='#']").forEach(a=>a.addEventListener("click",e=>e.preventDefault()));
});
