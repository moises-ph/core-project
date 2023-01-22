export const idlFactory = ({ IDL }) => {
  const Proposal = IDL.Record({
    'Passed' : IDL.Bool,
    'votes' : IDL.Record({ 'No' : IDL.Nat, 'Yes' : IDL.Nat }),
    'body' : IDL.Text,
    'user_proposer' : IDL.Principal,
  });
  const Succes = IDL.Variant({
    'TaskCompletedSuccesfully' : IDL.Null,
    'UserLogedInSuccesfully' : IDL.Bool,
  });
  const Err = IDL.Variant({
    'AnonymusUser' : IDL.Null,
    'ProposalNotFound' : IDL.Null,
    'Unauthorized' : IDL.Null,
    'EmptyBody' : IDL.Null,
    'Unexpected' : IDL.Text,
    'NotEnoughMBT' : IDL.Null,
    'ProposalAlreadyPassed' : IDL.Null,
  });
  const Result = IDL.Variant({ 'ok' : Succes, 'err' : Err });
  const Backend = IDL.Service({
    'create_proposal' : IDL.Func([Proposal], [Result], []),
    'delete_proposal' : IDL.Func([IDL.Nat], [Result], []),
    'list_proposals' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Nat, Proposal))],
        ['query'],
      ),
    'login_users' : IDL.Func([], [Result], []),
    'read_proposal' : IDL.Func([IDL.Nat], [IDL.Opt(Proposal)], ['query']),
    'vote_proposal' : IDL.Func([IDL.Nat, IDL.Bool], [Result], []),
  });
  return Backend;
};
export const init = ({ IDL }) => { return []; };
