import axios from 'axios';
import { useEffect } from 'react';

const LandingPage = ({ color }) => {
  console.log('I am in the component', color);
  useEffect(() => {
    (async () => {
      const response = await axios.get('/api/users/currentuser');
      console.log('Hello, I am in useEffect');
      console.log(`Response in LandingPage: ${response.data.currentUser}`);
    })();
  }, []);
  return <h1>Landing Page</h1>;
};

LandingPage.getInitialProps = async () => {
  console.log('I am on the server!');
  const response = await axios.get(
    'http://ingress-nginx-controller.kube-system.svc.cluster.local/api/users/currentuser'
  );
  console.log(`Response in getInitial: ${response.data.currentUser}`)
  return { color: 'red' };
};

export default LandingPage;
