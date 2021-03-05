// console.log('hello from stripe');
import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe('pk_test_51IRH5jHZ6F3OU2lGSb6k80epbvtYowr6MrVDtGHNLTgGEOmlSGVhAm38e52tQwxJhHCK71X7uFm8hqfzyCql1wIf00QWV5CWug');

export const bookTour = async tourId => {

    try {
        // 1) get checkout session from API
        const session = await axios(
            `/api/v1/bookings/checkout-session/${tourId}`
        );
        // console.log(session);

        // 2) create checkout form + charge credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });
        
    } catch (err) {
        // console.log(err);
        showAlert('error', err);
    }

    
}