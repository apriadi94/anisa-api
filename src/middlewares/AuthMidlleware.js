const jwt = require("jsonwebtoken");
const accessTokenSecret = process.env.SECRET_KEY;

const authenticateToken = (req, res, next) => {
    // Gather the jwt access token from the request header
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return res.status(401).send({
        status : 401,
        data : {
            message : 'Authentikasi Token tidak ada'
        }
    }) // if there isn't any token

    jwt.verify(token, accessTokenSecret, (err, user) => {
        if (err) return res.status(403).send({
            status : 403,
            data : err
        })
        req.user = user



        next() // pass the execution off to whatever request the client intended
    })
}

module.exports = { authenticateToken };
