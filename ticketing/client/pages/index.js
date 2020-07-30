import axios from 'axios';

const LandingPage = ({ currentUser }) => {
  // console.log(currentUser);
  // axios.get('/api/users/currentuser');
  return <h1>Landing Page</h1>;
};

LandingPage.getInitialProps = async () => {
  if (typeof window === 'undefined') {
    // we are on the server
    // Requests should be made to http://ingress-nginx....
  } else {
    // we are on the browser
    // Requests can be made with a base url of ''
  }
  return {};
};

export default LandingPage;
