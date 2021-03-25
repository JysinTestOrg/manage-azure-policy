token=$1
commit=$2
repository=$3
prNumber=$4
frombranch=$5
tobranch=$6

getPayLoad() {
    cat <<EOF
{
    "event_type": "ManageAzurePolicyPR", 
    "client_payload": 
    {
        "action": "CreateSecret", 
        "commit": "$commit", 
        "repository": "$repository", 
        "prNumber": "$prNumber", 
        "tobranch": "$tobranch", 
        "frombranch": "$frombranch"
    }
}
EOF
}

code=$(curl -X GET https://github.com/login/oauth/authorize?client_id=9e4fedaa995f29228ee)
access_code=$(curl -X POST https://github.com/login/oauth/access_token?client_id=9e4fedaa995f29228ee&client_secret=89e17c5b8818a230ded361679f79b88bdac7a9bd&code=$code)

access_token=${access_code:13:40}
response=""

if [ "$access_code" == ""  ]; then
    echo ${access_code}
    echo "access_code is empty"
else
    echo ${access_code}
    echo "access_code is not empty"
    response=$(curl -H "Authorization: token $access_token" -X POST https://api.github.com/repos/Azure/azure-actions-integration-tests/dispatches --data "$(getPayLoad)")
fi

if [ "$response" == "" ]; then
    echo ${access_token}
    echo "Integration tests triggered successfully"
else
    echo ${access_token}
    echo "Triggering integration tests failed with: '$response'"
    exit 1
fi
