pragma solidity ^0.5.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/GameManager.sol";

contract TestGameManager {
	function testInitialHighscoreIsZero() public {
		GameManager gameManager = GameManager(DeployedAddresses.GameManager());

		(address[10] memory top10Addresses, uint[10] memory top10Wins) = gameManager.getTopTen();

		Assert.equal(top10Wins[0], 0, "Initially there should be no wins");
		Assert.equal(top10Addresses[0], address(0), "Initially the top 10 list should be empty");
	}
}

