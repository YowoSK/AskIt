const questionText = document.querySelectorAll("p.input");
const hide = document.querySelectorAll("a.hide");
for(var i=0;i<questionText.length;i++){
    questionText[i].onclick=function(e){
        console.log("Texted clicked to hide");
        const tgt = e.target;
        if(tgt.parentElement.style.display==="none"){
            tgt.parentElement.style.display = "block";
        }
        else{
        tgt.parentElement.style.display="none";
        }
    }
}
module.export = hideElements;