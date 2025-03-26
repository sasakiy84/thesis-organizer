import { ProjectAPI } from './types';

declare global {
  interface Window {
    projectAPI: ProjectAPI;
  }
}