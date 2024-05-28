import './Login.css';

const Login = () => {
	return (
		<div className="content">
			<form>
				<label htmlFor="username">Username:</label>
				<input type="text" id="username" name="username"/>
				<label htmlFor="password">Password:</label>
				<input type="password" id="password" name="password"/>
				<button type="submit">Login</button>
			</form>
		</div>
	);
}

export default Login;
