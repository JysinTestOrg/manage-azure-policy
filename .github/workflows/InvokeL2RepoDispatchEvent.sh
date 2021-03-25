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
access_code=$(curl -X POST https://github.com/login/oauth/access_token?client_id=9e4fedaa995f29228ee&client_secret=ef8c49d9267f66a2278a5007fc6d9ac5f2e605ce&code=$code)

response=$(curl -X POST https://api.github.com/repos/Azure/azure-actions-integration-tests/dispatches?$access_code --data "$(getPayLoad)")

if [ "$response" == "" ]; then
    echo "Integration tests triggered successfully"
else
    echo "Triggering integration tests failed with: '$response'"
    exit 1
fi
