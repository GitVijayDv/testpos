import axios from "axios";

export default axios.create({
  baseURL: 'http://ec2-3-239-92-6.compute-1.amazonaws.com/:4000/api',
  headers: {
    'Access-Control-Allow-Origin' : '*',
    'Access-Control-Allow-Methods':'GET,PUT,POST,DELETE,PATCH,OPTIONS',
    }
});
