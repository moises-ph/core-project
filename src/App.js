import './App.css';
import MotokoLanguage from './assets/MotokoLanguage.png';
import ReactLogo from './assets/ReactLogo.png';
import { BrowserRouter, Route, Routes, NavLink } from 'react-router-dom';
import Home from './components/Home';
import { idlFactory as idlFactoryDAO } from './.dfx/ic/canisters/backend/backend.did.js';
import { useContext, useEffect, useState } from 'react';
import Proposals from './components/Proposals';
import { ContextProvider } from './context/DAOContext';
import Context from './context/DAOContext';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import CreateProposal from './components/CreateProposal';

function App() {
  const {setLoged, setDaoAgent, loged} = useContext(ContextProvider)
  const MySwal = withReactContent(Swal);
  const [loged_2, setLog] = useState(false);
  const canisterId = 'b3ysv-piaaa-aaaag-abepq-cai';

  const init = async (e)=>{
    const principal = await window.ic.plug.agent.getPrincipal();
    const dao = await window.ic.plug.createActor({
      canisterId: canisterId,
      interfaceFactory : idlFactoryDAO
    });
    let bool = await dao.login_users();
    setLog(bool);
    console.log(bool);
    return;
  }

  const connectWallet = async (e)=>{
    MySwal.showLoading(null);
    const principalKey = await window.ic.plug.requestConnect({
      whiteList: [canisterId]
    });
    if(!principalKey) {console.log('denied')}
    console.log(principalKey);
    const principal = await window.ic.plug.agent.getPrincipal();
    const dao = await window.ic.plug.createActor({
      canisterId: canisterId,
      interfaceFactory : idlFactoryDAO
    });
    let bool = await dao.login_users();
    setLog(bool);
    if(bool){
      setLoged(principal)
      MySwal.hideLoading();
      return;
    }
    else{
      MySwal.fire({
        title:'Error',
        text:'Anonymous user not allowed',
        icon:'error'
      });
      MySwal.hideLoading();
      return;
    }
  };

  const disabled = loged_2 ? true : false ;



  return (
    <>
      <Context>
        <BrowserRouter>
          <nav className="flex flex-row items-center justify-between w-full px-64 pt-2">
            <NavLink to='/'>
              <div className="anim_start flex items-center h-full flex-shrink-0 text-white hover:animate-spin-slow">
                <img alt='Motoko Programming Language Logo' className="fill-current h-14 w-16 mr-2" viewBox="0 0 54 54" src={MotokoLanguage} />
                <img alt='React JS Logo' className="fill-current h-12 w-12 mr-2 " viewBox="0 0 54 54" src={ReactLogo} />
              </div>
            </NavLink>
            <div className='flex flex-row gap-6 text-slate-500  items-center justify-center'>
              <NavLink className="hover:text-white transition-colors duration-200" to='/proposals'>Proposals</NavLink>
              <NavLink className="hover:text-white transition-colors duration-200" to='/create'>Create Proposal</NavLink>
            </div>
            <div>
              <button disabled={disabled} 
                      onClick={connectWallet} 
                      className='text-sm px-4 py-2 transition-colors duration-500 leading-none border rounded text-white border-white hover:border-transparent hover:text-black hover:bg-white mt-4 lg:mt-0'
                      >
                      {disabled ? "Already Connected" : "Connect"}
              </button>
            </div>
          </nav>
          <main className='w-full flex flex-col items-center py-16'>
            <Routes>
              <Route path='/' element={<Home />}/>
              <Route path='/proposals' element={<Proposals />}/>
              <Route path='/create' element={<CreateProposal />} />
            </Routes>
          </main>
        </BrowserRouter>
      </Context>
    </>
  );
}

export default App;
