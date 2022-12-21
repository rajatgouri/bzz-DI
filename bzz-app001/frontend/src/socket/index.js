import { API_BASE_URL } from "@/config/serverApiConfig";
import io from "socket.io-client";

console.log(API_BASE_URL.slice(0,-5))
const socket = io(API_BASE_URL.slice(0,-5), {
  secure: true,
  rejectUnauthorized: false,
});


export default socket
