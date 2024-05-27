// App.js
import './App.css';

import React, { useState } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import PizzaMenu from './components/PizzaMenu';
import OrderSubmit from './components/OrderSubmit';
import OrderQueue from './components/OrderQueue';
import ManufacturedOrders from './components/ManufacturedOrders';

const App = () => {
    const [order, setOrder] = useState(null); // state to hold selected order

    return (
        <Router>
            <div>
                <Header />
                <Switch>
                    <Route path="/" exact>
                        <PizzaMenu setOrder={setOrder} />
                    </Route>
                    <Route path="/order/:orderNumber">
                        <OrderSubmit order={order} />
                    </Route>
                    <Route path="/order-queue">
                        <OrderQueue />
                    </Route>
                    <Route path="/manufactured-orders">
                        <ManufacturedOrders />
                    </Route>
                </Switch>
                <Footer />
            </div>
        </Router>
    );
};

export default App;
