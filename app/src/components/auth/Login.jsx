import './Login.css';
import {useNavigate} from "react-router-dom";
import {useState} from "react";

const Login = () => {
    const [errorMessage, setErrorMessage] = useState('')

    const navigate = useNavigate();


    const handleSubmit = (event) => {
        event.preventDefault();
        const username = event.target.username.value;

        fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({username}),
        })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Login failed');
                }
            })
            .then((data) => {
                localStorage.setItem('token', data.token);
                navigate('/');
            }).catch((error) => {
            setErrorMessage(error.message);
        });
    }


    return (
        <div className="content">
            <form onSubmit={handleSubmit}>
                <label htmlFor="username">Username</label>
                <input type="text" id="username" name="username"/>
                <button type="submit">Login</button>
                {errorMessage && <p>{errorMessage}</p>}
            </form>
        </div>
    );
}

export default Login;
