import { nexus } from '../shared/nexus-client';

/**
 * The "Nerve Ending" (The Fetch Wrapper)
 * Every request from every app carries the same "Heartbeat" (the User JWT).
 */
export const nexusRequest = async (functionName: string, payload: any) => {
  const { data: { session } } = await nexus.auth.getSession();
  
  if (!session) {
    console.error("Heartbeat Missing: User not authenticated.");
    return null;
  }

  // Every request to the backend is wrapped in the same soul
  const { data, error } = await nexus.functions.invoke(functionName, {
    body: { 
      ...payload, 
      shell: import.meta.env.VITE_NEXUS_SHELL_NAME || window.location.hostname,
      timestamp: new Date().toISOString()
    },
    headers: {
      Authorization: `Bearer ${session.access_token}`
    }
  });

  if (error) {
    console.error(`Nexus Nerve Error [${functionName}]:`, error.message);
    throw error;
  }
  
  return data;
};
