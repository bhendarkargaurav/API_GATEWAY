import express from 'express'
import morgan from 'morgan';
import { createProxyMiddleware } from 'http-proxy-middleware'
import { rateLimit } from 'express-rate-limit'
import axios from 'axios';

const app = express();

const PORT = 3005;

const limiter = rateLimit({
	windowMs: 2 * 60 * 1000, // minutes
	limit: 4, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
})

app.use(morgan('combined'));
app.use(limiter);

//
app.use('/bookingservice', async(req, res, next) => {
    console.log(req.headers['x-access-token']);
    try {
        const response = await axios.get('http://localhost:3001/api/v1/isAuthenticated', {
        headers: {
            'x-access-token': req.headers['x-access-token']
            }
        })
        console.log("response is", response.data);
        if(response.data.success) {
            next();
        }else {
            return res.status(401).json({
            message: 'Unauthorised'
        })
        }

    } catch (error) {
        return res.status(401).json({
            message: 'somethng went wrong'
        })
    }
})

app.use('/bookingservice', createProxyMiddleware({target: 'http://localhost:3002/', changeOrigin: true}))

app.get('/home', (req, res) => {
    return res.json({message: "OK"});
})

app.listen(PORT, () => {
    console.log(`server started at port ${PORT}`)
})
