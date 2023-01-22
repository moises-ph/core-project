/* global BigInt */

import React from 'react'
import { useState } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import Context from '../context/DAOContext';
import { ContextProvider } from '../context/DAOContext';
import { idlFactory as idlFactoryDAO } from '../.dfx/ic/canisters/backend/backend.did.js';


function Proposals() {
    const [proposals, setProp] = useState([]);
    const MySwal = withReactContent(Swal);
    const canisterId = 'b3ysv-piaaa-aaaag-abepq-cai';
    const [daoLocal, setDao] = useState();
    const [Principal, setPrincipal] = useState();

    const getProposals = async () =>{
        MySwal.showLoading(null);
        const dao = await window.ic.plug.createActor({
            canisterId: canisterId,
            interfaceFactory : idlFactoryDAO
        });
        setDao(dao);
        const loged = await dao.login_users();
        console.log(loged);
        if(loged){
            setPrincipal(await window.ic.plug.agent.getPrincipal());
            let res = await dao.list_proposals();
            setProp(res);
            console.log(res);
            MySwal.hideLoading();
        }else{
            MySwal.fire('Error','You are not Connected, please connect with the Plug extension', 'error');
        }
    };

    const voteProposal = async (e) =>{
        let votedUser = localStorage.getItem(e.target.value.toString());
        if(votedUser == Principal){
            MySwal.fire('Error', 'You already voted for this proposal', 'error');
        }
        else{
            localStorage.setItem(e.target.value, [Principal]);
            let vote = await MySwal.fire({
                title : `What is your vote for Proposal #${e.target.value}`,
                showDenyButton : true,
                confirmButtonText : 'Vote Yes',
                denyButtonText : 'Vote No'
            }).then(result => result.isConfirmed ? true : false);
            MySwal.showLoading();
            let res = await daoLocal.vote_proposal(parseInt(e.target.value),vote);
            console.log(res);
            MySwal.hideLoading();
            getProposals();
        }
    }


    // useEffect(()=>{
    //     getProposals();
    // })

  return (
    <>
        <Context>
            <h2 className='anim_start font-medium text-4xl'>Proposals</h2>
            <button onClick={getProposals} className='text-sm px-4 py-2 transition-colors duration-500 leading-none border rounded text-white border-white hover:border-transparent hover:text-black hover:bg-white mt-4 lg:mt-5'>Get Proposals</button>
            <div>{proposals.map(value =><>
                <div className='my-5 border border-slate-500 rounded px-6 py-6' key={parseInt(BigInt(value[0]).toString())}>
                    <ul>
                        <li className='py-1'><h3><b>Proposal ID :</b> {BigInt(value[0]).toString() }</h3></li>
                        <li className='py-1'><b>Proposal Text:</b> {value[1].body}</li>
                        {value[1].Passed ? <li className='py-1'><b>Proposal Already Passed</b></li> :<>
                        <li className='py-1'><b>Votes to Yes :</b> {BigInt(value[1].votes.Yes).toString()}</li>
                        <li className='py-1'><b>Votes to No :</b> {BigInt(value[1].votes.No).toString()}</li>
                        <li className='py-1 flex flex-row justify-center'>
                            <button className='text-sm px-4 py-2 transition-colors duration-500 leading-none border rounded text-white border-white hover:border-transparent hover:text-white hover:bg-green-600' value={parseInt(BigInt(value[0]).toString())} onClick={voteProposal}>Vote</button>
                        </li>
                        </> }
                    </ul>
                </div>
            </>)}</div>
        </Context>
    </>
  )
}

export default Proposals