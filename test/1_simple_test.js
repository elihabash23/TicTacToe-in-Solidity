const GameManager = artifacts.require("GameManager");
const TicTacToe = artifacts.require("TicTacToe");

contract("TicTacToe test", accounts => {
	it("should have an empty game grid in the beginning", async () => {
			let gameManagerInstance = await GameManager.deployed();
			let transactionReceipt = await gameManagerInstance.startNewGame({value: web3.utils.toWei("0.1", "ether")});
			let ticTacToeInstance = await TicTacToe.at(transactionReceipt.logs[0].args._gameAddress);
			let gameGrid = await ticTacToeInstance.getGrid();

			for (let i = 0; i < 3; i++) {
				for (let j = 0; j < 3; j++) {
					assert.equal(0, gameGrid[i][j], i + " row and " + j + " column must be zero");
				}
			}
	})
});
