import Principal "mo:base/Principal";
import Result "mo:base/Result";

module Proposals{

    public type Proposal = {
        user_proposer : Principal;
        body : Text;
        votes : {
            Yes : Nat;
            No : Nat;
        };
        Passed : Bool;
    };
}