import { useState } from 'react';
import {createContext} from 'react';

export const ContextProvider = createContext();

function Context ({children}) {
  const [daoAgent, setDaoAgent] = useState(null);
  const [loged, setLoged] = useState(null);

  return (
  <ContextProvider.Provider value={{daoAgent, setDaoAgent, loged, setLoged}}>
    {children}
  </ContextProvider.Provider>
 )
};

export default Context;