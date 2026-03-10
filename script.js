
// --- CORE SETUP & STATE MANAGEMENT ---

const FIREBASE_CONFIG = { 

    apiKey: "AIzaSyD35odIjfILahBo2JEGWlCVChmfjHq6Rng", 

    authDomain: "boldng-web1.firebaseapp.com", 

    projectId: "boldng-web1", 

    storageBucket: "boldng-web1.firebasestorage.app", 

    messagingSenderId: "451061811783", 

    appId: "1:451061811783:web:b5d2870e86b7cdc517bf62", 

    measurementId: "G-7QBPQ4FSRS" 

};



// Initialize Firebase

if (!firebase.apps.length) {

    firebase.initializeApp(FIREBASE_CONFIG);

}

const db = firebase.firestore();



// --- CATEGORIES SETUP ---

const CATEGORIES = [

    { id: 'fashion-men', name: "Men's Fashion" }, 

    { id: 'fashion-women', name: "Women's Fashion" }, 

    { id: 'phones', name: 'Phones & Tablets' }, 

    { id: 'laptops', name: 'Computing & PCs' },

    { id: 'electronics', name: 'Electronics & TV' }, 

    { id: 'appliances', name: 'Home Appliances' }, 

    { id: 'beauty', name: 'Health & Beauty' }, 

    { id: 'jewelry', name: 'Jewelry & Watches' },

    { id: 'bags', name: 'Bags & Luggage' }, 

    { id: 'sports', name: 'Sports & Outdoors' }, 

    { id: 'kids', name: 'Kids & Toys' }, 

    { id: 'baby', name: 'Baby Essentials' },

    { id: 'home-office', name: 'Home & Office' }, 

    { id: 'industrial', name: 'Industrial & Scientific' }, 

    { id: 'garden', name: 'Garden & Outdoors' }, 

    { id: 'pets', name: 'Pet Supplies' },

    { id: 'music', name: 'Musical Instruments' }, 

    { id: 'cars', name: 'Automotive & Cars' }, 

    { id: 'ebooks', name: 'eBooks & PDFs' }, 

    { id: 'software', name: 'Software & Digital' }

];

    const TRENDING_SEARCHES = ["Fashion hoodie", "Mens fashionable trainers", "Streetwear hoodie", "Comfortable hoodie", "Gym hoodies", "Vintage hoodie", "Fashion puffer jacket", "Trending hoodie", "Autumn hoodie", "Mens fashion essentials", "Mens watch"];

    const CAMPAIGNS = [

        { bg: 'from-blue-900/95 via-blue-900/60 to-transparent', tag: 'Tech Week Deals', title: 'Latest Laptops<br><span class="text-blue-200">& Accessories</span>', btn: 'Shop Tech', cat: 'laptops', icon: 'laptop', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80&auto=format&fit=crop' },

        { bg: 'from-rose-900/95 via-rose-900/60 to-transparent', tag: 'New Arrivals', title: 'Premium Women\'s<br><span class="text-rose-200">Fashion</span>', btn: 'Shop Fashion', cat: 'fashion-women', icon: 'sparkles', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80&auto=format&fit=crop' },

        { bg: 'from-emerald-900/95 via-emerald-900/60 to-transparent', tag: 'Special Offer', title: 'Smart Home<br><span class="text-emerald-200">Appliances</span>', btn: 'Upgrade Home', cat: 'appliances', icon: 'home', image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80&auto=format&fit=crop' },

        { bg: 'from-purple-900/95 via-purple-900/60 to-transparent', tag: 'Best Sellers', title: 'Top Trending<br><span class="text-purple-200">Smartphones</span>', btn: 'Shop Phones', cat: 'phones', icon: 'smartphone', image: 'https://images.unsplash.com/photo-1598327105666-5b89351cb315?w=800&q=80&auto=format&fit=crop' }

    ];


    let products = [], cart = [], activeCat = 'all', files = [], editingId = null;
    let currentUser = null; let state_orders = []; let ordersUnsubscribe = null; let promoInterval = null; let currentPromoIndex = 0;
    let platformSettings = { email: 'help@bold.ng', phone: '0708 063 5700', whatsapp: '2347080635700', address: '123 Commerce Avenue\nLagos, Nigeria', facebook: 'https://facebook.com/boldng', twitter: 'https://twitter.com/boldng', instagram: 'https://instagram.com/bold.ng' };
    let currentShippingFee = 0;

    // --- REPAIRED SMART ROUTER ENGINE ---
    window.handleRouter = function() {
        let hash = window.location.hash.replace('#', '') || 'home';
        
        ['view-cart', 'view-checkout', 'view-details', 'view-transaction', 'view-invoice'].forEach(id => {
            const el = document.getElementById(id); if(el) el.classList.add('hidden');
        });
        
        document.querySelectorAll('.view-section').forEach(v => v.classList.add('hidden'));

        let mainView = hash;

        if (hash.startsWith('product/')) {
            const id = hash.split('/')[1];
            if (products.length > 0) renderProductDetails(id);
            mainView = 'home';
            document.getElementById('view-details').classList.remove('hidden');
        } else if (hash === 'cart') {
            renderCartUI();
            mainView = 'home'; 
            document.getElementById('view-cart').classList.remove('hidden');
        } else if (hash === 'checkout') {
            if(cart.length === 0) { window.location.hash = 'cart'; return; }
            renderCheckoutUI();
            mainView = 'home';
            document.getElementById('view-checkout').classList.remove('hidden');
        } else if (hash.startsWith('tx/')) {
            const id = hash.split('/')[1];
            if (state_orders.length > 0) renderTransactionUI(id);
            mainView = 'dashboard';
            document.getElementById('view-transaction').classList.remove('hidden');
        }

        const target = document.getElementById('view-' + mainView);
        if(target) target.classList.remove('hidden');

        // SAFELY Update Bottom Nav Colors without destroying layout!
        ['nav-home', 'nav-cart', 'nav-account'].forEach(id => {
            const el = document.getElementById(id);
            if(el) { el.classList.remove('text-orange-500'); el.classList.add('text-gray-500'); }
        });

        if (mainView === 'home' && hash !== 'cart') { 
            const nh = document.getElementById('nav-home'); 
            if(nh) { nh.classList.remove('text-gray-500'); nh.classList.add('text-orange-500'); } 
        }
        else if (mainView === 'account' || mainView === 'dashboard') { 
            const na = document.getElementById('nav-account'); 
            if(na) { na.classList.remove('text-gray-500'); na.classList.add('text-orange-500'); } 
        }
        else if (hash === 'cart') { 
            const nc = document.getElementById('nav-cart'); 
            if(nc) { nc.classList.remove('text-gray-500'); nc.classList.add('text-orange-500'); } 
        }

        const isBusiness = ['login', 'vendor-signup', 'dashboard', 'merchant', 'finance', 'admin', 'hr', 'support', 'vice', 'affiliate', 'logistics', 'success', 'terms'].includes(mainView);
        
        const fNav = document.getElementById('footer-nav'); 
        if(fNav) {
            if (isBusiness && mainView !== 'success' && mainView !== 'terms') { fNav.style.display = 'none'; } 
            else { fNav.style.display = 'flex'; }
        }
        
        const mFoot = document.getElementById('main-footer'); 
        if(mFoot) mFoot.style.display = (isBusiness && mainView !== 'terms') ? 'none' : 'block';

        if(mainView === 'admin') loadAdmin(); 
        if(mainView === 'finance') loadFinance(); 
        if(mainView === 'logistics') renderLogistics();
        
        if (typeof lucide !== 'undefined') lucide.createIcons(); 
        window.scrollTo(0,0);
    };

    window.addEventListener('hashchange', handleRouter);
    window.nav = function(view) { window.location.hash = view; }
    window.goBack = function() { if (window.history.length > 1 && window.location.hash !== '') { window.history.back(); } else { window.location.hash = 'home'; } }

    // PERFECTED: INSTANT AMAZON-STYLE CART BADGE UPDATER
    window.updateCartBadge = function() { 
        const count = cart.length; 
        const b1 = document.getElementById('badge'); 
        const b2 = document.getElementById('footer-badge'); 
        
        if (b1) { 
            b1.innerText = count; 
            if (count > 0) {
                b1.classList.remove('hidden'); // Forces it to show immediately
                b1.classList.add('scale-150'); 
                setTimeout(() => b1.classList.remove('scale-150'), 400); 
            } else {
                b1.classList.add('hidden'); // Hides it if cart is empty
            }
        } 
        
        if (b2) { 
            b2.innerText = count; 
            if (count > 0) {
                b2.classList.remove('hidden'); // Forces it to show immediately
                b2.classList.add('scale-150'); 
                setTimeout(() => b2.classList.remove('scale-150'), 400); 
            } else {
                b2.classList.add('hidden'); // Hides it if cart is empty
            }
        } 
    }
    window.updateCart = function() { localStorage.setItem('bold_cart', JSON.stringify(cart)); window.updateCartBadge(); }

    window.addEventListener('DOMContentLoaded', () => {
        try { cart = JSON.parse(localStorage.getItem('bold_cart')||'[]'); updateCartBadge(); } catch(e) { cart = []; }
        const catSelect = document.getElementById('p-cat-upload');
        if(catSelect) catSelect.innerHTML = `<option value="">Select Product Category</option>` + CATEGORIES.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        document.getElementById('cat-chips').innerHTML = `<button type="button" class="cat-chip selected" onclick="filter('all')">All Categories</button>` + CATEGORIES.map(c => `<button type="button" class="cat-chip" onclick="filter('${c.id}')">${c.name}</button>`).join('');
        document.getElementById('trending-chips').innerHTML = TRENDING_SEARCHES.map(term => `<button type="button" class="px-4 py-2 bg-slate-100 hover:bg-orange-100 hover:text-orange-600 text-slate-600 text-[10px] font-bold rounded-full whitespace-nowrap transition-colors border border-slate-200 shadow-sm" onclick="fillSearch('${term}')"><i data-lucide="trending-up" class="w-3 h-3 inline mr-1 opacity-50"></i>${term}</button>`).join('');

        try {
            if (typeof firebase !== 'undefined') {
                firebase.initializeApp(FIREBASE_CONFIG); window.db = firebase.firestore(); window.db.settings({ experimentalForceLongPolling: true }); window.auth = firebase.auth(); window.auth.signInAnonymously().catch(console.error);
                
                window.db.collection('settings').doc('general').onSnapshot(doc => {
                    if(doc.exists) { platformSettings = { ...platformSettings, ...doc.data() }; updateSettingsUI(); }
                });

                window.auth.onAuthStateChanged(async (user) => {
                    const ctaBlock = document.getElementById('home-login-cta');
                    if (user && !user.isAnonymous) {
                        if (ctaBlock) ctaBlock.style.display = 'none';
                        try {
                            const docRef = await window.db.collection('users').doc(user.email).get();
                            if (docRef.exists) { currentUser = docRef.data(); } else {
                                const adminEmails = ['ceo@bold.ng', 'admin@bold.ng', 'doncassidy@bold.ng'];
                                if(adminEmails.includes(user.email)) { currentUser = { storeName: "Bold Official", email: user.email, role: 'admin' }; await window.db.collection('users').doc(user.email).set(currentUser); } 
                                else { currentUser = { storeName: user.email.split('@')[0], email: user.email, role: 'vendor' }; await window.db.collection('users').doc(user.email).set(currentUser); }
                            }
                        } catch (e) {
                            const adminEmails = ['ceo@bold.ng', 'admin@bold.ng', 'doncassidy@bold.ng'];
                            currentUser = { storeName: adminEmails.includes(user.email) ? "Bold Official" : user.email.split('@')[0], email: user.email, role: adminEmails.includes(user.email) ? 'admin' : 'vendor' };
                        }
                        document.getElementById('user-name').innerText = currentUser.storeName; document.getElementById('user-role').innerText = currentUser.role === 'admin' ? "Super Admin" : "Verified Vendor";
                        
                        document.querySelectorAll('.admin-only').forEach(el => el.style.display = currentUser.role === 'admin' ? 'flex' : 'none');
                        const btnEditFoot = document.getElementById('admin-footer-edit'); if(btnEditFoot) btnEditFoot.style.display = currentUser.role === 'admin' ? 'flex' : 'none';

                        const activeView = Array.from(document.querySelectorAll('.view-section')).find(v => !v.classList.contains('hidden'))?.id;
                        if(['view-login', 'view-vendor-signup', 'view-account'].includes(activeView)) nav('dashboard');
                        listenToOrders();
                    } else {
                        if (ctaBlock) ctaBlock.style.display = 'block'; currentUser = null; if(ordersUnsubscribe) { ordersUnsubscribe(); ordersUnsubscribe = null; }
                        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
                        const btnEditFoot = document.getElementById('admin-footer-edit'); if(btnEditFoot) btnEditFoot.style.display = 'none';
                    }
                });
                
                window.db.collection('products').orderBy('timestamp','desc').onSnapshot(snap => { 
                    products = []; snap.forEach(d => { let p=d.data(); p.id=d.id; products.push(p); }); 
                    renderHome(); 
                    if(!document.getElementById('view-merchant').classList.contains('hidden')) loadInventory(); 
                    if (window.location.hash.startsWith('#product/')) handleRouter();
                });
            }
        } catch (e) { console.error(e); }
        
        handleRouter(); 
    });

    function updateSettingsUI() {
        const ftEmail = document.getElementById('ft-email'); if(ftEmail) ftEmail.innerText = platformSettings.email;
        const ftPhone = document.getElementById('ft-phone'); if(ftPhone) ftPhone.innerText = platformSettings.phone;
        const ftAddress = document.getElementById('ft-address'); if(ftAddress) ftAddress.innerHTML = platformSettings.address.replace(/\n/g, '<br>');
        const ftFb = document.getElementById('ft-fb'); if(ftFb) ftFb.href = platformSettings.facebook;
        const ftTw = document.getElementById('ft-tw'); if(ftTw) ftTw.href = platformSettings.twitter;
        const ftIg = document.getElementById('ft-ig'); if(ftIg) ftIg.href = platformSettings.instagram;
        
        const accEmail = document.getElementById('acc-email'); if(accEmail) accEmail.innerText = platformSettings.email;
        const accEmailLink = document.getElementById('acc-email-link'); if(accEmailLink) accEmailLink.href = 'mailto:' + platformSettings.email;
        const accPhone = document.getElementById('acc-phone'); if(accPhone) accPhone.innerText = platformSettings.phone;
        const accPhoneLink = document.getElementById('acc-phone-link'); if(accPhoneLink) accPhoneLink.href = 'tel:' + platformSettings.phone.replace(/\s+/g, '');
        const accWaLink = document.getElementById('acc-wa-link'); if(accWaLink) accWaLink.href = 'https://wa.me/' + platformSettings.whatsapp.replace(/\D/g,'');
    }

    window.openSettingsModal = function() {
        document.getElementById('set-email').value = platformSettings.email || '';
        document.getElementById('set-phone').value = platformSettings.phone || '';
        document.getElementById('set-whatsapp').value = platformSettings.whatsapp || '';
        document.getElementById('set-address').value = platformSettings.address || '';
        document.getElementById('set-facebook').value = platformSettings.facebook || '';
        document.getElementById('set-twitter').value = platformSettings.twitter || '';
        document.getElementById('set-instagram').value = platformSettings.instagram || '';
        document.getElementById('view-settings-modal').classList.remove('hidden');
    }

    window.savePlatformSettings = async function() {
        const btn = document.getElementById('btn-save-settings');
        btn.innerHTML = `<i data-lucide="loader-2" class="w-5 h-5 animate-spin mx-auto"></i>`;
        btn.disabled = true; lucide.createIcons();
        const newSettings = { email: document.getElementById('set-email').value, phone: document.getElementById('set-phone').value, whatsapp: document.getElementById('set-whatsapp').value, address: document.getElementById('set-address').value, facebook: document.getElementById('set-facebook').value, twitter: document.getElementById('set-twitter').value, instagram: document.getElementById('set-instagram').value };
        try { await window.db.collection('settings').doc('general').set(newSettings, { merge: true }); showToast("Platform Settings Globally Updated!"); document.getElementById('view-settings-modal').classList.add('hidden'); } catch(e) { alert("Error saving settings: " + e.message); }
        btn.innerHTML = `Save Changes globally`; btn.disabled = false;
    }

    function listenToOrders() {
        if(!currentUser) return;
        if(ordersUnsubscribe) ordersUnsubscribe();
        if(currentUser.role === 'admin') { 
            ordersUnsubscribe = window.db.collection('orders').onSnapshot(snap => { state_orders = []; snap.forEach(doc => { let d = doc.data(); d.docId = doc.id; state_orders.push(d); }); state_orders.sort((a,b) => new Date(b.date) - new Date(a.date)); refreshOrderViews(); if (window.location.hash.startsWith('#tx/')) handleRouter(); }, err => console.error(err)); 
        } 
        else if (currentUser.role === 'vendor') { 
            ordersUnsubscribe = window.db.collection('vendors').doc(currentUser.email).collection('vendorOrders').onSnapshot(snap => { state_orders = []; snap.forEach(doc => { let d = doc.data(); d.docId = doc.id; state_orders.push(d); }); state_orders.sort((a,b) => new Date(b.date) - new Date(a.date)); refreshOrderViews(); if (window.location.hash.startsWith('#tx/')) handleRouter(); }, err => console.error(err)); 
        }
    }

    function refreshOrderViews() { if(!document.getElementById('view-finance').classList.contains('hidden')) loadFinance(); if(!document.getElementById('view-admin').classList.contains('hidden')) loadAdmin(); if(!document.getElementById('view-logistics').classList.contains('hidden')) renderLogistics(); }

    window.handleProfileClick = function() { if (currentUser) { nav('dashboard'); } else { nav('account'); } };
    window.search = function(val) { const term = val.toLowerCase(); if (term === '') { clearSearch(); return; } document.getElementById('home-default-view').classList.add('hidden'); document.getElementById('home-search-view').classList.remove('hidden'); document.getElementById('search-title').innerText = `Results for "${val}"`; renderGrid(products.filter(p => p.title.toLowerCase().includes(term) || (p.model && p.model.toLowerCase().includes(term))), 'grid'); if(promoInterval) clearInterval(promoInterval); }
    window.clearSearch = function() { document.getElementById('main-search').value = ''; activeCat = 'all'; document.querySelectorAll('#cat-chips .cat-chip').forEach(chip => chip.classList.remove('selected')); document.querySelector('#cat-chips .cat-chip').classList.add('selected'); document.getElementById('home-default-view').classList.remove('hidden'); document.getElementById('home-search-view').classList.add('hidden'); renderHome(); }
    window.fillSearch = function(term) { document.getElementById('main-search').value = term; search(term); document.getElementById('grid').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    window.filter = function(id) { activeCat = id; if(id !== 'all') localStorage.setItem('bold_last_category', id); document.querySelectorAll('#cat-chips .cat-chip').forEach(chip => { chip.classList.remove('selected'); if(chip.getAttribute('onclick').includes(`filter('${id}')`)) { chip.classList.add('selected'); } }); document.getElementById('main-search').value = ''; renderHome(); }
    
    function updateBanner() {
        const promo = CAMPAIGNS[currentPromoIndex]; const banner = document.getElementById('hero-banner'); const imgEl = document.getElementById('hero-image'); const overlay = document.getElementById('hero-overlay');
        if(!banner || !imgEl || !overlay) return;
        banner.style.opacity = '0'; banner.style.transform = 'scale(0.99)'; imgEl.style.transform = 'scale(1)'; imgEl.style.opacity = '0'; 
        setTimeout(() => {
            overlay.className = `absolute inset-0 bg-gradient-to-r ${promo.bg} pointer-events-none transition-colors duration-700`;
            document.getElementById('hero-tag').innerHTML = `<i data-lucide="${promo.icon}" class="w-3 h-3 inline-block mr-1"></i> ${promo.tag}`;
            document.getElementById('hero-title').innerHTML = promo.title; document.getElementById('hero-btn').onclick = () => { filter(promo.cat); window.scrollTo({top: 0, behavior: 'smooth'}); };
            imgEl.src = promo.image;
            document.getElementById('hero-dots').innerHTML = CAMPAIGNS.map((_, i) => `<div onclick="setPromo(${i})" class="h-1.5 rounded-full cursor-pointer transition-all duration-500 shadow-sm ${i===currentPromoIndex ? 'w-6 bg-orange-500' : 'w-1.5 bg-white/40 hover:bg-white/80'}"></div>`).join('');
            banner.style.opacity = '1'; banner.style.transform = 'scale(1)'; imgEl.style.opacity = '1'; imgEl.style.transform = 'scale(1.05)'; 
            lucide.createIcons(); 
        }, 400); 
    }

    function startPromoRotation() { if(promoInterval) clearInterval(promoInterval); updateBanner(); promoInterval = setInterval(() => { currentPromoIndex = (currentPromoIndex + 1) % CAMPAIGNS.length; updateBanner(); }, 6000); }
    window.setPromo = function(index) { currentPromoIndex = index; if(promoInterval) clearInterval(promoInterval); updateBanner(); promoInterval = setInterval(() => { currentPromoIndex = (currentPromoIndex + 1) % CAMPAIGNS.length; updateBanner(); }, 6000); }

    function renderHome() { 
        if (activeCat !== 'all') { document.getElementById('home-default-view').classList.add('hidden'); document.getElementById('home-search-view').classList.remove('hidden'); const catName = CATEGORIES.find(c => c.id === activeCat)?.name || 'Category'; document.getElementById('search-title').innerText = catName; renderGrid(products.filter(p => p.category === activeCat), 'grid'); if(promoInterval) clearInterval(promoInterval); } 
        else { document.getElementById('home-default-view').classList.remove('hidden'); document.getElementById('home-search-view').classList.add('hidden'); startPromoRotation();
            const flashItems = products.filter(p => p.oldPrice && p.oldPrice > p.price).slice(0, 6); if(flashItems.length > 0) { document.getElementById('flash-section').classList.remove('hidden'); renderGrid(flashItems, 'flash-scroller', true); } else { document.getElementById('flash-section').classList.add('hidden'); }
            const lastCat = localStorage.getItem('bold_last_category'); if (lastCat) { const recommendedItems = products.filter(p => p.category === lastCat).slice(0, 6); if (recommendedItems.length > 0) { document.getElementById('recommended-section').classList.remove('hidden'); renderGrid(recommendedItems, 'recommended-scroller', true); } }
            renderGrid(products.slice(0, 10), 'discover-grid');
        }
    }

    function renderGrid(list, targetId = 'grid', isScroller = false) {
        const container = document.getElementById(targetId);
        container.innerHTML = list.map(p => {
            const badge = p.isDigital ? `<div class="absolute top-3 left-3 bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg flex items-center gap-1"><i data-lucide="download-cloud" class="w-3 h-3"></i> E-Book</div>` : (p.oldPrice ? `<div class="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg">-${Math.round(((p.oldPrice-p.price)/p.oldPrice)*100)}%</div>` : '');
            const cardClasses = isScroller ? 'product-card card group cursor-pointer scroller-item flex-shrink-0 border-gray-100' : 'product-card card group cursor-pointer border-gray-100';
            const reviewCount = p.reviews ? p.reviews.length : 0; const avgRating = reviewCount > 0 ? (p.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1) : 0;
            let starsUi = ''; for(let i=1; i<=5; i++) { starsUi += `<i data-lucide="star" class="w-3 h-3 ${i <= Math.round(avgRating) && reviewCount > 0 ? 'text-orange-400 fill-current' : 'text-gray-300'}"></i>`; }
            const ratingHtml = `<div class="flex items-center gap-1 text-[10px] text-gray-500 mt-1 mb-1 font-bold"><div class="flex gap-0.5">${starsUi}</div><span>${reviewCount > 0 ? avgRating : 'New'} <span class="font-normal text-gray-400">(${reviewCount})</span></span></div>`;
            return `
            <div class="${cardClasses}" onclick="window.location.hash='product/${p.id}'">
                <div class="h-36 bg-gray-50 relative overflow-hidden flex items-center justify-center p-2"><img src="${p.images && p.images.length > 0 ? p.images[0] : 'https://via.placeholder.com/150'}" class="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500">${badge}</div>
                <div class="p-3 bg-white border-t border-gray-100"><div class="font-bold text-xs truncate text-slate-800">${p.title}</div>${ratingHtml}<div class="text-[10px] text-gray-500 mt-0.5 truncate border-b border-gray-50 pb-2 mb-2">By ${p.storeName || 'Bold Store'}</div><div class="flex items-end justify-between"><div><div class="font-black text-slate-900 text-sm">₦${Number(p.price).toLocaleString()}</div>${p.oldPrice ? `<div class="text-[9px] text-gray-400 line-through">₦${Number(p.oldPrice).toLocaleString()}</div>` : ''}</div><button type="button" onclick="event.stopPropagation(); addToCart('${p.id}', this)" class="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wide flex items-center gap-1 hover:bg-orange-500 hover:text-white transition-all duration-300"><i data-lucide="shopping-bag" class="w-3 h-3"></i> <span class="btn-text">Add</span></button></div></div>
            </div>`
        }).join('') || `<p class="col-span-2 text-center p-10 text-gray-400">No products found here yet.</p>`;
        lucide.createIcons();
    }

    window.showAuthError = function(boxId, textId, msg) { document.getElementById(textId).innerText = msg; document.getElementById(boxId).classList.remove('hidden'); }
    window.hideAuthError = function(boxId) { document.getElementById(boxId).classList.add('hidden'); }
    window.togglePass = function(inputId, eyeId, eyeOffId) { const input = document.getElementById(inputId); const eye = document.getElementById(eyeId); const eyeOff = document.getElementById(eyeOffId); if(input.type === 'password') { input.type = 'text'; eye.classList.add('hidden'); eyeOff.classList.remove('hidden'); } else { input.type = 'password'; eye.classList.remove('hidden'); eyeOff.classList.add('hidden'); } }

    window.doLogin = async function() { hideAuthError('login-error'); const email = document.getElementById('login-email').value.toLowerCase(); const pass = document.getElementById('login-pass').value; if(!email || !pass) return showAuthError('login-error', 'login-error-text', 'Please enter your email and password.'); const btn = document.getElementById('btn-login'); const originalHtml = btn.innerHTML; btn.innerHTML = `<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> Authenticating...`; btn.disabled = true; lucide.createIcons(); try { await window.auth.signInWithEmailAndPassword(email, pass); showToast("Logged in successfully"); } catch(err) { const adminEmails = ['ceo@bold.ng', 'admin@bold.ng', 'doncassidy@bold.ng']; if (adminEmails.includes(email)) { try { await window.auth.createUserWithEmailAndPassword(email, pass); showToast("CEO Account System Initialized!"); } catch(createErr) { if (createErr.code === 'auth/email-already-in-use') showAuthError('login-error', 'login-error-text', 'Incorrect password. Try again.'); else showAuthError('login-error', 'login-error-text', 'System Error: ' + createErr.message); } } else { let errorMsg = "Login failed. Please check your credentials."; if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') errorMsg = "No account found with this email. Please register as a seller first."; if (err.code === 'auth/wrong-password') errorMsg = "Incorrect password. Please try again."; showAuthError('login-error', 'login-error-text', errorMsg); } } finally { btn.innerHTML = originalHtml; btn.disabled = false; lucide.createIcons(); } }
    
    // PERFECTED VENDOR REGISTRATION WITH BANK DETAILS
    window.registerVendor = async function() { 
        hideAuthError('reg-error'); 
        const store = document.getElementById('reg-store').value; 
        const email = document.getElementById('reg-email').value.toLowerCase(); 
        const pass = document.getElementById('reg-pass').value; 
        const bankName = document.getElementById('reg-bank-name').value;
        const accNum = document.getElementById('reg-acc-num').value;
        const accName = document.getElementById('reg-acc-name').value;

        if(!store || !email || !pass || !bankName || !accNum || !accName) return showAuthError('reg-error', 'reg-error-text', 'All fields (including bank details) are required to open a verified store.'); 
        if(pass.length < 6) return showAuthError('reg-error', 'reg-error-text', 'Password must be at least 6 characters long.'); 
        if(accNum.length !== 10) return showAuthError('reg-error', 'reg-error-text', 'Please enter a valid 10-digit Nigerian account number.');

        const btn = document.getElementById('btn-reg'); const originalHtml = btn.innerHTML; btn.innerHTML = `<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> Creating Store...`; btn.disabled = true; lucide.createIcons(); 
        
        try { 
            const cred = await window.auth.createUserWithEmailAndPassword(email, pass); 
            await window.db.collection('users').doc(email).set({ 
                storeName: store, 
                email: email, 
                role: 'vendor', 
                uid: cred.user.uid, 
                bankDetails: { bankName: bankName, accountNumber: accNum, accountName: accName },
                createdAt: firebase.firestore.FieldValue.serverTimestamp() 
            }); 
            showToast("Store Created Successfully!"); 
        } catch(err) { 
            let errorMsg = "Registration Failed."; 
            if(err.code === 'auth/email-already-in-use') errorMsg = "An account with this email already exists. Try signing in."; 
            showAuthError('reg-error', 'reg-error-text', errorMsg); 
        } finally { 
            btn.innerHTML = originalHtml; btn.disabled = false; lucide.createIcons(); 
        } 
    }
    
    window.logout = function() { window.auth.signOut().then(() => { currentUser = null; nav('home'); showToast("Securely logged out."); }); }

    window.toggleDigitalMode = function(isDigital) { if(isDigital) { document.getElementById('brand-field').classList.add('hidden'); document.getElementById('stock-field').classList.add('hidden'); document.getElementById('sku-field').classList.add('hidden'); document.getElementById('condition-field').classList.add('hidden'); document.getElementById('digital-url-section').classList.remove('hidden'); document.getElementById('p-cat-upload').value = 'ebooks'; toggleCategorySpecs('ebooks'); } else { document.getElementById('brand-field').classList.remove('hidden'); document.getElementById('stock-field').classList.remove('hidden'); document.getElementById('sku-field').classList.remove('hidden'); document.getElementById('condition-field').classList.remove('hidden'); document.getElementById('digital-url-section').classList.add('hidden'); document.getElementById('p-cat-upload').value = ''; toggleCategorySpecs(''); } }
    window.toggleCategorySpecs = function(val) { const container = document.getElementById('dynamic-specs-container'); document.querySelectorAll('#dynamic-specs-container > div:not(h4)').forEach(el => el.classList.add('hidden')); container.classList.add('hidden'); if (!val) return; container.classList.remove('hidden'); const techCats = ['phones', 'laptops', 'electronics']; const fashionCats = ['fashion-men', 'fashion-women', 'jewelry', 'bags', 'sports', 'kids']; const homeCats = ['appliances', 'home-office', 'industrial', 'garden', 'pets']; const carCats = ['cars']; const bookCats = ['ebooks', 'software', 'music']; if (techCats.includes(val)) { document.getElementById('specs-tech').classList.remove('hidden'); document.getElementById('specs-fashion').classList.remove('hidden'); } else if (fashionCats.includes(val)) { document.getElementById('specs-fashion').classList.remove('hidden'); } else if (homeCats.includes(val)) { document.getElementById('specs-home').classList.remove('hidden'); document.getElementById('specs-fashion').classList.remove('hidden'); } else if (carCats.includes(val)) { document.getElementById('specs-cars').classList.remove('hidden'); document.getElementById('specs-fashion').classList.remove('hidden'); } else if (bookCats.includes(val)) { document.getElementById('specs-books').classList.remove('hidden'); } else { document.getElementById('specs-fashion').classList.remove('hidden'); } }
    window.handleFiles = function(input) { files = Array.from(input.files).slice(0, 5); const grid = document.getElementById('preview-area'); grid.innerHTML = ''; grid.classList.remove('hidden'); document.getElementById('upload-text').innerText = files.length + " selected"; files.forEach(file => { const reader = new FileReader(); reader.onload = e => { const img = document.createElement('img'); img.src = e.target.result; img.className = 'w-16 h-16 object-cover rounded border border-gray-200 flex-shrink-0'; grid.appendChild(img); }; reader.readAsDataURL(file); }); }
    const compress = (file) => new Promise(resolve => { const reader = new FileReader(); reader.readAsDataURL(file); reader.onload = e => { const img = new Image(); img.src = e.target.result; img.onload = () => { const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d'); const scale = 800 / Math.max(img.width, img.height); canvas.width = img.width * scale; canvas.height = img.height * scale; ctx.drawImage(img, 0, 0, canvas.width, canvas.height); resolve(canvas.toDataURL('image/jpeg', 0.7)); } } });

    window.saveProduct = async function() { const btn = document.getElementById('btn-publish'); if(!currentUser) return alert("You must be logged in."); const title = document.getElementById('p-title').value; const price = document.getElementById('p-price').value; const cat = document.getElementById('p-cat-upload').value; const isDigital = document.getElementById('p-is-digital').checked; const fileLink = document.getElementById('p-file-link').value; if(!title || !price || !cat) return alert("Missing Title, Price, or Category!"); if(isDigital && !fileLink) return alert("Digital products require a download link!"); btn.innerHTML = `<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> Processing...`; btn.disabled = true; lucide.createIcons(); try { let imageUrls = []; if(files.length > 0) { for(const file of files) imageUrls.push(await compress(file)); } else if (editingId) { imageUrls = products.find(p => p.id === editingId).images || []; } else { imageUrls.push("https://via.placeholder.com/600x600?text=No+Image"); } const colorSelect = document.getElementById('p-color'); const selectedColors = Array.from(colorSelect.selectedOptions).map(opt => opt.value); const data = { title: title, price: Number(price), oldPrice: document.getElementById('p-old').value ? Number(document.getElementById('p-old').value) : null, isDigital: isDigital, category: cat, description: document.getElementById('p-desc').value, images: imageUrls, sellerId: currentUser.email, storeName: currentUser.storeName, timestamp: firebase.firestore.FieldValue.serverTimestamp() }; const addIfVal = (key, id) => { const v = document.getElementById(id)?.value; if(v) data[key] = v; }; if (isDigital) { data.fileLink = fileLink; addIfVal('author', 'p-author'); addIfVal('format', 'p-format'); } else { addIfVal('brand', 'p-brand'); addIfVal('stock', 'p-stock'); addIfVal('sku', 'p-sku'); addIfVal('condition', 'p-condition'); addIfVal('warranty', 'p-warranty'); addIfVal('ram', 'p-ram'); addIfVal('storage', 'p-storage'); addIfVal('os', 'p-os'); addIfVal('cpu', 'p-cpu'); addIfVal('screen', 'p-screen'); addIfVal('battery', 'p-battery'); addIfVal('camera', 'p-camera'); if(selectedColors.length > 0) data.colors = selectedColors; addIfVal('size', 'p-size'); addIfVal('material', 'p-material'); addIfVal('care', 'p-care'); addIfVal('weight', 'p-weight'); addIfVal('power', 'p-power'); addIfVal('dimensions', 'p-dims'); addIfVal('year', 'p-year'); addIfVal('mileage', 'p-mileage'); addIfVal('transmission', 'p-transmission'); addIfVal('fuelType', 'p-fuel'); addIfVal('engine', 'p-engine'); } if(editingId) { await window.db.collection('products').doc(editingId).update(data); showToast("Updated!"); } else { await window.db.collection('products').add(data); showToast("Live on Marketplace!"); } resetMerchantForm(); loadInventory(); } catch(e) { alert("Error: " + e.message); } btn.innerHTML = `<i data-lucide="check-circle" class="w-5 h-5"></i> Publish to Marketplace`; btn.disabled = false; lucide.createIcons(); }
    
    window.editProduct = function(id) { 
        nav('merchant'); const p = products.find(x => x.id === id); if(!p) return; 
        editingId = p.id; document.getElementById('form-title').innerText = "Edit Product"; document.getElementById('btn-cancel').classList.remove('hidden'); document.getElementById('btn-publish').innerHTML = `<i data-lucide="check-circle" class="w-5 h-5"></i> Update Product`; document.getElementById('p-title').value = p.title || ''; document.getElementById('p-price').value = p.price || ''; document.getElementById('p-old').value = p.oldPrice || ''; document.getElementById('p-desc').value = p.description || ''; document.getElementById('p-is-digital').checked = p.isDigital || false; toggleDigitalMode(p.isDigital); if (p.isDigital) { document.getElementById('p-file-link').value = p.fileLink || ''; document.getElementById('p-author').value = p.author || ''; document.getElementById('p-format').value = p.format || ''; } else { document.getElementById('p-cat-upload').value = p.category || ''; toggleCategorySpecs(p.category); const setVal = (elmId, val) => { const el = document.getElementById(elmId); if(el) el.value = val || ''; }; setVal('p-brand', p.brand); setVal('p-stock', p.stock); setVal('p-sku', p.sku); setVal('p-condition', p.condition || 'New'); setVal('p-warranty', p.warranty); setVal('p-ram', p.ram); setVal('p-storage', p.storage); setVal('p-os', p.os); setVal('p-cpu', p.cpu); setVal('p-screen', p.screen); setVal('p-battery', p.battery); setVal('p-camera', p.camera); setVal('p-size', p.size); setVal('p-material', p.material); setVal('p-care', p.care); setVal('p-weight', p.weight); setVal('p-power', p.power); setVal('p-dims', p.dimensions); setVal('p-year', p.year); setVal('p-mileage', p.mileage); setVal('p-transmission', p.transmission); setVal('p-fuel', p.fuelType); setVal('p-engine', p.engine); const colorSelect = document.getElementById('p-color'); if (colorSelect && p.colors) { Array.from(colorSelect.options).forEach(opt => { opt.selected = p.colors.includes(opt.value); }); } } const grid = document.getElementById('preview-area'); grid.innerHTML = ''; if (p.images && p.images.length > 0) { grid.classList.remove('hidden'); p.images.forEach(src => { const img = document.createElement('img'); img.src = src; img.className = 'w-16 h-16 object-cover rounded border border-gray-200 flex-shrink-0'; grid.appendChild(img); }); document.getElementById('upload-text').innerText = p.images.length + " previous image(s) loaded"; } lucide.createIcons(); window.scrollTo({ top: 0, behavior: 'smooth' }); 
    }
    
    window.resetMerchantForm = function() { editingId = null; document.querySelectorAll('.input').forEach(el => el.value = ''); document.querySelectorAll('select.input').forEach(el => el.selectedIndex = 0); document.getElementById('p-is-digital').checked = false; toggleDigitalMode(false); files = []; document.getElementById('preview-area').innerHTML = ''; document.getElementById('preview-area').classList.add('hidden'); document.getElementById('upload-text').innerText = "Drag & Drop or Tap to Upload Images"; document.getElementById('form-title').innerText = "List a New Product"; document.getElementById('btn-cancel').classList.add('hidden'); document.getElementById('btn-publish').innerHTML = `<i data-lucide="check-circle" class="w-5 h-5"></i> Publish to Marketplace`; }
    
    function loadInventory() { 
        if(!currentUser) return; 
        const myProducts = currentUser.role === 'admin' ? products : products.filter(p => p.sellerId === currentUser.email); 
        document.getElementById('inventory-list').innerHTML = myProducts.map(p => `
            <div class="flex items-center gap-3 p-3 bg-white border-b border-gray-100 transition hover:bg-slate-50">
                <img src="${p.images?.[0] || ''}" class="w-12 h-12 rounded object-cover shadow-sm">
                <div class="flex-1 min-w-0">
                    <div class="text-sm font-bold truncate text-slate-800">${p.title} ${p.isDigital ? '💾' : ''}</div>
                    <div class="text-xs text-blue-600 font-bold">₦${Number(p.price).toLocaleString()} <span class="text-gray-400 font-normal ml-2">${p.stock ? p.stock + ' in stock' : ''}</span></div>
                </div>
                <div class="flex gap-2">
                    <button type="button" onclick="editProduct('${p.id}')" class="text-blue-600 bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-colors shadow-sm text-xs font-bold flex items-center gap-1" title="Edit"><i data-lucide="edit-2" class="w-3 h-3"></i> <span class="hidden sm:inline">Edit</span></button>
                    <button type="button" onclick="deleteProduct('${p.id}')" class="text-red-600 bg-red-50 px-3 py-2 rounded-lg hover:bg-red-600 hover:text-white transition-colors shadow-sm text-xs font-bold flex items-center gap-1" title="Delete"><i data-lucide="trash-2" class="w-3 h-3"></i> <span class="hidden sm:inline">Delete</span></button>
                </div>
            </div>`).join('') || '<div class="text-center text-gray-400 py-10">Store empty.</div>'; 
        lucide.createIcons(); 
    }
    
    window.deleteProduct = function(id) { 
        if(confirm("Are you sure you want to delete this product?")) {
            window.db.collection('products').doc(id).delete().then(() => { showToast("Product deleted!"); if(!document.getElementById('view-details').classList.contains('hidden')) { goBack(); } });
        } 
    }

    // CORE RENDERING: PRODUCT DETAILS
    window.renderProductDetails = function(id) {
        const p = products.find(x => x.id === id); if(!p) { showToast("Product not found"); return; } 
        window.currentReviewRating = 5; if(p.category) localStorage.setItem('bold_last_category', p.category);
        
        let merchantControls = '';
        if (currentUser && (currentUser.email === p.sellerId || currentUser.role === 'admin')) {
            merchantControls = `
            <div class="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-6 flex justify-between items-center shadow-sm">
                <div class="text-xs text-blue-800 font-bold flex items-center gap-1"><i data-lucide="shield" class="w-4 h-4"></i> Merchant Controls</div>
                <div class="flex gap-2"><button onclick="editProduct('${p.id}')" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition flex items-center gap-1 shadow-sm"><i data-lucide="edit-2" class="w-3 h-3"></i> Edit</button><button onclick="deleteProduct('${p.id}')" class="bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-200 transition flex items-center gap-1 shadow-sm"><i data-lucide="trash-2" class="w-3 h-3"></i> Delete</button></div>
            </div>`;
        }

        let quickBadges = ''; if(p.isDigital) quickBadges += `<span class="bg-purple-100 text-purple-800 px-2 py-1 rounded text-[10px] font-bold border border-purple-200 uppercase tracking-wider"><i data-lucide="download" class="w-3 h-3 inline mr-1"></i> Digital Download</span>`; if(p.condition) quickBadges += `<span class="bg-gray-100 text-gray-700 px-2 py-1 rounded text-[10px] font-bold border border-gray-200 uppercase tracking-wider">${p.condition}</span>`; if(p.brand) quickBadges += `<span class="bg-blue-50 text-blue-700 px-2 py-1 rounded text-[10px] font-bold border border-blue-200 uppercase tracking-wider">Brand: ${p.brand}</span>`; if(p.warranty) quickBadges += `<span class="bg-green-50 text-green-700 px-2 py-1 rounded text-[10px] font-bold border border-green-200 uppercase tracking-wider"><i data-lucide="shield-check" class="w-3 h-3 inline mr-1"></i> ${p.warranty}</span>`;
        const reviewCount = p.reviews ? p.reviews.length : 0; const avgRating = reviewCount > 0 ? (p.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1) : 0;
        let detailStars = ''; for(let i=1; i<=5; i++) { detailStars += `<i data-lucide="star" class="w-4 h-4 ${i <= Math.round(avgRating) && reviewCount > 0 ? 'text-orange-500 fill-current' : 'text-gray-300'}"></i>`; }
        let topRatingHtml = `<div class="flex items-center gap-1 mb-3 text-sm font-bold text-slate-800" onclick="document.getElementById('review-section').scrollIntoView({behavior:'smooth'})" style="cursor:pointer;"><div class="flex gap-0.5">${detailStars}</div><span class="ml-1">${reviewCount > 0 ? avgRating : '<span class="text-xs text-gray-500 font-normal">No ratings yet</span>'}</span><span class="text-blue-600 font-normal text-xs ml-1 hover:underline">(${reviewCount} reviews)</span></div>`;
        const specKeys = [ { key: 'sku', label: 'SKU' }, { key: 'cpu', label: 'Processor' }, { key: 'ram', label: 'RAM' }, { key: 'storage', label: 'Storage / ROM' }, { key: 'os', label: 'Operating System' }, { key: 'screen', label: 'Screen Size' }, { key: 'battery', label: 'Battery' }, { key: 'camera', label: 'Camera' }, { key: 'material', label: 'Material' }, { key: 'care', label: 'Care Instructions' }, { key: 'weight', label: 'Item Weight' }, { key: 'power', label: 'Power / Wattage' }, { key: 'dimensions', label: 'Dimensions' }, { key: 'year', label: 'Year' }, { key: 'mileage', label: 'Mileage' }, { key: 'transmission', label: 'Transmission' }, { key: 'fuelType', label: 'Fuel Type' }, { key: 'engine', label: 'Engine' }, { key: 'author', label: 'Author/Artist' }, { key: 'format', label: 'Format' } ];
        let specsTableHtml = ''; specKeys.forEach(s => { if(p[s.key]) { specsTableHtml += `<div class="grid grid-cols-3 border-b border-gray-100 py-2 text-sm"><div class="text-gray-500">${s.label}</div><div class="col-span-2 font-medium text-slate-800">${p[s.key]}</div></div>`; } }); let specSection = specsTableHtml ? `<div class="mt-8 mb-6"><h3 class="font-bold text-lg text-slate-900 mb-4 border-b pb-2">Product Specifications</h3>${specsTableHtml}</div>` : '';
        let selectionHtml = ''; if (p.size) selectionHtml += `<div class="mb-4"><span class="text-xs font-bold text-gray-400 uppercase block mb-2">Size</span><div class="font-bold text-sm bg-gray-50 border border-gray-200 p-2 rounded">${p.size}</div></div>`; if (p.colors && p.colors.length > 0) { selectionHtml += `<div class="mb-4"><span class="text-xs font-bold text-gray-400 uppercase block mb-2">Color Family</span><div class="flex gap-2 flex-wrap">` + p.colors.map(c => `<span class="text-xs font-semibold px-4 py-2 bg-gray-50 border border-gray-200 rounded shadow-sm">${c}</span>`).join('') + `</div></div>`; }
        let dotsHtml = ''; if(p.images && p.images.length > 1) { dotsHtml = `<div class="absolute bottom-4 left-0 right-0 flex justify-center gap-2">` + p.images.map((_, i) => `<div class="w-2 h-2 rounded-full ${i===0?'bg-orange-500':'bg-gray-300'}"></div>`).join('') + `</div>`; }
        let discountBadge = ''; if (p.oldPrice && p.oldPrice > p.price) { const perc = Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100); discountBadge = `<span class="bg-red-100 text-red-600 font-black text-xs px-2 py-1 rounded ml-2">-${perc}%</span>`; }
        let reviewsListHtml = ''; if (reviewCount > 0) { const sortedReviews = [...p.reviews].sort((a,b) => new Date(b.date) - new Date(a.date)); reviewsListHtml = sortedReviews.map(r => `<div class="border-b border-gray-100 pb-4 mb-4 last:border-0"><div class="flex items-center gap-2 mb-2"><div class="flex gap-0.5">${[1,2,3,4,5].map(i => `<i data-lucide="star" class="w-3 h-3 ${i <= r.rating ? 'text-orange-400 fill-current' : 'text-gray-300'}"></i>`).join('')}</div><span class="font-bold text-xs text-slate-800">${r.user}</span><span class="text-[10px] text-gray-400 ml-auto bg-gray-50 px-2 py-1 rounded">${new Date(r.date).toLocaleDateString()}</span></div><p class="text-sm text-gray-600 leading-relaxed">${r.comment}</p></div>`).join(''); } else { reviewsListHtml = `<p class="text-sm text-gray-400 mb-4 bg-gray-50 p-4 rounded-xl text-center">No reviews yet. Buy this item and be the first to share your thoughts!</p>`; }
        const reviewSection = `<div id="review-section" class="mb-8 pt-8 border-t border-gray-200"><h3 class="font-black text-xl text-slate-900 mb-6 flex items-center gap-2">Customer Reviews</h3>${reviewsListHtml}<div class="bg-slate-50 p-5 rounded-2xl border border-slate-200 mt-6 shadow-sm"><h4 class="font-black text-sm text-slate-800 mb-1">Rate this product</h4><p class="text-xs text-gray-500 mb-3">Share your experience with other customers.</p><div class="flex gap-1 mb-4">${[1,2,3,4,5].map(i => `<div id="star-btn-${i}" onclick="setRating(${i})" class="cursor-pointer p-1 text-${i <= 5 ? 'orange-400' : 'gray-300'} hover:scale-110 transition-all"><i data-lucide="star" class="w-8 h-8 ${i <= 5 ? 'fill-current' : ''}"></i></div>`).join('')}</div><textarea id="review-text" class="input w-full text-sm mb-3" rows="3" placeholder="What did you like or dislike?"></textarea><button id="btn-submit-review" onclick="submitReview('${p.id}')" class="w-full bg-[#061224] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors shadow-md">Submit Review</button></div></div>`;
        document.getElementById('details-content').innerHTML = `
            <div class="relative h-[400px] bg-white flex items-center justify-center border-b border-gray-100 overflow-hidden"><img src="${p.images?.[0] || ''}" class="max-w-full max-h-full object-contain p-4 transition-transform duration-300">${dotsHtml}<button type="button" onclick="goBack()" class="absolute top-4 left-4 bg-white/90 p-3 rounded-full shadow-md hover:bg-gray-100"><i data-lucide="arrow-left" class="w-5 h-5"></i></button><button type="button" class="absolute top-4 right-4 bg-white/90 p-3 rounded-full shadow-md text-gray-400 hover:text-red-500"><i data-lucide="heart" class="w-5 h-5"></i></button></div>
            <div class="p-5 bg-white relative z-10 min-h-[50vh] pb-32">
                ${merchantControls}
                <div class="flex flex-wrap gap-2 mb-3">${quickBadges}</div><h1 class="text-xl font-bold text-slate-900 leading-snug mb-1">${p.title}</h1>${topRatingHtml}<div class="mb-6 p-4 bg-slate-50 border border-slate-100 rounded-xl"><div class="flex items-center mb-1"><div class="text-3xl font-black text-slate-900">₦${Number(p.price).toLocaleString()}</div>${discountBadge}</div>${p.oldPrice ? `<div class="text-sm text-gray-500 line-through">List Price: ₦${Number(p.oldPrice).toLocaleString()}</div>` : ''}${p.stock ? `<div class="text-xs font-bold text-green-600 mt-2">In Stock (${p.stock} units available)</div>` : `<div class="text-xs text-gray-500 mt-2">Stock availability varies</div>`}</div>${selectionHtml}${specSection}<div class="mb-8"><h3 class="font-bold text-lg text-slate-900 mb-3 border-b pb-2">About this item</h3><p class="text-gray-700 text-sm leading-relaxed whitespace-pre-line">${p.description || "No description provided."}</p></div>${reviewSection}</div>
            <div class="fixed bottom-0 left-0 w-full p-4 bg-white border-t border-gray-200 z-[70] shadow-[0_-10px_20px_rgba(0,0,0,0.05)] flex gap-3"><button type="button" class="w-14 h-14 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-orange-500 hover:text-orange-500 transition-colors"><i data-lucide="message-circle" class="w-6 h-6"></i></button><button type="button" onclick="addToCart('${p.id}', this)" class="flex-1 bg-orange-500 text-white rounded-xl font-black text-lg shadow-lg hover:bg-orange-600 transition-all duration-300 flex justify-center items-center gap-2"><i data-lucide="shopping-cart" class="w-5 h-5"></i> <span class="btn-text">Add to Cart</span></button></div>`;
    }
    
    window.setRating = function(val) { window.currentReviewRating = val; for(let i=1; i<=5; i++) { const starBtn = document.getElementById('star-btn-'+i); const icon = starBtn.querySelector('svg'); if(i <= val) { starBtn.classList.add('text-orange-400'); starBtn.classList.remove('text-gray-300'); icon.classList.add('fill-current'); } else { starBtn.classList.remove('text-orange-400'); starBtn.classList.add('text-gray-300'); icon.classList.remove('fill-current'); } } }
    window.submitReview = async function(productId) { const text = document.getElementById('review-text').value; if(!text) return alert("Please write a comment before submitting."); const reviewerName = (currentUser && currentUser.storeName) ? currentUser.storeName : "Verified Buyer"; const newReview = { user: reviewerName, rating: window.currentReviewRating, comment: text, date: new Date().toISOString() }; const btn = document.getElementById('btn-submit-review'); btn.disabled = true; btn.innerText = "Submitting..."; try { await window.db.collection('products').doc(productId).update({ reviews: firebase.firestore.FieldValue.arrayUnion(newReview) }); showToast("Review submitted successfully!"); renderProductDetails(productId); } catch(err) { alert("Error submitting review: " + err.message); btn.disabled = false; btn.innerText = "Submit Review"; } }

    function loadFinance() { if(!state_orders || !currentUser) return; let total = 0, pending = 0, html = ''; state_orders.forEach(d => { if(d.payment?.status === 'Paid') total += d.total; else if(d.payment?.status !== 'Rejected') pending += d.total; const statusColor = d.payment?.status === 'Paid' ? 'text-green-600' : 'text-orange-500'; html += `<div class="flex justify-between items-center py-3 border-b border-gray-50 cursor-pointer" onclick="window.location.hash='tx/${d.docId}'"><div><div class="text-xs font-bold">#${d.docId.slice(0,6)}</div><div class="text-[10px] text-gray-400">${d.date.split('T')[0]} • ${d.customer?.name||'Guest'}</div></div><div class="text-right"><div class="text-sm font-bold">₦${d.total.toLocaleString()}</div><div class="text-[10px] font-bold ${statusColor}">${d.payment?.status}</div></div></div>`; }); document.getElementById('fin-total').innerText = '₦' + total.toLocaleString(); document.getElementById('fin-pending').innerText = '₦' + pending.toLocaleString(); document.getElementById('fin-list').innerHTML = html || '<div class="text-center py-10 text-gray-400">No sales yet.</div>'; }
    window.verifyTransaction = function(id) { if(confirm("Confirm Payment?")) window.db.collection('orders').doc(id).update({'payment.status': 'Paid', status: 'Processing'}); goBack(); }
    
    // UPDATED ADMIN LOAD TO SHOW VENDOR BANK DETAILS
    async function loadAdmin() { 
        if (!currentUser || currentUser.role !== 'admin') return; 
        let totalRev = 0; let ordersHtml = ''; 
        if(state_orders && state_orders.length > 0) { 
            state_orders.forEach(d => { 
                if(d.payment?.status === 'Paid') totalRev += d.total; 
                const statusColor = d.payment?.status === 'Paid' ? 'text-green-600' : 'text-orange-500'; 
                ordersHtml += `<div class="flex justify-between items-center py-3 px-4 border-b border-gray-50 cursor-pointer" onclick="window.location.hash='tx/${d.docId}'"><div><div class="text-xs font-bold">#${d.docId.slice(0,6)}</div><div class="text-[10px] text-gray-400">${d.date.split('T')[0]} • ${d.customer?.name||'Guest'}</div></div><div class="text-right"><div class="text-sm font-bold">₦${d.total.toLocaleString()}</div><div class="text-[10px] font-bold ${statusColor}">${d.payment?.status}</div></div></div>`; 
            }); 
        } 
        document.getElementById('admin-total-rev').innerText = '₦' + totalRev.toLocaleString(); 
        document.getElementById('admin-list').innerHTML = ordersHtml || '<div class="p-4 text-center text-xs text-gray-400">No orders yet.</div>'; 
        
        try { 
            const usersSnap = await window.db.collection('users').where('role', '==', 'vendor').get(); 
            document.getElementById('admin-total-vendors').innerText = usersSnap.size; 
            let vendorsHtml = ''; 
            usersSnap.forEach(doc => { 
                const v = doc.data(); 
                const joinedDate = v.createdAt?.toDate ? v.createdAt.toDate().toLocaleDateString() : 'Recently'; 
                
                // Construct bank details display if they exist
                let bankDisplay = '';
                if(v.bankDetails) {
                    bankDisplay = `<div class="mt-2 bg-blue-50 p-2 rounded border border-blue-100"><div class="text-[9px] text-blue-500 uppercase tracking-wider font-bold mb-0.5">Payout Account</div><div class="text-xs font-bold text-slate-800 font-mono select-all">${v.bankDetails.accountNumber} - ${v.bankDetails.bankName}</div><div class="text-[10px] text-slate-600 truncate">${v.bankDetails.accountName}</div></div>`;
                }

                vendorsHtml += `
                <div class="py-4 px-4 border-b border-gray-50">
                    <div class="flex justify-between items-start mb-1">
                        <div><div class="text-sm font-bold text-slate-800">${v.storeName}</div><div class="text-[10px] text-gray-500">${v.email}</div></div>
                        <div class="text-right"><div class="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Joined: ${joinedDate}</div></div>
                    </div>
                    ${bankDisplay}
                </div>`; 
            }); 
            document.getElementById('admin-vendor-list').innerHTML = vendorsHtml || '<div class="p-4 text-center text-xs text-gray-400">No vendors found.</div>'; 
        } catch (error) { 
            console.error("Error loading vendors:", error); 
            document.getElementById('admin-vendor-list').innerHTML = '<div class="p-4 text-center text-xs text-red-400">Error loading vendors.</div>'; 
        } 
    }
    window.removeFromCart = function(id) { const index = cart.findIndex(p => p.id === id); if (index > -1) { cart.splice(index, 1); updateCart(); renderCartUI(); } }

    window.renderCartUI = function() { 
        document.getElementById('cart-total').innerText = '₦' + cart.reduce((a,b)=>a+Number(b.price),0).toLocaleString(); 
        let itemCounts = {};
        cart.forEach(p => { if(itemCounts[p.id]) { itemCounts[p.id].qty += 1; } else { itemCounts[p.id] = { ...p, qty: 1 }; } });
        document.getElementById('cart-items').innerHTML = Object.values(itemCounts).map(p => `
            <div class="flex justify-between p-3 border-b border-gray-100 text-sm items-center bg-gray-50 rounded-lg mb-2">
                <div class="flex-1 truncate pr-2 font-bold text-slate-800"><span class="bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-[10px] mr-2">${p.qty}x</span>${p.title} ${p.isDigital ? '💾' : ''}</div>
                <div class="flex items-center gap-3"><span class="font-black text-slate-900">₦${(Number(p.price) * p.qty).toLocaleString()}</span><button onclick="removeFromCart('${p.id}')" class="text-red-500 p-2 bg-red-100 rounded-lg hover:bg-red-200 transition"><i data-lucide="trash-2" class="w-4 h-4"></i></button></div>
            </div>`).join('') || '<div class="text-center p-10 text-gray-400">Your cart is empty</div>'; 
    }
    
    let paymentMethod = 'card';

    window.calculateShipping = function() {
        const allDigital = cart.every(p => p.isDigital);
        if (allDigital) {
            currentShippingFee = 0;
        } else {
            const state = document.getElementById('ship-state').value;
            if (!state) {
                currentShippingFee = 0;
            } else if (state === 'Lagos') {
                currentShippingFee = 3000;
            } else {
                currentShippingFee = 5000;
            }
        }
        window.updateCheckoutTotal();
    }

    window.updateCheckoutTotal = function() {
        const subtotal = cart.reduce((a,b) => a + Number(b.price), 0);
        const finalTotal = subtotal + currentShippingFee;
        document.getElementById('checkout-shipping-display').innerText = currentShippingFee > 0 ? `Shipping: ₦${currentShippingFee.toLocaleString()}` : `Shipping: Free`;
        document.getElementById('checkout-total-display').innerText = '₦' + finalTotal.toLocaleString();
    }

    window.renderCheckoutUI = function() { 
        const allDigital = cart.every(p => p.isDigital); 
        if(allDigital) { 
            document.getElementById('physical-address-box').classList.add('hidden'); 
            document.getElementById('opt-pod').classList.add('hidden'); 
            selectPay('card'); 
        } else { 
            document.getElementById('physical-address-box').classList.remove('hidden'); 
            document.getElementById('opt-pod').classList.remove('hidden'); 
        } 
        calculateShipping(); // Auto-calculates shipping when checkout opens
    }
    
    window.selectPay = function(m) { paymentMethod = m; document.querySelectorAll('.pay-opt').forEach(el => el.classList.remove('selected')); const selectedOpt = document.getElementById('opt-' + m); if (selectedOpt) { selectedOpt.classList.add('selected'); } if(m === 'bank') document.getElementById('bank-details').classList.remove('hidden'); else document.getElementById('bank-details').classList.add('hidden'); }

    window.processPayment = function() { 
        const name = document.getElementById('ship-name').value; const phone = document.getElementById('ship-phone').value; const email = document.getElementById('ship-email').value; const state = document.getElementById('ship-state').value; const city = document.getElementById('ship-city').value; const addr = document.getElementById('ship-addr').value; const notes = document.getElementById('ship-notes').value; const allDigital = cart.every(p => p.isDigital); 
        
        if(!name || !phone || !email) return alert("Please fill in your Full Name, Phone, and Email."); 
        if(!allDigital && (!state || !city || !addr)) return alert("Please complete your full Delivery Details (State, City, Address)."); 
        
        const subtotal = cart.reduce((a,b)=>a+Number(b.price),0); 
        const total = subtotal + currentShippingFee; // Includes shipping
        const customerInfo = { name: name, phone: phone, email: email, address: allDigital ? 'Digital Delivery' : addr, state: allDigital ? 'N/A' : state, city: allDigital ? 'N/A' : city, notes: notes || '' }; 
        
        const btn = document.getElementById('btn-pay'); btn.innerHTML = `<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> Processing...`; btn.disabled = true; lucide.createIcons(); 

        if(paymentMethod === 'card') { 
            const paystackKey = 'pk_live_YOUR_PAYSTACK_LIVE_KEY_HERE'; 
            if (paystackKey.includes('YOUR_PAYSTACK')) {
                console.warn("Using Test Environment: Simulating payment."); showToast("Demo Mode: Simulating Payment...");
                setTimeout(() => { saveOrder({method:'Paystack Online', ref: 'TEST-REF-'+Date.now(), status:'Paid', amount:total, shipping: currentShippingFee}, customerInfo); }, 1500);
            } else {
                let handler = PaystackPop.setup({
                    key: paystackKey, email: email, amount: total * 100, currency: 'NGN', ref: 'BOLD-' + Math.floor((Math.random() * 1000000000) + 1), 
                    callback: function(response) { saveOrder({method:'Paystack Online', ref: response.reference, status:'Paid', amount:total, shipping: currentShippingFee}, customerInfo); },
                    onClose: function() { btn.innerHTML = `<i data-lucide="lock" class="w-5 h-5"></i> Confirm Order`; btn.disabled = false; lucide.createIcons(); showToast("Payment window closed."); }
                }); handler.openIframe();
            }
        } else if (paymentMethod === 'bank') { saveOrder({method:'Bank Transfer', ref:'BT-'+Date.now(), status:'Pending Verification', amount:total, shipping: currentShippingFee}, customerInfo); 
        } else { saveOrder({method:'Pay On Delivery', ref:'POD-'+Date.now(), status:'Pending Payment', amount:total, shipping: currentShippingFee}, customerInfo); } 
    }

    window.renderTransactionUI = function(id) { 
        const tx = state_orders.find(o => o.docId === id); if(!tx) return; 
        const isAdmin = currentUser && currentUser.role === 'admin'; 
        let itemCounts = {}; tx.items.forEach(i => { if(itemCounts[i.id]) { itemCounts[i.id].qty += 1; itemCounts[i.id].total += Number(i.price); } else { itemCounts[i.id] = { ...i, qty: 1, total: Number(i.price) }; } });
        let itemsHtml = ''; 
        Object.values(itemCounts).forEach(i => { 
            const downloadLink = (i.isDigital && tx.payment?.status === 'Paid') ? `<a href="${i.fileLink}" target="_blank" class="text-xs text-blue-600 underline ml-2">Download File</a>` : ''; 
            itemsHtml += `<div class="flex gap-3 py-3 border-b border-gray-50"><img src="${i.images?.[0]||''}" class="w-12 h-12 rounded object-cover border border-gray-100"><div class="flex-1"><div class="text-sm font-bold text-slate-800">${i.title}</div><div class="text-xs text-gray-500">Qty: ${i.qty} | SKU: ${i.sku || 'N/A'} ${downloadLink}</div></div><div class="font-black text-slate-900">₦${i.total.toLocaleString()}</div></div>`; 
        }); 

        let addressBlock = 'Digital Delivery (No physical shipping required)';
        if (tx.customer?.address !== 'Digital Delivery') { addressBlock = `<div class="font-medium text-slate-800">${tx.customer?.address || ''}</div><div class="text-slate-600">${tx.customer?.city ? tx.customer.city + ', ' : ''}${tx.customer?.state || ''}</div>${tx.customer?.notes ? `<div class="mt-2 p-2 bg-yellow-50 text-yellow-800 text-xs rounded border border-yellow-200"><b>Note:</b> ${tx.customer.notes}</div>` : ''}`; }

        document.getElementById('tx-content').innerHTML = `
            <div class="flex gap-2 mb-4"><button onclick="generateInvoice('${tx.docId}')" class="flex-1 bg-white border border-gray-200 text-slate-800 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition shadow-sm"><i data-lucide="file-text" class="w-4 h-4 text-blue-500"></i> Generate E-Invoice</button></div>
            <div class="bg-slate-50 p-5 rounded-2xl mb-6 border border-gray-200 shadow-inner flex justify-between items-center"><div><div class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Order Total</div><h1 class="text-3xl font-black text-slate-900">₦${tx.total.toLocaleString()}</h1><div class="flex gap-2 mt-2"><span class="text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${tx.payment?.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}">${tx.payment?.status}</span><span class="text-[10px] font-bold px-2 py-1 rounded bg-blue-100 text-blue-700 uppercase tracking-wider">${tx.payment?.method}</span></div></div><i data-lucide="receipt" class="w-12 h-12 text-gray-300"></i></div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"><div class="card p-4 border border-gray-100 shadow-sm"><h3 class="font-bold text-[10px] text-gray-400 uppercase mb-3 tracking-widest flex items-center gap-1"><i data-lucide="user" class="w-3 h-3"></i> Customer Details</h3><div class="text-sm font-bold text-slate-800 mb-1">${tx.customer?.name}</div><div class="text-xs text-slate-600 mb-1"><i data-lucide="phone" class="w-3 h-3 inline mr-1 opacity-50"></i> ${tx.customer?.phone}</div><div class="text-xs text-slate-600"><i data-lucide="mail" class="w-3 h-3 inline mr-1 opacity-50"></i> ${tx.customer?.email || 'No email provided'}</div></div><div class="card p-4 border border-gray-100 shadow-sm"><h3 class="font-bold text-[10px] text-gray-400 uppercase mb-3 tracking-widest flex items-center gap-1"><i data-lucide="map-pin" class="w-3 h-3"></i> Shipping Destination</h3><div class="text-sm leading-relaxed">${addressBlock}</div></div></div>
            <div class="card p-4 mb-6 border border-gray-100 shadow-sm"><h3 class="font-bold text-[10px] text-gray-400 uppercase mb-3 tracking-widest flex items-center gap-1"><i data-lucide="box" class="w-3 h-3"></i> Order Items</h3>${itemsHtml}</div>
            ${(isAdmin && tx.payment?.status !== 'Paid') ? `<div class="grid grid-cols-2 gap-3"><button onclick="verifyTransaction('${tx.docId}')" class="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold transition-colors flex justify-center items-center gap-2 shadow-lg"><i data-lucide="check-circle" class="w-5 h-5"></i> Approve Payment</button><button onclick="rejectTransaction('${tx.docId}')" class="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-4 rounded-xl font-bold transition-colors">Reject Order</button></div>` : ''}
        `; 
    }

    window.generateInvoice = function(payload) {
        let tx = typeof payload === 'string' ? state_orders.find(o => o.docId === payload) : payload;
        if(!tx) return; let txId = tx.docId || tx.id; let itemCounts = {}; tx.items.forEach(i => { if(itemCounts[i.id]) { itemCounts[i.id].qty += 1; itemCounts[i.id].total += Number(i.price); } else { itemCounts[i.id] = { ...i, qty: 1, total: Number(i.price) }; } });
        let invoiceItems = ''; Object.values(itemCounts).forEach(i => { invoiceItems += `<tr class="border-b border-gray-100 text-sm"><td class="py-3 text-slate-800">${i.title} <div class="text-[10px] text-gray-400">SKU: ${i.sku || 'N/A'}</div></td><td class="py-3 text-center text-slate-600">${i.qty}</td><td class="py-3 text-right text-slate-600">₦${Number(i.price).toLocaleString()}</td><td class="py-3 text-right font-bold text-slate-900">₦${i.total.toLocaleString()}</td></tr>`; });
        const stampColor = tx.payment?.status === 'Paid' ? 'text-green-600 border-green-600' : 'text-orange-500 border-orange-500'; const displayDate = new Date(tx.date).toLocaleDateString();
        const subtotal = tx.total - (tx.shippingFee || 0);

        document.getElementById('invoice-paper').innerHTML = `
            <div class="flex justify-between items-start border-b border-gray-200 pb-6 mb-6"><div><div class="flex items-center gap-2 mb-2"><div class="w-8 h-8 bg-[#061224] rounded flex items-center justify-center text-white font-black text-lg shadow-md">B</div><div class="font-bold text-xl tracking-tight text-[#061224]">Bold<span class="text-orange-500">.ng</span></div></div><p class="text-xs text-gray-500 leading-relaxed">${platformSettings.address.replace(/\n/g, '<br>')}<br>${platformSettings.email}</p></div><div class="text-right"><h1 class="text-4xl font-black text-gray-200 uppercase tracking-widest mb-1">Invoice</h1><p class="text-sm font-bold text-slate-800">#${txId}</p><p class="text-xs text-gray-500">Date: ${displayDate}</p></div></div>
            <div class="grid grid-cols-2 gap-8 mb-8"><div><h3 class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Billed To:</h3><p class="text-sm font-bold text-slate-800">${tx.customer?.name}</p><p class="text-xs text-slate-600 mt-1">${tx.customer?.email || ''}<br>${tx.customer?.phone}</p><p class="text-xs text-slate-600 mt-1">${tx.customer?.address}<br>${tx.customer?.city ? tx.customer.city + ', ' : ''}${tx.customer?.state || ''}</p></div><div class="text-right"><div class="inline-block border-2 ${stampColor} px-4 py-2 rounded-lg text-lg font-black uppercase tracking-widest transform rotate-[-5deg] opacity-80 mt-4">${tx.payment?.status}</div></div></div>
            <table class="w-full mb-8"><thead><tr class="border-b-2 border-gray-800 text-left text-xs text-gray-500 uppercase tracking-wider"><th class="py-2 font-bold">Item Description</th><th class="py-2 font-bold text-center">Qty</th><th class="py-2 font-bold text-right">Unit Price</th><th class="py-2 font-bold text-right">Total</th></tr></thead><tbody>${invoiceItems}</tbody></table>
            <div class="flex justify-end border-t border-gray-200 pt-4 mb-8"><div class="w-1/2 md:w-1/3"><div class="flex justify-between text-sm text-gray-600 mb-2"><span>Subtotal:</span> <span>₦${subtotal.toLocaleString()}</span></div><div class="flex justify-between text-sm text-gray-600 mb-2"><span>Shipping Fee:</span> <span>₦${(tx.shippingFee || 0).toLocaleString()}</span></div><div class="flex justify-between text-lg font-black text-slate-900 border-t border-gray-200 pt-2 mt-2"><span>Total:</span> <span>₦${tx.total.toLocaleString()}</span></div></div></div>
            <div class="text-center text-xs text-gray-400 border-t border-gray-100 pt-6 mt-12"><p class="font-bold text-slate-600 mb-1">Thank you for shopping with Bold.ng!</p><p>If you have any questions concerning this invoice, please contact our support.</p></div>
        `; document.getElementById('view-invoice').classList.remove('hidden');
    }

    async function saveOrder(info, customer) { 
        if(!window.db) return; 
        try { 
            const orderId = Date.now().toString(); 
            const orderData = { id: orderId, items: cart, total: info.amount, shippingFee: info.shipping || 0, status: info.status === 'Paid' ? 'Processing' : 'Pending', payment: info, customer: customer, date: new Date().toISOString() }; 
            await window.db.collection('orders').doc(orderId).set(orderData); 
            const vendors = [...new Set(cart.map(item => item.sellerId))]; const batch = window.db.batch(); 
            vendors.forEach(vendorEmail => { 
                if(!vendorEmail) return; 
                const vendorItems = cart.filter(item => item.sellerId === vendorEmail); const vendorTotal = vendorItems.reduce((sum, item) => sum + Number(item.price), 0); 
                const vendorRef = window.db.collection('vendors').doc(vendorEmail).collection('vendorOrders').doc(orderId); 
                batch.set(vendorRef, { docId: orderId, date: orderData.date, status: orderData.status, payment: orderData.payment, customer: customer, items: vendorItems, total: vendorTotal }); 
            }); 
            await batch.commit(); 
            
            cart=[]; window.updateCart();
            
            const successMsg = info.status === 'Paid' ? "Payment Verified SECURELY! You will receive an email receipt shortly." : "Order Placed Successfully! Our team will contact you soon to confirm delivery.";
            document.getElementById('success-message').innerText = successMsg;
            const invoiceBtn = document.getElementById('btn-success-invoice'); if(invoiceBtn) { invoiceBtn.onclick = function() { generateInvoice(orderData); }; }
            
            window.location.hash = 'success';
            const btn = document.getElementById('btn-pay'); btn.innerHTML = `<i data-lucide="lock" class="w-5 h-5"></i> Confirm Order`; btn.disabled = false; 
        } catch (err) { console.error(err); alert("Error saving order"); } 
    }