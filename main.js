//decide whether to play for pennies, nickels, dimes, or quarters
//each player begins with three of the chosen coin (they get to play on mercy after coins are gone)
//put money in pot
//status of the money pot
//status of all players monies
//one unique deck of cards (already shuffled)
let deckID = ''

fetch(`https://deckofcardsapi.com/api/deck/new/draw/?count=1`)
.then(res => res.json()) // parse response as JSON
.then(data => {
  console.log(data)
  deckID = data.deck_id
  
})
.catch(err => {
    console.log(`error ${err}`)
});

//mark dealer hi
//function to unhide cards once they are dealt, will call within the deal function
function unhideCards(){
  document.querySelectorAll('.card').forEach(function (card) {
    card.classList.remove('hidden');
  });
}
//deal three cards to each player
document.querySelector('button').addEventListener('click', dealThreeCardsToEachPlayer)

function dealThreeCardsToEachPlayer(){
  const url = `https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=9`
  fetch(url)
      .then(res => res.json()) // parse response as JSON
      .then(data => {
      document.querySelector('#yourFirstCard').src = data.cards[0].image
      document.querySelector('#yourSecondCard').src = data.cards[3].image
      document.querySelector('#yourThirdCard').src = data.cards[6].image
      document.querySelector('#textGigisCards').textContent = "Gigi's Cards"
      document.querySelector('#textGrandmasCards').textContent = "Grandma's Cards"
      document.querySelector('#textYourCards').textContent = "Your Cards"
      unhideCards()
      let player1Val = convertToNum(data.cards[0].value)
      let player2Val = convertToNum(data.cards[1].value)
      let player1Card1Code = data.cards[0].code
      let player2Card1Code = data.cards[1].code
      let player3Card1Code = data.cards[2].code
      let player1Card2Code = data.cards[3].code
      let player2Card2Code = data.cards[4].code
      let player3Card2Code = data.cards[5].code
      let player1Card3Code = data.cards[6].code
      let player2Card3Code = data.cards[7].code
      let player3Card3Code = data.cards[8].code

//I believe this next part would catch the error of the function dealThreeCardsToEachPlayer but it's not happy here for some reason.
      .catch(err => {
          console.log(`error ${err}`)
      });
})}

//players hands
//upturned card
//card values - An Ace counts 11 points, face cards count 10 points, and all other cards count their face value.
function convertToNum(val) {
    if(val === 'ACE') {
      return 11
    } else if (val === 'KING') {
      return 10
    } else if (val === 'QUEEN') {
      return 10
    } else if (val === 'JACK') {
      return 10
    } else {
      return Number(val)
    }
  }



//player to left of dealer goes first, may take upturned card in exchange for one of theirs OR
//draw top card from the deck and then choose one to discard to top of the pile

//play continues clockwise around the table until one player thinks they can win...

//if they think they can win, they knock on their turn instead of getting a new card, and the others get one more turn

//Compare cards, highest total score wins, if there is a tie for highest score...
//If there is a tie for the highest score, the player with the highest-ranking card wins. 
//Example: K, Q, 6 (total 26) would beat Q, 9, 7 (also total 26). If there is a tie in the highest cards,
//the next highest cards are compared, and so on.

//If a player gets 31 points at any point they win right then and there.

//Background story of where the game came from with a picture of my grandmother and great-grandmother