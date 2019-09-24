const GameManager = artifacts.require("GameManager");
const TicTacToe = artifacts.require("TicTacToe");

contract("TicTacToe test win", accounts => {
	it("should be possible to win the game", async () => {
			let gameManagerInstance = await GameManager.deployed();
			let transactionReceipt = await gameManagerInstance.startNewGame({from: accounts[0], value: web3.utils.toWei("0.1", "ether")});
			let ticTacToeInstance = await TicTacToe.at(transactionReceipt.logs[0].args._gameAddress);
			let transactionReceiptJoin = await ticTacToeInstance.joinTheGame({from: accounts[1], value: web3.utils.toWei("0.1", "ether")});
			assert.equal("NextPlayer", transactionReceiptJoin.logs[1].event);

			let transactionReceiptPlayed =  await ticTacToeInstance.setMark(0, 0, {from: transactionReceiptJoin.logs[1].args._player});
			//console.log(transactionReceiptPlayed);
			transactionReceiptPlayed =  await ticTacToeInstance.setMark(0, 1, {from: transactionReceiptPlayed.logs[0].args._player});
			transactionReceiptPlayed =  await ticTacToeInstance.setMark(1, 1, {from: transactionReceiptPlayed.logs[0].args._player});
			transactionReceiptPlayed =  await ticTacToeInstance.setMark(2, 0, {from: transactionReceiptPlayed.logs[0].args._player});
			let winningPlayer = transactionReceiptPlayed.logs[0].args._player;
			transactionReceiptPlayed =  await ticTacToeInstance.setMark(2, 2, {from: transactionReceiptPlayed.logs[0].args._player});

			assert.equal(winningPlayer, transactionReceiptPlayed.logs[1].args._winner, "The winner is not the right player");

			console.log(transactionReceiptPlayed);

			let grid = await ticTacToeInstance.getGrid();
			console.log(grid);
			assert.equal(winningPlayer, grid[0][0], "Left top is occupied by the winner");
			assert.equal(winningPlayer, grid[1][1], "Center is occupied by the winner");
			assert.equal(winningPlayer, grid[2][2], "Right bottom is occupied by the winner");

	})
});
