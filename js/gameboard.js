'use strict'

function buildBoard(boardSize) {
    var board = [];
    for (var i = 0; i < boardSize; i++) {
        board[i] = [];
        for (var j = 0; j < boardSize; j++) {
            board[i][j] = createCell();
        }
    }
    return board;
}


function renderBoard(board) {
    var boardStr = '';

    boardStr += '<table>';
    for (var i = 0; i < board.length; i++) {
        boardStr += '<tr>';
        for (var j = 0; j < board[0].length; j++) {
            boardStr += `<td onmousedown="cellClicked(this, event)" class="board-cell cell-${i}-${j}"></td>`
        }
        boardStr += '</tr>';
    }
    boardStr += '</table>';

    var elBoard = document.querySelector('.game-container .game-board');
    elBoard.innerHTML = boardStr;
}

function createCell() {
    var cell = {
        isBomb: false,
        bombsAroundCell: 0,
        isMarked: false,
        isFlaged: false,
        isHinted: false
    };
    return cell;
}