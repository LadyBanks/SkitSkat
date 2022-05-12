//currently trying to figure out piles


let deckID = ''

fetch(`https://deckofcardsapi.com/api/deck/bvrzjyf2ozqz/draw/?count=2`)
.then(res => res.json()) // parse response as JSON
.then(data => {
  console.log(data)
  deckID = data.deck_id
  
})
.catch(err => {
    console.log(`error ${err}`)
});
document.querySelector('button').addEventListener('click', drawTwo)

function drawTwo(){
  const url = `https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=2`
  fetch(url)
      .then(res => res.json()) // parse response as JSON
      .then(data => {
      document.querySelector('#player1').src = data.cards[0].image
      document.querySelector('#player2').src = data.cards[1].image
      let player1Val = convertToNum(data.cards[0].value)
      let player2Val = convertToNum(data.cards[1].value)
      let player1Code = data.cards[0].code
      let player2Code = data.cards[1].code
      if (player1Val > player2Val) {
        document.querySelector('h3').innerText = 'Player 1 Wins!'
        let player1Pile = `https://deckofcardsapi.com/api/deck/${deckID}/pile/player1Pile/add/?cards=${player1Code},${player2Code}`
        fetch(player1Pile)
          .then(res => res.json()) // parse response as JSON
          .then(data => {
          console.log(data.remaining)
          })}
      else if (player1Val < player2Val) {
        document.querySelector('h3').innerText = 'Player 2 Wins!'
        let player2Pile = `https://deckofcardsapi.com/api/deck/${deckID}/pile/player2Pile/add/?cards=${player1Code},${player2Code}`
      
      }
      else {
        document.querySelector('h3').innerText = 'TIME FOR WAR!'

      }
      })

      .catch(err => {
          console.log(`error ${err}`)
      });
}


function convertToNum(val) {
  if(val === 'ACE') {
    return 14
  } else if (val === 'KING') {
    return 13
  } else if (val === 'QUEEN') {
    return 12
  } else if (val === 'JACK') {
    return 11
  } else {
    return Number(val)
  }
}
