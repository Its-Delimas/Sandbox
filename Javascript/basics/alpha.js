function myMove (){
    let id = null;
    const elem = document.getElementById('animation')
    let pos = 0;
        clearInterval(id);
        id = setInterval(frameElement, 5);
            function frame(){
                if (pos == 350){
                    clearInterval(id);
                } else {
                    pos++;
                    elem.style.top = pos + 'px';
                    elem.style.left = pos + 'px';
                }
            }
}