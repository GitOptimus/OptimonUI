import axios from "axios";

export default axios.create({
  //baseURL: "http://10.157.63.34:8085/getMetricDetails",
 //baseURL: "http://localhost:8080/getMetricDetails",
 baseURL: "http://10.213.144.88:8084/getMetricDetails",
  headers: {
    "Content-type": "application/json"
  }
}); 