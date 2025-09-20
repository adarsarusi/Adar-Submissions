"use strict";

function createMat(size) {
  const mat = [];
  for (var i = 0; i < size; i++) {
    const row = [];
    for (var j = 0; j < size; j++) {
      row.push("");
    }
    mat.push(row);
  }
  return mat;
}

function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}

function getClassName(position) {
  return `cell-${position.i}-${position.j}`;
}
