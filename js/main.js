import dictionary from './dictionary.js';

const vSW = {
    name: 'vanillaSmellWords',
    version:'2022.0.8',
    author:'https://github.com/caglarorhan',
    dictionary:()=>{return dictionary},
    askedWordIndex:null,
    extraCharsCodes:[305,231,351,246,252,287],
    init: () => {
        vSW.gameBoard.create()
            .then(() => {
                vSW.keyBoard.create().then(() => {
                    vSW.keyBoard.setKeys();
                })
                vSW.gameBoard.setBoard();
                vSW.askedWordIndex = vSW.getRandomWordIndexFromDictionary();
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
        setBoard: () => {
            for (let row = 0; row < vSW.gameBoard.rowCount; row++) {
                let rowDiv = document.createElement('div');
                rowDiv.style.cssText = vSW.cssStoryBook["game-board-row"];
                for (let col = 0; col < vSW.gameBoard.colCount; col++) {
                    let colDiv = document.createElement('div');
                    colDiv.style.cssText = vSW.cssStoryBook["game-board-col"];
                    rowDiv.appendChild(colDiv);
                    let letterInput = document.createElement('input');
                    letterInput.style.cssText = vSW.cssStoryBook["letterInput"];
                    letterInput.setAttribute('maxlength', "1");
                    letterInput.setAttribute('readonly', "readonly");
                    colDiv.appendChild(letterInput);
                }
                document.getElementById(vSW.name).appendChild(rowDiv);
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
            theInputs.forEach(i=>i.value='');
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
            console.log(askedWord);
            console.log(JSON.stringify(vSW.gameBoard.guessedWords))

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
                console.log(JSON.stringify(letterCountMap))

                //if word guessed correctly
                if(lastEnteredWord.join('')===askedWord){
                    vSW.gameBoard.endGame({didWin:true, message:"Bravvo... You found the asked word!"});
                }else{
                    if(vSW.dictionary().includes(lastEnteredWord.join(''))){
                        //vSW.warningMessages(`Ahhh, you missed! Please keep trying.`);
                        // Close newly entered word spot and begin to new word
                        let newWord = [];
                        vSW.gameBoard.guessedWords.push(newWord);
                    }else{
                        vSW.warningMessages(`This word is not on the dictionary!`);
                        return;
                    }

                }

                //coloring hints created
                for(let x=0; x<vSW.gameBoard.colCount;x++){
                    let inputIndex = ((guessedWordsLength-1)*vSW.gameBoard.colCount)+(x);
                    if(lastEnteredWord[x]===askedWordLettersArray[x]){
                        // letter and its position are correct.
                        theInputs[inputIndex].style.cssText+=vSW.cssStoryBook.correctLetterCorrectPlace;
                        letterCountMap[lastEnteredWord[x]]--;
                    }else if(askedWordLettersArray.includes(lastEnteredWord[x])){
                        // letter is correct but its position is wrong
                        if(letterCountMap[lastEnteredWord[x]]>0){
                            theInputs[inputIndex].style.cssText+=vSW.cssStoryBook.correctLetterWrongPlace;
                            letterCountMap[lastEnteredWord[x]]--;
                        }else{
                            theInputs[inputIndex].style.cssText+=vSW.cssStoryBook.wrongLetter;
                        }
                    }else{
                        // letter is wrong
                        theInputs[inputIndex].style.cssText+=vSW.cssStoryBook.wrongLetter;
                    }
                }
            }
            if (vSW.gameBoard.guessedWords.length-1 === vSW.gameBoard.rowCount) {
                vSW.gameBoard.endGame({didWin:true, message:"Board is full. Game Ended! You Lost!"});

            }
        },
        endGame:(data={didWin:false, message:"No message received."})=>{

            vSW.warningMessages(data.message);
            document.querySelectorAll( `#${vSW.name}-keyboard button`).forEach(btn=>btn.setAttribute('disabled','disabled'));
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
            "game-board": "width: 40%; height: 400px; background-color: #f5f5f5; margin:10px auto;",
            "char": "width: 100px; height: 100px; background-color: #f5f5f5; border: 1px solid #000;",
            "keyboard": "width: 40%; height: 10%; background-color: #f5f5f5;margin: 100px auto; 10px",
            "keyboard-button": "width: 50px; height: 50px; cursor: pointer; corner-radius: 9px; font-weight:bold;",
            "keyboard-button-enter": "width: 50px; height: 50px; cursor: pointer; corner-radius: 9px; background-color:darkgreen; color:white;",
            "keyboard-button-delete": "width: 50px; height: 50px; cursor: pointer; corner-radius: 9px; background-color:red; color:white;",
            "game-board-row": "width: 100%; height: 20%; display: flex; flex-direction: row;",
            "game-board-col": "width: 20%; height: 100%; background-color: #f5f5f5; border: 1px solid #000;",
            "letterInput": "width:100%; height:100%; color:red; font-size:3vw; text-align:center; font-weight:bold;",
            "correctLetterCorrectPlace":"color:white; background-color:green",
            "correctLetterWrongPlace":"color:white; background-color:orange",
            "wrongLetter":"color:white; background-color:grey",
        },
    warningMessages:(message)=>{
        alert(message);
        console.warn(message);
    }
    }



window.addEventListener('load',vSW.init);
window.addEventListener('load',()=>{
    document.body.style.cssText=vSW.cssStoryBook.body;
    let versionTag = document.createElement('div');
    versionTag.innerHTML=`version: ${vSW.version}`;
    document.body.insertAdjacentElement('afterbegin',versionTag);
    let authorTag = document.createElement('div');
    authorTag.innerHTML=`author: <a href="${vSW.author}" target="_blank" rel="noopener noreferrer">Caglar Orhan</a>`;
    document.body.insertAdjacentElement('beforeend',authorTag);
});

document.addEventListener("keydown", event => {
    console.log(event.key)
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

