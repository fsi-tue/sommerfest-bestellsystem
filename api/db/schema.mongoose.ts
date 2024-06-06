import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// User schema
const userSchema = new Schema({
    id: { type: Number, autoIncrement: true, primaryKey: true },
    name: { type: String },
    email: { type: String },
    password: { type: String },
    role: { type: String, enum: ["admin", "customer"] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const User = model('User', userSchema);

// Pizza schema
const pizzaSchema = new Schema({
    id: { type: Number, autoIncrement: true, primaryKey: true },
    name: { type: String, required: true },
    price: { type: Number },
    enabled: { type: Boolean },
    createdAt: { type: Date, default: Date.now }
});

const Pizza = model('Pizza', pizzaSchema);

// Payment schema
const paymentSchema = new Schema({
    id: { type: Number, autoIncrement: true, primaryKey: true }
});

const Payment = model('Payment', paymentSchema);

// OrderState Enum (Mongoose doesn't support enums directly, so we use validation)
const orderStateEnum = ['open', 'paid', 'delivered'];

// PizzaOrderMap schema
const pizzaOrderMapSchema = new Schema({
    orderid: { type: Number },
    pizza: { type: Number }
});

const PizzaOrderMap = model('PizzaOrderMap', pizzaOrderMapSchema);

// CollectedOrder schema
const collectedOrderSchema = new Schema({
    id: { type: Number, autoIncrement: true, primaryKey: true },
    timestamp: { type: Date, default: Date.now }
});

const CollectedOrder = model('CollectedOrder', collectedOrderSchema);

// WaitingOrder schema
const waitingOrderSchema = new Schema({
    id: { type: Number, autoIncrement: true, primaryKey: true },
    collectedorder: { type: Number, ref: 'CollectedOrder' },
    time_left: { type: Number },
    timestamp: { type: Date, default: Date.now }
});

const WaitingOrder = model('WaitingOrder', waitingOrderSchema);

// PaidOrder schema
const paidOrderSchema = new Schema({
    id: { type: Number, autoIncrement: true, primaryKey: true },
    waitingorder: { type: Number, ref: 'WaitingOrder' },
    paymentid: { type: Number, ref: 'Payment', required: true },
    timestamp: { type: Date, default: Date.now }
});

const PaidOrder = model('PaidOrder', paidOrderSchema);

// OpenOrder schema
const openOrderSchema = new Schema({
    id: { type: Number, autoIncrement: true, primaryKey: true },
    name: { type: String },
    paidorder: { type: Number, ref: 'PaidOrder' },
    timestamp: { type: Date, default: Date.now }
});

const OpenOrder = model('OpenOrder', openOrderSchema);

// AuthBearerTokens schema
const authBearerTokensSchema = new Schema({
    id: { type: Number, autoIncrement: true, primaryKey: true },
    userId: { type: Number, ref: 'User', required: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 8 * 60 * 60 * 1000) }
});

const AuthBearerTokens = model('AuthBearerTokens', authBearerTokensSchema);

export { User, Pizza, Payment, PizzaOrderMap, CollectedOrder, WaitingOrder, PaidOrder, OpenOrder, AuthBearerTokens };
