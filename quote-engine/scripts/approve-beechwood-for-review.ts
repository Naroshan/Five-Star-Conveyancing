// Five Star Conveyancing — approve Beechwood Solicitors' pending fee data
import { approveFirmForReview } from './_reviewWorkflow.js';

approveFirmForReview('499274', 'Beechwood Solicitors').catch((err) => {
  console.error(err);
  process.exit(1);
});
