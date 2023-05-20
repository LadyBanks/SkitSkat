//Option to hide instructions
function hideWhatIsHappening() {
  document.getElementById('whatIsHappening').style.display = 'none'
}
document.getElementById('whatIsHappening').addEventListener('click', hideWhatIsHappening)

//the pot is empty at the start
let coinsInThePot = 0

//variable for the card that is on the top of the discard pile, defined on the deal
let topOfTheDiscardPile = undefined
//variable for unseen card on top of the deck, defined when a new card is upturned probably
let topOfDeck = undefined

//decide whether to play for pennies, nickels, dimes, or quarters
const chosenCoin = ""

//need a turn counter
var totalTurnsPlayed = 0

//card values - Ace = 11 points, face cards = 10 points, all = face value
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


//PLAYER OBJECT
//each player begins with three of the chosen coin (they get to play on mercy after coins are gone)
function Player(name, num, coins, onMercy, isOut, dealer, active) {
  this.name = name
  this.num = num
  this.coins = coins
  this.onMercy = onMercy
  this.isOut = isOut
  this.dealer = dealer
  this.active = active
  //either upturnedCard or TopOfTheDeck
  this.chosenCard = undefined
  this.choiceLockedIn = false
  this.planningToDiscard = undefined
  //hand is currently the three card codes (i.e. 5D, AS, 2C)
  this.hand = []
  //this.points is calculated below in the this.calulateHandPointValue function
  this.points = 0
  this.winningSuit = undefined
  this.winningSuitScore = undefined
  this.highCardValue = undefined
  this.offSuitCardsInHand = undefined
  //Gives players score, taking suit into account, stores in this.points variable
  this.calculateHandPointValue = function() {
    //pull out all spades into new array by filtering the this.hand array of cards and sort it in descending so you can grab high card from 0 index
    var spadesInHand = this.hand.filter(card => {
      return card.suit === 'SPADES'
    })
    //take values of the spade cards, convert them to numbers, and put them in new array
    var spadesValuesInHand = spadesInHand.map(card => convertToNum(card.value)).sort((a,b)=>b-a)
    //sum all spade card num values from the new array
    var sumOfSpadesValuesInHand = spadesValuesInHand.reduce((partialSum, a) => partialSum + a, 0);
    //repeat for other three suits below
    var clubsInHand = this.hand.filter(card => {
      return card.suit === 'CLUBS'
    })
    var clubsValuesInHand = clubsInHand.map(card => convertToNum(card.value)).sort((a,b)=>b-a)
    var sumOfClubsValuesInHand = clubsValuesInHand.reduce((partialSum, a) => partialSum + a, 0);
    var heartsInHand = this.hand.filter(card => {
      return card.suit === 'HEARTS'
    })
    var heartsValuesInHand = heartsInHand.map(card => convertToNum(card.value)).sort((a,b)=>b-a)
    var sumOfHeartsValuesInHand = heartsValuesInHand.reduce((partialSum, a) => partialSum + a, 0);
    var diamondsInHand = this.hand.filter(card => {
      return card.suit === 'DIAMONDS'
    })
    var diamondsValuesInHand = diamondsInHand.map(card => convertToNum(card.value)).sort((a,b)=>b-a)
    var sumOfDiamondsValuesInHand = diamondsValuesInHand.reduce((partialSum, a) => partialSum + a, 0);
    var sortedSums = [sumOfSpadesValuesInHand, sumOfClubsValuesInHand, sumOfHeartsValuesInHand, sumOfDiamondsValuesInHand].sort((a,b)=>b-a)
    switch(sortedSums[0]) {
      case sumOfSpadesValuesInHand:
        this.winningSuit = 'SPADES'
        this.winningSuitScore = sumOfSpadesValuesInHand
        this.highCardValue = spadesValuesInHand[0]
        break;
      case sumOfClubsValuesInHand:
        this.winningSuit = 'CLUBS'
        this.winningSuitScore = sumOfClubsValuesInHand
        this.highCardValue = clubsValuesInHand[0]
        break;
      case sumOfHeartsValuesInHand:
        this.winningSuit = 'HEARTS'
        this.winningSuitScore = sumOfHeartsValuesInHand
        this.highCardValue = heartsValuesInHand[0]
        break;
      case sumOfDiamondsValuesInHand:
        this.winningSuit = 'DIAMONDS'
        this.winningSuitScore = sumOfDiamondsValuesInHand
        this.highCardValue = diamondsValuesInHand[0]
        break;
    }
    //pull the offsuit cards into an array (if there are any)
    this.offSuitCardsInHand = activePlayer.hand.filter (e => e.suit != `${activePlayer.winningSuit}`)
    //if you have offsuit cards, order them ascending so the lowest is in position 0
    if (this.offSuitCardsInHand.length >0) {
      this.offSuitCardsInHand = this.offSuitCardsInHand.sort(function(a, b) {
      return parseFloat(convertToNum(a.value)) - parseFloat(convertToNum(b.value)); })}
        //DO THIS NEXT NEED TO FIGURE OUT WHAT TO DO WHEN TWO (or three) SUITS TIE?  MAYBE?
    //NEED TO FIGURE OUT HOW TO DECLARE HIGH CARD FOR TIES, WOULD BE HIGHEST CARD OR THE SUIT THEY ARE USING, need some if's about the indexes of sorted sums being equal, maybe make new function to insert here since this one is already big?
    this.points = Math.max(sumOfSpadesValuesInHand, sumOfClubsValuesInHand, sumOfHeartsValuesInHand, sumOfDiamondsValuesInHand)
    return Math.max(sumOfSpadesValuesInHand, sumOfClubsValuesInHand, sumOfHeartsValuesInHand, sumOfDiamondsValuesInHand)
  }
  //put money in pot
  this.putInCoin = function() {
    if (this.coins > 0) {
      this.coins -= 1
      coinsInThePot += 1
    }
    if (this.coins == 0) {
      if (this.onMercy == false) {
        this.onMercy = true
      }
      else {
        this.isOut = true
      }
    }
  }
  this.wouldThatCardImproveHandValue = function() {
    //make three different arrays with upturned card based on which cards you could discard
    console.log("TESTING HERE")
    thatCard = topOfTheDiscardPile
    currentHand = this.hand
    currentHandValue = this.calculateHandPointValue()
    ifYouSwapCard1 = [thatCard, this.hand[1], this.hand[2]]
    ifYouSwapCard2 = [this.hand[0], thatCard, this.hand[2]]
    ifYouSwapCard3 = [this.hand[0], this.hand[1], thatCard]
    this.hand = ifYouSwapCard1
    ifYouSwapCard1NewValue = this.calculateHandPointValue()
    console.log(this.calculateHandPointValue())
    this.hand = ifYouSwapCard2
    ifYouSwapCard2NewValue = this.calculateHandPointValue()
    console.log(this.calculateHandPointValue())
    this.hand = ifYouSwapCard3
    ifYouSwapCard3NewValue = this.calculateHandPointValue()
    console.log(this.calculateHandPointValue())
    allOptions = [currentHandValue, ifYouSwapCard1NewValue, ifYouSwapCard2NewValue, ifYouSwapCard3NewValue]
    console.log(allOptions)
    //below logs index of winning value, DO NEXT NEED TO ACCOUNT FOR TIE BY CHECKING FOR DUPLICATE VALUE AND choose option based on discarding lowest value card I WAS HERE
    console.log(allOptions.indexOf(Math.max(...allOptions)))
  }
}

function updatePointsDisplay() {
  document.querySelector('#yourPoints').textContent = `Points: ${player1.points}`
}

//make players from player object
let player1 = new Player('You', 1, 3, false, false, false, true)
let player2 = new Player('GiGi', 2, 3, false, false, false, false)
let player3 = new Player('Grandma', 3, 3, false, false, true, false)
let allPlayers = [player1, player2, player3]

//Player3 will deal first
let currentDealer = player3

//You, Player1, will go first
let activePlayer = player1

//determine who will be the dealer next based on current dealer
//and insert dealers name into html element to display
function whoIsNextDealer(currentDealer) {
  switch(currentDealer) {
    case player1:
      currentDealer = player2
      player2.dealer = true
      player1.dealer = false
      break;
    case player2:
      currentDealer = player3
      player3.dealer = true
      player2.dealer = false
      break;
    case player3:
      currentDealer = player1
      player1.dealer = true
      player3.dealer = false
      break;
  }
  document.getElementById('dealer').textContent = `Dealer: ${currentDealer.name}`
}

//determine who will be the active player based on current active player
//NEED TO ADD TO THIS, DOESN'T ACCOUNT FOR PLAYERS BEING OUT
function whoIsNextActivePlayer() {
  switch(activePlayer) {
    case player1:
      activePlayer = 'steve'
      player2.active = true
      player1.active = false
      break;
    case player2:
      activePlayer = player3
      player3.active = true
      player2.active = false
      break;
    case player3:
      activePlayer = player1
      player1.active = true
      player3.active = false
      break;
  }
}

function endOfTurn() {
  totalTurnsPlayed = totalTurnsPlayed + 1
  //be sure the top of deck is a card back
  document.querySelector('#topOfTheDeck').src = 'oneCard.png'
  //establish a new topOfDeck card if the player took it
  if (activePlayer.chosenCard == topOfDeck) {
    const url = `https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=1`
    fetch(url)
      .then(res => res.json()) // parse response as JSON
      .then(data => {
        topOfDeck = data.cards[0]
    })
  }
  //calculate points
  activePlayer.calculateHandPointValue()
  //updates display of player 1's points
  updatePointsDisplay()
  //check for game ending skit skat
  checkForSkitSkat()
  whoIsNextActivePlayer()
  //tried putting the below in a function outside of here and then calling it but I think it was out of scope because it made activePlayer as undefined, maybe can put it into the WhoIsNextActivePlayer function instead of this happening separately?
  if (player1.active == true) {
    activePlayer = player1
    document.querySelector('#whatIsHappening').textContent = `It's your turn!  Select either the card on the top of the discard pile or the top card from the deck`
  }
  else if (player2.active == true) {
    activePlayer = player2
    document.querySelector('#whatIsHappening').textContent = `It's GiGi's turn`
  }
  else if (player3.active == true) {
    activePlayer = player3
    document.querySelector('#whatIsHappening').textContent = `It's Grandma's turn`
  }
  console.log(`Active Player = ${activePlayer.name}`)
  if (activePlayer == player2 || activePlayer == player3) {
    takeATurnCP()
  }
}

//made this function when I was having all players ante up at the beginning of the round, don't need it anymore
function allPlayersPutInCoins() {
  player1.putInCoin()
  player2.putInCoin()
  player3.putInCoin()
}

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

//unhide cards and labels once they are dealt, call within the deal function
function unhideCardsAndInsertLabels(){
  document.querySelectorAll('.card').forEach(function (card) {
    card.classList.remove('hidden');
  });
  document.querySelectorAll('.label').forEach(function (label) {
    label.classList.remove('hidden')
    label.style.display = ('inline-block');
  });
  document.querySelector('#textGigisCards').textContent = `${player2.name}'s Cards`
  document.querySelector('#textGrandmasCards').textContent = `${player3.name}'s Cards`
  document.querySelector('#textYourCards').textContent = "Your Cards"
}


//being able to push the start button to call the function that starts the game
document.querySelector('button').addEventListener('click', dealThreeCardsToEachPlayer)

//function to start the game and deal three cards to everyone and unhide stuff
//you are player1 and player 3 dealt first
function dealThreeCardsToEachPlayer(){
  //start button disapppears
  document.querySelector('button').style.display = 'none'
  //all players put one coin into the pot NOT PLAYING BY THESE RULES SO COMMENTED OUT
  //allPlayersPutInCoins()
  //insert text into html that shows amount of coins in the pot.
  document.getElementById('pot').textContent = `Coins in the pot: ${coinsInThePot}`
  //player3's name is displayed as the dealer
  document.getElementById('dealer').textContent = `Dealer: ${currentDealer.name}`
  //url with unique deck ID obtained on page load
  const url = `https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=11`
  fetch(url)
      .then(res => res.json()) // parse response as JSON
      .then(data => {
      document.querySelector('#yourFirstCard').src = data.cards[0].image
      document.querySelector('#yourSecondCard').src = data.cards[3].image
      document.querySelector('#yourThirdCard').src = data.cards[6].image
      document.querySelector('#upturnedCard').src = data.cards[9].image
      document.querySelector('#topOfTheDeck').src = 'oneCard.png'
      unhideCardsAndInsertLabels()
      player1.hand.push(data.cards[0])
      player1.hand.push(data.cards[3])
      player1.hand.push(data.cards[6])
      player2.hand.push(data.cards[1])
      player2.hand.push(data.cards[4])
      player2.hand.push(data.cards[7])
      player3.hand.push(data.cards[2])
      player3.hand.push(data.cards[5])
      player3.hand.push(data.cards[8])
      topOfTheDiscardPile = data.cards[9]
      topOfDeck = data.cards[10]
      //DELETE THESE CONSOLE.LOGS LATER
      console.log(player1.hand)
      console.log(player2.hand)
      console.log(player3.hand)
      console.log(topOfTheDiscardPile)
      player1.calculateHandPointValue()
      player2.calculateHandPointValue()
      player3.calculateHandPointValue()
      updatePointsDisplay()
      document.querySelector('#whatIsHappening').textContent = `It's your turn!  Select either the card on the top of the discard pile or the top card from the deck`
      //This is just hear for testing the calculate point value function, will maybe need it to check for skit skat?  Maybe that is separate and always called first?
      seeWhoWonThatRound()
      //must check for skit skat on deal as well as at the end of each turn
      checkForSkitSkat()
      console.log(activePlayer)
      activePlayer.wouldThatCardImproveHandValue()
//I believe this next part would catch the error of the function dealThreeCardsToEachPlayer but it's not happy here for some reason.
      //.catch(err => {
      //    console.log(`error ${err}`)
      //});
})
}

//Delete this??
//upturned card NEED TO DEFINE NEW TOP OF THE DECK CARD HERE!!! 
function upturnACard() {
  const url = `https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=1`
  fetch(url)
      .then(res => res.json()) // parse response as JSON
      .then(data => {
      document.querySelector('#upturnedCard').src = data.cards[0].image
      topOfTheDiscardPile = data.cards[0]
})
}

//card click reaction, card moves left and has glow border, defines chosenCard that you will take NEED TO ADD A CLICK AGAIN TO CONFIRM FOR TOP OF THE DECK CARD THEN IT IS REVEALED
function clickUpturnedCard() {
  if (player1.active == true) {
    if (activePlayer.choiceLockedIn == false) {
      if (activePlayer.chosenCard == undefined || activePlayer.chosenCard == topOfDeck) {
      document.getElementById("upturnedCard").style.boxShadow= '0px 0px 50px #fff'
      document.getElementById("upturnedCard").style.transform= 'translateX(-100%)'
      document.getElementById("topOfTheDeck").style.transform= 'translateX(0%)'
      document.getElementById("topOfTheDeck").style.boxShadow= 'none'
      activePlayer.chosenCard = topOfTheDiscardPile
      console.log(activePlayer.chosenCard)
      document.querySelector('#whatIsHappening').textContent = `Click again to lock in this choice`
      }
      else if (activePlayer.chosenCard == topOfTheDiscardPile) {
        activePlayer.choiceLockedIn = true
        console.log(activePlayer.chosenCard)
        document.querySelector('#whatIsHappening').textContent = `You chose to go with what you know!  Now, chose a card to discard (you can discard what you just took if you have changed your mind`
        //NEED TO SHOW ANOTHER CARD UNDER THIS CUZ IT'S THE DISCARD PILE
        document.getElementById("upturnedCard").style.boxShadow= 'none'
      }
    }
    //if your choice is locked in, selection border comes back with option to discard the upturned card you just drew
    else {
      if (activePlayer.chosenCard == topOfTheDiscardPile) {
        document.getElementById("upturnedCard").style.boxShadow= '0px 0px 50px #fff'
        document.getElementById("yourFirstCard").style.boxShadow= 'none'
        document.getElementById("yourSecondCard").style.boxShadow= 'none'
        document.getElementById("yourThirdCard").style.boxShadow= 'none'
        activePlayer.planningToDiscard = topOfTheDiscardPile
    }}
  }
}

//click card on top of deck
function clickTopOfTheDeck() {
  if (player1.active == true) {
    //if you haven't locked in your choice
    if (activePlayer.choiceLockedIn == false) {
      if (activePlayer.chosenCard == undefined || activePlayer.chosenCard == topOfTheDiscardPile) {
      document.getElementById("upturnedCard").style.boxShadow= 'none'
      document.getElementById("topOfTheDeck").style.boxShadow= '0px 0px 50px #fff'
      document.getElementById("topOfTheDeck").style.transform= 'translateX(-100%)'
      document.getElementById("upturnedCard").style.transform= 'translateX(0%)'
      activePlayer.chosenCard = topOfDeck
      console.log(activePlayer.chosenCard)
      document.querySelector('#whatIsHappening').textContent = `Are you sure?  Click again to lock in your choice and reveal the card`
      }
      else if (activePlayer.chosenCard == topOfDeck) {
        activePlayer.choiceLockedIn = true
        console.log(activePlayer.chosenCard)
        document.querySelector('#whatIsHappening').textContent = `You chose to take a chance!  Now, chose a card to discard (you can discard what you drew if you don't like it`
        //NEED TO SHOW ANOTHER CARD BACK UNDER THIS CUZ IT'S THE DECK, ALSO NEED TO CALL API FOR NEW CARD TO BE NEW TOP OF DECK CARD
        document.querySelector('#topOfTheDeck').src = topOfDeck.image
        document.getElementById("topOfTheDeck").style.boxShadow= 'none'
      }
    }
    //if your choice is locked in, selection border comes back with option to discard the deck card you just drew
    else {
      if (activePlayer.chosenCard == topOfDeck) {
      document.getElementById("topOfTheDeck").style.boxShadow= '0px 0px 50px #fff'
      document.getElementById("yourFirstCard").style.boxShadow= 'none'
      document.getElementById("yourSecondCard").style.boxShadow= 'none'
      document.getElementById("yourThirdCard").style.boxShadow= 'none'
      activePlayer.planningToDiscard = topOfDeck
    }}
  }
}

function clickYourFirstCard() {
  if (player1.active == true) {
    if (activePlayer.choiceLockedIn == true && activePlayer.planningToDiscard != activePlayer.hand[0]) {
      document.getElementById("yourFirstCard").style.boxShadow= '0px 0px 50px #fff'
      document.getElementById("yourSecondCard").style.boxShadow= 'none'
      document.getElementById("yourThirdCard").style.boxShadow= 'none'
      document.getElementById("topOfTheDeck").style.boxShadow= 'none'
      document.getElementById("upturnedCard").style.boxShadow= 'none'
      activePlayer.planningToDiscard = activePlayer.hand[0]
      console.log(activePlayer.planningToDiscard)
      document.querySelector('#whatIsHappening').textContent = `Click again to discard this card`
      }
    //you are clicking again to confirm discard and stuff moves around DO THIS NEXT NEED TO MAKE SURE THERE IS NEW TOP OF DECK THAT IS NOT SHOWING, CURRENTLY STAYS THE SAME SO YOU SEE THE SAME CARD TWICE, DON'T DO THAT HERE THOUGH, GET THAT RIGHT THEN COPY/ALTER THIS FOR CLICKING YOUR SECOND AND THIRD CARD
    else if (activePlayer.choiceLockedIn == true && activePlayer.planningToDiscard == activePlayer.hand[0]) {
      document.querySelector('#upturnedCard').src = activePlayer.hand[0].image
      activePlayer.hand.shift()
      activePlayer.hand.unshift(activePlayer.chosenCard)
      document.querySelector('#yourFirstCard').src = activePlayer.hand[0].image
      document.getElementById("yourFirstCard").style.boxShadow= 'none'
      document.getElementById("upturnedCard").style.transform= 'translateX(0%)'
      document.getElementById("topOfTheDeck").style.transform= 'translateX(0%)'
      endOfTurn()
    }
}
}

function clickYourSecondCard() {
  if (player1.active == true) {
    if (activePlayer.choiceLockedIn == true && activePlayer.planningToDiscard != activePlayer.hand[1]) {
      document.getElementById("yourFirstCard").style.boxShadow= 'none'
      document.getElementById("yourSecondCard").style.boxShadow= '0px 0px 50px #fff'
      document.getElementById("yourThirdCard").style.boxShadow= 'none'
      document.getElementById("topOfTheDeck").style.boxShadow= 'none'
      document.getElementById("upturnedCard").style.boxShadow= 'none'
      activePlayer.planningToDiscard = activePlayer.hand[1]
      console.log(activePlayer.planningToDiscard)
      document.querySelector('#whatIsHappening').textContent = `Click again to discard this card`
      }
    else if (activePlayer.choiceLockedIn == true && activePlayer.planningToDiscard == activePlayer.hand[1]) {
      document.querySelector('#upturnedCard').src = activePlayer.hand[1].image
      activePlayer.hand.splice(1, 1, activePlayer.chosenCard)
      document.querySelector('#yourSecondCard').src = activePlayer.hand[1].image
      document.getElementById("yourSecondCard").style.boxShadow= 'none'
      document.getElementById("upturnedCard").style.transform= 'translateX(0%)'
      document.getElementById("topOfTheDeck").style.transform= 'translateX(0%)'
      endOfTurn()
    }
  }
}

function clickYourThirdCard() {
  if (player1.active == true) {
    if (activePlayer.choiceLockedIn == true && activePlayer.planningToDiscard != activePlayer.hand[2]) {
      document.getElementById("yourFirstCard").style.boxShadow= 'none'
      document.getElementById("yourSecondCard").style.boxShadow= 'none'
      document.getElementById("yourThirdCard").style.boxShadow= '0px 0px 50px #fff'
      document.getElementById("topOfTheDeck").style.boxShadow= 'none'
      document.getElementById("upturnedCard").style.boxShadow= 'none'
      activePlayer.planningToDiscard = activePlayer.hand[2]
      console.log(activePlayer.planningToDiscard)
      document.querySelector('#whatIsHappening').textContent = `Click again to discard this card`
      }
    else if (activePlayer.choiceLockedIn == true && activePlayer.planningToDiscard == activePlayer.hand[2]) {
      document.querySelector('#upturnedCard').src = activePlayer.hand[2].image
      activePlayer.hand.pop()
      activePlayer.hand.push(activePlayer.chosenCard)
      document.querySelector('#yourThirdCard').src = activePlayer.hand[2].image
      document.getElementById("yourThirdCard").style.boxShadow= 'none'
      document.getElementById("upturnedCard").style.transform= 'translateX(0%)'
      document.getElementById("topOfTheDeck").style.transform= 'translateX(0%)'
      endOfTurn()
    }
  }
}


//click events for clickable cards
document.getElementById("upturnedCard").addEventListener('click', clickUpturnedCard)
document.getElementById("topOfTheDeck").addEventListener('click', clickTopOfTheDeck)
document.getElementById("yourFirstCard").addEventListener('click', clickYourFirstCard)
document.getElementById("yourSecondCard").addEventListener('click', clickYourSecondCard)
document.getElementById("yourThirdCard").addEventListener('click', clickYourThirdCard)

//player to left of dealer goes first



//BIG FUNCTION, computer player must decide what to do on their turn
function takeATurnCP() {
  console.log(activePlayer.hand)
   //need to know active player total points, high suit, figured out here by calc function then logged for testing
  activePlayer.calculateHandPointValue()
  console.log(activePlayer.winningSuit)
  console.log(activePlayer.highCardValue)
  console.log(activePlayer.offSuitCardsInHand)

  //GAME LOGIC
  //MAYBE how to check array for same thing multiple times to know if suit in hand more than once, cuz if two or three cards of same suit then more likely to stick with that, will use pull all suits into array and then use Set, compare length, check length of set to know if 2 or 3 of same suit
  //IF PLAYER HAS THREE DIFFERENT SUITS OR TWO SUITS AND SECOND SUIT VALUE IS HIGH
  if (activePlayer.winningSuit == topOfTheDiscardPile.suit) {
    // if total value for winning suit is >= 16
    if (activePlayer.winningSuitScore >= 16) {
      //if you have an offsuit card that's 7 or less (aka something easy to discard)
      if (activePlayer.offSuitCardsInHand.length > 0 && convertToNum(activePlayer.offSuitCardsInHand[0].value) <= 7) {
        //you know you will discard this card, so let's plan that so we can put it somewhere in a sec
        activePlayer.planningToDiscard = activePlayer.offSuitCardsInHand[0]
        //ditch this lowest offsuit card
        activePlayer.hand.splice(activePlayer.hand.findIndex(item => item.code === offSuitCardsInHand[0].code), 1)
        //take the upturned card into hand
        activePlayer.hand.unshift(topOfTheDiscardPile)
        //put the discard on the top of the discard pile
        topOfTheDiscardPile = activePlayer.planningToDiscard
        //be sure to change the image
        document.querySelector('#upturnedCard').src = topOfTheDiscardPile.image
        //END
        endOfTurn
      }
      //if you don't have offsuit card or your offsuit card is high
      else {
        //if this upturned card improves your score (this may be a lot, would have to calculate hand value based on three different discard options?) DO THIS LEFT OFF HERE
        if (2+2) {
          //early in game NEED TO CHECK THAT I'VE CODED FOR COUNTER TO GO UP WHEN NEEDED
          if (totalTurnsPlayed < 12) {
            //if improves to 23 or more
             //you take it
             //END
             endOfTurn
            //else doesn't improve enough
              //take chance with top of deck
              //END
              endOfTurn
          }
          //late game
          else {
            //if improves to 26 or more
              //you take it
              //END
              endOfTurn
            //else doesn't improve enough
              //take chance with top of deck
              //END
              endOfTurn
          }
        }
        //else (if taking this card would worsen your score or not improve it enough
        else {
          //you check top of deck card instead
          //if top of deck doesn't match existing suits
          if (2+2) {
            //if it will improve score
              //then take it and discard lowest or off
              //END
              endOfTurn
            //else (if it doesn't increase score)
              //then discard it
              //END
              endOfTurn
          }
          //if top of deck is offsuit
            //you discard it
            //END
            endOfTurn
        }
      }}
    }
   if (2+2) {
      if (convertToNum(topOfTheDiscardPile.value) >=7) {
        //if you have a card(s) of same suit that is 8 or more (so you'd have 15+)
        if (2+2) {
          //take upturned card because you are desperate for points, discard card of different suit with lowest value
          //END
          endOfTurn
        }
        //else
        else {
          //take chance with deck, discard lowest value offsuit (lowest on if all three are the same)
          //END
          endOfTurn
        }
        }
      else {
        //take chance with deck
        //END
        endOfTurn
      }
    }
  else if (2+2) { //if (activePlayer.highCardValue < 7)
      //if upturned card is 9 or more,...
        //if it doesn't hurt your score...
          //then take it
          //END
          endOfTurn
        //else take chance and draw
          //if can improve your score...
            //then keep it
            //END
            endOfTurn
          //else
            //discard it
            //END
            endOfTurn
    
  }
  //IF PLAYER HAS TWO SUITS AND SECOND SUIT VALUE IS LOW
  //IF UPTURNED CARD IS 9 OR MORE AND SECOND SUIT VALUE IS 5 OR LESS
    //TAKE UPTURNED and discard that low card END
  //if player has all three cards same suit and hand value is 23 or more
    //only take on suits that improve score, otherwise draw from deck



  //from above NEED TO MAKE A FUNCTION THAT COMPARES WHAT TOTAL POINTS WOULD BE BASED ON DIFFERENT DISCARDS SO THAT COMPUTER MAKES THE MOST LOGICAL CHOICE, make that and for now make the computer turn just based on that, get fancy later.
  //if upturned is higher than total points, take it and discard lowest card of different suit
  //if upturned card won't help (it's a different suit and/or too low) take top of the deck
  //once top of the deck is revealed, similar logic applied as above, can use activeplayer.chosencard variable again to make things apply to either uptuned or topofdeck.
  console.log(activePlayer.hand)
}
//may take upturned card in exchange for one of theirs OR
//draw top card from the deck and then choose one to discard to top of the pile
//first need to check players current score

//play continues clockwise around the table until one player thinks they can win...

//NEED TO THINK ABOUT WHERE KNOCK BUTTON WILL GO, MAYBE ALTER CURSOR TO BE A KNOCKING FIST AND DOUBLE CLICK KNOCK ON THE TABLE?
//if they think they can win, they knock on their turn instead of getting a new card, and the others get one more turn


//FOR THE ONES WHERE TWO PEOPLE TIE FOR LOSING NEED TO ADD TO CHECK FOR HIGHEST RANKING CARD!! Need to figure out what suit they are using and what they value of that highest card of that suit is
//Compare cards, highest total score wins
function seeWhoWonThatRound() {
  var allPlayersPoints = {"Player 1": player1.points, "Player 2": player2.points, "Player 3": player3.points}
  for (var player in allPlayersPoints) {
    console.log(player + " has " + allPlayersPoints[player] + " points");
  }
  if (player1.points != player2.points) {
    if (player1.points != player3.points) {
      //if all players have unique scores as determined by the above
      if (player1.points > player2.points) {
        if (player1.points > player3.points) {
          console.log("Player 1 wins!")
        }
        if (player1.points < player3.points) {
          console.log("Player 3 wins!")
        }}
      if (player1.points < player2.points) {
        if (player2.points > player3.points) {
          console.log("Player 2 wins!")
        }
        if (player2.points == player3.points) {
          console.log("Players 2 and 3 have tied!")
        }
        if (player2.points < player3.points) {
          console.log("Player 3 wins!")
        }
        }
      }
    //if player 1 = player 3 but not equal to player 2 as determined by the above
    else {
      if (player1.points < player2.points) {
        console.log("Player 2 wins!")
      }
      else {
        console.log("Players 1 and 3 have tied!")
      }
    }
      }
  //if player 1 = player 2 as determined by the above
  else if (player1.points != player3.points) {
    if (player1.points > player3.points) {
      console.log("Players 1 and 2 have tied!")
    }
    else {
      console.log("Player 3 wins!")
    }
  }
  else {
    console.log("All players have tied!")
  }
}
//if there is a tie for highest score...
//If there is a tie for the highest score, the player with the highest-ranking card wins. 
//Example: K, Q, 6 (total 26) would beat Q, 9, 7 (also total 26). If there is a tie in the highest cards,
//the next highest cards are compared, and so on.


//Check for Skit Skat function will happen at the end of turn after card is taken, If a player gets 31 points at any point they call "Skit Skat!" and win right then and there, this will have to check all players points so we can call anytime including with initial deal (the calculate function will be run already, this will just look at this.points).  If the skit skat happens then non-active players all put in
function checkForSkitSkat() {
console.log(`Player 1: ${player1.points}\nPlayer 2: ${player2.points}\nPlayer 3: ${player3.points}`)
if (activePlayer.points == 31) {
  console.log(`Player 1: ${player1.points}\nPlayer 2: ${player2.points}\nPlayer 3: ${player3.points}`)
  //alert pops up, would like to replace with something prettier later
  alert(`SKIT SKAT! ${activePlayer.name} won!`)
  //non-active two players put in a coin
  allPlayers.forEach(player => { if (player.active == false) {player.putInCoin()}})
  //console log to show that coins went in
  console.log(`skit skat happened and ${activePlayer.name} won and coin status is ${player1.coins}, ${player2.coins}, ${player3.coins}`)
}
}


//accordian with object and how to play
var acc = document.getElementsByClassName("accordion");
var i;

for (i = 0; i < acc.length; i++) {
  acc[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var panel = this.nextElementSibling;
    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
    } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
    }
  });
}
//Background story of where the game came from with a picture of my grandmother and great-grandmother
//<p> This game is a variant of 31 and very similar to a game called Blitz. I do not know where the name "Skit Skat" came from,
//but that is always what we called it.  My great-grandmother (whom we called GiGi) taught my grandmother and I to play many years ago,
//and it was our most played card game for many years.  I have many fond memories of sitting around the table with those wonderful women,
//playing Skit Skat.  I made this game as a tribute to them.</p>
