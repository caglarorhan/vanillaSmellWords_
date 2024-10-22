import dictionary from './dictionary.js';

const vSW = {
    name: 'vanillaSmellWords',
    version:'2022.0.9',
    author:'https://github.com/caglarorhan',
    dictionary:()=>{return dictionary},
    askedWordIndex:null,
    extraCharsCodes:[305,231,360,350,351,246,252,287],
    meaningsOfWords:Object.create(null),
    init: () => {
        vSW.gameBoard.create()
            .then(() => {
                vSW.keyBoard.create().then(() => {
                    vSW.keyBoard.setKeys();
                })
                vSW.gameBoard.setBoard();
                vSW.askedWordIndex = vSW.getRandomWordIndexFromDictionary();
                vSW.gameBoard.showInfo("SCORE",JSON.parse(window.localStorage.getItem(vSW.name)).score);
            })

    },
    getRandomWordIndexFromDictionary: ()=>{
        return Math.floor(Math.random()*(dictionary.length-1));
    },
    gameBoard: {
        rowCount: 6,
        colCount: 5,
        guessedWords: [],
        create: () => {
            let gameBoard = document.createElement('div');
            gameBoard.id = vSW.name;
            gameBoard.style.cssText = vSW.cssStoryBook["game-board"];
            return new Promise((resolve, reject) => {
                document.body.appendChild(gameBoard);
                resolve(gameBoard);
            });
        },
        reset:()=>{
            vSW.gameBoard.guessedWords=[];
            vSW.askedWordIndex = vSW.getRandomWordIndexFromDictionary();
            let theInputs = document.querySelectorAll(`#${vSW.name} input`);
            theInputs.forEach(i=>{
                i.value='';
                i.style.cssText=vSW.cssStoryBook.letterInput;
                delete i.dataset.correctLetterCorrectPlace;
            });
            document.querySelectorAll( `#${vSW.name}-keyboard button`).forEach(btn=>{btn.disabled=false;})
            vSW.hideTheMeaning();
        },
        setBoard: () => {
            for (let row = 0; row < vSW.gameBoard.rowCount; row++) {
                let rowDiv = document.createElement('div');
                rowDiv.style.cssText = vSW.cssStoryBook["game-board-row"];
                rowDiv.dataset.divType="rows";
                rowDiv.dataset.rowNo=''+row;
                for (let col = 0; col < vSW.gameBoard.colCount; col++) {
                    let colDiv = document.createElement('div');
                    colDiv.style.cssText = vSW.cssStoryBook["game-board-col"];
                    colDiv.dataset.divType="cols";
                    colDiv.dataset.colNo=''+col;
                    rowDiv.appendChild(colDiv);
                    let letterInput = document.createElement('input');
                    letterInput.style.cssText = vSW.cssStoryBook["letterInput"];
                    letterInput.setAttribute('maxlength', "1");
                    letterInput.setAttribute('readonly', "readonly");
                    colDiv.appendChild(letterInput);
                }
                rowDiv.addEventListener('mouseover',(event)=>{
                    let srcItem = event.target;
                    if(srcItem.dataset.divType==="cols"){
                        srcItem=srcItem.parentNode;
                    }
                    if(vSW.gameBoard.guessedWords[parseInt(srcItem.dataset.rowNo)]){
                        let focusedGuessedWord = vSW.gameBoard.guessedWords[parseInt(srcItem.dataset.rowNo)].join('');
                        if(focusedGuessedWord.length>0){
                            vSW.showTheMeaning(focusedGuessedWord);
                        }
                    }
                })
                rowDiv.addEventListener('mouseout',()=>{
                    vSW.hideTheMeaning();
                })
                document.getElementById(vSW.name).appendChild(rowDiv);
            }
            // data created at localStorage
            let data=Object.create(null);
            let score = Object.create(null);
            for(let x = 1; x<=vSW.gameBoard.colCount;x++){
                score[x]=0;
            }
            score["fail"]=0;
            data.score=score;
            if(!window.localStorage.getItem(vSW.name)){
                window.localStorage.setItem(vSW.name,JSON.stringify(data))
            }
        },
        addChar: (char) => {
            if (!vSW.gameBoard.guessedWords.length) {
                let newWord = [];
                newWord.push(char);
                vSW.gameBoard.guessedWords.push(newWord);
            } else {
                let lastGuessedWordIndex = vSW.gameBoard.guessedWords.length - 1
                if (vSW.gameBoard.guessedWords[lastGuessedWordIndex].length < vSW.gameBoard.colCount) {
                    vSW.gameBoard.guessedWords[lastGuessedWordIndex].push(char);
                }
            }
            vSW.gameBoard.placeWordsToBoard();
        },
        placeWordsToBoard: () => {
            let theInputs = document.querySelectorAll(`#${vSW.name} input`);
            theInputs.forEach(i=>{
                i.value='';
            });
            let askedWord = vSW.dictionary()[vSW.askedWordIndex];
            console.log(askedWord);
            for (let x = 0; x < vSW.gameBoard.guessedWords.length; x++) {
                for(let y=0; y<vSW.gameBoard.guessedWords[x].length;y++){
                    let targetLetterFromGuessedWord = vSW.gameBoard.guessedWords[x][y];
                    let inputIndex = (x*vSW.gameBoard.colCount)+y;
                    theInputs[inputIndex].value=targetLetterFromGuessedWord.toLocaleUpperCase('tr');
                }
            }
        },
        checkEnteredWord:()=>{
            let theInputs = document.querySelectorAll(`#${vSW.name} input`);
            if(vSW.gameBoard.guessedWords.length===0) return;
            let guessedWordsLength = vSW.gameBoard.guessedWords.length;
            let lastEnteredWord = vSW.gameBoard.guessedWords[guessedWordsLength-1];
            let askedWord = vSW.dictionary()[vSW.askedWordIndex];
            let askedWordLettersArray = askedWord.split('');
            // console.log(askedWord);
            // console.log(JSON.stringify(vSW.gameBoard.guessedWords))

            if(lastEnteredWord.length!==vSW.gameBoard.colCount){
                vSW.warningMessages(`You need to enter ${vSW.gameBoard.colCount} chars to make a guess!`);
                return;
            }
            if(lastEnteredWord.length===vSW.gameBoard.colCount){
                // letterCountMap
                let letterCountMap =Object.create(null);
                askedWordLettersArray.forEach(letter=>{
                    letterCountMap[letter]=++letterCountMap[letter] || 1;
                })
                // console.log(JSON.stringify(letterCountMap))

                //if word guessed correctly
                if(lastEnteredWord.join('')===askedWord){
                    vSW.gameBoard.endGame({didWin:true, message:"Bravvo... You found the asked word!"});
                }else{
                    if(vSW.dictionary().includes(lastEnteredWord.join(''))){
                        vSW.getTheMeaning(lastEnteredWord.join(''));
                        let newWord = [];
                        vSW.gameBoard.guessedWords.push(newWord);
                    }else{
                        vSW.warningMessages(`This word is not on the dictionary!`);
                        return;
                    }

                }

                //coloring hints created
                // first correct position correct letter
                for(let x=0; x<vSW.gameBoard.colCount;x++) {
                    let inputIndex = ((guessedWordsLength - 1) * vSW.gameBoard.colCount) + (x);
                    if (lastEnteredWord[x] === askedWordLettersArray[x]) {
                        // letter and its position are correct.
                        theInputs[inputIndex].style.cssText += vSW.cssStoryBook.correctLetterCorrectPlace;
                        theInputs[inputIndex].dataset.correctLetterCorrectPlace="1_1";
                        letterCountMap[lastEnteredWord[x]]--;
                    }
                }
                // second other positions for correct-wrong letters
                for(let x=0; x<vSW.gameBoard.colCount;x++){
                    let inputIndex = ((guessedWordsLength-1)*vSW.gameBoard.colCount)+(x);
                     if(askedWordLettersArray.includes(lastEnteredWord[x])){
                        // letter is correct but its position is wrong
                        if(letterCountMap[lastEnteredWord[x]]>0 && theInputs[inputIndex].dataset.correctLetterCorrectPlace!=="1_1"){
                            theInputs[inputIndex].style.cssText+=vSW.cssStoryBook.correctLetterWrongPlace;
                            theInputs[inputIndex].dataset.correctLetterCorrectPlace="1_0";
                            letterCountMap[lastEnteredWord[x]]--;
                        }else if(theInputs[inputIndex].dataset.correctLetterCorrectPlace!=="1_1"){
                            theInputs[inputIndex].dataset.correctLetterCorrectPlace="0_0";
                            theInputs[inputIndex].style.cssText+=vSW.cssStoryBook.wrongLetter;
                        }
                    }else{
                        // letter is wrong
                        theInputs[inputIndex].style.cssText+=vSW.cssStoryBook.wrongLetter;
                         theInputs[inputIndex].dataset.correctLetterCorrectPlace="0_0";
                    }
                }
            }
            if (vSW.gameBoard.guessedWords.length-1 === vSW.gameBoard.rowCount) {
                let askedWord = vSW.dictionary()[vSW.askedWordIndex];
                vSW.gameBoard.endGame({didWin:false, message:`
                Board is full. Game Ended! You Lost!
                Asked word was ${askedWord}
                `});

            }
        },
        endGame:(data={didWin:false, message:"No message received."})=>{
            let playedGameLogs=JSON.parse(window.localStorage.getItem(vSW.name));
            if(data.didWin){
                playedGameLogs.score[(vSW.gameBoard.guessedWords.length)]+=1
                    window.localStorage.setItem(vSW.name,JSON.stringify(playedGameLogs))
                setTimeout(vSW.gameBoard.reset,2000);
            }else{
                playedGameLogs.score["fail"]+=1
                window.localStorage.setItem(vSW.name,JSON.stringify(playedGameLogs))
                setTimeout(vSW.gameBoard.reset,2000);
            }
            vSW.warningMessages(data.message);
            vSW.gameBoard.showInfo("SCORE",JSON.parse(window.localStorage.getItem(vSW.name)).score);
            document.querySelectorAll( `#${vSW.name}-keyboard button`).forEach(btn=>btn.setAttribute('disabled','disabled'));
        },
        showInfo:(header="Header",data)=>{
            let infoBox;
            if(document.getElementById(`${vSW.name}-infobox`)){
                infoBox = document.getElementById(`${vSW.name}-infobox`)
                document.getElementById(`${vSW.name}-infobox`).innerHTML='';
            }else{
                infoBox = document.createElement('div');
                infoBox.id=vSW.name+"-infobox";
                infoBox.style.cssText=vSW.cssStoryBook.infoBox;
            }

            infoBox.innerHTML=`<h5>${header}</h5>`;
            Object.entries(data).forEach(([k,v])=>{
                infoBox.innerHTML+= `<div>${k}:${v}</div>`;
            })
            infoBox.innerHTML+=`<hr>
<h5>Color Hints</h5>
<div style="text-align: left;"><span style="${vSW.cssStoryBook.correctLetterCorrectPlace}; width:20px !important; height:20px !important; display:inline-block;"> </span> correct letter correct place</div>
<div style="text-align: left;"><span style="${vSW.cssStoryBook.correctLetterWrongPlace}; width:20px !important; height:20px !important; display:inline-block;"> </span> correct letter wrong place</div>
<div style="text-align: left;"><span style="${vSW.cssStoryBook.wrongLetter}; width:20px !important; height:20px !important; display:inline-block;"> </span> wrong letter</div>
<hr>
author: <a href="${vSW.author}" target="_blank" rel="noopener noreferrer">Caglar Orhan</a>
`;

            document.body.append(infoBox);

        }
    },
        keyBoard: {
            create: () => {
                let keyBoard = document.createElement('div');
                keyBoard.id = vSW.name + '-keyboard';
                keyBoard.style.cssText = vSW.cssStoryBook["keyboard"];
                return new Promise((resolve, reject) => {
                    document.body.appendChild(keyBoard);
                    resolve(keyBoard);
                });
            },
            setKeys: () => {
                for (let charCodes = 97; charCodes <= 350; charCodes++) {
                    if(charCodes>122 && !vSW.extraCharsCodes.includes(charCodes) || [91,92,93,94,95,96].includes(charCodes)) continue;
                    const char = String.fromCharCode(charCodes);
                    const button = document.createElement('button');
                    button.innerHTML = char.toLocaleUpperCase('tr');
                    button.style.cssText = vSW.cssStoryBook["keyboard-button"];
                    button.addEventListener('click', () => {
                        vSW.gameBoard.addChar(char);
                    });
                    document.getElementById(vSW.name + '-keyboard').appendChild(button);
                }
                // DELETE BUTTON
                let deleteButton = document.createElement('button');
                deleteButton.style.cssText = vSW.cssStoryBook["keyboard-button-delete"];
                deleteButton.innerHTML = "←";
                deleteButton.id=`${vSW.name}-delete-button`;
                deleteButton.addEventListener('click',()=>{
                    let lastGuessedWord = vSW.gameBoard.guessedWords[vSW.gameBoard.guessedWords.length-1];
                    if(lastGuessedWord.length){
                        // if(lastGuessedWord.length<vSW.gameBoard.colCount){
                            vSW.gameBoard.guessedWords[vSW.gameBoard.guessedWords.length-1].length=lastGuessedWord.length-1;
                            vSW.gameBoard.placeWordsToBoard();
                        // }
                    }
                    vSW.gameBoard.placeWordsToBoard();
                });
                document.getElementById(vSW.name + '-keyboard').appendChild(deleteButton);
                // ENTER-RETURN BUTTON ⏎
                let enterButton = document.createElement('button');
                enterButton.style.cssText = vSW.cssStoryBook["keyboard-button-enter"];
                enterButton.innerHTML = "⏎";
                enterButton.id=`${vSW.name}-enter-button`;
                enterButton.addEventListener('click',vSW.gameBoard.checkEnteredWord);
                document.getElementById(vSW.name + '-keyboard').appendChild(enterButton);
            }
        },
        cssStoryBook: {
            "body":"text-align:center;",
            "game-board": `width: 40%; height: 400px; background-color: #f5f5f5; margin:10px auto 150px;`,
            "char": "width: 100px; height: 100px; background-color: #f5f5f5; border: 1px solid #000;",
            "keyboard": "width: 40%; height: 10%; background-color: #f5f5f5; margin: 10px auto; 10px",
            "keyboard-button": "width: 50px; height: 50px; cursor: pointer; corner-radius: 9px; font-weight:bold; user-select:none; ",
            "keyboard-button-enter": "width: 50px; height: 50px; cursor: pointer; corner-radius: 20px; background-color:darkgreen; color:white;user-select:none;",
            "keyboard-button-delete": "width: 50px; height: 50px; cursor: pointer; corner-radius: 9px; background-color:red; color:white;user-select:none; ",
            "game-board-row": "width: 100%; height: 20%; display: flex; flex-direction: row; border:0px",
            "game-board-col": "width: 20%; height: 100%; background-color: #f5f5f5; border: 1px solid #000; border:0px",
            "letterInput": "width:100%; height:100%; color:red; font-size:3vw; text-align:center; font-weight:bold; cursor:pointer; user-select:none; pointer-events:none",
            "correctLetterCorrectPlace":"color:white; background-color:green",
            "correctLetterWrongPlace":"color:white; background-color:orange",
            "wrongLetter":"color:white; background-color:grey",
            "infoBox":"border:1px; width:200px; height:200px; position:absolute; top:0; right:0; display:block;",
            "showTheMeaningDiv":"text-align:left; width:300px;  margin:0 auto; top:30px; border:1px solid grey; position: absolute; padding:4px; overflow-y:auto; background-color:white;"
        },
    warningMessages:(message)=>{
        alert(message);
        console.warn(message);
    },
    getTheMeaning:(word)=>{
        vSW.meaningsOfWords[word]=[];
        fetch('https://sozluk.gov.tr/gts?ara='+word)
            .then(data=>data.json())
            .then(jsonData=>{
                jsonData[0].anlamlarListe.forEach(item=>{
                    //console.log(item.anlam);
                    vSW.meaningsOfWords[word].push(item.anlam.toString());
                })
                vSW.showTheMeaning(word)
            })

    },
    showTheMeaning:(word)=>{
       let theWordMeaningDiv;
           if(document.getElementById(`${vSW.name}-meanings`)){
               theWordMeaningDiv = document.getElementById(`${vSW.name}-meanings`);
           }else{
               theWordMeaningDiv= document.createElement('div')
               theWordMeaningDiv.id = `${vSW.name}-meanings`;
           }
           theWordMeaningDiv.style.cssText=vSW.cssStoryBook.showTheMeaningDiv;
       theWordMeaningDiv.innerHTML=`<h4>${word.toLocaleUpperCase('tr')}</h4><ol>`;

       vSW.meaningsOfWords[word].forEach(anlam=>{
           theWordMeaningDiv.innerHTML+=`<li>${anlam}</li>`;
       });
        theWordMeaningDiv.innerHTML+=`<hr>Source: <a href="https://sozluk.gov.tr" target="_blank" rel="noopener noreferrer">TDK Dictionary</a>`;
        let boardDivItem = document.querySelector(`#${vSW.name}`);
        let rect = boardDivItem.getBoundingClientRect();
        theWordMeaningDiv.style.top = rect.top+"px";
        theWordMeaningDiv.style.left = (rect.left-300-10)+"px";
        theWordMeaningDiv.style.height = (rect.bottom-rect-top)+"px";
        document.body.append(theWordMeaningDiv);
    },
    hideTheMeaning:()=>{
        if(document.querySelector(`#${vSW.name}-meanings`)){
            document.querySelector(`#${vSW.name}-meanings`).remove();
        }
    }
    }



window.addEventListener('resize', vSW.hideTheMeaning);
window.addEventListener('load',()=>{
    vSW.init();
    document.body.style.cssText=vSW.cssStoryBook.body;
    let versionTag = document.createElement('div');
    versionTag.innerHTML=`version: ${vSW.version}`;
    document.body.insertAdjacentElement('afterbegin',versionTag);
});

document.addEventListener("keydown", event => {
    if(event.key==="Enter"){
        document.querySelector(`#${vSW.name}-enter-button`).click();
        return;
    }
    if(event.key==="Backspace"){
        document.querySelector(`#${vSW.name}-delete-button`).click();
        return;
    }
    if (/^[a-z]*$/gi.test(event.key) && event.key.length===1){
        vSW.gameBoard.addChar(event.key.toLocaleLowerCase('tr'));

    }


});

