import http from 'k6/http';
import { check, sleep } from 'k6';

// Basic k6 smoke/load test hitting a few core endpoints.
// Adjust VUs/duration and add more scenarios as needed.

export const options = {
  vus: 5,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<800'], // 95% of requests under 800ms
    http_req_failed: ['rate<0.01'],   // <1% errors
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8081';

export default function () {
  const resRoot = http.get(`${BASE_URL}/`);
  check(resRoot, {
    'GET / status is 200': (r) => r.status === 200,
  });

  const resProjects = http.get(`${BASE_URL}/projects`);
  check(resProjects, {
    'GET /projects status is 200 or 404': (r) => r.status === 200 || r.status === 404,
  });

  const resBugs = http.get(`${BASE_URL}/allbugs`);
  check(resBugs, {
    'GET /allbugs status is 200 or 404': (r) => r.status === 200 || r.status === 404,
  });

  const resComments = http.get(`${BASE_URL}/comments`);
  check(resComments, {
    'GET /comments status is 200 or 404': (r) => r.status === 200 || r.status === 404,
  });

  sleep(1);
}


