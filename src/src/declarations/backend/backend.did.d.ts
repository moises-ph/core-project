import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface Backend {
  'create_proposal' : ActorMethod<[Proposal], Result>,
  'delete_proposal' : ActorMethod<[bigint], Result>,
  'list_proposals' : ActorMethod<[], Array<[bigint, Proposal]>>,
  'login_users' : ActorMethod<[], Result>,
  'read_proposal' : ActorMethod<[bigint], [] | [Proposal]>,
  'vote_proposal' : ActorMethod<[bigint, boolean], Result>,
}
export type Err = { 'AnonymusUser' : null } |
  { 'ProposalNotFound' : null } |
  { 'Unauthorized' : null } |
  { 'EmptyBody' : null } |
  { 'Unexpected' : string } |
  { 'NotEnoughMBT' : null } |
  { 'ProposalAlreadyPassed' : null };
export interface Proposal {
  'Passed' : boolean,
  'votes' : { 'No' : bigint, 'Yes' : bigint },
  'body' : string,
  'user_proposer' : Principal,
}
export type Result = { 'ok' : Succes } |
  { 'err' : Err };
export type Succes = { 'TaskCompletedSuccesfully' : null } |
  { 'UserLogedInSuccesfully' : boolean };
export interface _SERVICE extends Backend {}
