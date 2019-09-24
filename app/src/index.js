import Web3 from "web3";
import contract from "truffle-contract";
import $ from "jquery";

import gameManagerArtifact from "../../build/contracts/GameManager.json";
import ticTacToeArtifact from "../../build/contracts/TicTacToe.json";


const App = {
  web3: null,
  account: null,
  account2: null,
  activeAccount: null,
  gameManager: null,
  ticTacToe: null,
  activeTicTacToeInstance: null,

  start: async function() {
    const { web3 } = this;

    try {

      this.gameManager = contract(gameManagerArtifact);
      this.gameManager.setProvider(web3.currentProvider);

      this.ticTacToe = contract(ticTacToeArtifact);
      this.ticTacToe.setProvider(web3.currentProvider);

      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];
      this.activeAccount = this.account;
      this.account2 = accounts[1];

      this.gameManager.defaults({
        from: this.account
      });

      this.ticTacToe.defaults({
        from: this.account
      });

      this.refreshHighscore();
      this.gameStopped();

    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },

  setAccount2: async function() {
    this.ticTacToe.defaults({
      from: this.account2
    });
    this.activeAccount = this.account2;
  },

  gameStopped: async function() {
    $(".game-stopped").show();
    $(".game-over").hide();
    $(".game-running").hide();
  },

  gameRunning: async function() {
    $(".game-stopped").hide();
    $(".game-over").hide();
    $(".game-running").show();
  },

  gameJoining: async function() {
    $(".game-stopped").hide();
    $(".game-over").show();
    $(".game-running").hide();
  },

  gameOver: async function() {
    $(".game-stopped").hide();
    $(".game-over").show();
    $(".game-running").show();
  },

  refreshHighscore: async function() {
    const {gameManager} = this;
    let gameManagerInstance = await gameManager.deployed();
    let top10 = await gameManagerInstance.getTopTen();
    let table = $("#highscore");
    top10[0].forEach(function(value, index) {
      table.append("<tr><td>" + (index + 1) + "</td><td>" + value + "</td><td>" + top10[1][index] + "</td></tr>");
    });
  },

  createNewGame: async function() {
    const {gameManager, web3, ticTacToe} = this;
    this.gameJoining();
    let gameManagerInstance = await gameManager.deployed();
    let transactionResult = await gameManagerInstance.startNewGame({value: web3.utils.toWei("0.1", "ether")});
    console.log(transactionResult);
    this.activeTicTacToeInstance = await ticTacToe.at(transactionResult.logs[0].args._gameAddress);

    this.setStatus("Game Address: " + transactionResult.logs[0].args._gameAddress);

    this.activeTicTacToeInstance.PlayerJoined().on('data', function(event) {
      console.log(event);
      App.gameRunning();
    });

    this.listenToEvents();
  },

  joinGame: async function(gameAddress) {
    const {web3, ticTacToe} = this;
    this.activeTicTacToeInstance = await ticTacToe.at(gameAddress);
    this.listenToEvents();
    await this.activeTicTacToeInstance.joinTheGame({value: web3.utils.toWei("0.1", "ether")});
  },

  setMark: async function(event) {
    console.log(event);
    await event.data.instance.setMark(event.data.x, event.data.y);
    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < 3; j++) {
        $($("#board")[0].children[0].children[i].children[j]).off('click'); 
      }
    }
  },

  updateGrid: async function(clickable) {
    let grid = await this.activeTicTacToeInstance.getGrid();
    console.log(grid);
    for (var i = 0; i < grid.length; i++) {
      for (var j = 0; j < grid[i].length; j++) {
        if (grid[i][j] == this.activeAccount) {
          $("#board")[0].children[0].children[i].children[j].innerHTML = "X";
        } else if (grid[i][j] != 0){
          $("#board")[0].children[0].children[i].children[j].innerHTML = "O";
        }
      }
    }
    if (clickable) {
      for (var i = 0; i < grid.length; i++) {
        for (var j = 0; j < grid.length; j++) {
          if ($("#board")[0].children[0].children[i].children[j].innerHTML == "") {
            $($("#board")[0].children[0].children[i].children[j]).off('click').click({
              x: i,
              y: j,
              instance: this.activeTicTacToeInstance
            }, App.setMark);
          } 
        }
      }
    }  
  },
  listenToEvents: async function() {
    const {activeTicTacToeInstance, web3} = this;

    let self = this;

    activeTicTacToeInstance.NextPlayer().on('data', function(event) {
      console.log(event); 
      self.gameRunning();
      if (event.args._player == self.activeAccount) {
        self.setStatus("Your turn!");
        self.updateGrid(true);
      } else {
        self.setStatus("Waiting for opponent");
        self.updateGrid(false);
      }
    });

    activeTicTacToeInstance.GameOverWithWin().on('data', function(event) {
      if (event.args._winner == self.activeAccount) {
        self.setStatus("Congratulations, you are the winner!");
      } else {
        self.setStatus("You lost :(");
      }
      self.updateGrid(false);
      self.gameOver();
    });

    activeTicTacToeInstance.GameOverWithDraw().on('data', function(event) {
      self.setStatus("It's a draw!");
      self.updateGrid(false);
      self.gameOver();
    });
  },

  setStatus: function(message) {
    const status = document.getElementById("status");
    status.innerHTML = message;
  },
};

window.App = App;

window.addEventListener("load", function() {
  // if (window.ethereum) {
  //   // use MetaMask's provider
  //   App.web3 = new Web3(window.ethereum);
  //   window.ethereum.enable(); // get permission to access accounts
  // } else {
  //   console.warn(
  //     "No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live",
  //   );
  //   // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
  //   App.web3 = new Web3(
  //     new Web3.providers.WebsocketProvider("ws://127.0.0.1:7545"),
  //   );
  // }
  console.warn(
    "No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live",
  );
  // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
  App.web3 = new Web3(
    new Web3.providers.WebsocketProvider("ws://127.0.0.1:7545"),
  );

  App.start();
});
