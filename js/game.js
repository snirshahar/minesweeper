'use strict';

var MINE = '💣';
var FLAG = '🚩';
var GAME_ON = '😊';
var GAME_OVER = '😭';
var VICTORY = '😎';

var gLevels = [{ boardSize: 4, amountOfBombs: 2 },
    { boardSize: 8, amountOfBombs: 12 },
    { boardSize: 12, amountOfBombs: 30 }
];

var gGame = {
    gSize: 10,
    gAmountOfBombs: 10,
    gIsGameOver: false,
    gLives: 3,
    gFlagedBombsCount: 0,
    gFlagedCells: 0,
    gMarkedCellsCount: 0,
    gSafeClickCount: 3,
    gIsFirstClick: true,
    gTime: 0,
    gTimerInterval: null,
    startTime: null,
    endTime: null,
    totalGameTime: null
}
var gBoard;

var gStopWatchParts = {
    miliSec: 0,
    sec: 0,
    min: 0,
    miliMax: 100,
    secMax: 60,
    minMax: 100
}
var milSecStr = '00';
var secondsStr = '00';
var minutesStr = '00';


function getKey(event) {
    console.log(event.button);
}

function initGame() {
    gGame.gLives = 3;
    gGame.gFlagedBombsCount = 0;
    gGame.gMarkedCellsCount = 0;
    gGame.gFlagedCells = 0;
    gGame.gSafeClickCount = 3;
    gGame.gIsFirstClick = true;
    gStopWatchParts.miliSec = 0;
    gStopWatchParts.sec = 0;
    gStopWatchParts.min = 0;
    milSecStr = '00';
    secondsStr = '00';
    minutesStr = '00';
    clearInterval(gGame.gTimerInterval);
    gGame.gTimerInterval = null;

    gBoard = buildBoard(gGame.gSize);
    renderBoard(gBoard);
    renderLives();
    document.querySelector('.game-container .game-smiley').innerText = GAME_ON;
    var elGameOver = document.querySelector('.game-container .game-over');
    elGameOver.style.display = 'none';
    document.querySelector('.game-container .safe-button .game-button span').innerText = gGame.gSafeClickCount;
    document.querySelector('.game-container .stopwatch span').innerText = '00:00:00';
}

function stopWatch() {
    var stopWatchStr = '';

    milSecStr = createStopWatchStrPart('miliSec', 'miliMax');
    if (gStopWatchParts.miliSec === gStopWatchParts.miliMax - 1) {
        secondsStr = createStopWatchStrPart('sec', 'secMax');
        if (gStopWatchParts.sec === gStopWatchParts.secMax - 1) {
            minutesStr = createStopWatchStrPart('min', 'minMax');
        }
    }
    stopWatchStr = minutesStr + ':' + secondsStr + ':' + milSecStr
    var elStopWatch = document.querySelector('.game-container .stopwatch span');
    elStopWatch.innerText = stopWatchStr;
}

function createStopWatchStrPart(stopWatchPart, limit) {
    var timePartStr = '';
    if (gStopWatchParts[stopWatchPart] < 10) {
        gStopWatchParts[stopWatchPart]++
            timePartStr = '0' + gStopWatchParts[stopWatchPart];
    } else if (gStopWatchParts[stopWatchPart] >= 10) {
        gStopWatchParts[stopWatchPart]++
            timePartStr += gStopWatchParts[stopWatchPart];
    }
    if (gStopWatchParts[stopWatchPart] === gStopWatchParts[limit]) {
        gStopWatchParts[stopWatchPart] = 0;
    }
    return timePartStr;
}

function safeClickBtn() {
    if (gGame.gSafeClickCount === 0) return;
    if (gGame.gFlagedCells + gGame.gMarkedCellsCount + gGame.gAmountOfBombs === gGame.gSize ** 2) return;

    gGame.gSafeClickCount--
        document.querySelector('.game-container .safe-button .game-button span').innerText = gGame.gSafeClickCount;

    var randIPos = getRandomInt(0, gBoard.length - 1);
    var randJPos = getRandomInt(0, gBoard[0].length - 1);
    while (gBoard[randIPos][randJPos].isBomb || gBoard[randIPos][randJPos].isMarked) {
        randIPos = getRandomInt(0, gBoard.length - 1);
        randJPos = getRandomInt(0, gBoard[0].length - 1);
    }

    var currCell = gBoard[randIPos][randJPos];
    var elCell = document.querySelector(`.cell-${randIPos}-${randJPos}`);
    currCell.isHint = true;
    elCell.classList.add('safe');

    setTimeout(function() {
        currCell.isHint = false;
        elCell.classList.remove('safe');
    }, 3000);
}

function renderLives() {
    document.querySelector('.lives span').innerText = gGame.gLives;
}

function levelSet(levelIdx) {
    gGame.gSize = gLevels[levelIdx].boardSize;
    gGame.gAmountOfBombs = gLevels[levelIdx].amountOfBombs;
    initGame();
}

function cellFlaged(elCell) {
    var currPos = getCellPos(elCell);
    var currCell = gBoard[currPos.i][currPos.j];
    if (currCell.isMarked) return;

    if (currCell.isFlaged) {
        if (currCell.isBomb) {
            gGame.gFlagedBombsCount--
        }
        gGame.gFlagedCells--
            elCell.innerText = null;
        currCell.isFlaged = false;
        checkVictory();
    } else {
        if (currCell.isBomb) {
            gGame.gFlagedBombsCount++
        }
        gGame.gFlagedCells++;
        elCell.innerText = FLAG;
        currCell.isFlaged = true;
        checkVictory();
    }
}

function cellClicked(elCell, event) {

    var currPos = getCellPos(elCell);
    var currCell = gBoard[currPos.i][currPos.j];

    if (gGame.gIsFirstClick) {
        gGame.gIsFirstClick = false;
        gGame.startTime = Date.now();
        gGame.gTimerInterval = setInterval(stopWatch, 10);
        spreadBombs(gBoard, gGame.gAmountOfBombs, currPos);
        countBombs(gBoard);
    }

    if (event.button === 2) {
        cellFlaged(elCell);
        return
    } else if (event.button === 0) {


        if (currCell.isFlaged) return;
        if (currCell.isMarked) return;

        if (currCell.isBomb) {
            gGame.gLives--;
            renderLives();
            gGame.gMarkedCellsCount++;
            currCell.isMarked = true;
            elCell.innerText = MINE;
            elCell.classList.add('bombed');
            checkVictory();
            checkGameOver();
            return;
        }

        if (currCell.bombsAroundCell > 0) {
            elCell.innerText = currCell.bombsAroundCell;
            currCell.isMarked = true;
            elCell.classList.add('clicked');
            gGame.gMarkedCellsCount++;
            checkVictory();
        } else if (currCell.bombsAroundCell === 0) cellMarked(currPos);
    }
}

function checkGameOver() {
    if (gGame.gLives === 0) {
        gGame.gIsGameOver = true;
        revealBombs();
        var elGameOver = document.querySelector('.game-container .game-over');
        document.querySelector('.game-container .game-smiley').innerText = GAME_OVER;
        elGameOver.innerText = 'Game Over';
        elGameOver.style.display = 'block';
        gGame.endTime = Date.now();
        gGame.totalGameTime = gGame.endTime - gGame.startTime;
        clearInterval(gGame.gTimerInterval);
        return;
    }
}

function checkVictory() {
    if (gGame.gMarkedCellsCount + gGame.gFlagedBombsCount === gGame.gSize ** 2) {
        gGame.gIsGameOver = true;
        var elGameOver = document.querySelector('.game-container .game-over')
        document.querySelector('.game-container .game-smiley').innerText = VICTORY;
        elGameOver.innerText = 'Winner Winner Chicken Dinner!';
        elGameOver.style.display = 'block';
        gGame.endTime = Date.now();
        gGame.totalGameTime = gGame.endTime - gGame.startTime;
        clearInterval(gGame.gTimerInterval);
        return true;
    } else return false;
}

function revealBombs() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (gBoard[i][j].isBomb) {
                gBoard[i][j].isMarked = true;
                document.querySelector(`.cell-${i}-${j}`).innerText = MINE;
            }
        }
    }
}

function cellMarked(cellPos) {
    for (var i = cellPos.i - 1; i <= cellPos.i + 1; i++) {
        for (var j = cellPos.j - 1; j <= cellPos.j + 1; j++) {
            if (gBoard[i] && gBoard[i][j]) {
                var currCell = gBoard[i][j];
                var elCell = document.querySelector(`.cell-${i}-${j}`)
                if (currCell.isBomb) continue;
                if (currCell.isFlaged) continue;
                if (currCell.isMarked) continue;
                currCell.isMarked = true;
                elCell.classList.add('clicked');
                gGame.gMarkedCellsCount++
                    if (currCell.bombsAroundCell > 0) {
                        elCell.innerText = currCell.bombsAroundCell
                    } else
                if (currCell.bombsAroundCell === 0) {
                    elCell.innerText = null;
                    var currCellPos = { i: i, j: j };
                    cellMarked(currCellPos);
                }
            }
        }
    }
    checkVictory();
}

function getCellPos(elCell) {
    var elPos = elCell.classList[1].split('-');
    var pos = { i: +elPos[elPos.length - 2], j: +elPos[elPos.length - 1] };
    return pos;
}


function countBombs(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            var cellPos = { i: i, j: j };
            board[i][j].bombsAroundCell = setMinesNegsCount(board, cellPos);
        }
    }
}

function setMinesNegsCount(board, cellPos) {
    var count = 0;
    for (var i = cellPos.i - 1; i <= cellPos.i + 1; i++) {
        for (var j = cellPos.j - 1; j <= cellPos.j + 1; j++) {
            if (cellPos.i === i && cellPos.j === j) continue;
            if (board[i] && board[i][j]) {
                if (board[i][j].isBomb) count++
            }
        }
    }
    return count;
}

function spreadBombs(board, amountOfBombs, startPos) {
    for (var i = 0; i < amountOfBombs; i++) {
        var randIPos = getRandomInt(0, board.length - 1);
        var randJPos = getRandomInt(0, board[0].length - 1);
        while (board[randIPos][randJPos].isBomb || randIPos === startPos.i && randJPos === startPos.j) {
            randIPos = getRandomInt(0, board.length - 1);
            randJPos = getRandomInt(0, board[0].length - 1);
        }
        board[randIPos][randJPos].isBomb = true;
    }
}