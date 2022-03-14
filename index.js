const express = require("express");
const mysqlConnection = require("./config/database");
const bodyparser = require("body-parser");
const path = require("path");
const {post} = require("./routes/post");
const cors = require("cors");
const uuid = require("uuid").v4;
const stripe = require("stripe")(
    'sk_test_51KYmCzSIF1bhHQASKt59p7NFRxs0rxaw2u5NtfUpBFwMBka3cmjlS8QWzjyDYEqW7JdR7zhZsMVhRynQBOenjGo100EA5vTISq'
);
const app = express();
app.options("/*", function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
    res.header(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, Content-Length, X-Requested-With"
    );
    res.sendStatus(200);
});

app.use(express.json());
app.use(cors({origin: "*"}));
app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());
const postRouter = require("./routes/post");
app.use("/post", postRouter);
app.use(express.static("public"));
// app.use('/images', express.static('public'))


app.post("/checkout", async (req, res) => {
    try {
        const {data, token} = req.body;
        const customer = await stripe.customers.create({
            email: token.email,
            source: token.id,
        });
        const createIntents = await stripe.paymentIntents.create({
                amount: data.price * 100,
                currency: 'inr',
                customer: customer.id,
                receipt_email: token.email,
                payment_method_types: ['card'],
          

                description: `Purchased the ${data.productname}`,
                shipping: {
                    name: token.card.name,
                    address: {
                        line1: token.card.address_line1,
                        line2: token.card.address_line2,
                        city: token.card.address_city,
                        country: token.card.address_country,
                        postal_code: token.card.address_zip,
                    },
                },

            },
        );

        const paymentIntent = await stripe.paymentIntents.confirm(
            createIntents.id,
            {payment_method: 'pm_card_visa'}
        );

        res.status(400).json({
            paymentSummary: createIntents,
            confirmSummary: paymentIntent
        })
    } catch (error) {
        console.log(error);
        res.status(400).json(error)
    }
});
app.listen(4000, () => {
    console.log("server running on port 4000");
});
