import React from 'react'
import { idlFactory as idlFactoryDAO } from '../.dfx/ic/canisters/backend/backend.did.js';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { useRef, useContext } from 'react';
import { ContextProvider } from '../context/DAOContext';
import Context from '../context/DAOContext';

function CreateProposal  () {

    const body = useRef();
    const canisterId = 'b3ysv-piaaa-aaaag-abepq-cai';
    const MySwal = withReactContent(Swal);

    const sentProposal = async (e) => {
        try{
            MySwal.showLoading(null);
            e.preventDefault();
            const dao = await window.ic.plug.createActor({
                canisterId: canisterId,
                interfaceFactory : idlFactoryDAO
            });
            const loged = await dao.login_users();
            console.log(e);
            console.log(loged);
            if(loged){
                const principal = await window.ic.plug.agent.getPrincipal();
                const Proposal = {
                    user_proposer : principal,
                    body: body.current.value,
                    votes :{ 
                        Yes : 0,
                        No : 0
                    },
                    Passed : false
                };
                const result = await dao.create_proposal(Proposal);
                console.log(result);
                if(result.ok){
                    MySwal.hideLoading();
                    MySwal.fire('Succes', 'Your proposal was publicated succesfully','success');
                }
                else{
                    MySwal.hideLoading();
                    MySwal.fire('Oh!', 'Something went wrong, try again later.','error');
                }
                return;
            }else{
                MySwal.fire('Something happend', 'It seems that you are not logged in, please Connect with Plug.', 'error');
                return;
            }
        }
        catch(Err){
            MySwal.fire('Something happend', 'It seems that you are not logged in, please Connect with Plug.', 'error');
        }
    };

  return (
    <>
        <h2 className='anim_start font-medium text-4xl'>Create a new Proposal</h2>
        <form onSubmit={sentProposal} className="w-full max-w-sm mt-28">
            <div className="md:flex md:items-center mb-6">
                <div className="md:w-1/3">
                <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4" htmlFor="inline-full-name">
                    Your Principal
                </label>
                </div>
                <div className="md:w-2/3">
                <input className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500" id="inline-full-name" type="text" placeholder='Dont worry, we already have it' disabled={true}/>
                </div>
            </div>
            <div className="md:flex md:items-center mb-6 mt-10">
                <div className="md:w-1/3">
                <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4" htmlFor="inline-password">
                    Text of the proposal
                </label>
                </div>
                <div className="md:w-2/3">
                <input ref={body} className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500" id="inline-password" type="text" placeholder="Body of your proposal" />
                </div>
            </div>
            <div className="md:flex md:items-center mt-10">
                <div className="md:w-1/3"></div>
                <div className="md:w-2/3">
                <button className="transition-colors leading-none duration-500 text-white border-white hover:text-black hover:border-transparent hover:bg-white font-bold py-2 px-4 rounded" type="submit">
                    Send
                </button>
                </div>
            </div>
        </form>
    </>
  )
}

export default CreateProposal