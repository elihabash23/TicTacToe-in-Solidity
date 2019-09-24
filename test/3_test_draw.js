const GameManager = artifacts.require("GameManager");
const TicTacToe = artifacts.require("TicTacToe");

contract("TicTacToe test Draw", accounts => {
	it("should be possible to end the game with a draw", async () => {
			let gameManagerInstance = await GameManager.deployed();
			let transactionReceipt = await gameManagerInstance.startNewGame({from: accounts[0], value: web3.utils.toWei("0.1", "ether")});
			let ticTacToeInstance = await TicTacToe.at(transactionReceipt.logs[0].args._gameAddress);
			let transactionReceiptJoin = await ticTacToeInstance.joinTheGame({from: accounts[1], value: web3.utils.toWei("0.1", "ether")});
			assert.equal("NextPlayer", transactionReceiptJoin.logs[1].event);

			let player1BalanceBeforeDraw = await web3.eth.getBalance(accounts[0]);
			let player2BalanceBeforeDraw = await web3.eth.getBalance(accounts[1]);

			let transactionReceiptPlayed = await ticTacToeInstance.setMark(0, 0, {from: transactionReceiptJoin.logs[1].args._player});
		
			transactionReceiptPlayed =  await ticTacToeInstance.setMark(1, 0, {from: transactionReceiptPlayed.logs[0].args._player});
			transactionReceiptPlayed =  await ticTacToeInstance.setMark(2, 0, {from: transactionReceiptPlayed.logs[0].args._player});
			transactionReceiptPlayed =  await ticTacToeInstance.setMark(2, 1, {from: transactionReceiptPlayed.logs[0].args._player});
			transactionReceiptPlayed =  await ticTacToeInstance.setMark(2, 2, {from: transactionReceiptPlayed.logs[0].args._player});
			transactionReceiptPlayed =  await ticTacToeInstance.setMark(1, 1, {from: transactionReceiptPlayed.logs[0].args._player});
			transactionReceiptPlayed =  await ticTacToeInstance.setMark(0, 1, {from: transactionReceiptPlayed.logs[0].args._player});
			transactionReceiptPlayed =  await ticTacToeInstance.setMark(0, 2, {from: transactionReceiptPlayed.logs[0].args._player});
			transactionReceiptPlayed =  await ticTacToeInstance.setMark(1, 2, {from: transactionReceiptPlayed.logs[0].args._player});

			let player1BalanceAfterDraw = await web3.eth.getBalance(accounts[0]);
			let player2BalanceAfterDraw = await web3.eth.getBalance(accounts[1]);

			if (transactionReceiptPlayed.logs[0].args._receiver == accounts[0]) {
				assert.equal(accounts[0], transactionReceiptPlayed.logs[0].args._receiver, "Payout must be first account");
				assert.equal(web3.utils.toWei("0.1", "ether"), transactionReceiptPlayed.logs[0].args.amountInWei, "Payout must be 0.1 ether to the first account");
				assert.equal(accounts[1], transactionReceiptPlayed.logs[1].args._receiver, "Payout must be second account");
				assert.equal(web3.utils.toWei("0.1", "ether"), transactionReceiptPlayed.logs[1].args.amountInWei, "Payout must be 0.1 ether to the second account");
			} else {
				assert.equal(accounts[1], transactionReceiptPlayed.logs[0].args._receiver, "Payout must be first account");
				assert.equal(web3.utils.toWei("0.1", "ether"), transactionReceiptPlayed.logs[0].args.amountInWei, "Payout must be 0.1 ether to the first account");
				assert.equal(accounts[0], transactionReceiptPlayed.logs[1].args._receiver, "Payout must be second account");
				assert.equal(web3.utils.toWei("0.1", "ether"), transactionReceiptPlayed.logs[1].args.amountInWei, "Payout must be 0.1 ether to the second account");
			}

			//console.log(transactionReceiptPlayed);

			/*  This doesn't completely work because we have to take the gas consumption into consideration */
			// assert.equal(player1BalanceAfterDraw, parseInt(player1BalanceBeforeDraw) + parseInt(web3.utils.toWei("0.1", "ether")), "There should be a payback of 0.1 ether");
			// assert.equal(player2BalanceAfterDraw, parseInt(player2BalanceBeforeDraw) + parseInt(web3.utils.toWei("0.1", "ether")), "There should be a payback of 0.1 ether");
			assert.equal("GameOverWithDraw", transactionReceiptPlayed.logs[2].event, "Event GameOverWithDraw should have been emitted");

	})
});
