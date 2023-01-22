import Http "http";
import Text "mo:base/Text";
import HashMap "mo:base/HashMap";
import Option "mo:base/Option";
import Result "mo:base/Result";
import Error "mo:base/Error";

actor{
    public type HttpRequest = Http.HttpRequest;
    public type HttpResponse = Http.HttpResponse;

    stable var CurrentText : Text = "Core-Project Motoko Bootcamp 2023 First change in Code";

    let BadRequest : HttpResponse = {
                        body = Text.encodeUtf8("Error: Bad Request");
                        headers = [];
                        status_code = 401;
                        streaming_strategy = null;
                    };

    public func update_text(t : Text) : async Result.Result<Text,Text>{
        try{
            CurrentText := t;
            return #ok("Text updated Succesfully");
        }
        catch err{
            #err(Error.message(err));
        };
    };

    public query func http_request(req : HttpRequest): async HttpResponse{
        switch(req.method){
            case("GET"){
                return({
                    body = Text.encodeUtf8(CurrentText);
                    headers = [];
                    status_code = 200;
                    streaming_strategy = null;
                });
            };
            case(_){
                return(BadRequest);
            }
        }
    };
}