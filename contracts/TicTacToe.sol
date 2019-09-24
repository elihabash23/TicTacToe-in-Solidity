pragma solidity ^0.5.0;

import {GameManager} from "./GameManager.sol";

contract TicTacToe {
    
    GameManager gameManager;
    
    uint256 gameCost = 0.1 ether;
    
    address payable public player1;
    address payable public player2;
    
    address payable activePlayer; 
    
    event PlayerJoined(address _player);
    event NextPlayer(address _player);
    
    event GameOverWithWin(address _winner);
    event GameOverWithDraw();
    event PayoutSuccess(address _receiver, uint amountInWei);

    uint8 movesCount;
    
    uint balanceToWithdrawPlayer1;
    uint balanceToWithdrawPlayer2;
    
    bool gameActive;

    address[3][3] gameGrid;
    
    uint gameValidUntil;
    uint timeToReact = 3 minutes;
    
    constructor(address _addrGameManager, address payable _player1) public payable {
        gameManager = GameManager(_addrGameManager);
        require(msg.value == gameCost, "Please enter the correct amount of money to play.");
        player1 = _player1;
        // more functionality later
    }
    
    function joinTheGame() public payable {
        // here player 2 joins the game
        assert(player2 == address(0x0));
        assert(gameActive == false);
        require(msg.value == gameCost, "Please enter the right amount of money to join the game");
        
        player2 = msg.sender;
        emit PlayerJoined(player2);
        
        if (block.number % 2 == 0) {
            activePlayer = player2;
        } else {
            activePlayer = player1;
        }
        
        gameActive = true;
        
        gameValidUntil = now + timeToReact;
        
        emit NextPlayer(activePlayer);
    }
    
    function getGrid() public view returns(address[3][3] memory) {
        // here we return the grid
        return gameGrid;
    }
    
    function setMark(uint8 x, uint8 y) public {
        uint8 gridSize = uint8(gameGrid.length);
        require(gameGrid[x][y] == address(0));
        assert(gameActive);
        assert(x < gridSize);
        assert(y < gridSize);
        require(msg.sender == activePlayer);
        require(gameValidUntil >= now); 
        movesCount++;
        gameGrid[x][y] = msg.sender;
        
        //check if there is a win
        for (uint8 i = 0; i < gridSize; i++) {
            if (gameGrid[i][y] != activePlayer) {
                break;
            }
            
            if (i == gridSize - 1) {
                setWinner(activePlayer);
                return;
            }
        }
        
        for (uint8 i = 0; i < gridSize; i++) {
            if (gameGrid[x][i] != activePlayer) {
                break;
            }
            
            if (i == gridSize - 1) {
                setWinner(activePlayer);
                return;
            }
        }
        
        //diagonal
        if (x == y) {
            for (uint8 i = 0; i < gridSize; i++) {
                if (gameGrid[i][i] != activePlayer) {
                    break;
                }
                
                if (i == gridSize - 1) {
                    setWinner(activePlayer);
                    return;
                }
            }
        }
        
        //anti-diagonal
        if (x + y == gridSize - 1) {
            for (uint8 i = 0; i < gridSize; i++) {
                if (gameGrid[i][gridSize - 1 - i] != activePlayer) {
                    break;
                }
                
                if (i == gridSize - 1) {
                    setWinner(activePlayer);
                    return;
                }
            }
        }
        
        //check if it's a draw
        if (movesCount ==  gridSize**2) {
            setDraw();
            return;
        }
        
        if (activePlayer == player1) {
            activePlayer = player2;
        } else {
            activePlayer = player1;
        }
        
        
        emit NextPlayer(activePlayer);
    }
    
    function setWinner(address payable _player) private {
        gameActive = false;
        gameManager.enterWinner(_player);
        uint balanceToPayOut = address(this).balance;
        
        if (_player.send(balanceToPayOut) != true) {
            if (_player == player1) {
                balanceToWithdrawPlayer1 += balanceToPayOut;
            } else {
                balanceToWithdrawPlayer2 += balanceToPayOut;
            }
        } else {
            emit PayoutSuccess(_player, balanceToPayOut);
        }
        
        emit GameOverWithWin(_player);
        
    }
    
    function setDraw() private {
        uint balanceToPayOut = address(this).balance / 2;
        
        if (player1.send(balanceToPayOut) == false) {
            balanceToWithdrawPlayer1 += balanceToPayOut;
        } else {
            emit PayoutSuccess(player1, balanceToPayOut);
        }
        if (player2.send(balanceToPayOut) == false) {
            balanceToWithdrawPlayer2 += balanceToPayOut;
        } else {
            emit PayoutSuccess(player2, balanceToPayOut);
        }
        
        emit GameOverWithDraw();
    }
    
    function withdrawWin(address payable _to) public {
        uint balanceToWithdraw;
        
        if (msg.sender == player1) {
            require(balanceToWithdrawPlayer1 > 0);
            balanceToWithdraw = balanceToWithdrawPlayer1;
            balanceToWithdrawPlayer1 = 0;
            _to.transfer(balanceToWithdraw);
            emit PayoutSuccess(_to, balanceToWithdraw);
        }
        
        if (msg.sender == player2) {
            require(balanceToWithdrawPlayer2 > 0);
            balanceToWithdraw = balanceToWithdrawPlayer2;
            balanceToWithdrawPlayer2 = 0;
            _to.transfer(balanceToWithdraw);
            emit PayoutSuccess(_to, balanceToWithdraw);
        }
    }
    
    function emergencyCashOut() public {
        require(gameValidUntil < now);
        require(gameActive);
        setDraw();
    }
}