//Creation de l'instance
var DRAG; 

function lancer(){
	//entre " mettre l'id du canvas cible et ensuite le nom de la variable dans le json
	DRAG = new DragElement("zone",elemJson);	
}

window.addEventListener("load",lancer, false);


//fonction d'initialisation 

function DragElement(canvas,oj){

	this.AxeX=null;
	this.AxeY=null;
	this.rar=true;
	
	this.obj_json=oj;
	this.canvas=document.getElementById(canvas);

	this.tab_image=[];
	this.tabs_pos=[];  //tableau des position
	this.index=0;
	this.nbimage=0;
	this.ftc='';

	this.init();
	console.log(this);
}


//changement de curseur 
DragElement.prototype.style_curseur=function(s){		
	
	this.AxeX = s.pageX - (s.currentTarget.offsetLeft);
	this.AxeY = s.pageY - (s.currentTarget.offsetTop);

	for(var i=0;i<this.tabs_pos.length;i++){
		
		if(this.obj_json[i].deplacable==false){
			continue;	
		}
		
		if(this.colision(i) ){
			this.canvas.style.cursor='move';
			break;
		}
		
		else if(this.colision(i) ){
			this.canvas.style.cursor='pointer';

			break;
		}
		
		else{
			this.canvas.style.cursor='default';
		}
	}
};



//Reception du clic sur un élément (evenement mousdown)
		//utilisation de l'attribut prototype pour définir l'héritage des éléments
DragElement.prototype.init_mousedown=function(s){	

	if(this.rar){
		
		//calcul de la distance entre le  bord et le noeud grace à l'élément offset
		this.AxeX = s.pageX - (this.canvas.offsetLeft);
		this.AxeY = s.pageY - (this.canvas.offsetTop);
		
		for(var i=this.tabs_pos.length-1;i>=0;i--){
			
			var val=this.tabs_pos[i];
			
			//detection si l'objet peut être déplacer en observant la valeur ''deplacable" dans le json
			if(this.obj_json[val].deplacable==false){
				
				continue;	
			}		
			//gestion des colision 
			if(this.colision(val)){
				
				this.init_drag(i);
				s.preventDefault();
				break;
				
			}
		}
	}
};

// initialisation du deplacement
DragElement.prototype.init_drag=function(i){	
	//definition d'une variable change qui prend les nouvelles valeurs de coordonnés		
	var change =parseInt(this.tabs_pos.splice(i,1));
	//remplacement des variables dans le tableau de position
	this.tabs_pos.push(change);
	
	this.index=this.tabs_pos[this.tabs_pos.length-1];
	
	this.AxeX_b=this.AxeX-this.obj_json[this.index].gauche;
	this.AxeY_b=this.AxeY-this.obj_json[this.index].haut;
	
	var that=this;
	
	this.ftc=function(s){that.posi.call(that,s);};
	
	//ecouteur d'événement mouvement de la souris
	document.documentElement.addEventListener("mousemove", that.ftc, false);
	
	
	this.rar=false;
};

// gestion des deplacements
DragElement.prototype.posi=function(s){		

	var setX =s.pageX;
	var setY =s.pageY;
		//l'élément offset renvois au nombre de pixel dont l'élément est décallé par rapport au bord du canvas
	this.obj_json[this.index].haut = s.pageY - (this.canvas.offsetTop+this.AxeY_b);
	this.obj_json[this.index].gauche = s.pageX - (this.canvas.offsetLeft+this.AxeX_b);
	
	this.canvas_dessin(this);
	
};

//fin du deplacement
DragElement.prototype.fin_drag=function(){			
	
	if(this.rar==false){
		
		document.documentElement.removeEventListener("mousemove", this.ftc, false);
		
		this.rar=true;
	}
};

//reception de la position des elements
DragElement.prototype.colision=function(val){		
	//on test ici si l'element est bien dans le cadre
	if(this.AxeY >= this.obj_json[val].haut + this.obj_json[val].hauteur 
		    || this.AxeY <= this.obj_json[val].haut						
			|| this.AxeX>=this.obj_json[val].gauche + this.obj_json[val].largeur	
			|| this.AxeX<=this.obj_json[val].gauche){					
		 //si oui on ne renvois pas les valeur
		return false;	
	}
	else{
		//si tout vas bien on return les valeurs
		return true;
	}
};

//lecture du json et configuration des variables et array
DragElement.prototype.init=function(){		

	for(var i=0;i<this.obj_json.length;i++){
		//pour une image 
		if(this.obj_json[i].type=="image"){
			
			this.tab_image.push(new Image());
			this.tab_image[i].src=this.obj_json[i].image;
			this.nbimage++;
		}
		//pour du texte
		else if(this.obj_json[i].type=="texte"){
			
			var ctx = this.canvas.getContext("2d");
			this.obj_json[i].largeur= ctx.measureText(this.obj_json[i].texte).width;
			this.tab_image.push("vide");
		}
		//test si l'élément est deplacable ou si c'est du texe
		if(this.obj_json[i].deplacable || this.obj_json[i].type=="texte"){		
			this.tabs_pos.push(i);
		}
		else {
			this.tabs_pos.unshift(i);
		}
	}
	this.precharge();
};

// dessin des éléments
DragElement.prototype.canvas_dessin=function(){		
	var canvas=this.canvas;
	var ctx = canvas.getContext("2d");

	ctx.clearRect(0,0,canvas.width,canvas.height);
	
	for(var i=0;i<=this.tabs_pos.length-1;i++){
		
		var element=this.obj_json[this.tabs_pos[i]];
		
		ctx.fillStyle=element.couleur;  

		switch (element.type) {
	
		case "image":
			this.image(ctx,element,i);
			break;

		case "texte":
			this.texte(ctx,element);
			break;

		}
	}
};

//placement des elements via le json
DragElement.prototype.image=function(ctx,element,i) {
	ctx.drawImage(this.tab_image[this.tabs_pos[i]],element.gauche,element.haut,element.largeur,element.hauteur);
};

DragElement.prototype.texte=function(ctx,element) {
	ctx.fillStyle=element.couleur;
	ctx.font = element.police;
	ctx.fillText(element.texte, element.gauche, (element.haut+element.hauteur));
};

//fonction de préchargement des images
DragElement.prototype.precharge=function(){		
	for (var i = 0; i < this.tab_image.length; i++){
		if(this.tab_image[i] !="vide"){
			if(this.tab_image[i].complete== true || this.tab_image[i].height>0){
				this.nbimage--;
			}
		}
	}
	
	if(this.nbimage==0){
		
		this.canvas.addEventListener("mousemove",this.style_curseur.bind(this), false);
		this.canvas.addEventListener("mousedown",this.init_mousedown.bind(this), false);
		this.canvas.addEventListener("mouseup",this.fin_drag.bind(this), false);
		
		this.canvas_dessin();
		return false;
		
	}
	setTimeout(this.precharge.bind(this),100);
};




//Gesttion des tailles

//taille canvas
function SizeE(){
	var Dzone = document.getElementById("zone");
	var LaE   = document.getElementById("largeurE").value;
	var HaE   = document.getElementById("hauteurE").value;

	Dzone.width= LaE;
	Dzone.height= HaE;
	lancer();
	//console.log(LaE);
	//console.log(HaE);
}

//taille police 
function SizeP( ){
    var Tp= document.getElementById('tailleP').value;
    DRAG.obj_json[0].police = Tp+"px Arial";
    DRAG.obj_json[1].police = Tp+"px Arial";
    DRAG.obj_json[2].police = Tp+"px Arial";
    DRAG.obj_json[3].police = Tp+"px Arial";

    DRAG.canvas_dessin();

}
function SizePo() {
	var Tn= document.getElementById('tailleN').value;
	var Ta= document.getElementById('tailleA').value;
	var Tpr= document.getElementById('taillePr').value;
	var Tr= document.getElementById('tailleR').value;

	DRAG.obj_json[0].police = Tn+"px Arial";
    DRAG.obj_json[1].police = Ta+"px Arial";
    DRAG.obj_json[2].police = Tpr+"px Arial";
	DRAG.obj_json[3].police = Tr+"px Arial";
	
	
	DRAG.canvas_dessin();
}
function SizeEa(){
	var TE= document.getElementById('SizeEa').value;
	if (TE == 1){
	DRAG.obj_json[4].hauteur = "93";
	DRAG.obj_json[4].largeur = "150";
	DRAG.obj_json[4].taille=1;

}else if (TE == 2){
	DRAG.obj_json[4].hauteur = "50";
	DRAG.obj_json[4].largeur = "75";
	DRAG.obj_json[4].taille=2;
}else if (TE == 3){
	DRAG.obj_json[4].hauteur = "25";
	DRAG.obj_json[4].largeur = "45";
	DRAG.obj_json[4].taille=3;
}
    DRAG.canvas_dessin();

}


function envoiDo() {
	var endo = document.getElementById("envoi");
	var labelName ;
	var clientName;
    setTimeout( function() { 
		clientName = prompt("Entrer le nom de l'entreprise", "");
        labelName = prompt("Entrer le nom de l'étiquette", "");
        if (clientName != null||labelName != null) {
        axios.post('http://localhost:8080/insertLabel', { client: clientName, tag: labelName, label: DRAG.obj_json } )
                  .then( (response) => {
                            console.log(response);
          });
          }
    } ,200);
}
/* modal custom*/
var modal = document.getElementById("myModal");
var sclose = document.getElementsByClassName("close")[0];
var send = document.getElementById("envoyer");

function display() {
	modal.style.display = "block";
}

sclose.onclick = function() {
	modal.style.display = "none";
};

window.onclick = function(event) {
	if (event.target == modal) {
		modal.style.display = "none";
	}
};


//recup de la résolution
window.onload = function getResolution() {
	var largScreen = 600;
	var hautScreen = 250;
	if (window.innerWidth < largScreen || window.innerHeight < hautScreen ){
		alert("Votre résolution d'écran est: " + window.innerWidth + "x" + window.innerHeight + "et est donc trop petite pour l'utilisation de cette aplication");
  	}console.log(window.innerWidth);
};

;