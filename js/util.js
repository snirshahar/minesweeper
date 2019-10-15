'use strict'

function getRandomInt(num1, num2) {
    var maxNum = (num1 > num2) ? num1 + 1 : num2 + 1;
    var minNum = (num1 < num2) ? num1 : num2;
    var randomNumber = (Math.floor(Math.random() * (maxNum - minNum)) + minNum);
    return randomNumber;
}