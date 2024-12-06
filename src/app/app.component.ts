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
  rollsUsedForMex: number = 0;
  maxRollsForRest: number = 3;
  newPlayerName: string = ''; // Variabele voor de invoer van nieuwe spelers
  tiedPlayers: number[] = []; // Indexen van spelers met de laagste score
  inTieBreaker: boolean = false; // Geeft aan of een tiebreak bezig is

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

    if (this.currentPlayerIndex === this.players.length - 1) {
      this.roundOver = true;
      this.calculateLoser();
    } else {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    }
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

    // Filter de spelers die géén Mex hebben gegooid
    const validScores = this.score.filter(score => score !== mexScore);

    // Als iedereen Mex heeft gegooid, is er geen verliezer
    if (validScores.length === 0) {
      this.winner = 'Geen verliezer, iedereen heeft Mex gegooid!';
      return;
    }

    // Zoek de laagste geldige score
    const minScore = Math.min(...validScores);

    // Vind de indexen van de spelers met de laagste score
    this.tiedPlayers = this.score
      .map((score, index) => (score === minScore ? index : -1))
      .filter(index => index !== -1);

    if (this.tiedPlayers.length > 1) {
      // Start een tiebreak
      this.inTieBreaker = true;
      this.currentPlayerIndex = this.tiedPlayers[0]; // Begin met de eerste speler in de tiebreak
      this.currentRollCount = 1; // Elke speler mag één keer gooien
      console.log(`Tiebreak gestart voor spelers: ${this.tiedPlayers.map(i => this.players[i]).join(', ')}`);
    } else {
      // Als er maar één verliezer is, zet die als de verliezer
      this.winner = this.players[this.tiedPlayers[0]];
      console.log(`De verliezer is: ${this.players[this.tiedPlayers[0]]}`);
    }
  }


  resetRound(): void {
    this.score = [];
    this.mexCount = Array(this.players.length).fill(0);
    this.roundOver = false;
    this.currentPlayerIndex = 0;
    this.currentRollCount = 3;
    this.maxRollsForRest = 3;
  }

  // Functie om het totaal aantal Mex te berekenen
  getTotalMex(): number {
    return this.mexCount.reduce((total, count) => total + count, 0);
  }

  // Functie om een speler toe te voegen
  addPlayer(): void {
    if (this.newPlayerName.trim()) {
      this.players.push(this.newPlayerName.trim());
      this.mexCount.push(0); // Voeg een teller voor Mex toe voor de nieuwe speler
      this.newPlayerName = '';
    }
  }
}
