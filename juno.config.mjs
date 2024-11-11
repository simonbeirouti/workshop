import {defineConfig} from '@junobuild/config';
import dotenv from 'dotenv';

dotenv.config();

/** @type {import('@junobuild/config').JunoConfig} */
export default defineConfig({
  satellite: {
    id: process.env.JUNO_ID,
    source: 'dist',
    predeploy: ['npm run build']
  }
});
