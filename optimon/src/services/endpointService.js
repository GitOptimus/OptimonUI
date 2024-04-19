import axios from "../axios";

class EndpointService {
  getTrustData(id) {
    return axios.get(`?trustId=${id}`);
  }
}

export default new EndpointService();