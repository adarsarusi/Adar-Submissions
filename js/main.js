"use strict";

const MINE_IMG = '<img src="img/mine.png">';
const FLAG_IMG = '<img src="img/red flag.png">';

var gBoard;

var gLevel = {
  SIZE: 4,
  MINES: 2,
  REVEALED: 14
};

var gGame = {
  isOn: true,
  revealedCount: 0,
  markedCount: 0,
  secsPassed: 0,
  LIVES: 3
};

function onInit() {
  // setting the board inside a global variable
  gBoard = buildBoard();

  // rendering the board in the DOM
  renderBoard(gBoard);

}

function setDifficulty(size, mines) {
  gLevel.SIZE = size
  gLevel.MINES = mines
  gLevel.REVEALED = size ** 2 - mines

  gGame.isOn = true

  gBoard = buildBoard()

  renderBoard(gBoard)
}

function buildBoard() {
  // creating a mat based on the difficulty
  var mat = createMat(gLevel.SIZE);

  // inserting objects to the board
  for (var i = 0; i < mat.length; i++) {
    for (var j = 0; j < mat[i].length; j++) {
      mat[i][j] = {
        minesAroundCount: 0,
        isRevealed: false,
        isMine: false,
        isMarked: false,
      };
    }
  }

  //setting up mines according to difficulty
  var setupMines = gLevel.MINES
  while (setupMines > 0) {
    var emptyCells = []
    var position = {}

    for (var i = 0; i < mat.length; i++) {
      for (var j = 0; j < mat[i].length; j++) {
        if (mat[i][j].isMine === false) {
          position = { i, j }
          emptyCells.push(position)
        }
      }
    }

    var randCell = emptyCells[getRandomInt(0, emptyCells.length)]

    mat[randCell.i][randCell.j].isMine = true

    setupMines--
  }

  // manually setting mines
  // mat[1][0].isMine = mat[2][2].isMine = true;

  // setting nearby mines count around each cell
  for (var i = 0; i < mat.length; i++) {
    for (var j = 0; j < mat[i].length; j++) {
      mat[i][j].minesAroundCount = setMinesNegsCount(mat, i, j)
    }
  }

  // returning the mat setting it in the gBoard
  return mat;
}

function setMinesNegsCount(mat, matI, matJ) {

  var count = 0

  //neighbor function
  for (var i = matI - 1; i <= matI + 1; i++) {
    if (i < 0 || i >= mat.length) continue

    for (var j = matJ - 1; j <= matJ + 1; j++) {
      if (j < 0 || j >= mat[i].length) continue
      if (i === matI && j === matJ) continue

      if (mat[i][j].isMine === true) count++
    }
  }

  return count

}

function renderBoard(board) {
  const elBoard = document.querySelector(".board");
  var strHTML = "";

  // building the DOM
  for (var i = 0; i < board.length; i++) {
    strHTML += "<tr>\n";
    for (var j = 0; j < board[0].length; j++) {
      var currCell = board[i][j];

      var cellClass = getClassName({ i: i, j: j });

      if (currCell.isMine === true) {
        strHTML += `\t<td class="cell ${cellClass} mine" oncontextmenu="onCellMarked(this, ${i},${j})" onclick="onCellClicked(this, ${i},${j})">`;
      } else {
        strHTML += `\t<td class="cell ${cellClass}" oncontextmenu="onCellMarked(this, ${i},${j})" onclick="onCellClicked(this, ${i},${j})">`;
      }

      strHTML += "</td>\n";
    }
    strHTML += "</tr>\n";
  }
  elBoard.innerHTML = strHTML;


}

function onCellClicked(elCell, i, j) {
  if (gGame.isOn === false) return


  // if the clicked cell is already marked with a flag it cannot be revealed
  if (gBoard[i][j].isMarked) return

  
  gBoard[i][j].isRevealed = true
  elCell.classList.add('revealed')
  gGame.revealedCount++

  // if there is a mine it is revealed
  if (gBoard[i][j].isMine === true) {
    elCell.innerHTML = MINE_IMG
    gGame.isOn = false
  }

  // if theres mines around the clicked cell it reveals how many mines are around it
  if (gBoard[i][j].minesAroundCount > 0 && gBoard[i][j].isMine === false) elCell.innerText = gBoard[i][j].minesAroundCount

  checkGameOver()
}

function onCellMarked(elCell, i, j) {
  if (gGame.isOn === false) return

  // checking if the clicked cell is marked setting a flag and vice versa
  if (!gBoard[i][j].isMarked) {
    elCell.innerHTML = FLAG_IMG
    gBoard[i][j].isMarked = true
    gGame.markedCount++
  } else {
    elCell.innerHTML = ''
    gBoard[i][j].isMarked = false
    gGame.markedCount--
  }

  checkGameOver()
}

function checkGameOver() {
  if (gGame.revealedCount === gLevel.REVEALED && gGame.markedCount === gLevel.MINES) {
    gGame.isOn = false
  }
}

function expandReveal(board, elCell, i, j) { }

// function createBoard() {
//     const tempNums = gNums.slice()
//     const shuffleNums = []

//     while (tempNums.length > 0) {
//         const rndIndex = getRandomInt(0, tempNums.length)
//         const rndNum = tempNums.splice(rndIndex, 1)
//         shuffleNums.push(rndNum[0])
//     }

//     return shuffleNums
// }

// function checkNegBalls() {  for refference

// 	var count = 0

// 	for (var i = gGamerPos.i - 1; i <= gGamerPos.i + 1; i++) {
// 		if (i < 0 || i >= gBoard.length) continue

// 		for (var j = gGamerPos.j - 1; j <= gGamerPos.j + 1; j++) {
// 			if (j < 0 || j >= gBoard[i].length) continue
// 			if (i === gGamerPos.i && j === gGamerPos.j) continue

// 			if (gBoard[i][j].gameElement === BALL) count++
// 		}
// 	}

// 	var elNegBalls = document.querySelector('.neighbor')
// 	elNegBalls.innerText = count

// }

// function newBoard(difficulty, matSize){
//     gNums = []
//     SIZE = matSize
//     DIFF = difficulty
//     nextNum = 1

//     for (let i = 1; i <= DIFF; i++) {
//         gNums.push(i)
//     }

//     onInitGame()
// }

// function printBoard() {
//     const board = createBoard()

//     const elBoard = document.querySelector('tbody')
//     var strHtml = ''
//     for (let i = 0; i < SIZE; i++) {
//         strHtml += `<tr>`

//         for (let i = 0; i < SIZE; i++) {
//             var cellNum = board.pop()
//             strHtml += `<td onclick='onCellClicked(this, ${cellNum}) '>${cellNum}</td>`
//         }

//         strHtml += `</tr>`
//     }

//     elBoard.innerHTML = strHtml
// }

// function onCellClicked(elCell, clickedNum) {
//     if (clickedNum === nextNum) {
//         elCell.classList.add('clicked')
//         if (nextNum < DIFF) nextNum++

//         if (clickedNum === 1) startTimer()
//         if (clickedNum === DIFF) clearInterval(gInterval)

//         const elNext = document.querySelector('h3')
//         var nextHtml = `Next Number: ${nextNum}`
//         elNext.innerHTML = nextHtml
//     }
// }
