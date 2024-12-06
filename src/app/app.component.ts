import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  players: string[] = [];
  currentPlayerIndex: number = 0;
  rolls: number[] = [];
  score: number[] = [];
  currentRollCount: number = 3;
  keptDice: number[] = [];
  mexCount: number[] = [];
  roundOver: boolean = false;
  winner: string = '';
  playersRolled: boolean[] = [];
  losingPlayerIndex: number = 0;
  rollsUsedForMex: number = 0;
  playersPlayed: boolean[] = [];
  maxRollsForRest: number = 3;
  newPlayerName: string = '';
  tiedPlayers: number[] = [];
  inTieBreaker: boolean = false;

  rollDice(): void {
    if (this.currentRollCount <= 0 || this.roundOver) {
      return;
    }

    let roll1 = this.keptDice.includes(1) ? 1 : Math.floor(Math.random() * 6) + 1;
    let roll2 = this.keptDice.includes(2) ? 2 : Math.floor(Math.random() * 6) + 1;

    this.rollsUsedForMex++;

    if (roll1 === 1 || roll2 === 1) {
      this.keptDice.push(1);
    }
    if (roll1 === 2 || roll2 === 2) {
      this.keptDice.push(2);
    }

    this.rolls = [roll1, roll2];
    this.calculateScore();

    if ((roll1 === 1 && roll2 === 2) || (roll1 === 2 && roll2 === 1)) {
      this.mexCount[this.currentPlayerIndex]++;
      this.maxRollsForRest = this.rollsUsedForMex;
      this.nextPlayer();
    } else if ((roll1 === 1 && roll2 === 3) || (roll1 === 3 && roll2 === 1)) {
      this.nextPlayer();
    } else {
      this.currentRollCount--;
    }

    if (this.currentRollCount <= 0) {
      this.nextPlayer();
    }
  }

nextPlayer(): void {
  this.keptDice = [];
  this.rollsUsedForMex = 0;
  this.currentRollCount = this.maxRollsForRest;

  this.playersRolled[this.currentPlayerIndex] = true; // Markeer dat de huidige speler heeft gegooid

  // Controleer of alle spelers hebben gegooid
  const allPlayersRolled = this.playersRolled.every(player => player);

  if (allPlayersRolled) {
    this.roundOver = true;
    this.calculateLoser();
    return;
  }

  let nextIndex = (this.currentPlayerIndex + 1) % this.players.length;
  while (this.playersRolled[nextIndex]) {
    nextIndex = (nextIndex + 1) % this.players.length;
  }

  this.currentPlayerIndex = nextIndex;
}

resetRound(): void {
  this.score = [];
  this.mexCount = Array(this.players.length).fill(0);
  this.roundOver = false;
  this.playersRolled = Array(this.players.length).fill(false); // Reset de array die bijhoudt wie heeft gegooid
  this.currentPlayerIndex = this.losingPlayerIndex;
  this.currentRollCount = 3;
  this.maxRollsForRest = 3;
  this.keptDice = [];
  this.rolls = [];
}



  calculateScore(): void {
    let [roll1, roll2] = this.rolls;
    if (roll1 > roll2) {
      this.score[this.currentPlayerIndex] = roll1 * 10 + roll2;
    } else {
      this.score[this.currentPlayerIndex] = roll2 * 10 + roll1;
    }

    if (roll1 === roll2) {
      this.score[this.currentPlayerIndex] = roll1 * 100;
    }
  }

  calculateLoser(): void {
    const mexScore = 21;

    const validScores = this.score.filter(score => score !== mexScore);

    if (validScores.length === 0) {
      this.winner = 'No loser, everyone rolled Mex!';
      return;
    }

    const minScore = Math.min(...validScores);

    this.tiedPlayers = this.score
      .map((score, index) => (score === minScore ? index : -1))
      .filter(index => index !== -1);

    if (this.tiedPlayers.length > 1) {
      this.inTieBreaker = true;
      this.currentPlayerIndex = this.tiedPlayers[0];
      this.currentRollCount = 1;
      console.log(`Tiebreak started for players: ${this.tiedPlayers.map(i => this.players[i]).join(', ')}`);
    } else {
      this.losingPlayerIndex = this.tiedPlayers[0];
      this.winner = this.players[this.losingPlayerIndex];
      console.log(`The loser is: ${this.players[this.losingPlayerIndex]}`);
    }
  }



  getTotalMex(): number {
    return this.mexCount.reduce((total, count) => total + count, 0);
  }

  addPlayer(): void {
    if (this.newPlayerName.trim()) {
      this.players.push(this.newPlayerName.trim());
      this.mexCount.push(0);
      this.newPlayerName = '';
    }
    this.resetRound();
  }
}
