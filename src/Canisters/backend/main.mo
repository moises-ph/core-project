import Principal "mo:base/Principal";
import Proposals "Proposals";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Hash "mo:base/Hash";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Result "mo:base/Result";
import Bool "mo:base/Bool";
import Cycles "mo:base/ExperimentalCycles";
import Error "mo:base/Error";



shared ({ caller = owner }) actor class Backend() = {

    // This is de DAO canister

    // Testing the Inter Canister call to the Ledger canister
    // let myAccount : Principal = Principal.fromText("fc2jq-ue76f-2gcvn-ba2u6-hllbo-janie-wuok6-4ealb-go5c2-aby43-5qe");
    // let myMBTbalance : actor{ icrc1_balance_of :({owner:Principal; subaccount:?Nat8}) -> async Nat} = actor("db3eq-6iaaa-aaaah-abz6a-cai");

    // public func myMBTbalance_query() :async Nat{
    //     let balance : Nat =await myMBTbalance.icrc1_balance_of({owner = myAccount; subaccount = null});
    //     return balance;
    // };

    stable var creator : Principal = owner;
    type Err ={
        #Unauthorized;
        #ProposalNotFound;
        #AnonymusUser;
        #NotEnoughMBT;
        #ProposalAlreadyPassed;
        #Unexpected : Text;
        #EmptyBody;
    };

    type Succes = {
        #TaskCompletedSuccesfully;
        #UserLogedInSuccesfully : Bool;
    };

    //////////////////
    //////Ledger//////
    //////////////////

    let checkMBTBalance_exf : actor{ icrc1_balance_of :({owner:Principal; subaccount:?Nat8}) -> async Nat} = actor("db3eq-6iaaa-aaaah-abz6a-cai");

    ///////////////////
    //////Webpage//////
    ///////////////////

    let updateText : actor{ update_text : (t : Text) -> async () } = actor("ehdiq-eaaaa-aaaag-abeqa-cai");

    /////////////////
    //////Users//////
    /////////////////

    stable var ArrUsers : [Principal] = [];

    private func validate_user(user : Principal) : Bool{
        var isUser : ?Principal = Array.find<Principal>(ArrUsers, func x = x == user);
        switch(isUser){ 
            case(null) false; 
            case(? existentUser) true;
        };
    };

    ///////////////////////////
    //////Users Functions//////
    ///////////////////////////

    public shared ({ caller = user }) func login_users(): async Result.Result<Succes, Err>{
        let isUser : ?Principal = Array.find<Principal>(ArrUsers, func x = x == user);
        switch(isUser){
            case(null){
                if(Principal.isAnonymous(user)){
                    #err(#AnonymusUser);
                }else{
                    ArrUsers := Array.append(ArrUsers, [user]);
                    #ok(#UserLogedInSuccesfully(true));
                };
            };
            case(? user){
                #ok(#UserLogedInSuccesfully(true));
            };
        }
    };

    /////////////////////
    //////Proposals//////
    /////////////////////

    public type Proposal = Proposals.Proposal;
    stable var ArrDataProposals : [(Nat, Proposal)] = [];
    var DataProposals = HashMap.fromIter<Nat,Proposal>( ArrDataProposals.vals() ,0 , Nat.equal, Hash.hash);
    stable var ProposalsCounter : Nat = 0;


    ///////////////////////////////
    //////Proposals Functions//////
    ///////////////////////////////    


    // Admin Function ONLY!!!! DELETE
    public shared({ caller = user }) func delete_proposal(id : Nat) : async Result.Result<Succes, Err>{
        if(user == creator){
            var proposal : ?Proposal = DataProposals.get(id);
            switch(proposal) {
                case(null) { #err(#ProposalNotFound) };
                case(? p) { 
                    ignore DataProposals.remove(id);
                    #ok(#TaskCompletedSuccesfully);
                 };
            };
        }else{
            #err(#Unauthorized);
        }
    };

    // CREATE
    public shared({caller = user}) func create_proposal(p : Proposal) : async Result.Result<Succes, Err>{
        if(validate_user(user)){
            let userFounds : Nat = await checkMBTBalance_exf.icrc1_balance_of({owner = user; subaccount = null});
            if(userFounds >= 1){
                if(p.body != ""){
                    ProposalsCounter += 1;
                    let id : Nat = ProposalsCounter;
                    var newProposal : Proposal = p;
                    DataProposals.put(id, newProposal);
                    #ok(#TaskCompletedSuccesfully);
                }else{
                    #err(#EmptyBody);
                }
            }else{
                #err(#NotEnoughMBT);
            }
        }else{
            #err(#Unauthorized);
        };
    };

    // UPDATE (Votes Only)
    public shared({ caller = user }) func vote_proposal(id : Nat, vote : Bool) : async Result.Result<Succes, Err>{
        try{
            if(validate_user(user)){
                let userFounds : Nat = await checkMBTBalance_exf.icrc1_balance_of({owner = user; subaccount = null});
                if(userFounds >= 1){
                    let currentProposal : ?Proposal = DataProposals.get(id);
                    switch(currentProposal){
                        case(null) #err(#ProposalNotFound);
                        case(? proposal){
                            switch(proposal.Passed){
                                case(true){
                                    #err(#ProposalAlreadyPassed);
                                };
                                case(false){
                                    var yesVotes : Nat = proposal.votes.Yes;
                                    var noVotes : Nat = proposal.votes.No;
                                    var passed : Bool = false;
                                    if(vote){
                                        yesVotes += userFounds;
                                    }else{
                                        noVotes += userFounds;
                                    };
                                    let passedNat : Nat = yesVotes - noVotes;
                                    if(passedNat < 100000000){
                                        passed := false;
                                    }else{
                                        passed := true;
                                        ignore updateText.update_text(proposal.body);
                                    };
                                    var votedProposal : Proposal = {
                                        user_proposer = proposal.user_proposer;
                                        body = proposal.body;
                                        votes ={
                                            Yes = yesVotes;
                                            No = noVotes;
                                        };
                                        Passed = passed;
                                    };
                                    DataProposals.put(id , votedProposal);
                                    #ok(#TaskCompletedSuccesfully);
                                };
                            }
                        };
                    }
                }else{
                    #err(#NotEnoughMBT);
                }
            }else{
                #err(#Unauthorized);
            }
        }catch err{
            #err(#Unexpected(Error.message(err)));
        }
    };

    //LIST
    public query func list_proposals() : async [(Nat,Proposal)]{
        Iter.toArray<(Nat,Proposal)>(DataProposals.entries());
    };

    //READ
    public query func read_proposal(id : Nat) : async ?Proposal{
        DataProposals.get(id);
    };

    system func preupgrade(){
        ArrDataProposals := Iter.toArray<(Nat,Proposal)>(DataProposals.entries());
    };

    system func postupgrade(){
        ArrDataProposals := [];
    };

}