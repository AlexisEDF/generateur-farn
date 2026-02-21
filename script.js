var button_code_bar = document.getElementById('button_code_bar');
var text = document.getElementById('text');
var designation = document.getElementById('designation');
var box = document.getElementById('box');
var pdf_box = document.getElementById('pdf_box');

// Variables pour l'historique et la recherche
var liste_historique = document.getElementById('liste_historique');
var titre_historique = document.getElementById('titre_historique');
var recherche_historique = document.getElementById('recherche_historique');

// Mémoire locale
var historiqueData = JSON.parse(localStorage.getItem('farn_historique')) || [];

// --- GESTION DU MODE SOMBRE ---
var body = document.body;
var toggleBtn = document.getElementById('dark_mode_toggle');

if (localStorage.getItem('farn_dark_mode') === 'enabled') {
    body.classList.add('dark-theme');
    if(toggleBtn) toggleBtn.innerText = "☀️";
}

function toggleDarkMode() {
    body.classList.toggle('dark-theme');
    if (body.classList.contains('dark-theme')) {
        localStorage.setItem('farn_dark_mode', 'enabled');
        if(toggleBtn) toggleBtn.innerText = "☀️";
    } else {
        localStorage.setItem('farn_dark_mode', 'disabled');
        if(toggleBtn) toggleBtn.innerText = "🌙";
    }
}
// ------------------------------

// 💡 NOUVEAU : Fonction d'affichage avec filtre de recherche
function afficherHistorique(filtre = "") {
    if (historiqueData.length > 0) {
        titre_historique.style.display = "block";
        recherche_historique.style.display = "block"; // Affiche la barre de recherche
    } else {
        titre_historique.style.display = "none";
        recherche_historique.style.display = "none";
    }
    
    liste_historique.innerHTML = ""; 
    
    // On filtre les données : on cherche si le texte tapé est dans la désignation OU dans le code
    let donneesFiltrees = historiqueData.filter(function(item) {
        let texteRecherche = filtre.toLowerCase();
        return item.des.toLowerCase().includes(texteRecherche) || item.code.toLowerCase().includes(texteRecherche);
    });

    for (let i = 0; i < donneesFiltrees.length; i++) {
        let item = donneesFiltrees[i];
        let li = document.createElement("li");
        li.innerHTML = "<span class='hist-des'>" + item.des + "</span> <span class='hist-code'>" + item.code + "</span>";
        
        li.onclick = function() {
            designation.value = (item.des === "Sans désignation") ? "" : item.des;
            text.value = item.code;
            button_code_bar.click();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };

        liste_historique.appendChild(li);
    }
    
    // Message si la recherche ne trouve rien
    if (donneesFiltrees.length === 0 && historiqueData.length > 0) {
        liste_historique.innerHTML = "<li style='justify-content:center; color:#999; cursor:default;'>Aucun résultat trouvé</li>";
    }
}

// On écoute ce que l'utilisateur tape dans la barre de recherche
if (recherche_historique) {
    recherche_historique.addEventListener('input', function() {
        afficherHistorique(this.value); // Met à jour la liste en direct !
    });
}

// Affichage initial au démarrage
afficherHistorique();


button_code_bar.onclick = function(){
    if(text.value.length > 0){
        if(text.value.length < 50){
          box.innerHTML = "<h3 style='margin-bottom: 15px; font-size: 22px; text-transform: uppercase; text-align: center;'>" + designation.value + "</h3><svg id='barcode'></svg>";
          JsBarcode("#barcode", text.value);
          
          box.style.border='1px solid #999';
          box.style.display = 'flex';
          box.style.flexDirection = 'column';
          box.style.alignItems = 'center';
          box.style.padding = '20px';

          // On affiche uniquement le bouton de téléchargement PDF
          pdf_box.innerHTML = "<button onclick='genererPDF()'>Télécharger le code-barres</button>";
          pdf_box.style.marginTop="10px";
          pdf_box.style.display="flex";
          
        }else {
            box.style.border ="0";
            box.innerHTML="<p class='error'> Le texte est trop long !</p>";
            pdf_box.style.display ="none";
        }
    }else {
       box.style.border ="0";
       box.innerHTML="<p class='error'>Veuillez mettre un code-barre !</p>";
       pdf_box.style.display ="none";
    }
}

text.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    button_code_bar.click();
  }
});

function genererPDF(){
  box.style.border = "3px solid black"; 

  var nomFichier = designation.value ? `${designation.value} - ${text.value}.pdf` : `${text.value}.pdf`;
  var largeurPixels = box.offsetWidth;
  var hauteurPixels = box.offsetHeight;

  var opt = {
    margin:       0,
    filename:     nomFichier,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, scrollY: 0 },
    jsPDF:        { 
        unit: 'in', 
        format: [largeurPixels / 96, hauteurPixels / 96], 
        orientation: 'l' 
    }
  };
  
  var memoireDesignation = designation.value || "Sans désignation";
  var memoireCode = text.value;

  html2pdf().set(opt).from(box).save().then(function() {
      
      historiqueData.unshift({ des: memoireDesignation, code: memoireCode });
      
      // 💡 NOUVEAU : On garde maintenant les 50 dernières étiquettes en mémoire !
      if (historiqueData.length > 50) {
          historiqueData.pop(); 
      }

      localStorage.setItem('farn_historique', JSON.stringify(historiqueData));
      
      // On vide la barre de recherche après avoir généré un nouveau code
      if(recherche_historique) recherche_historique.value = "";
      afficherHistorique();
      
      box.style.border = "1px solid #999"; 
      designation.value = "";
      text.value = "";
      pdf_box.style.display = "none";
      designation.focus();
  });
}

// --- ACTIVATION DU MODE HORS-LIGNE (SERVICE WORKER) ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('sw.js').then(function(registration) {
      console.log('Mode hors-ligne activé !');
    }).catch(function(err) {
      console.log('Erreur Service Worker : ', err);
    });
  });
}








