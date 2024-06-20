import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
	const navigate = useNavigate();
	localStorage.removeItem('token');
	useEffect(() => {
		navigate('/');
		window.dispatchEvent(new CustomEvent("loginSuccessEvent"));
	}, []);

	return (
		<div className="content">
			
		</div>
	);
}

export default Logout;
