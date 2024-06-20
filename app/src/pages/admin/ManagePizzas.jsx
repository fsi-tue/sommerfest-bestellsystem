import { useEffect, useState } from "react";
import { API_ENDPOINT, THIS_ENDPOINT } from "../../globals.js";
import { useNavigate } from "react-router-dom";

const ManagePizzas = () => {
    //this wont deter anyone
    const token  = localStorage.getItem('token') || "";
    const authed = token !== "";
    
    const navigate = useNavigate();
    if(!authed)
    {
        navigate("/");
    }


    return (
        <div className="content">
            <h2>Manage Pizzas</h2>
        </div >
    );
}


export default ManagePizzas;
