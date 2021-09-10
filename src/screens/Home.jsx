import React, {useState} from 'react'
import styled from 'styled-components'
import { elements, winnerConditions } from '../constants'
import AuthCard from '../components/AuthCard'
import { useHistory } from "react-router-dom";


const Home = props => {
    const history = useHistory()

    const [authForm, updateAuthForm] = useState({
        username: '',
        password: '',
    })
    const [isLoginProcess, changeIsLoginProcess] = useState(true)
    const [loading, setLoading] = useState(false)

    const handleChange = e => {
        const { name, value } = e.target
        updateAuthForm({...authForm, [name]: value })
    }

    const handleLogin = () => {
        history.push('/create-game')
    }

    const handleRegister = () => {
        history.push('/create-game')
    }

    const authButtonRenderer = () => {
        let button = new Object()

        if(isLoginProcess) {
            button = {
                text: 'Login',
                onClick: handleLogin,
                disabled: loading,
                loading: loading
            }
        }else{
            button = {
                text: 'Register',
                onClick: handleRegister,
                disabled: loading,
                loading: loading
            }
        }
        return button
    }

    const authSubRouterRenderer = () => {
        let subRouter = new Object()

        if(isLoginProcess) {
            subRouter = {
                text: 'Create Account',
                onClick: () => changeIsLoginProcess(false)
            }
        }else{
            subRouter = {
                text: 'Have Account? do Login',
                onClick: () => changeIsLoginProcess(true)
            }
        }
        return subRouter
    }

    return (
        <Container>
            <AuthCard 
                title={isLoginProcess ? 'Login' : 'Register'}
                formData={authForms}
                onChange={(e) => handleChange(e)}
                button={authButtonRenderer()}
                subRouters={authSubRouterRenderer()}
            />
        </Container>
    )
}

export default Home

const authForms = [
    {
        label: 'Username',
        type: 'text',
        placeholder: 'Enter your username',
        required: true,
        name: 'username',
    },
    {
        label: 'Password',
        type: 'password',
        placeholder: 'Enter your password',
        required: true,
        name: 'password',
    },
]


const Container = styled.div`
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
    align-items:center;
    .formWrapper{
        width: 90%;
        margin-top: 3rem;
        .subRouterWrapper{
            width: 100%;
            margin-top: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            .subRouterText{
                text-align-center;
                font-size: 20px;
                font-weight: bold;
            }
        }
        .submitButton{
            width: 100%
        }
    }
    .title{
        font-size: 20px;
        font-weight: bold;
        margin-top: 5rem;
        width: 90%
    }
    
`