'use client'

import {Navigate, useLocation} from "react-router-dom";

function RequireAuth({children}) {
	let auth = useAuth();
	const location = useLocation();

	if (!auth.user) {
		return <Navigate to="/login" state={{from: location}} replace/>;
	}

	return children;
}

export default RequireAuth;
