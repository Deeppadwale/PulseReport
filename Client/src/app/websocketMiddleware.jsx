// import { createAction } from '@reduxjs/toolkit';

// export const wsMessageReceived = createAction('ws/message Received');

// const createWebSocketMiddleware = (wsUrl) => {
//     return (store) => {
//         let ws = null;

//         const connect = () => {
//             ws = new WebSocket(wsUrl);

//             ws.onopen = () => {
//                 console.log('WebSocket connected');
//             };

//             ws.onmessage = (event) => {
//                 console.log('WebSocket message received:', event.data);
//                 store.dispatch(wsMessageReceived(event.data));
//             };

//             ws.onclose = () => {
//                 console.log('WebSocket disconnected. Attempting to reconnect...');
//                 setTimeout(connect, 5000);
//             };

//             ws.onerror = (error) => {
//                 console.error('WebSocket error:', error);
//                 ws.close();
//             };
//         };

//         connect();

//         return (next) => (action) => {
//             return next(action);
//         };
//     };
// };

// export default createWebSocketMiddleware;