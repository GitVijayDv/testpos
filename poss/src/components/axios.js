import axios from "axios";

export default axios.create({
  baseURL: 'http://ec2-34-239-167-142.compute-1.amazonaws.com:4000/',
  headers: {
    'Access-Control-Allow-Origin' : '*',
    'Access-Control-Allow-Methods':'GET,PUT,POST,DELETE,PATCH,OPTIONS',
    }
});
