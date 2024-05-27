// Header.js
import React from 'react';
import { Link } from 'react-router-dom';

import logo from '../logo.svg';

const Header = () => {
    return (
        <header>
            <img src={logo} className="App-logo" alt="logo" />
            <h1>Pizza Ordering App</h1>
            <nav>
                <ul>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/order-queue">Order Queue</Link></li>
                    <li><Link to="/manufactured-orders">Manufactured Orders</Link></li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;
