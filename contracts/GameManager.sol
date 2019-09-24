pragma solidity ^0.5.0;

import {TicTacToe} from "./TicTacToe.sol";
import {HighScoreManager} from "./HighScoreManager.sol";

contract GameManager {
    HighScoreManager public highScoreManager;
    
    event EventGameCreated(address _player, address _gameAddress);
    
    mapping(address => bool) allowedToEnterHighscore;
    
    constructor() public {
        highScoreManager = new HighScoreManager(address(this));
    }
    
    modifier onlyInGameHighscoreEditing() {
        require(allowedToEnterHighscore[msg.sender], "You are not allowed to enter a highscore.");
        _;
    }
    
    function enterWinner(address _winner) public onlyInGameHighscoreEditing {
        highScoreManager.addWin(_winner);
    }
    
    function getTopTen() public view returns(address[10] memory, uint[10] memory) {
        return highScoreManager.getTopTen();
    }
    
    function startNewGame() public payable {
        TicTacToe ticTacToe = (new TicTacToe).value(msg.value)(address(this), msg.sender);
        allowedToEnterHighscore[address(ticTacToe)] = true;
        emit EventGameCreated(msg.sender, address(ticTacToe));
    }
}