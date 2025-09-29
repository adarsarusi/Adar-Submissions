"use strict";

const MINE_IMG = '<img src="img/mine.png">';
const FLAG_IMG = '<img src="img/red flag.png">';
const HEART_IMG = '<img src= "img/lives.png">';
const ALIVE_IMG = '<img src= "img/alive.png">';
const DEAD_IMG = '<img src= "img/dead.png">';
const WIN_IMG = '<img src= "img/win.png">';

var gBoard;

var gLevel = {
  SIZE: 4,
  MINES: 2,
  REVEALED: 14,
};

var gGame = {
  isOn: true,
  revealedCount: 0,
  markedCount: 0,
  secsPassed: 0,
  LIVES: 3,
  firstClick: true,
};

function onInit() {
  // setting the board inside a global variable
  gBoard = buildBoard();

  // rendering the board in the DOM
  renderBoard(gBoard);

  setLives();
}

function setDifficulty(size, mines) {
  gLevel.SIZE = size;
  gLevel.MINES = mines;
  gLevel.REVEALED = size ** 2 - mines;

  gGame.firstClick = true
  gGame.LIVES = 3;
  setLives();

  gGame.revealedCount = 0;
  gGame.markedCount = 0;

  gGame.isOn = true;

  gBoard = buildBoard();

  renderBoard(gBoard);
}

function buildBoard() {
  if (gGame.firstClick === true) {
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
          isFirstClick: false,
        };
      }
    }
    return mat;
  }

  //setting up mines according to difficulty

  // manually setting mines
  // mat[1][0].isMine = mat[2][2].isMine = true;

  // setting nearby mines count around each cell
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[i].length; j++) {
      gBoard[i][j].minesAroundCount = checkMinesNegsCount(gBoard, i, j);
    }
  }

  // returning the mat setting it in the gBoard
  return;
}

function checkMinesNegsCount(mat, matI, matJ) {
  var count = 0;

  //neighbor function
  for (var i = matI - 1; i <= matI + 1; i++) {
    if (i < 0 || i >= mat.length) continue;

    for (var j = matJ - 1; j <= matJ + 1; j++) {
      if (j < 0 || j >= mat[i].length) continue;
      if (i === matI && j === matJ) continue;

      if (mat[i][j].isMine === true) count++;
    }
  }

  return count;
}


function expandReveal(board, elCell, matI, matJ) {
  if (checkMinesNegsCount(board, i, j) !== 0) return

  for (var i = matI - 1; i <= matI + 1; i++) {
    if (i < 0 || i >= board.length) continue;

    for (var j = matJ - 1; j <= matJ + 1; j++) {
      if (j < 0 || j >= board[i].length) continue;
      if (i === matI && j === matJ) continue;

      elCell.isRevealed = true
      elCell.classList.add("revealed");
      elCell.innerText = gBoard[i][j].minesAroundCount;
      gGame.revealedCount++;
    }
  }
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
        strHTML += `\t<td class="cell ${cellClass} mine" oncontextmenu="onCellMarked(event, this, ${i},${j})" onclick="onCellClicked(this, ${i},${j})">`;
      } else if (currCell.isRevealed === true) {
        strHTML += `\t<td class="cell ${cellClass} revealed" oncontextmenu="onCellMarked(event, this, ${i},${j})" onclick="onCellClicked(this, ${i},${j})">`;
      }
      else {
        strHTML += `\t<td class="cell ${cellClass}" oncontextmenu="onCellMarked(event, this, ${i},${j})" onclick="onCellClicked(this, ${i},${j})">`;
      }

      strHTML += "</td>\n";
    }
    strHTML += "</tr>\n";
  }
  elBoard.innerHTML = strHTML;
}

function onCellClicked(elCell, i, j) {
  if (gGame.firstClick === true) {
    gGame.firstClick = false;
    gBoard[i][j].isFirstClick = true;
    gBoard[i][j].isRevealed = true;
    // need to fix (still doesnt work properly)
    // fixed :)
    setupMines();
    buildBoard();

    // if (gBoard[i][j].minesAroundCount === 0) {
    //   expandReveal(gBoard, elCell, i, j)
    //   return
    // }

    gBoard[i][j].isRevealed = true;
    elCell.classList.add("revealed");
    gGame.revealedCount++;
    // renderBoard(gBoard)
    elCell.innerText = gBoard[i][j].minesAroundCount;



    return
  }

  // if the cell is already revealed there is no reason to click on it again
  if (gBoard[i][j].isRevealed) return

  // if the game is finished the player cannot click any more cells
  if (gGame.isOn === false) return;

  // if the clicked cell is already marked with a flag it cannot be revealed
  if (gBoard[i][j].isMarked) return;

  //revealing the current clicked cell
  gBoard[i][j].isRevealed = true;
  elCell.classList.add("revealed");
  gGame.revealedCount++;

  // if there is a mine it is revealed
  if (gBoard[i][j].isMine === true) {
    elCell.innerHTML = MINE_IMG;
    elCell.classList.add("minePop");
    gGame.LIVES--;
    setLives();

    if (gGame.LIVES === 0) {
      gGame.isOn = false;

      var elMines = document.querySelectorAll(".mine");
      var mineIdx = 0;
      // revealing the rest of the mines
      for (var k = 0; k < gBoard.length; k++) {
        for (var g = 0; g < gBoard[k].length; g++) {
          if (gBoard[k][g].isMine === true) {
            elMines[mineIdx].classList.add("revealed");
            elMines[mineIdx].innerHTML = MINE_IMG;
            mineIdx++;
          }
        }
      }
    }
  }

  // if theres mines around the clicked cell it reveals how many mines are around it
  if (gBoard[i][j].minesAroundCount > 0 && gBoard[i][j].isMine === false)
    elCell.innerText = gBoard[i][j].minesAroundCount;

  // if (gBoard[i][j].minesAroundCount === 0) expandReveal(gBoard, elCell, i, j)

  checkGameOver();
}

function onCellMarked(ev, elCell, i, j) {
  // stopping the right click context menu popup when right clicking a cell
  ev.preventDefault();

  // if the game is finished the player cannot mark any more cells
  if (gGame.isOn === false) return;

  if (gBoard[i][j].isRevealed && gBoard[i][j].isMine) {
    gBoard[i][j].isRevealed = false;
    gGame.revealedCount--;
  }

  // checking if the clicked cell is marked setting a flag and vice versa
  if (!gBoard[i][j].isMarked) {
    elCell.innerHTML = FLAG_IMG;
    gBoard[i][j].isMarked = true;
    gGame.markedCount++;
  } else {
    elCell.innerHTML = "";
    gBoard[i][j].isMarked = false;
    gGame.markedCount--;
  }

  checkGameOver();
}

// checking victory by marking all the possible mines and clearing every other cell
function checkGameOver() {
  if (
    gGame.revealedCount === gLevel.REVEALED &&
    gGame.markedCount === gLevel.MINES
  ) {
    gGame.isOn = false;
    var elSmile = document.querySelector(".smile");
    elSmile.innerHTML = WIN_IMG;
  }
}

function setLives() {
  var elLives = document.querySelector(".lives");
  elLives.innerHTML = HEART_IMG.repeat(gGame.LIVES);

  var elSmile = document.querySelector(".smile");

  if (gGame.LIVES === 3) elSmile.innerHTML = ALIVE_IMG;
  else if (gGame.LIVES === 0) elSmile.innerHTML = DEAD_IMG;
}

function setupMines() {
  var setupMines = gLevel.MINES;
  while (setupMines > 0) {
    var emptyCells = [];
    var position = {};

    for (var i = 0; i < gBoard.length; i++) {
      for (var j = 0; j < gBoard[i].length; j++) {
        if (
          gBoard[i][j].isMine === false &&
          gBoard[i][j].isFirstClick === false
        ) {
          position = { i, j };
          emptyCells.push(position);
        }
      }
    }

    var randCell = emptyCells[getRandomInt(0, emptyCells.length)];

    gBoard[randCell.i][randCell.j].isMine = true;

    setupMines--;
  }
}
