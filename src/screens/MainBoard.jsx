import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { elements, winnerConditions } from '../constants'
import { getGameDataApi, updateGameData } from '../api/game'
import { useLocation, useNavigate } from 'react-router-dom';
import customToast from '../utils/toast'
import { useUserContext } from '../hooks/useUserContext'

let getGameDataInterval;
const MainBoard = props => {
    const location = useLocation()
    const navigate = useNavigate()
    const user = useUserContext()
    const { inviteCode } = location.state
    const [players, updatePlayers] = useState({
        player_x: '',
        player_o: '',
        currentTurn: 0
    })
    const [winner, setWinner] = useState({status: false, id: 4, condition: []})
    const [squares, setSquares] = useState(elements.map(item => {return {...item}}))
    //or use this to create array of object unique => useState(JSON.parse(JSON.stringify(elements))) 
    const [playerOneSquaresId, setPlayerOneSquaresId] = useState([])
    const [playerTwoSquaresId, setPlayerTwoSquaresId] = useState([])

    const handleClickOnSquare = (elementId, uNumber) => {
        let tempArray = JSON.parse(JSON.stringify(squares))
        let nextPlayer = players.currentTurn === 0 ? 1 : 0
        const playerOne = [...playerOneSquaresId]
        const playerTwo = [...playerTwoSquaresId]

        updatePlayers(players => ({...players, currentTurn: nextPlayer }))

        if(tempArray[elementId].owner === 0) {
            tempArray[elementId].owner = uNumber
            if(uNumber === 1) playerOne.push(elementId)
            else playerTwo.push(elementId)
        } 
        else return
        setPlayerOneSquaresId(playerOne)
        setPlayerTwoSquaresId(playerTwo)
        checkWinner(playerOne, playerTwo, tempArray, nextPlayer)
    }

    const checkWinner = async (playerOne, playerTwo, tempArray, nextPlayer) => {
        let winnerCondition = []
        let webServerBoard = tempArray.map(item => item.owner)
        let webServerWinner = 4
        let webServerWinnerCondition = new Array(3).fill(0)
        let gameStatus = 1

        winnerConditions.forEach(condition => {
            if (condition.every(squareNum => playerOne.includes(squareNum))) {
                setWinner({status: true, id: 1, condition}) 
                winnerCondition = condition
                webServerWinner = 0
                webServerWinnerCondition = condition
                gameStatus = 3
            }
            if (condition.every(squareNum => playerTwo.includes(squareNum))) {
                setWinner({status: true, id: 2, condition})
                winnerCondition = condition
                webServerWinner = 1
                webServerWinnerCondition = condition
                gameStatus = 3
            }
            // The every() method tests whether all elements in the array pass the test implemented by the provided function. It returns a Boolean value.
        })

        if(winnerCondition.length === 0 && tempArray.every(item => item.owner !== 0)) webServerWinner = 3
  
        tempArray.forEach(square => {
            if(winnerCondition.includes(square.id)){
                square.isWinnerSquare = true
            }
        })
        try{
            await updateGameData({
                code: inviteCode, 
                board: webServerBoard,
                winner: webServerWinner,
                winCondition: webServerWinnerCondition,
                gameStatus,
                nextPlayer
            })
        }catch(error){
            customToast.error('could not update board!');
        }
        setSquares(tempArray)
    }

    const getGameData = async (code) => {
        try{
            const tempArray = squares
            const playerOne = [...playerOneSquaresId]
            const playerTwo = [...playerTwoSquaresId]

            let res = await getGameDataApi(code)
            
            if(res.status === 200){
                updatePlayers({
                    player_x: res.data.playerX,
                    player_o: res.data.playerO,
                    currentTurn: res.data.nextPlayer
                })
                if(res.data.winner < 3) {
                    setWinner({
                        status: true, 
                        id: res.data.winner,
                        condition: res.data.winCondition
                    })
                    tempArray.forEach(square => {
                        if(res.data.winCondition.includes(square.id)){
                            square.isWinnerSquare = true
                        }
                    })
                }else if(res.data.winner === 3) {
                    setWinner({
                        status: false, 
                        id: res.data.winner,
                        condition: []
                    })
                }
                tempArray.forEach(item => {
                    item.owner = res.data.gameBoard[item.id]
                    if(res.data.gameBoard[item.id] === 1) playerOne.push(item.id)
                    else if(res.data.gameBoard[item.id] === 2) playerTwo.push(item.id)
                    else return
                })
                
                setSquares(tempArray)
                setPlayerOneSquaresId(playerOne)
                setPlayerTwoSquaresId(playerTwo)
            }
        }catch(error){
            if(error.status === 404) {
                navigate("/create-game");
            }
            console.log(error);
        }
    }

    const handleGoBack = () => {
        navigate("/create-game");
        // setUserNumber(1)
        // setSquares(JSON.parse(JSON.stringify(elements)))
        // setWinner({status: false, id: null})
        // setPlayerOneSquaresId([])
        // setPlayerTwoSquaresId([])
    }

    const renderMark = (owner) => {
        switch (owner) {
            case 1:
                return 'X'
            case 2:
                return 'O'
            default:
                return null
        }
    }

    const disableBoardFunction = () => {
        let bool = true
        if(winner.status) return false
        if(user.userInfo.username === players.player_x) {
            if(players.currentTurn !== 0) bool = false
        }else{
            if(players.currentTurn === 0) bool = false
        }
        return bool
    }

    const noticeBoard = () => {
        if(winner.status) {
            if(winner.id === 0) return <span> Winner is: {players.player_x}</span>
            else if(winner.id === 1) return <span>Winner is: {players.player_o}</span>
        }else if(winner.id === 3) {
            return <span>OOPS. No one won!</span>
        }else{
            if(players.currentTurn === 0) return <span>{players.player_x}</span>
            else if(players.currentTurn === 1) return <span>{players.player_o}</span>
        }
    }

    useEffect(() => {
        //call a interval to call API and get game data to simulate a game live
        getGameDataInterval = setInterval(() => getGameData(inviteCode), 1000)
        return () => {
            clearInterval(getGameDataInterval)
        }
    }, [])

    return (
        <Container>
            <div className='pageHeader'>
                <Turn hasWinner={winner.status}>
                    {noticeBoard()}
                </Turn>
            </div>
            <BoardWrapper>
                {squares.map(el => 
                    <Square 
                        key={el.id}
                        isWinnerSquare={el.isWinnerSquare}
                        onClick={() => disableBoardFunction() && handleClickOnSquare(el.id, players.currentTurn === 0 ? 1 : 2)}
                    >
                        <span>
                            {renderMark(el.owner)}
                        </span>
                    </Square>
                )}
            </BoardWrapper>
            <RefreshButton onClick={handleGoBack}>
                <span>Back to create game</span>
            </RefreshButton>
        </Container>
    )
}

export default MainBoard

const Container = styled.div`
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
    align-items:center;
    margin-top: 5vh;
    .pageHeader{
        font-size: 25px;
        margin-bottom: 30px 
    }
`
const BoardWrapper = styled.div`
    height: 50vh;
    width: 90vw;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr;
    grid-row-gap: 5px;
    grid-column-gap: 5px;
    position: relative;
    .winnerOverLay{
        background: #000;
        position: absolute;
        width: 100%;
        height: 100%;
        opacity: 0.7;
        border-radius: 15px;
        display: flex;
        justify-content:center;
        align-items:center;
        span{
            font-size: 30px;
            color: #fff;
        }
    }
`
const Square = styled.div`
    background: ${p => p.isWinnerSquare ? '#2b2101' : "#525252"};
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 15px;
    span{
        font-size: 50px;
        color: ${p => p.isWinnerSquare ? '#ffcb55': '#fff'};
    }
`
const Turn = styled.span`
    margin: 10px;
    span{
        text-transform: capitalize;
        font-size: 25px;
        font-weight: bold;
        color: ${p => p.hasWinner ? '#ff9300' : '#000'}
    }
`
const RefreshButton = styled.button`
    margin-top: 5vh;
    width: 90vw;
    height: 50px;
    border: none;
    outline: none;
    border-radius: 15px;
    background-color: #525252;
    span{
        font-size: 20px;
        font-weight: bold;
        color: #fff
    }
`