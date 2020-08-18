import axios from 'axios';

const LandingPage = ({ currentUser }) => {
  console.log(currentUser);
  // axios.get('/api/users/currentuser');
  return <h1>Landing Page</h1>;
};

LandingPage.getInitialProps = async () => {
  if (typeof window === 'undefined') {
    // we are on the server
    // Requests should be made to http://ingress-nginx....
    const { data } = await axios.get(
      'http://ingress-nginx-controller.kube-system.svc.cluster.local/api/users/currentuser', {
        headers: {
          Host: 'ticketing.dev'
        }
      }
    );
    return data;
  } else {
    // we are on the browser
    // Requests can be made with a base url of ''
    const { data } = await axios.get('/api/users/currentuser');
    return data;
  }
  return {};
};

export default LandingPage;
