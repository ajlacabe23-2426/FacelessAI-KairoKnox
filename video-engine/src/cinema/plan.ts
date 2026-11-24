import type {CinemaPlan} from './schema';

export const cinematicPlan: CinemaPlan = {
  id: 'KairoCinematic60',
  width: 1080,
  height: 1920,
  fps: 60,
  overlapFrames: 24,
  beats: [
    {
      id: 'trace', startFrame: 0, durationInFrames: 240,
      eyebrow: 'KAIRO KNOX / SYSTEM TRACE 01',
      headline: 'ONE REQUEST.\nTHREE LAYERS.',
      explanation: 'A login is not a single event. Watch the request move through a client, an API, and an access policy.',
      accent: '#71E6DF',
      telemetry: [
        {label: 'CLIENT', value: 'REQUEST SENT'},
        {label: 'API', value: 'TOKEN CHECK'},
        {label: 'POLICY', value: 'ACCESS DECISION'},
      ],
    },
    {
      id: 'boundary', startFrame: 216, durationInFrames: 240,
      eyebrow: 'IDENTITY / TRUST BOUNDARY 02',
      headline: 'VERIFY BEFORE\nYOU TRUST.',
      explanation: 'Authentication establishes identity. Authorization answers what that identity can do.',
      accent: '#EED18D',
      telemetry: [
        {label: 'AUTHN', value: 'WHO ARE YOU?'},
        {label: 'AUTHZ', value: 'WHAT IS ALLOWED?'},
        {label: 'RESULT', value: 'LEAST PRIVILEGE'},
      ],
    },
    {
      id: 'payoff', startFrame: 432, durationInFrames: 240,
      eyebrow: 'PRACTICAL SECURITY / 03',
      headline: 'MAKE THE\nBOUNDARY VISIBLE.',
      explanation: 'Use logs and explicit permission checks to explain why a request succeeded or failed.',
      accent: '#B8E6FF',
      telemetry: [
        {label: 'TRACE', value: 'REQUEST ID'},
        {label: 'EVIDENCE', value: 'POLICY RESULT'},
        {label: 'ACTION', value: 'VERIFY AGAIN'},
      ],
    },
  ],
};
