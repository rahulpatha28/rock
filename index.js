const playerText=document.querySelector("#playerText")
const computerText=document.querySelector("#computerText")
const resultext=document.querySelector("#resultText")
const choiceBtns= document.querySelectorAll(".choiceBtn")
let player;
let computer;
let result;
choiceBtns.forEach(button=>button.addEventListener("click",()=>{
        player=button.textContent;
        computerTurn();
        playerText.textContent= `Player: ${player}`;
        computerText.textContent=`Computer: ${computer}`;
        resultText.textContent= checkWinner();
    }));
function computerTurn(){
    const randnum=Math.floor(Math.random()*3)+1;
    switch(randnum){
    case 1:
        computer="ROCK";
        break;
    case 2:
        computer="PAPER"; 
        break;
    case 3:
        computer="SCISSORS";
        break;}

}
function checkWinner(){
    if(player==computer){
        return "Draw";}
    
    else if(computer=="ROCK" ){
        return (player=="SCISSORS" )?"you loose":"you win";}
    else if(computer=="SCISSORS" ){
        return (player=="ROCK") ?"you  win":"you loose";}
    else if(computer=="PAPER" ){
            return (player=="SCISSORS")? "you win":"you loose";}
    }  
